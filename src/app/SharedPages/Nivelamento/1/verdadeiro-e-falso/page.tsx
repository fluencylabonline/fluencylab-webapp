'use client';
import { useState, useEffect } from "react";
import statementsData from "../../database/true-false-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaArrowRight } from "react-icons/fa6";
import { db } from "@/app/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";
interface Statement {
  statement: string;
  truth: boolean;
}

const VerdadeiroOuFalso: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const totalPossiblePoints = 5;
  const [quizStatements, setQuizStatements] = useState<Statement[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [progressColor, setProgressColor] = useState("bg-fluency-orange-500");
  
  useEffect(() => {
    const selectedStatements: Statement[] = [];
    while (selectedStatements.length < 10) {
      const randomIndex = Math.floor(Math.random() * statementsData.statements.length);
      const statement = statementsData.statements[randomIndex];
      if (!selectedStatements.find((s) => s.statement === statement.statement)) {
        selectedStatements.push(statement);
      }
    }
    setQuizStatements(selectedStatements);
  }, []);

  const handleAnswerSelection = (truth: boolean) => {
    setSelectedAnswer(truth);
    if (truth === quizStatements[currentQuestionIndex].truth) {
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
    setSelectedAnswer(null);
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
        await addDoc(collection(db, "users", userId, "nivelamento", "nivel1", "verdadeiro-e-falso"), scoreData);
        toast.success("Pontuação salva com sucesso!");
        router.push(`compreensao`);
      } catch (error) {
        toast.error("Erro ao salvar a pontuação");
        console.error("Erro ao salvar a pontuação: ", error);
      }
    }
  };

  if (quizStatements.length === 0) {
    return <div>Loading...</div>;
  }

  const currentStatement = quizStatements[currentQuestionIndex];
  const allStatementsAnswered = currentQuestionIndex === quizStatements.length - 1 && answered;
  const finalScore = (score / quizStatements.length) * totalPossiblePoints;
  const progressPercentage = ((currentQuestionIndex + 1) / quizStatements.length) * 100;

  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
    <div className="flex flex-col items-center bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md w-[26rem] h-[26rem]">
      <div className="w-full bg-fluency-gray-200 h-2.5 overflow-hidden dark:bg-gray-700 rounded-tl-md rounded-tr-md">
        <div
          className={`${progressColor} h-2.5 transition-all duration-500`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="p-12 mt-4">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium flex flex-col gap-1 items-start">
          Essa frase é verdadeira ou falsa? <p className="font-bold text-fluency-orange-500">{currentStatement.statement}</p>
        </h2>
        <div className="flex flex-col items-stretch gap-1 p-6 w-full">
          <button
            className={`p-1 px-3 rounded-md font-semibold text-white duration-300 ease-in-out
              ${selectedAnswer === true ? 'bg-gray-600 cursor-not-allowed' : answered ? 'bg-gray-500 cursor-not-allowed' : 'bg-fluency-orange-500 hover:bg-fluency-orange-600'}
              ${answered && selectedAnswer === true ? 'bg-gray-700' : ''}
            `}
            onClick={() => handleAnswerSelection(true)}
            disabled={selectedAnswer !== null || answered}
          >
            Verdade
          </button>
          <button
            className={`p-1 px-3 rounded-md font-semibold text-white duration-300 ease-in-out
              ${selectedAnswer === false ? 'bg-gray-600 cursor-not-allowed' : answered ? 'bg-gray-500 cursor-not-allowed' : 'bg-fluency-orange-500 hover:bg-fluency-orange-600'}
              ${answered && selectedAnswer === false ? 'bg-gray-700' : ''}
            `}
            onClick={() => handleAnswerSelection(false)}
            disabled={selectedAnswer !== null || answered}
          >
            Falso
          </button>
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-2">
        {allStatementsAnswered ? (
              <div>
                <div className="hidden">Pontuação Final: {finalScore}</div>
                <FluencyButton variant="confirm" onClick={handleNextLevel}>
                  Próxima Lição
                  <FaArrowRight className="w-4 h-auto ml-2" />
                </FluencyButton>
              </div>
              ):(
                <button className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"             onClick={handleNextQuestion}
                disabled={selectedAnswer === null || allStatementsAnswered}>
                Próxima <IoMdArrowRoundForward />
              </button>
              )}
        </div>
        </div>
      </div>
     <Toaster />
    </div>
  );
};

export default VerdadeiroOuFalso;

