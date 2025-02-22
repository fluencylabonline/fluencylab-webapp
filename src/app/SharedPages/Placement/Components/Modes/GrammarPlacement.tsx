'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import FluencyButton from "@/app/ui/Components/Button/button";
import { CiCircleQuestion } from "react-icons/ci";

interface GrammarQuestion {
  question: {
    type: string;
    option: string;
    correct: string;
    options: string[];
    difficulty: number; // Add difficulty to question interface
  };
  answer: string | null;
  completed: boolean;
  score: number | null;
  points?: number; // Add points property
}

interface GrammarPlacementProps {
  onClose: () => void;
  testId: any;
}

const GrammarPlacement: React.FC<GrammarPlacementProps> = ({ onClose, testId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [grammarQuestions, setGrammarQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [questionPoints, setQuestionPoints] = useState<number[]>([]); // State to hold points for each question

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    async function fetchGrammarTest() {
      if (!userId) return;
      setLoading(true);
      try {
        const placementDocRef = doc(db, "users", userId, "Placement", testId);
        const docSnap = await getDoc(placementDocRef);
        if (docSnap.exists()) {
          const grammarData: GrammarQuestion[] = docSnap.data()?.grammar;
          if (Array.isArray(grammarData) && grammarData.length > 0) {

            // Calculate total difficulty
            const totalDifficulty = grammarData.reduce((sum: number, q: any) => {
              const difficultyValue = Number(q.question.difficulty);
              return sum + difficultyValue;
            }, 0);
            console.log(totalDifficulty)
            // Calculate points for each question and round up
            const calculatedPoints = grammarData.map((q: any) => {
              return Math.ceil((q.question.difficulty / totalDifficulty) * 100);
            });

            // Ensure total points is exactly 100 by adjusting the rounding error
            let currentTotalPoints = calculatedPoints.reduce((sum: number, p: number) => sum + p, 0);
            let pointsToAdjust = 100 - currentTotalPoints;

            let adjustedPoints = [...calculatedPoints];
            if (pointsToAdjust !== 0) {
              // Adjust points for the highest difficulty questions first
              let questionsSortedByDifficulty = grammarData.map((q: any, index: number) => ({ difficulty: q.question.difficulty, index: index }))
                .sort((a, b) => b.difficulty - a.difficulty); // Sort in descending order of difficulty

              for (let i = 0; i < Math.abs(pointsToAdjust); i++) {
                let questionIndexToAdjust = questionsSortedByDifficulty[i % questionsSortedByDifficulty.length].index;
                adjustedPoints[questionIndexToAdjust] += pointsToAdjust > 0 ? 1 : -1;
              }
            }

            setGrammarQuestions(grammarData.map((q: any, index: number) => ({ ...q, points: adjustedPoints[index] }))); // Add points to questions
            setQuestionPoints(adjustedPoints);


            // Calculate first incomplete question
            const firstIncompleteIndex = grammarData.findIndex(q => !q.completed);
            setCurrentIndex(firstIncompleteIndex !== -1 ? firstIncompleteIndex : grammarData.length - 1);
          }
        } else {
          toast.error("Nenhum teste de vocabulário encontrado para hoje.");
        }
      } catch (error) {
        console.error("Erro ao carregar teste de vocabulário:", error);
        toast.error("Falha ao carregar o teste de vocabulário.");
      }
      setLoading(false);
    }
    fetchGrammarTest();
  }, [userId, testId]);

  const getGrammarPrompt = (item: GrammarQuestion["question"]) => {
    if (!item) return "";
    switch (item.type) {
      case "multiple-choice":
        return (
          <p className="text-center">
            Escolha a melhor opção para <span className="text-indigo-500">"{item.option}"</span>
          </p>
        );
      case "true_or_false":
        return (
          <p className="text-center">
            Decida se o enunciado <span className="text-indigo-500">"{item.option}"</span> é verdadeiro ou falso
          </p>
        );
      case "tense-aspect":
        return (
          <p className="text-center">
            Complete: <span className="text-indigo-500">"{item.option}"</span>?
          </p>
        );
      default:
        return item.option;
    }
  };

  const saveGrammarResults = useCallback(async (updatedQuestions: GrammarQuestion[]) => {
    if (!session?.user?.id) return;
    try {
      const placementDocRef = doc(db, "users", session.user.id, "Placement", testId);
      let totalScore = 0;
      updatedQuestions.forEach((q, index) => {
        const questionPointsValue = q.points || 0;
        totalScore += (q.score ?? 0) * questionPointsValue; // Apply points to the score
      });
      const allCompleted = updatedQuestions.every(q => q.completed);
      await updateDoc(placementDocRef, {
        grammar: updatedQuestions,
        "abilitiesScore.grammarScore": totalScore,
        "abilitiesCompleted.grammarCompleted": allCompleted,
      });
      const nivelamentoRef = doc(db, "users", session.user.id);
      await updateDoc(nivelamentoRef, {
        NivelamentoPermitido: false,
      });
    } catch (error) {
      console.error("Erro ao salvar vocabulário:", error);
      toast.error("Falha ao salvar o progresso de vocabulário.");
    }
  }, [session, testId]);

  const handleOptionSelect = (option: string) => {
    // Only allow selection if the question is not completed
    if (!grammarQuestions[currentIndex].completed) {
      setSelectedOption(option);
    }
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption) {
      toast.error("Por favor, selecione uma opção.");
      return;
    }
    const currentQuestion = grammarQuestions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.question.correct;
    const updatedQuestion: GrammarQuestion = {
      ...currentQuestion,
      answer: selectedOption,
      completed: true,
      score: isCorrect ? 1 : 0, // Score 1 if correct, 0 if incorrect
    };
    const updatedQuestions = grammarQuestions.map((q, i) =>
      i === currentIndex ? updatedQuestion : q
    );
    setGrammarQuestions(updatedQuestions);
    setSelectedOption(null);
    await saveGrammarResults(updatedQuestions);
    if (currentIndex < grammarQuestions.length - 1) {
      handleNext();
    } else {
      onClose();
      router.refresh();
    }
  };

  const handleSkip = async () => {
    const updatedQuestion: GrammarQuestion = {
      ...grammarQuestions[currentIndex],
      answer: null,
      completed: true,
      score: 0, // Score 0 for skipped questions
    };
    const updatedQuestions = grammarQuestions.map((q, i) =>
      i === currentIndex ? updatedQuestion : q
    );
    setGrammarQuestions(updatedQuestions);
    setSelectedOption(null);
    await saveGrammarResults(updatedQuestions);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < grammarQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  if (grammarQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const currentQuestion = grammarQuestions[currentIndex];
  const promptText = getGrammarPrompt(currentQuestion.question);

  const explanationVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark p-4">
      <AnimatePresence mode="wait">
        {isExplanationOpen ? (
          <motion.div
            key="explanation"
            variants={explanationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className='lg:w-[40vw] md:w-[60vw] w-[70vw] bg-fluency-gray-300 dark:bg-fluency-gray-800 p-4 text-justify rounded-md gap-2 relative'
          >
            <div className='flex flex-col items-center justify-center gap-4'>
              <div className='w-full'>Nessa parte, o enunciado vai mudar e variar o tipo de pergunta. Preste atenção e forneça uma resposta que esteja de acordo com o enunciado.</div>
              <FluencyButton variant='purple' onClick={() => setIsExplanationOpen(false)}>
                Voltar
              </FluencyButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="absolute -top-4 -right-4 font-bold text-sm">
              <CiCircleQuestion
                onClick={() => setIsExplanationOpen(true)}
                className='w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer'
              />
            </div>
            <div className="mb-6 p-4 bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg w-full">
              <div className="font-bold w-full">{promptText}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.question.options.map((option: string, index: number) => (
                <div
                  key={index}
                  // Only trigger selection if the current question is not completed
                  onClick={() => !currentQuestion.completed && handleOptionSelect(option)}
                  className={`w-full font-semibold p-2 px-6 rounded-md duration-300 ease-in-out transition-all
                      ${currentQuestion.completed ? "cursor-not-allowed opacity-50" : "cursor-pointer bg-white dark:bg-fluency-gray-900 hover:bg-gray-200 hover:dark:bg-fluency-gray-900"}
                      ${selectedOption === option && !currentQuestion.completed ? "bg-indigo-500 hover:bg-indigo-500 dark:bg-indigo-600 hover:dark:bg-indigo-600 text-white" : ""}`}
                >
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              {!currentQuestion.completed && (
                <>
                  <FluencyButton onClick={handleConfirmAnswer} variant="purple">
                    Confirmar Resposta
                  </FluencyButton>
                  <FluencyButton onClick={handleSkip} variant="gray">
                    Pular
                  </FluencyButton>
                </>
              )}
              {currentQuestion.completed && (
                <FluencyButton
                  onClick={handleNext}
                  variant="purple"
                >
                  {currentIndex < grammarQuestions.length - 1 ? "Próxima Pergunta" : "Finalizar Teste"}
                </FluencyButton>
              )}
            </div>
            <div className="text-gray-600 dark:text-gray-500 mt-2">
              {`Pergunta ${currentIndex + 1} de ${grammarQuestions.length}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrammarPlacement;