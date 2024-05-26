'use client';
import { useState, useEffect } from "react";
import statementsData from "../../database/true-false-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";

interface Statement {
  statement: string;
  truth: boolean;
}

const VerdadeiroOuFalso: React.FC = () => {
  const [quizStatements, setQuizStatements] = useState<Statement[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

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
    }
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  if (quizStatements.length === 0) {
    return <div>Loading...</div>;
  }

  const currentStatement = quizStatements[currentQuestionIndex];
  const allStatementsAnswered = currentQuestionIndex === quizStatements.length - 1 && answered;

  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-20 rounded-md w-max h-max">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium flex flex-row gap-1 items-center">
          É verdade ou falso? <p className="font-bold text-fluency-orange-500">{currentStatement.statement}</p>
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
          {selectedAnswer !== null && (
            <div className={`p-2 px-4 rounded-md ${selectedAnswer === currentStatement.truth ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {selectedAnswer === currentStatement.truth ? "Correto!" : "Incorreto!"}
            </div>
          )}
          <button
            className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || allStatementsAnswered}
          >
            Próxima <IoMdArrowRoundForward />
          </button>
        </div>
      </div>

      {allStatementsAnswered && (
        <div>
          <div className="hidden">Pontuação Final: {score}</div>
        </div>
      )}
    </div>
  );
};

export default VerdadeiroOuFalso;
