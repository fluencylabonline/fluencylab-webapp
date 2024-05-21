'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore"; 
import { db } from "@/app/firebase";
import './quizstyle.css';

export default function Quiz() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [deckTitle, setDeckTitle] = useState('');
    const [deckDescription, setDeckDescription] = useState('');
    const [questionTitle, setQuestionTitle] = useState('');
    const [questionOption, setQuestionOption] = useState('');
    const [options, setOptions] = useState([]);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(-1);
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [editQuiz, setEditQuizz] = useState(false);

    const [playQuiz, setPlayQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('');
    const [remainingTime, setRemainingTime] = useState(60); // Initial time in seconds (1 minute)
    const [score, setScore] = useState(0);
    const scores = JSON.parse(localStorage.getItem("quizScores")) || {};

    const [createQuiz, setCreateQuizz] = useState(false);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        async function fetchDecks() {
            const decksCollection = collection(db, "Quizzes");
            const snapshot = await getDocs(decksCollection);
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        }
        fetchDecks();
    }, []);

    function openCreateQuiz() {
        setCreateQuizz(true);
    }

    function closeCreateQuiz() {
        setCreateQuizz(false);
    }

    function openEditQuiz(deck) {
        setSelectedDeck(deck);
        setDeckTitle(deck.deckTitle);
        setDeckDescription(deck.deckDescription);
        setQuestions(deck.questions);
        setEditQuizz(true);
    }

    function closeEditQuiz() {
        setEditQuizz(false);
        setSelectedDeck(null);
        setDeckTitle('');
        setDeckDescription('');
        setQuestions([]);
    }

    function openPlayQuiz(deck) {
        setSelectedDeck(deck);
        setQuestions(deck.questions);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
        setRemainingTime(60); // Reset timer for each question
        setPlayQuiz(true);
        startTimer(); // Start the timer when modal opens
    }
    
    function closePlayQuiz() {
        setPlayQuiz(false);
        setSelectedDeck(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
    }

    function addOption() {
        if (questionOption.trim() !== '') {
            setOptions([...options, { option: questionOption, isCorrect: false }]);
            setQuestionOption('');
        }
    }

    function finishQuestion() {
        if (questionTitle.trim() !== '' && options.length > 0) {
            setQuestions([...questions, { questionTitle, options }]);
            setQuestionTitle('');
            setOptions([]);
            setCorrectOptionIndex(-1);
        }
    }

    async function handleCreateQuiz() {
        try {
            if (!deckTitle) {
                console.error("Deck title is required");
                return;
            }

            const quizRef = doc(db, "Quizzes", deckTitle);
            await setDoc(quizRef, {
                deckTitle: deckTitle,
                deckDescription: deckDescription,
                questions: questions,
            });

            // Reset state after successful creation
            setDeckTitle('');
            setDeckDescription('');
            setQuestionTitle('');
            setQuestionOption('');
            setOptions([]);
            setQuestions([]);
            setCreateQuizz(false);

            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        } catch (error) {
            console.error("Error creating quiz: ", error);
        }
    }

    async function handleSaveEditQuiz() {
        try {
            if (!deckTitle || !selectedDeck) {
                console.error("Deck title and selected deck are required");
                return;
            }

            const quizRef = doc(db, "Quizzes", selectedDeck.id);
            await updateDoc(quizRef, {
                deckTitle: deckTitle,
                deckDescription: deckDescription,
                questions: questions,
            });

            // Reset state after successful editing
            closeEditQuiz();

            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        } catch (error) {
            console.error("Error updating quiz: ", error);
        }
    }

    async function handleDeleteDeck(deckId) {
        try {
            await deleteDoc(doc(db, "Quizzes", deckId));
            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        } catch (error) {
            console.error("Error deleting deck: ", error);
        }
    }

    const handleOptionChange = (index) => {
        setCorrectOptionIndex(index);
        setOptions(
            options.map((option, i) =>
                i === index ? { ...option, isCorrect: true } : { ...option, isCorrect: false }
            )
        );
    };

    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionTitle = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionEditChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex].option = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionCorrectChange = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((option, i) =>
            i === oIndex ? { ...option, isCorrect: true } : { ...option, isCorrect: false }
        );
        setQuestions(updatedQuestions);
    };

    const deleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const deleteOption = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(updatedQuestions);
    };

    const addQuestionToEdit = () => {
        if (questionTitle.trim() !== '' && options.length > 0) {
            setQuestions([...questions, { questionTitle, options }]);
            setQuestionTitle('');
            setOptions([]);
            setCorrectOptionIndex(-1);
        }
    };

    const addOptionToQuestion = (qIndex) => {
        const updatedQuestions = [...questions];
        if (questionOption.trim() !== '') {
            updatedQuestions[qIndex].options.push({ option: questionOption, isCorrect: false });
            setQuestions(updatedQuestions);
            setQuestionOption('');
        }
    };

    const handleAnswerSelect = (selectedOption) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = currentQuestion.options.some(
            (option) => option.option === selectedOption && option.isCorrect
        );
        setUserAnswer(selectedOption);
        setFeedback(isCorrect ? "Correct!" : "Wrong!");
        setFeedbackColor(isCorrect ? "green" : "red");
    
        // Update score if the answer is correct
        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
            updateScoreInLocalStorage(selectedDeck.id, score + 1);
        }
    
        // Move to next question after 1 minute
        setTimeout(() => {
            goToNextQuestion();
        }, 60000);
    };    

    const startTimer = () => {
        let timer = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(timer);
                    goToNextQuestion(); // Move to next question when time's up
                    return 60; // Reset time for next question
                } else {
                    return prevTime - 1; // Decrease remaining time by 1 second
                }
            });
        }, 1000); // Update every second
    };
    
    const goToNextQuestion = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer(null);
        setFeedback('');
    };

    const updateScoreInLocalStorage = (deckId, score) => {
        const scores = JSON.parse(localStorage.getItem("quizScores")) || {};
        scores[deckId] = score;
        localStorage.setItem("quizScores", JSON.stringify(scores));
    };
    

