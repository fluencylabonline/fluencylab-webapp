'use client';
import { useState, useEffect } from "react";
import wordsData from "../../database/sentences-test-english.json";
import { IoMdArrowRoundForward } from "react-icons/io";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaArrowRight } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase";
import { toast, Toaster } from "react-hot-toast";
import { PiExam } from "react-icons/pi";

interface Word {
  phrase: string;
  correct_translation: string;
  other_translations: string[];
}

const Level2: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
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

      fetchUserInfo()
  }, [session]);

  
  const totalPossiblePoints = 5;
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [progressColor, setProgressColor] = useState("bg-fluency-orange-500");
  
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

  const handleAnswerSelection = (correct_translation: string) => {
    setSelectedTranslation(correct_translation);
    if (correct_translation === quizWords[currentQuestionIndex].correct_translation) {
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
    setSelectedTranslation("");
    setAnswered(false);
  };

  const handleNextLevel = async () => {
    if (session && session.user) {
      const userId = session.user.id;
      const scoreData = {
        pontos: finalScore,
        data: serverTimestamp(),
      };

      try {
        // Adding a new document with an auto-generated ID
        await addDoc(collection(db, "users", userId, "Nivelamento", "Nivel-1", "Frases"), scoreData);
        toast.success("Pontuação salva com sucesso!");
        router.push(`verdadeiro-e-falso`);
      } catch (error) {
        toast.error("Erro ao salvar a pontuação");
        console.error("Erro ao salvar a pontuação: ", error);
      }
    }
  };

  if (quizWords.length === 0) {
    return <div>Loading...</div>;
  }

  const currentWord = quizWords[currentQuestionIndex];
  const allWordsAnswered = currentQuestionIndex === quizWords.length - 1 && answered;
  const finalScore = (score / quizWords.length) * totalPossiblePoints;
  const progressPercentage = ((currentQuestionIndex + 1) / quizWords.length) * 100;

return (
  <div className="h-[90vh] overflow-y-hidden flex flex-col items-center justify-around">
      
  {nivelamentoPermitido === false ? 
  (
  <div className='w-max h-max rounded-md bg-fluency-green-700 text-white font-bold p-6'>
      <div className='flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
  </div>
  ):(
  <>
    <div className="flex flex-col items-center bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md w-[30rem] h-[25rem]">
      <div className="w-full bg-fluency-gray-200 h-2.5 overflow-hidden dark:bg-gray-700 rounded-tl-md rounded-tr-md">
        <div
            className={`${progressColor} h-2.5 transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="p-10 mt-4">
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

        <div className="flex flex-col items-center justify-center w-full gap-2 mt-2">
              {allWordsAnswered ? (
              <div>
                <div className="hidden">Pontuação Final: {finalScore}</div>
                <FluencyButton variant="confirm" onClick={handleNextLevel}>
                  Próxima Lição
                  <FaArrowRight className="w-4 h-auto ml-2" />
                </FluencyButton>
              </div>
              ):(
                <button className="text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3" onClick={handleNextQuestion} disabled={selectedTranslation === "" || allWordsAnswered}>
                Próxima <IoMdArrowRoundForward />
              </button>
              )}
            </div>
        </div>
      </div></>)}
     <Toaster />
    </div>
  );
};

export default Level2;
