'use client';
import { useState, useEffect } from "react";
import wordsData from "../../database/sentences-test-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";

interface Word {
  phrase: string;
  correct_translation: string;
  other_translations: string[];
}

const Level2: React.FC = () => {
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const wordEntries = Object.entries(wordsData) as [string, Word][];
    const selectedWords: Word[] = [];
    while (selectedWords.length < 10) {
      const randomIndex = Math.floor(Math.random() * wordEntries.length);
      const [key, word] = wordEntries[randomIndex];
      if (!selectedWords.find((w) => w.phrase === word.phrase)) {
        selectedWords.push(word);
      }
    }
    setQuizWords(selectedWords);
  }, []);

  const handleAnswerSelection = (translation: string) => {
    setSelectedTranslation(translation);
    if (translation === quizWords[currentQuestionIndex].correct_translation) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswered(true);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedTranslation("");
    setAnswered(false);
  };

  if (quizWords.length === 0) {
    return <div>Loading...</div>;
  }

  const currentWord = quizWords[currentQuestionIndex];
  const allWordsAnswered = currentQuestionIndex === quizWords.length - 1 && answered;

  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-20 rounded-md w-max h-max">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium flex flex-row gap-1 items-center">Qual a tradução de: <p className="font-bold text-fluency-orange-500">{currentWord.phrase}</p></h2>
        <div className="flex flex-col items-stretch gap-1 p-6 w-full">
          {currentWord.other_translations.map((translation, index) => (
            <button
              className={`p-1 px-3 rounded-md font-semibold text-white duration-300 ease-in-out
                ${selectedTranslation === translation ? 'bg-gray-600 cursor-not-allowed' : answered ? 'bg-gray-500 cursor-not-allowed' : 'bg-fluency-orange-500 hover:bg-fluency-orange-600'}
                ${answered && selectedTranslation === translation ? 'bg-gray-700' : ''}
              `}
              key={index}
              onClick={() => handleAnswerSelection(translation)}
              disabled={selectedTranslation !== "" || answered}
            >
              {translation}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-2">
          {selectedTranslation !== "" && (
            <div className={`p-2 px-4 rounded-md ${selectedTranslation === currentWord.correct_translation ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {selectedTranslation === currentWord.correct_translation ? "Correto!" : "Incorreto!"}
            </div>
          )}
          <button className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3" onClick={handleNextQuestion} disabled={selectedTranslation === "" || allWordsAnswered}>
            Próxima <IoMdArrowRoundForward />
          </button>
        </div>
      </div>

      {allWordsAnswered && (
        <div>
          <div className="hidden">Pontuação Final: {score}</div>
        </div>
      )}
    </div>
  );
};

export default Level2;
