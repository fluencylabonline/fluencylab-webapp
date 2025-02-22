'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import FluencyButton from '@/app/ui/Components/Button/button';
import { AnimatePresence, motion } from 'framer-motion';
import { CiCircleQuestion } from 'react-icons/ci';

interface ReadingPlacementProps {
  language: string;
  onClose: () => void;
  testId: any;
}

interface ReadingQuestion {
  question: {
    text: string;
    question: string;
    options: string[];
    correct: string;
    difficulty: number; // Add difficulty to question interface
  };
  completed: boolean;
  answer: string | null;
  score: number | null;
  points?: number; // Add points property
}

export function ReadingPlacement({ onClose, testId }: ReadingPlacementProps) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>('');
  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0); // Track total score as points
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [questionPoints, setQuestionPoints] = useState<number[]>([]); // State to hold points for each question

  // Set userId after session data is available
  useEffect(() => {
    if (session && session.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Fetch reading questions for the user from Firestore
  useEffect(() => {
    async function fetchReadingQuestions() {
      try {
        const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
        const docSnap = await getDoc(placementDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const readingData: ReadingQuestion[] = data?.reading || [];

          // Calculate total difficulty
          const totalDifficulty = readingData.reduce((sum: number, q: any) => {
            const difficultyValue = Number(q.question.difficulty);
            return sum + difficultyValue;
          }, 0);

          // Calculate points for each question and round up
          const calculatedPoints = readingData.map((q: any) => {
            return Math.ceil((q.question.difficulty / totalDifficulty) * 100);
          });

          // Ensure total points is exactly 100 by adjusting the rounding error
          let currentTotalPoints = calculatedPoints.reduce((sum: number, p: number) => sum + p, 0);
          let pointsToAdjust = 100 - currentTotalPoints;

          let adjustedPoints = [...calculatedPoints];
          if (pointsToAdjust !== 0) {
            // Adjust points for the highest difficulty questions first
            let questionsSortedByDifficulty = readingData.map((q: any, index: number) => ({ difficulty: q.question.difficulty, index: index }))
              .sort((a, b) => b.difficulty - a.difficulty); // Sort in descending order of difficulty

            for (let i = 0; i < Math.abs(pointsToAdjust); i++) {
              let questionIndexToAdjust = questionsSortedByDifficulty[i % questionsSortedByDifficulty.length].index;
              adjustedPoints[questionIndexToAdjust] += pointsToAdjust > 0 ? 1 : -1;
            }
          }

          setReadingQuestions(readingData.map((q: any, index: number) => ({ ...q, points: adjustedPoints[index] }))); // Add points to questions
          setQuestionPoints(adjustedPoints);


          // Find first incomplete question
          const firstIncompleteIndex = readingData.findIndex((q: { completed: any; }) => !q.completed);
          setCurrentQuestionIndex(
            firstIncompleteIndex !== -1
              ? firstIncompleteIndex
              : readingData.length - 1 // Fallback to last if all completed
          );

          setIsLoading(false);
        } else {
          setReadingQuestions([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setReadingQuestions([]);
      }
    }

    if (userId) {
      fetchReadingQuestions();
    }
  }, [userId, testId]); // Added testId to dependencies

  // Finalize the test by updating Firestore
  const finalizeTest = useCallback(async () => {
    const placementDocRef = doc(db, 'users', userId, 'Placement', testId);

    await updateDoc(placementDocRef, {
      "abilitiesCompleted.readingCompleted": true,
    }).catch((error) => console.error('Error updating Firestore:', error));

    onClose(); // Fecha o modal após finalização
  }, [onClose, userId, testId]);

  // Handle answer selection
  const handleAnswer = useCallback(async (selectedOption: string) => {
    const correctAnswer = readingQuestions[currentQuestionIndex]?.question?.correct;
    let updatedQuestions = [...readingQuestions];
    let updatedScore = score;
    const currentQuestionPoints = readingQuestions[currentQuestionIndex]?.points || 0;


    if (selectedOption === correctAnswer) {
      updatedQuestions[currentQuestionIndex].score = currentQuestionPoints; // Assign points if correct
      updatedScore += currentQuestionPoints; // Add points to total score
    } else {
      updatedQuestions[currentQuestionIndex].score = 0; // 0 points if incorrect
    }

    updatedQuestions[currentQuestionIndex].answer = selectedOption;
    updatedQuestions[currentQuestionIndex].completed = true; // Mark as completed
    setReadingQuestions(updatedQuestions);
    setScore(updatedScore);
    setAnswered(true);

    const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
    const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
    const isLastQuestion = nextIndex === -1;

    const updatePayload: any = {
      reading: updatedQuestions,
      "abilitiesScore.readingScore": updatedScore, // Update with accumulated points
    };

    if (isLastQuestion) {
      updatePayload["abilitiesCompleted.readingCompleted"] = true;
    }

    // Atualiza o Firestore
    await updateDoc(placementDocRef, updatePayload)
  }, [readingQuestions, currentQuestionIndex, score, userId, testId]);

  // Handle next button click
  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < readingQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAnswered(false);
    } else {
      await finalizeTest();
    }
  }, [currentQuestionIndex, readingQuestions.length, finalizeTest]);

  // Update Firestore with the latest progress (reading questions and score)
  const updateUserProgress = useCallback(async (updatedQuestions: ReadingQuestion[], updatedScore: number) => {
    const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
    await updateDoc(placementDocRef, {
      reading: updatedQuestions,
      "abilitiesScore.readingScore": updatedScore, // Atualiza com valor de pontos acumulados
    }).catch((error) => console.error('Error updating Firestore:', error));
  }, [userId, testId]);

  const handleSkip = useCallback(async () => {
    const updatedQuestions = [...readingQuestions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      completed: true,
      answer: null,
      score: 0, // 0 points for skip
    };

    let updatedScore = score; // Score is not increased when skipping


    setReadingQuestions(updatedQuestions);
    setScore(updatedScore);
    setAnswered(true);

    const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
    const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
    const isLastQuestion = nextIndex === -1;

    const updatePayload: any = {
      reading: updatedQuestions,
      "abilitiesScore.readingScore": updatedScore, // Score is not changed by skipping
    };

    if (isLastQuestion) {
      updatePayload["abilitiesCompleted.readingCompleted"] = true;
    }


    // Update Firestore
    await updateDoc(placementDocRef, updatePayload);
    updateUserProgress(updatedQuestions, updatedScore); // Update score even when skipping
    handleNext();
  }, [readingQuestions, currentQuestionIndex, score, updateUserProgress, handleNext, userId, testId]);

  // Handle question rendering logic
  const currentQuestion = readingQuestions[currentQuestionIndex]?.question;

  if (readingQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const questionVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const explanationVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark">
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
              <p className='w-full'>Com base no enunciado fornecido, tente responder às perguntas.</p>
              <FluencyButton variant='purple' onClick={() => setIsExplanationOpen(false)}>
                Voltar
              </FluencyButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`question-${currentQuestionIndex}`} // Unique key per question
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            className='p-4 flex flex-col items-center gap-4'
          >
            <div className="absolute -top-4 -right-4 font-bold text-sm">
              <CiCircleQuestion
                onClick={() => setIsExplanationOpen(true)}
                className='w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer'
              />
            </div>
            <div className='flex flex-col items-center justify-center text-justify gap-3'>
              <p className="font-bold w-full">{currentQuestion.text}</p>
              <p className="font-medium">{currentQuestion.question}</p>
            </div>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => {
                const isSelected = readingQuestions[currentQuestionIndex]?.answer === option;
                const isCorrect = option === currentQuestion.correct;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full font-semibold p-2 bg-gray-100 dark:bg-fluency-gray-800 hover:bg-gray-200 hover:dark:bg-fluency-gray-900 rounded-md disabled:opacity-50 duration-300 ease-in-out transition-all
                      ${isSelected && (isCorrect ? 'bg-indigo-500 dark:bg-indigo-600' : 'bg-fluency-red-500 dark:bg-fluency-red-500')}
                      ${answered ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={answered}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {!answered && (
              <FluencyButton
                variant="gray"
                onClick={handleSkip}
                disabled={answered}
              >
                Pular
              </FluencyButton>
            )}
            {answered && (
              <div className="my-2">
                <FluencyButton variant='purple' onClick={handleNext}>
                  {currentQuestionIndex < readingQuestions.length - 1
                    ? 'Próxima pergunta'
                    : 'Finalizar teste'}
                </FluencyButton>
              </div>
            )}
            <div className="text-gray-600 dark:text-gray-500">
              Pergunta {currentQuestionIndex + 1} de {readingQuestions.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}