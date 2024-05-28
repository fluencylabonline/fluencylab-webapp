'use client';
import { useState, useEffect } from "react";
import textsData from "../../database/small-texts-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaArrowRight } from "react-icons/fa6";
import { db } from "@/app/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";

interface Text {
  text: string;
  options: string[];
  correct_answer: string;
}

const Compreensao: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const totalPossiblePoints = 5;
  const [quizTexts, setQuizTexts] = useState<Text[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [progressColor, setProgressColor] = useState("bg-fluency-orange-500");

  useEffect(() => {
    const selectedTexts: Text[] = [];
    while (selectedTexts.length < 5) {
      const randomIndex = Math.floor(Math.random() * textsData.texts.length);
      const text = textsData.texts[randomIndex];
      if (!selectedTexts.find((t) => t.text === text.text)) {
        selectedTexts.push(text);
      }
    }
    setQuizTexts(selectedTexts);
  }, []);

  const handleOptionSelection = (option: string) => {
    setSelectedOption(option);
    if (option === quizTexts[currentQuestionIndex].correct_answer) {
      setScore((prevScore) => prevScore + 1);
      setProgressColor("bg-fluency-green-500");
    } else {
      setProgressColor("bg-fluency-red-500");
    }
    setAnswered(true);

    // Revert the progress bar color back to original after 2 seconds
    setTimeout(() => {
      setProgressColor("bg-fluency-orange-500");
    }, 2000);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedOption(null);
    setAnswered(false);
  };

  const handleNextLevel = async () => {
    if (session && session.user) {
      const userId = session.user.id;
      const scoreData = {
        pontos: finalScore,
        data: new Date().toISOString(),
      };

      try {
        // Adding a new document with an auto-generated ID
        await addDoc(collection(db, "users", userId, "nivelamento", "nivel1", "compreensao"), scoreData);
        toast.success("Pontuação salva com sucesso!");
        router.push(`/nivel-2`);
      } catch (error) {
        toast.error("Erro ao salvar a pontuação");
        console.error("Erro ao salvar a pontuação: ", error);
      }
    }
  };

  
  if (quizTexts.length === 0) {
    return <div>Loading...</div>;
  }

  const currentText = quizTexts[currentQuestionIndex];
  const allTextsAnswered = currentQuestionIndex === quizTexts.length - 1 && answered;
  const finalScore = (score / quizTexts.length) * totalPossiblePoints;
  const progressPercentage = ((currentQuestionIndex + 1) / quizTexts.length) * 100;

  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      <div className="flex flex-col items-center bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md w-full h-[80vh]">
        <div className="w-full bg-fluency-gray-200 h-2.5 overflow-hidden dark:bg-gray-700 rounded-tl-md rounded-tr-md">
          <div
            className={`${progressColor} h-2.5 transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="p-16 mt-4">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium w-[40rem]">{currentText.text}</h2>
        <div className="flex flex-col items-stretch gap-1 p-6">
          {currentText.options.map((option) => (
            <button
              className={`p-1 px-3 text-start rounded-md font-semibold text-white duration-300 ease-in-out
                ${selectedOption === option ? 'bg-gray-600 cursor-not-allowed' : answered ? 'bg-gray-500 cursor-not-allowed' : 'bg-fluency-orange-500 hover:bg-fluency-orange-600'}
                ${answered && selectedOption === option ? 'bg-gray-700' : ''}
              `}
              key={option}
              onClick={() => handleOptionSelection(option)}
              disabled={selectedOption !== null || answered}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-2">
            {allTextsAnswered ? (
              <div>
                <div className="hidden">Pontuação Final: {finalScore}</div>
                <FluencyButton variant="confirm" onClick={handleNextLevel}>
                  Próxima Lição
                  <FaArrowRight className="w-4 h-auto ml-2" />
                </FluencyButton>
              </div>
              ):(
                <button className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"             onClick={handleNextQuestion}
                disabled={selectedOption === null || allTextsAnswered}>
                Próxima <IoMdArrowRoundForward />
              </button>
            )}
        </div>
        </div>
      </div>

    </div>
  );
};

export default Compreensao;
