'use client';
import { useState, useEffect } from "react";
import words from "../../database/500-english-words.json";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaArrowRight } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundForward } from "react-icons/io";
import { db } from "@/app/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";
import { PiExam } from "react-icons/pi";

interface Word {
  english: string;
  correct: string;
  translations: string[];
}

const Level1: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false);
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session && session.user && session.user.id) {
        try {
          const profile = doc(db, 'users', session.user.id);
          const docSnap = await getDoc(profile);
          if (docSnap.exists()) {
            setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document: ", error);
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  const totalPossiblePoints = 5;
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [score, setScore] = useState(0);
  const [answerChosen, setAnswerChosen] = useState(false);
  const [progressColor, setProgressColor] = useState("bg-fluency-orange-500");
  const [quizHistory, setQuizHistory] = useState<
    { word: string; correctAnswer: string; selectedAnswer: string; options: string[] }[]
  >([]);

  // Ao montar o componente, tenta carregar o estado salvo; se não houver, gera novas palavras
  useEffect(() => {
    const savedState = localStorage.getItem("level1QuizState");
    if (savedState) {
      const state = JSON.parse(savedState);
      setQuizWords(state.quizWords);
      setCurrentQuestionIndex(state.currentQuestionIndex);
      setScore(state.score);
      setQuizHistory(state.quizHistory);
      setSelectedTranslation(state.selectedTranslation);
      setAnswerChosen(state.answerChosen);
    } else {
      const selectedWords: Word[] = [];
      while (selectedWords.length < 20) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        if (!selectedWords.find((w) => w.english === word.english)) {
          const translations = word.translations;
          const shuffledTranslations = [...translations].sort(() => Math.random() - 0.5);
          selectedWords.push({ ...word, translations: shuffledTranslations });
        }
      }
      setQuizWords(selectedWords);
    }
  }, []);

  // Salva no localStorage sempre que algum estado relevante mudar
  useEffect(() => {
    if (quizWords.length > 0) {
      const state = {
        quizWords,
        currentQuestionIndex,
        score,
        quizHistory,
        selectedTranslation,
        answerChosen,
      };
      localStorage.setItem("level1QuizState", JSON.stringify(state));
    }
  }, [quizWords, currentQuestionIndex, score, quizHistory, selectedTranslation, answerChosen]);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedTranslation("");
    setAnswerChosen(false);
  };

  const handleAnswerSelection = (translation: string) => {
    setSelectedTranslation(translation);

    // Salva os dados da questão atual no histórico
    const currentHistory = {
      word: quizWords[currentQuestionIndex].english,
      correctAnswer: quizWords[currentQuestionIndex].correct,
      selectedAnswer: translation,
      options: quizWords[currentQuestionIndex].translations,
    };
    setQuizHistory((prevHistory) => [...prevHistory, currentHistory]);

    if (translation === quizWords[currentQuestionIndex].correct) {
      setScore((prevScore) => prevScore + 1);
      setProgressColor("bg-fluency-green-500");
    } else {
      setProgressColor("bg-fluency-red-500");
    }

    setAnswerChosen(true);

    // Volta a cor original da barra de progresso após 2 segundos
    setTimeout(() => {
      setProgressColor("bg-fluency-orange-500");
    }, 2000);
  };

  const handleNextLevel = async () => {
    if (session && session.user) {
      const userId = session.user.id;
      const finalScore = (score / quizWords.length) * totalPossiblePoints;
      const scoreData = {
        pontos: finalScore,
        data: serverTimestamp(),
        history: quizHistory.map((entry) => ({
          word: entry.word,
          correctAnswer: entry.correctAnswer,
          selectedAnswer: entry.selectedAnswer,
          options: entry.options,
        })),
      };

      try {
        await addDoc(collection(db, "users", userId, "Nivelamento", "Nivel-1", "Vocabulario"), scoreData);
        toast.success("Pontuação e histórico salvos com sucesso!");
        // Limpa o estado salvo ao finalizar o quiz
        localStorage.removeItem("level1QuizState");
        router.push(`frases`);
      } catch (error) {
        toast.error("Erro ao salvar a pontuação e o histórico");
        console.error("Erro ao salvar a pontuação e o histórico: ", error);
      }
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  if (quizWords.length === 0) {
    return <div>Loading...</div>;
  }

  // Se o índice ultrapassar o número de questões, exibe a tela final
  if (currentQuestionIndex >= quizWords.length) {
    const finalScore = (score / quizWords.length) * totalPossiblePoints;
    return (
      <div className="h-[90vh] flex flex-col items-center justify-around">
        <FluencyButton variant="confirm" onClick={handleNextLevel}>
          Próxima Lição <FaArrowRight className="w-4 h-auto ml-2" />
        </FluencyButton>
        <Toaster />
      </div>
    );
  }

  const currentWord = quizWords[currentQuestionIndex];
  const allWordsAnswered = currentQuestionIndex === quizWords.length - 1 && answerChosen;
  const finalScore = (score / quizWords.length) * totalPossiblePoints;
  const progressPercentage = ((currentQuestionIndex + 1) / quizWords.length) * 100;

  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      {nivelamentoPermitido === false ? (
        <div className="w-max h-max rounded-md bg-fluency-green-700 text-white font-bold p-6">
          <div className="flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4">
            Nivelamento feito! <PiExam className="w-6 h-auto" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md w-96 h-[26rem]">
            <div className="w-full bg-fluency-gray-200 h-2.5 overflow-hidden dark:bg-gray-700 rounded-tl-md rounded-tr-md">
              <div
                className={`${progressColor} h-2.5 transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="p-12 mt-4">
              <div>Pontos: {score}</div>
              <h2 className="text-xl font-medium flex flex-row gap-1 items-center">
                Qual a tradução de:{" "}
                <p className="font-bold text-fluency-orange-500">{currentWord.english}</p>
              </h2>
              <div className="flex flex-col items-stretch gap-1 p-6 w-full">
                {currentWord.translations.map((translation) => (
                  <button
                    className={`p-1 px-3 rounded-md font-semibold text-white duration-300 ease-in-out
                      ${
                        selectedTranslation === translation
                          ? "bg-gray-600 cursor-not-allowed"
                          : answerChosen
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-fluency-orange-500 hover:bg-fluency-orange-600"
                      }
                      ${answerChosen && selectedTranslation === translation ? "bg-gray-700" : ""}`}
                    key={translation}
                    onClick={() => handleAnswerSelection(translation)}
                    disabled={selectedTranslation !== "" || answerChosen}
                  >
                    {translation}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center w-full gap-2 mt-2">
                {allWordsAnswered ? (
                  <div>
                    <div className="hidden">Pontuação Final: {finalScore}</div>
                    <FluencyButton variant="confirm" onClick={handleNextLevel}>
                      Próxima Lição
                      <FaArrowRight className="w-4 h-auto ml-2" />
                    </FluencyButton>
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-center w-full gap-2">
                    <button
                      className="text-white font-bold bg-gray-400 hover:bg-gray-500 duration-300 ease-in-out p-2 rounded-md px-3"
                      onClick={handleSkipQuestion}
                    >
                      Pular
                    </button>
                    <button
                      className="flex flex-row items-center justify-center gap-1 text-white font-bold bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"
                      onClick={handleNextQuestion}
                      disabled={selectedTranslation === ""}
                    >
                      Próxima <IoMdArrowRoundForward />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <Toaster />
    </div>
  );
};

export default Level1;
