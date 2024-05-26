'use client';
import { useState, useEffect } from "react";
import words from "../../database/500-english-words.json";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaArrowRight } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundForward } from "react-icons/io";

interface Word {
  english: string;
  correct: string;
  translations: string[];
}

const Level1: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const handleNextLevel = () => {
      router.push(`frases`);
  };

  const totalPossiblePoints = 4;
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [score, setScore] = useState(0);
  const [answerChosen, setAnswerChosen] = useState(false);

  // Read the JSON file and extract the words
  useEffect(() => {
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
  }, []);

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedTranslation("");
    setAnswerChosen(false);
  };

  const handleAnswerSelection = (translation: string) => {
    setSelectedTranslation(translation);
    if (translation === quizWords[currentQuestionIndex].correct) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswerChosen(true);
  };

  if (quizWords.length === 0) {
    return <div>Loading...</div>;
  }

  const currentWord = quizWords[currentQuestionIndex];
  const allWordsAnswered = currentQuestionIndex === quizWords.length - 1 && answerChosen;
  const finalScore = (score / quizWords.length) * totalPossiblePoints;
  return (
    <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-20 rounded-md w-max h-max">
        <div>Pontos: {score}</div>
        <h2 className="text-xl font-medium flex flex-row gap-1 items-center">Qual a tradução de: <p className="font-bold text-fluency-orange-500">{currentWord.english}</p></h2>
        <div className="flex flex-col items-stretch gap-1 p-6 w-full">
          {currentWord.translations.map((translation) => (
            <button
              className={`p-1 px-3 rounded-md font-semibold text-white duration-300 ease-in-out
                ${selectedTranslation === translation ? 'bg-gray-600 cursor-not-allowed' : answerChosen ? 'bg-gray-500 cursor-not-allowed' : 'bg-fluency-orange-500 hover:bg-fluency-orange-600'}
                ${answerChosen && selectedTranslation === translation ? 'bg-gray-700' : ''}
              `}
              key={translation}
              onClick={() => handleAnswerSelection(translation)}
              disabled={selectedTranslation !== "" || answerChosen}
            >
              {translation}
            </button>
          ))}
        </div>

          <div className="flex flex-col items-center justify-center w-full gap-2">
              {selectedTranslation !== "" && (
              <div className={`p-2 px-4 rounded-md ${selectedTranslation === currentWord.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {selectedTranslation === currentWord.correct ? "Correto!" : "Incorreto!"}
              </div>
              )}
            <button className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3" onClick={handleNextQuestion} disabled={selectedTranslation === "" || allWordsAnswered}>
              Próxima <IoMdArrowRoundForward />
            </button>
          </div>

      </div>
      
      {allWordsAnswered && (
        <div>
          <div className="hidden">Pontuação Final: {finalScore}</div>
          <FluencyButton variant="confirm" onClick={handleNextLevel}>
            Próxima 
            <FaArrowRight className="w-4 h-auto ml-2" />
          </FluencyButton>
        </div>
        )}
      
    </div>
  );
};

export default Level1;