return (
<div>
    <FluencyInput />
    {role === 'teacher' && <FluencyButton onClick={openCreateQuiz}>Create Quizz</FluencyButton>}
    <div>
        {decks.map(deck => (
            <div key={deck.id}>
                <div className="flex flex-row gap-2">
                    <p onClick={() => openPlayQuiz(deck)} className="cursor-pointer">{deck.deckTitle}</p>
                    <FluencyButton onClick={() => openEditQuiz(deck)}>Edit</FluencyButton>
                    <FluencyButton onClick={() => handleDeleteDeck(deck.id)}>Delete</FluencyButton>
                    <p>Score: {scores[deck.id] || 0}</p>
                </div>
            </div>
        ))}
    </div>

    {playQuiz && selectedDeck && (
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full max-w-md p-5">
            <div className="timer-bar" style={{ width: `${(remainingTime / 60) * 100}%` }}></div>
                <div className="flex flex-col items-center justify-center">
                    <FluencyCloseButton onClick={closePlayQuiz} />
                    {currentQuestionIndex < questions.length ? (
                        <div>
                            <h3 className="text-lg leading-6 font-medium mb-2">Question {currentQuestionIndex + 1}</h3>
                            <p>{questions[currentQuestionIndex].questionTitle}</p>
                            <ul>
                                {questions[currentQuestionIndex].options.map((option, index) => (
                                    <li key={index}>
                                        <input
                                            type="radio"
                                            id={option.option}
                                            name="options"
                                            value={option.option}
                                            checked={userAnswer === option.option}
                                            onChange={() => handleAnswerSelect(option.option)}
                                        />
                                        <label htmlFor={option.option}>{option.option}</label>
                                    </li>
                                ))}
                            </ul>
                            <p style={{ color: feedbackColor }}>{feedback}</p>
                            <FluencyButton onClick={goToNextQuestion}>Next</FluencyButton>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg leading-6 font-medium mb-2">Quiz Completed</h3>
                            <p>Your score: {score}</p>
                            <FluencyButton onClick={closePlayQuiz}>Close</FluencyButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>)}

    {editQuiz && 
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5">
                <div className="flex flex-col items-center justify-center">
                    <FluencyCloseButton onClick={closeEditQuiz} />
                    <h3 className="text-lg leading-6 font-medium mb-2">Edit Quiz</h3>
                    <div className="mt-2 flex flex-col items-center gap-3 p-4">
                        <FluencyInput value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} placeholder="Título do deck" />
                        <FluencyInput value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)} placeholder="Descrição" />
                        {questions.map((question, qIndex) => (
                            <div key={qIndex} className="flex flex-col gap-2 mb-4">
                                <FluencyInput value={question.questionTitle} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="Pergunta aqui" />
                                <ul>
                                    {question.options.map((option, oIndex) => (
                                        <li key={oIndex} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={() => handleOptionCorrectChange(qIndex, oIndex)}
                                            />
                                            <FluencyInput value={option.option} onChange={(e) => handleOptionEditChange(qIndex, oIndex, e.target.value)} />
                                            <FluencyButton onClick={() => deleteOption(qIndex, oIndex)}>Delete Option</FluencyButton>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-row gap-1">
                                    <FluencyInput value={questionOption} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Nova alternativa" />
                                    <FluencyButton onClick={() => addOptionToQuestion(qIndex)}>Add Option</FluencyButton>
                                </div>
                                <FluencyButton onClick={() => deleteQuestion(qIndex)}>Delete Question</FluencyButton>
                            </div>
                        ))}
                        <div>
                            <FluencyInput value={questionTitle} onChange={(e) => setQuestionTitle(e.target.value)} placeholder="Pergunta aqui" />
                            <p>Opções</p>
                            <div className="flex flex-row gap-1">
                                <FluencyInput value={questionOption} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Alternativa" />
                                <FluencyButton onClick={addOption}>Add</FluencyButton>
                            </div>
                            <ul>
                                {options.map((option, index) => (
                                    <li key={index}>
                                        <input
                                            type="checkbox"
                                            checked={index === correctOptionIndex}
                                            onChange={() => handleOptionChange(index)}
                                        />
                                        <label>{option.option}</label>
                                    </li>
                                ))}
                            </ul>
                            <FluencyButton variant="confirm" onClick={addQuestionToEdit}>Add Question</FluencyButton>
                        </div>
                        <div className="flex justify-center">
                            <FluencyButton variant='confirm' onClick={handleSaveEditQuiz}>Salvar</FluencyButton>
                            <FluencyButton variant='gray' onClick={closeEditQuiz}>Cancelar</FluencyButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>}

    {createQuiz && 
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5">
                <div className="flex flex-col items-center justify-center">
                    <FluencyCloseButton onClick={closeCreateQuiz} />
                    <h3 className="text-lg leading-6 font-medium mb-2">Criar um Quiz</h3>
                    <div className="mt-2 flex flex-col items-center gap-3 p-4">
                        <FluencyInput value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} placeholder="Título do deck" />
                        <FluencyInput value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)} placeholder="Descrição" />
                        <div>
                            <FluencyInput value={questionTitle} onChange={(e) => setQuestionTitle(e.target.value)} placeholder="Pergunta aqui" />
                            <p>Opções</p>
                            <div className="flex flex-row gap-1">
                                <FluencyInput value={questionOption} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Alternativa" />
                                <FluencyButton onClick={addOption}>Add</FluencyButton>
                            </div>
                            <ul>
                                {options.map((option, index) => (
                                    <li key={index}>
                                        <input
                                            type="checkbox"
                                            checked={index === correctOptionIndex}
                                            onChange={() => handleOptionChange(index)}
                                        />
                                        <label>{option.option}</label>
                                    </li>
                                ))}
                            </ul>
                            <FluencyButton variant="confirm" onClick={finishQuestion}>Finalizar</FluencyButton>
                        </div>
                        <div className="flex flex-col items-center gap-3 p-4">
                            <h4 className="text-md leading-6 font-medium mb-2">Perguntas Adicionadas</h4>
                            <ul>
                                {questions.map((question, index) => (
                                    <li key={index}>
                                        <strong>{question.questionTitle}</strong>
                                        <ul>
                                            {question.options.map((option, i) => (
                                                <li key={i}>{option.option}</li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center">
                            <FluencyButton variant='confirm' onClick={handleCreateQuiz}>Criar Quizz</FluencyButton>
                            <FluencyButton variant='gray' onClick={closeCreateQuiz}>Cancelar</FluencyButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>}
</div>
);}
