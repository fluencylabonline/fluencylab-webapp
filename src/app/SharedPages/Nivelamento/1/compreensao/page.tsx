'use client';
import { useState, useEffect } from "react";
import textsData from "../../database/small-texts-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";

interface Text {
  text: string;
  options: string[];
  correct_answer: string;
}

const Compreensao: React.FC = () => {
  const [quizTexts, setQuizTexts] = useState<Text[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

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
    }
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedOption(null);
    setAnswered(false);
  };

  if (quizTexts.length === 0) {
    return <div>Loading...</div>;
  }

  const currentText = quizTexts[currentQuestionIndex];
  const allTextsAnswered = currentQuestionIndex === quizTexts.length - 1 && answered;

  return (
    <div className="h-[90vh] w-[50rem] overflow-y-hidden flex flex-col items-center justify-around">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-20 rounded-md w-full h-max">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium w-full text-wrap">{currentText.text}</h2>
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
          {selectedOption !== null && (
            <div className={`p-2 px-4 rounded-md ${selectedOption === currentText.correct_answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {selectedOption === currentText.correct_answer ? "Correto!" : "Incorreto!"}
            </div>
          )}
          <button
            className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"
            onClick={handleNextQuestion}
            disabled={selectedOption === null || allTextsAnswered}
          >
            Próxima <IoMdArrowRoundForward />
          </button>
        </div>
      </div>

      {allTextsAnswered && (
        <div>
          <div className="hidden">Pontuação Final: {score}</div>
        </div>
      )}
    </div>
  );
};

export default Compreensao;
