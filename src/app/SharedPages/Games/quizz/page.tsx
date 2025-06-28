"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { toast, Toaster } from "react-hot-toast";
import { Tooltip } from "@nextui-org/react";
import "./quizstyle.css";
import { FiEdit, FiCheck, FiUpload } from "react-icons/fi";
import { MdDeleteSweep } from "react-icons/md";
import { GiSchoolBag } from "react-icons/gi";
import { TbCardsFilled } from "react-icons/tb";
import { RxCardStackPlus } from "react-icons/rx";
import { FaArrowRight } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";

// Type definitions
interface Option {
  option: string;
  isCorrect: boolean;
}

interface Question {
  questionTitle: string;
  options: Option[];
}

interface Deck {
  id: string;
  deckTitle: string;
  deckDescription: string;
  questions: Question[];
  tags?: string[];
}

interface Student {
  id: string;
  name: string;
}

interface QuizProgress {
  deckTitle: string;
  currentQuestionIndex: number;
  answers: (string | null)[];
  score: number;
  remainingTime: number;
}

export default function Quiz() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;

  // State declarations
  const [deckTitle, setDeckTitle] = useState<string>("");
  const [deckDescription, setDeckDescription] = useState<string>("");
  const [questionTitle, setQuestionTitle] = useState<string>("");
  const [questionOption, setQuestionOption] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const optionInputRef = useRef<HTMLInputElement>(null);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(-1);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [editQuiz, setEditQuizz] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [playQuiz, setPlayQuiz] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackColor, setFeedbackColor] = useState<string>("");
  const [remainingTime, setRemainingTime] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [createQuiz, setCreateQuizz] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [csvData, setCsvData] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);

  // 2. Adicionar estados para tags
  const [currentTag, setCurrentTag] = useState<string>("");
  const [deckTags, setDeckTags] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("");

  // 3. Função para adicionar tag
  const addTag = () => {
    if (currentTag.trim() !== "" && !deckTags.includes(currentTag.trim())) {
      setDeckTags([...deckTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  // 4. Função para remover tag
  const removeTag = (tagToRemove: string) => {
    setDeckTags(deckTags.filter((tag) => tag !== tagToRemove));
  };

  // 5. Função para obter todas as tags únicas
  const getAllTags = () => {
    const allTags = new Set<string>();
    decks.forEach((deck) => {
      deck.tags?.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // Handle search input
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 6. Atualizar filtro de decks para incluir tags e busca
  const filteredDecks = decks.filter((deck) => {
    const matchesSearch = deck.deckTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTagFilter === "" || (deck.tags && deck.tags.includes(selectedTagFilter));
    return matchesSearch && matchesTag;
  });
  
  // Fetch user scores
  useEffect(() => {
    if (session) {
      fetchUserScores();
    }
  }, [session]);

  const fetchUserScores = async () => {
    try {
      const userDocRef = doc(db, "users", session?.user?.id || "");
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserScores(userData.quizzes || {});
      }
    } catch (error) {
      console.error("Error fetching scores:", error);
      toast.error("Error fetching scores.");
    }
  };

  // Save progress to localStorage
  const saveProgress = () => {
    if (!selectedDeck) return;

    const progress: QuizProgress = {
      deckTitle: selectedDeck.deckTitle,
      currentQuestionIndex,
      answers,
      score,
      remainingTime,
    };

    localStorage.setItem(
      `quizProgress_${selectedDeck.id}`,
      JSON.stringify(progress)
    );
  };

  // Load progress from localStorage
  const loadProgress = (deck: Deck) => {
    const savedProgress = localStorage.getItem(`quizProgress_${deck.id}`);
    if (savedProgress) {
      const progress: QuizProgress = JSON.parse(savedProgress);

      // Only load if it's the same deck
      if (progress.deckTitle === deck.deckTitle) {
        setCurrentQuestionIndex(progress.currentQuestionIndex);
        setAnswers(progress.answers);
        setScore(progress.score);
        setRemainingTime(progress.remainingTime);
        return true;
      }
    }
    return false;
  };

  // Clear progress
  const clearProgress = () => {
    if (!selectedDeck) return;
    localStorage.removeItem(`quizProgress_${selectedDeck.id}`);
  };

  // Timer functions
  const startTimer = useCallback(() => {
    let timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          goToNextQuestion();
          return 60;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);
  }, []);

  // Quiz functions
  const openPlayQuiz = useCallback(
    (deck: Deck) => {
      setSelectedDeck(deck);
      setQuestions(deck.questions);

      // Initialize answers array with null values
      const initialAnswers = Array(deck.questions.length).fill(null);
      setAnswers(initialAnswers);

      // Try to load saved progress
      const hasProgress = loadProgress(deck);

      if (!hasProgress) {
        // No saved progress - start fresh
        setCurrentQuestionIndex(0);
        setScore(0);
        setRemainingTime(60);
      }

      setPlayQuiz(true);
      startTimer();

      const params = new URLSearchParams();
      params.set("deckname", deck.deckTitle);
      params.set("openplay", "true");
      router.replace(`?${params.toString()}`);
    },
    [router, startTimer]
  );

  // Fetch decks
  useEffect(() => {
    async function fetchDecks() {
      const decksCollection = collection(db, "Quizzes");
      const snapshot = await getDocs(decksCollection);
      const decksData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Deck)
      );
      setDecks(decksData);
    }
    fetchDecks();
  }, []);

  // Handle URL params for quiz
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openPlay = params.get("openplay");
    const deckName = params.get("deckname");
    if (openPlay === "true" && deckName) {
      const selectedDeck = decks.find((deck) => deck.deckTitle === deckName);
      if (selectedDeck) {
        openPlayQuiz(selectedDeck);
      }
    }
  }, [decks, openPlayQuiz]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (session) {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("role", "==", "student"),
          where("professorId", "==", session.user.id)
        );
        const querySnapshot = await getDocs(q);
        const fetchedStudents: Student[] = [];
        querySnapshot.forEach((doc) => {
          fetchedStudents.push({ id: doc.id, ...doc.data() } as Student);
        });
        setStudents(fetchedStudents);
      }
    };
    fetchStudents();
  }, [session]);

  // Save progress when state changes
  useEffect(() => {
    if (playQuiz && selectedDeck) {
      saveProgress();
    }
  }, [
    currentQuestionIndex,
    answers,
    score,
    remainingTime,
    playQuiz,
    selectedDeck,
  ]);

  // Modal handlers
  const closePlayQuiz = () => {
    setPlayQuiz(false);
    setSelectedDeck(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setFeedback("");
    setRemainingTime(60);

    const params = new URLSearchParams();
    params.set("deckname", "");
    params.set("openplay", "false");
    router.replace(`?${params.toString()}`);
  };

  const openCreateQuiz = () => setCreateQuizz(true);
  const openImportModal = () => setShowImportModal(true);
  const closeImportModal = () => setShowImportModal(false);

  const closeCreateQuiz = () => {
    setCreateQuizz(false);
    setDeckTitle("");
    setDeckDescription("");
    setQuestions([]);
    setQuestionTitle("");
    setOptions([]);
  };

  const openEditQuiz = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeckTitle(deck.deckTitle);
    setDeckDescription(deck.deckDescription);
    setQuestions(deck.questions);
    setDeckTags(deck.tags || []);
    setEditQuizz(true);
  };

  const closeEditQuiz = () => {
    setEditQuizz(false);
    setSelectedDeck(null);
    setDeckTitle("");
    setDeckDescription("");
    setQuestions([]);
  };

  const openStudentModal = (deckId: string) => {
    setShowStudentModal(true);
    setSelectedDeck(decks.find((deck) => deck.id === deckId) || null);
  };

  const closeStudentModal = () => setShowStudentModal(false);

  // Task assignment
  const handleAddDeckAsTask = async (studentId: string, deck: Deck | null) => {
    if (!deck) return;

    try {
      const studentDocRef = doc(db, "users", studentId);
      const studentDocSnapshot = await getDoc(studentDocRef);
      const studentData = studentDocSnapshot.data();

      if (!studentData || !studentData.tasks) {
        toast.error("Error adding task.");
        return;
      }

      const tasksArray = studentData.tasks.Task || [];
      const taskExists = tasksArray.some(
        (task: { task: string }) =>
          task.task === `Review lesson: ${deck.deckTitle}`
      );

      if (taskExists) {
        toast.error("Task already exists!");
        return;
      }

      const deckLink = `/student-dashboard/pratica/quizz?deckname=${encodeURIComponent(
        deck.deckTitle
      )}&openplay=true`;
      const newTask = {
        task: `Review lesson: ${deck.deckTitle}`,
        link: deckLink,
        done: false,
      };
      tasksArray.push(newTask);

      await updateDoc(studentDocRef, {
        tasks: { Task: tasksArray },
      });

      toast.success("Task added successfully!");
      setShowStudentModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Error adding task.");
    }
  };

  // Quiz creation functions
  const addOption = () => {
    if (!questionTitle) {
      toast.error("Add a title to this question.");
      return;
    }
    if (questionOption.trim() !== "") {
      setOptions([...options, { option: questionOption, isCorrect: false }]);
      setQuestionOption("");
      if (optionInputRef.current) optionInputRef.current.focus();
    }
  };

  const deleteOptioninCreation = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  const finishQuestion = () => {
    if (options.length < 2) {
      toast.error("Add at least 2 options!");
      return;
    }
    if (!deckDescription || !deckTitle) {
      toast.error("Add title and description!");
      return;
    }
    if (correctOptionIndex === -1) {
      toast.error("Select the correct option!");
      return;
    }
    if (questionTitle.trim() !== "" && options.length > 0) {
      setQuestions([...questions, { questionTitle, options }]);
      setQuestionTitle("");
      setOptions([]);
      setCorrectOptionIndex(-1);
      toast.success("Question added");
    } else {
      toast.error("Fill the question and add options");
    }
  };

  const handleCreateQuiz = async () => {
    try {
      if (!deckTitle) {
        toast.error("Add a deck title...");
        return;
      }

      if (questions.length < 4) {
        toast.error("Add at least 4 questions before creating the quiz.");
        return;
      }

      const quizRef = doc(db, "Quizzes", deckTitle);
      await setDoc(quizRef, {
        deckTitle: deckTitle,
        deckDescription: deckDescription,
        questions: questions,
        tags: deckTags,
      });
      toast.success("Deck created successfully!");

      setDeckTitle("");
      setDeckDescription("");
      setQuestionTitle("");
      setQuestionOption("");
      setOptions([]);
      setQuestions([]);
      setDeckTags([]);
      setCreateQuizz(false);

      const snapshot = await getDocs(collection(db, "Quizzes"));
      const decksData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Deck)
      );
      setDecks(decksData);
    } catch (error) {
      console.error("Error creating quiz: ", error);
      toast.error("Error creating quiz");
    }
  };

  // Edit functions
  const handleSaveEditQuiz = async () => {
    try {
      if (!deckTitle || !selectedDeck) {
        toast.error("Fill the deck title and description...");
        return;
      }

      const quizRef = doc(db, "Quizzes", selectedDeck.id);
      await updateDoc(quizRef, {
        deckTitle: deckTitle,
        deckDescription: deckDescription,
        questions: questions,
        tags: deckTags,
      });

      closeEditQuiz();

      const snapshot = await getDocs(collection(db, "Quizzes"));
      const decksData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Deck)
      );
      setDecks(decksData);
      toast.success("Deck updated successfully!");
    } catch (error) {
      console.error("Error updating quiz: ", error);
      toast.error("Error updating quiz");
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDoc(doc(db, "Quizzes", deckId));
      const snapshot = await getDocs(collection(db, "Quizzes"));
      const decksData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Deck)
      );
      setDecks(decksData);
      toast.success("Deck deleted");
    } catch (error) {
      console.error("Error deleting deck: ", error);
      toast.error("Error deleting deck");
    }
  };

  const handleOptionChange = (index: number) => {
    setCorrectOptionIndex(index);
    setOptions(
      options.map((option, i) =>
        i === index
          ? { ...option, isCorrect: true }
          : { ...option, isCorrect: false }
      )
    );
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionTitle = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionEditChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex].option = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionCorrectChange = (qIndex: number, oIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map(
      (option, i) =>
        i === oIndex
          ? { ...option, isCorrect: true }
          : { ...option, isCorrect: false }
    );
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const deleteOption = (qIndex: number, oIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter(
      (_, i) => i !== oIndex
    );
    setQuestions(updatedQuestions);
  };

  const addQuestionToEdit = () => {
    if (questionTitle.trim() !== "" && options.length > 0) {
      setQuestions([...questions, { questionTitle, options }]);
      setQuestionTitle("");
      setOptions([]);
      setCorrectOptionIndex(-1);
      toast.success("Question added");
    }
  };

  const addOptionToQuestion = (qIndex: number) => {
    const updatedQuestions = [...questions];
    if (questionOption.trim() !== "") {
      updatedQuestions[qIndex].options.push({
        option: questionOption,
        isCorrect: false,
      });
      setQuestions(updatedQuestions);
      setQuestionOption("");
    }
  };

  // Quiz playing functions
  const handleAnswerSelect = (selectedOption: string) => {
    if (!selectedDeck || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options.some(
      (option) => option.option === selectedOption && option.isCorrect
    );

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(newAnswers);

    setFeedback(isCorrect ? "Correct!" : "Wrong!");
    setFeedbackColor(isCorrect ? "green" : "red");

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 2000);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setFeedback("");
      setRemainingTime(60);
    } else {
      handleFinishQuiz();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setFeedback("");
      setRemainingTime(60);
    }
  };

  const handleFinishQuiz = async () => {
    if (session && selectedDeck) {
      try {
        const userDocRef = doc(db, "users", session.user.id);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();

        const userQuizzes = userData?.quizzes || {};
        userQuizzes[selectedDeck.deckTitle] = score;

        await updateDoc(userDocRef, {
          quizzes: userQuizzes,
        });

        toast.success("Score saved successfully!");
      } catch (error) {
        console.error("Error saving score:", error);
        toast.error("Error saving score.");
      }
    }

    // Clear saved progress
    clearProgress();

    // Close quiz
    closePlayQuiz();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      addOption();
    }
  };

  // CSV import functions
  const handleCSVUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCSVImport = () => {
    if (!csvData.trim()) {
      toast.error("Please paste CSV data");
      return;
    }

    setImporting(true);

    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          if (data.length === 0) {
            throw new Error("CSV is empty");
          }

          // Extract deck info from first row
          const firstRow = data[0];
          if (!firstRow.deckTitle || !firstRow.deckDescription) {
            throw new Error(
              "CSV must contain deckTitle and deckDescription columns"
            );
          }

          const newDeckTitle = firstRow.deckTitle;
          const newDeckDescription = firstRow.deckDescription;
          const newDeckTags = firstRow.tags
            ? firstRow.tags.split(",").map((tag: string) => tag.trim())
            : [];

          // Process questions
          const questionsMap: Record<string, Question> = {};

          data.forEach((row) => {
            const questionTitle = row.questionTitle;
            if (!questionTitle) return;

            if (!questionsMap[questionTitle]) {
              questionsMap[questionTitle] = {
                questionTitle,
                options: [],
              };
            }

            // Add all options (assuming columns: option1, option2, ...)
            for (let i = 1; i <= 4; i++) {
              const optionKey = `option${i}`;
              const isCorrectKey = `isCorrect${i}`;

              if (row[optionKey]) {
                questionsMap[questionTitle].options.push({
                  option: row[optionKey],
                  isCorrect: row[isCorrectKey] === "true",
                });
              }
            }
          });

          const newQuestions = Object.values(questionsMap);

          if (newQuestions.length === 0) {
            throw new Error("No valid questions found in CSV");
          }

          // Set state for preview
          setDeckTitle(newDeckTitle);
          setDeckTags(newDeckTags);
          setDeckDescription(newDeckDescription);
          setQuestions(newQuestions);
          setShowImportModal(false);
          setCreateQuizz(true);
          toast.success("CSV imported successfully! Review and create quiz");
        } catch (error: any) {
          toast.error(`Error importing CSV: ${error.message}`);
        } finally {
          setImporting(false);
        }
      },
      error: (error: any) => {
        toast.error(`CSV parsing error: ${error.message}`);
        setImporting(false);
      },
    });
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row gap-4 items-center w-full p-3">
        <motion.div className="w-full" whileHover={{ scale: 1.01 }}>
          <FluencyInput
            placeholder="Procurar deck..."
            className="w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </motion.div>
        <div className="flex flex-row gap-2 items-center">
          <select
            value={selectedTagFilter}
            onChange={(e) => setSelectedTagFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-fluency-gray-700"
          >
            <option value="">Todas as tags</option>
            {getAllTags().map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          {selectedTagFilter && (
            <button
              onClick={() => setSelectedTagFilter("")}
              className="px-2 py-1 bg-fluency-red-100 text-fluency-red-700 rounded-md text-sm hover:bg-fluency-red-200"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {role === "teacher" && (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FluencyButton className="w-full" onClick={openCreateQuiz}>
                  <span className="flex items-center">
                    Criar <span className="hidden sm:inline ml-1">Quiz</span>
                    <RxCardStackPlus className="ml-2 w-5 h-5" />
                  </span>
                </FluencyButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FluencyButton
                  variant="gray"
                  className="w-full"
                  onClick={openImportModal}
                >
                  <span className="flex items-center">
                    <span className="hidden sm:inline">Importar</span>
                    <FiUpload className="ml-2 w-5 h-5" />
                  </span>
                </FluencyButton>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredDecks.map((deck) => (
          <motion.div
            key={deck.id}
            className="bg-fluency-pages-light dark:bg-fluency-pages-dark flex flex-col justify-between rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div
              onClick={() => openPlayQuiz(deck)}
              className="p-5 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <TbCardsFilled className="text-fluency-blue-500 text-xl" />
                <h3 className="font-bold text-lg truncate">{deck.deckTitle}</h3>
              </div>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm mb-3 line-clamp-2">
                {deck.deckDescription}
              </p>
              <div className="flex justify-between items-center">
                <span className="bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-200 text-xs px-2 py-1 rounded-full">
                  {deck.questions.length} perguntas
                </span>
                
                <span className="font-semibold text-fluency-blue-600 dark:text-fluency-blue-400">
                  Pontos: {userScores[deck.deckTitle] || 0}
                </span>
              </div>
            </div>

{deck.tags && deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-4">
                    {deck.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-fluency-green-100 dark:bg-fluency-green-900 text-fluency-green-800 dark:text-fluency-green-200 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {deck.tags.length > 3 && (
                      <span className="text-xs text-fluency-gray-500">
                        +{deck.tags.length - 3} mais
                      </span>
                    )}
                  </div>
                )}
            {role === "teacher" && (
              <div className="bg-fluency-gray-100 dark:bg-fluency-gray-900 p-2 flex justify-end gap-2">
                
                <Tooltip
                  content="Edit deck"
                  className="bg-fluency-blue-600 p-1 rounded-md text-white"
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditQuiz(deck);
                    }}
                    className="p-1.5 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiEdit className="text-fluency-blue-500 text-lg" />
                  </motion.button>
                </Tooltip>

                <Tooltip
                  content="Assign to student"
                  className="bg-fluency-yellow-600 p-1 rounded-md text-white"
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudentModal(deck.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-fluency-yellow-100 dark:hover:bg-fluency-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <GiSchoolBag className="text-fluency-yellow-500 text-lg" />
                  </motion.button>
                </Tooltip>

                <Tooltip
                  content="Delete deck"
                  className="bg-fluency-red-600 p-1 rounded-md text-white"
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-fluency-red-100 dark:hover:bg-fluency-gray-700"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdDeleteSweep className="text-fluency-red-500 text-lg" />
                  </motion.button>
                </Tooltip>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Play Quiz Modal */}
      <AnimatePresence>
        {playQuiz && selectedDeck && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-fluency-pages-light dark:bg-fluency-gray-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute top-0 h-2 bg-fluency-green-500 transition-all duration-1000"
                  style={{ width: `${(remainingTime / 60) * 100}%` }}
                  animate={{ width: ["0%", `${(remainingTime / 60) * 100}%`] }}
                  transition={{ duration: 1 }}
                />
                <FluencyCloseButton className="pt-2" onClick={closePlayQuiz} />

                <div className="p-8">
                  <div className="flex justify-between items-center my-4">
                    <h3 className="text-xl font-bold">
                      Pergunta {currentQuestionIndex + 1} de {questions.length}
                    </h3>
                    <span className="bg-fluency-blue-500 text-white px-4 py-1 rounded-md font-medium">
                      {remainingTime}s
                    </span>
                  </div>

                  {currentQuestionIndex < questions.length ? (
                    <>
                      <motion.p
                        className="text-lg font-medium mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {questions[currentQuestionIndex].questionTitle}
                      </motion.p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {questions[currentQuestionIndex].options.map(
                          (option, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleAnswerSelect(option.option)}
                              disabled={answers[currentQuestionIndex] !== null}
                              className={`p-4 rounded-md text-left transition-all ${
                                answers[currentQuestionIndex] === option.option
                                  ? option.isCorrect
                                    ? "bg-fluency-green-100 dark:bg-fluency-green-900 border-2 border-fluency-green-500"
                                    : "bg-fluency-red-100 dark:bg-fluency-red-900 border-2 border-fluency-red-500"
                                  : "bg-fluency-gray-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-600"
                              } ${
                                answers[currentQuestionIndex] !== null &&
                                "opacity-90"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + index * 0.05 }}
                            >
                              {option.option}
                            </motion.button>
                          )
                        )}
                      </div>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          {currentQuestionIndex > 0 && (
                            <FluencyButton
                              variant="glass"
                              onClick={goToPreviousQuestion}
                            >
                              Voltar
                            </FluencyButton>
                          )}
                        </div>

                        <FluencyButton
                          variant="confirm"
                          onClick={goToNextQuestion}
                          className="flex items-center gap-2"
                          disabled={answers[currentQuestionIndex] === null}
                        >
                          {currentQuestionIndex < questions.length - 1
                            ? "Próxima"
                            : "Finalizar"}
                          <FaArrowRight />
                        </FluencyButton>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-2xl font-bold mb-2">
                        Quiz Completado!
                      </h3>
                      <motion.div
                        className="text-5xl font-bold text-fluency-blue-500 mb-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        {score} / {questions.length}
                      </motion.div>
                      <FluencyButton
                        variant="confirm"
                        onClick={handleFinishQuiz}
                        className="w-full max-w-xs mx-auto"
                      >
                        Finalizar Quiz
                      </FluencyButton>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-fluency-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Importar Quiz de CSV</h3>
                <FluencyCloseButton onClick={closeImportModal} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Fazer upload do arquivo CSV:
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Ou cole o CSV aqui:
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="w-full p-3 border rounded-lg font-mono text-sm"
                  placeholder={`deckTitle,deckDescription,questionTitle,option1,isCorrect1,option2,isCorrect2,...\nMath Basics,Basic math questions,What is 2+2?,4,true,5,false,...`}
                />
              </div>

              <div className="flex justify-end gap-3">
                <FluencyButton variant="gray" onClick={closeImportModal}>
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  variant="confirm"
                  onClick={handleCSVImport}
                  disabled={importing}
                >
                  {importing ? "Importando..." : "Importar"}
                </FluencyButton>
              </div>

              <div className="mt-6 bg-fluency-blue-50 dark:bg-fluency-blue-900 p-4 rounded-lg">
                <h4 className="font-bold mb-2">CSV Exemplo de formato:</h4>
                <pre className="text-xs overflow-x-auto">
                  {`deckTitle,deckDescription,tags,questionTitle,option1,isCorrect1,option2,isCorrect2,option3,isCorrect3,option4,isCorrect4
                    Math Basics,Basic math questions,"math,basic,arithmetic",What is 2+2?,4,true,5,false,6,false,8,false
                    Math Basics,Basic math questions,"math,basic,arithmetic",What is 3*3?,6,false,9,true,12,false,15,false`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {createQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-fluency-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Crie um novo quiz</h3>
                <FluencyCloseButton onClick={closeCreateQuiz} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título do Deck
                    </label>
                    <FluencyInput
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      placeholder="Math Quiz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descrição do Deck
                    </label>
                    <FluencyInput
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      placeholder="Basic math questions"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <FluencyInput
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        placeholder="Adicionar tag"
                      />
                      <FluencyButton onClick={addTag}>Adicionar</FluencyButton>
                    </div>
                    {deckTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {deckTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-200 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-fluency-red-500 hover:text-fluency-red-700"
                            >
                              <IoClose size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pergunta
                    </label>
                    <FluencyInput
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      placeholder="What is 2+2?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Opções
                    </label>
                    <div className="flex gap-2">
                      <FluencyInput
                        ref={optionInputRef}
                        value={questionOption}
                        onKeyPress={handleKeyPress}
                        onChange={(e) => setQuestionOption(e.target.value)}
                        placeholder="Correct answer"
                      />
                      <FluencyButton
                        className="min-w-[120px]"
                        onClick={addOption}
                      >
                        Add Opção
                      </FluencyButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Opções</label>
                    <ul className="space-y-2 max-h-40 overflow-y-auto p-2 bg-fluency-gray-100 dark:bg-fluency-gray-900 rounded-lg">
                      {options.map((option, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-fluency-gray-800 rounded-md"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={index === correctOptionIndex}
                              onChange={() => handleOptionChange(index)}
                              className="mr-2"
                            />
                            <span>{option.option}</span>
                          </div>
                          <button
                            onClick={() => deleteOptioninCreation(index)}
                            className="text-fluency-red-500 hover:text-fluency-red-700"
                          >
                            <MdDeleteSweep size={20} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <FluencyButton
                      variant="confirm"
                      className="w-full"
                      onClick={finishQuestion}
                    >
                      Add Pergunta
                    </FluencyButton>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    Perguntas adicionadas ({questions.length})
                  </h4>

                  <div className="bg-fluency-blue-50 dark:bg-fluency-blue-900 p-3 rounded-lg mb-4">
                    <p className="text-sm">
                      <span className="font-bold">Dica:</span> Adicione pelo
                      menos 4 perguntas para criar um quiz.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {questions.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        className="bg-fluency-gray-100 dark:bg-fluency-gray-700 p-3 rounded-lg"
                      >
                        <p className="font-medium mb-2">
                          {question.questionTitle}
                        </p>
                        <ul className="space-y-1">
                          {question.options.map((option, oIndex) => (
                            <li
                              key={oIndex}
                              className={`flex items-center ${
                                option.isCorrect
                                  ? "text-fluency-green-600 dark:text-fluency-green-400"
                                  : ""
                              }`}
                            >
                              <span className="mr-2">{oIndex + 1}.</span>
                              {option.option}
                              {option.isCorrect && (
                                <FiCheck className="ml-2 text-fluency-green-500" />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {questions.length === 0 && (
                      <div className="text-center py-8 text-fluency-gray-500">
                        <TbCardsFilled className="mx-auto text-4xl mb-2" />
                        <p>Nenhuma pergunta adicionada ainda</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-fluency-gray-200 dark:border-fluency-gray-700 mt-4">
                <FluencyButton variant="gray" onClick={closeCreateQuiz}>
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  variant="confirm"
                  onClick={handleCreateQuiz}
                  disabled={questions.length < 4}
                >
                  Criar Quiz
                </FluencyButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {editQuiz && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-fluency-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Editar Quiz: {selectedDeck.deckTitle}
                </h3>
                <FluencyCloseButton onClick={closeEditQuiz} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Deck Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título do Quiz
                    </label>
                    <FluencyInput
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      placeholder="Título do Quiz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descrição
                    </label>
                    <FluencyInput
                      value={deckDescription}
                      onChange={(e) => setDeckDescription(e.target.value)}
                      placeholder="Descrição"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <FluencyInput
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        placeholder="Adicionar tag"
                      />
                      <FluencyButton onClick={addTag}>Adicionar</FluencyButton>
                    </div>
                    {deckTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {deckTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-200 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-fluency-red-500 hover:text-fluency-red-700"
                            >
                              <IoClose size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-fluency-yellow-50 dark:bg-fluency-yellow-900 p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-bold">Dica:</span> Adicione novas
                      perguntas abaixo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nova pergunta
                    </label>
                    <FluencyInput
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      placeholder="Nova pergunta aqui"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nova opção
                    </label>
                    <div className="flex gap-2">
                      <FluencyInput
                        value={questionOption}
                        onChange={(e) => setQuestionOption(e.target.value)}
                        placeholder="Opção aqui"
                      />
                      <FluencyButton
                        className="min-w-[120px]"
                        onClick={addOption}
                      >
                        Add Opção
                      </FluencyButton>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Opções</label>
                    <ul className="space-y-2 max-h-40 overflow-y-auto p-2 bg-fluency-gray-100 dark:bg-fluency-gray-900 rounded-lg">
                      {options.map((option, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-fluency-gray-800 rounded-md"
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={index === correctOptionIndex}
                              onChange={() => handleOptionChange(index)}
                              className="mr-2"
                            />
                            <span>{option.option}</span>
                          </div>
                          <button
                            onClick={() => deleteOptioninCreation(index)}
                            className="text-fluency-red-500 hover:text-fluency-red-700"
                          >
                            <MdDeleteSweep size={20} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <FluencyButton
                    variant="confirm"
                    className="w-full"
                    onClick={addQuestionToEdit}
                    disabled={!questionTitle || options.length === 0}
                  >
                    Adicionar Pergunta Nova
                  </FluencyButton>
                </div>

                {/* Questions List */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-semibold">
                    Perguntas ({questions.length})
                  </h4>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {questions.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        className="bg-fluency-gray-100 dark:bg-fluency-gray-700 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <FluencyInput
                            value={question.questionTitle}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, e.target.value)
                            }
                            className="w-full font-medium"
                          />
                          <button
                            onClick={() => deleteQuestion(qIndex)}
                            className="ml-2 text-fluency-red-500 hover:text-fluency-red-700 p-2"
                          >
                            <MdDeleteSweep size={20} />
                          </button>
                        </div>

                        <div className="space-y-2 mt-3">
                          <label className="text-sm font-medium">Opções:</label>
                          <ul className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <li
                                key={oIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  checked={option.isCorrect}
                                  onChange={() =>
                                    handleOptionCorrectChange(qIndex, oIndex)
                                  }
                                  className="mr-1"
                                />
                                <FluencyInput
                                  value={option.option}
                                  onChange={(e) =>
                                    handleOptionEditChange(
                                      qIndex,
                                      oIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 py-1"
                                />
                                <button
                                  onClick={() => deleteOption(qIndex, oIndex)}
                                  className="text-fluency-red-500 hover:text-fluency-red-700 p-1"
                                >
                                  <MdDeleteSweep size={18} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <FluencyInput
                            value={questionOption}
                            onChange={(e) => setQuestionOption(e.target.value)}
                            placeholder="Add new option"
                            className="flex-1"
                          />
                          <FluencyButton
                            onClick={() => addOptionToQuestion(qIndex)}
                            disabled={!questionOption}
                          >
                            Add
                          </FluencyButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700 mt-4">
                    <FluencyButton variant="gray" onClick={closeEditQuiz}>
                      Cancelar
                    </FluencyButton>
                    <FluencyButton
                      variant="confirm"
                      onClick={handleSaveEditQuiz}
                    >
                      Salvar mudanças
                    </FluencyButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Assignment Modal */}
      {showStudentModal && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-fluency-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Enviar como tarefa</h3>
                <FluencyCloseButton onClick={closeStudentModal} />
              </div>

              <div className="mb-4">
                <p className="font-medium mb-1">Quiz:</p>
                <div className="bg-fluency-blue-50 dark:bg-fluency-blue-900 p-3 rounded-lg flex items-center">
                  <TbCardsFilled className="text-fluency-blue-500 mr-2 text-xl" />
                  <span className="font-semibold">
                    {selectedDeck.deckTitle}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Selecionar aluno
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-fluency-gray-700"
                >
                  <option value="">Selecinar aluno</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-fluency-yellow-50 dark:bg-fluency-yellow-900 p-3 rounded-lg mb-4">
                <p className="text-sm">
                  Isso vai adicionar o quiz como uma tarefa para o aluno
                  selecionado.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <FluencyButton variant="gray" onClick={closeStudentModal}>
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  variant="confirm"
                  onClick={() =>
                    handleAddDeckAsTask(selectedStudentId, selectedDeck)
                  }
                  disabled={!selectedStudentId}
                >
                  Enviar
                </FluencyButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
