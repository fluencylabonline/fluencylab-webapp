import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import FluencyButton from '@/app/ui/Components/Button/button';
import { MdPauseCircle, MdPlayCircle } from 'react-icons/md';
import { AnimatePresence, motion } from 'framer-motion';
import { CiCircleQuestion } from 'react-icons/ci';

interface ListeningPlacementProps {
  language: string;
  onClose: () => void;
  testId: any;
}

interface ListeningQuestion {
  question: {
    text: string;
    question: string;
    options: string[];
    correct: string;
    difficulty: string;
  };
  completed: boolean;
  answer: string | null;
  score: number | null;
  points?: number;
}

// WaveAnimation component to simulate an audio waveform while playing
const WaveAnimation = () => (
  <div className="flex items-center h-5 gap-1 mx-2">
    {[1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className="w-1 h-6 bg-current rounded-full animate-audio-wave"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

export function ListeningPlacement({ language, onClose, testId }: ListeningPlacementProps) {
    const { data: session } = useSession();
    const [userId, setUserId] = useState<string>('');
    const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0); // This score will now accumulate points
    const [answered, setAnswered] = useState<boolean>(false);
    const [speechRate, setSpeechRate] = useState(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isExplanationOpen, setIsExplanationOpen] = useState(true);
    const [questionPoints, setQuestionPoints] = useState<number[]>([]); // State to hold points for each question
    const [playsRemaining, setPlaysRemaining] = useState<number>(2); // State to track plays remaining
    const currentQuestion = listeningQuestions[currentQuestionIndex]?.question;
    
    // Manage speech synthesis play state
    const [playState, setPlayState] = useState<"idle" | "playing" | "paused">("idle");
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
    useEffect(() => {
      if (session && session.user?.id) {
        setUserId(session.user.id);
      }
    }, [session]);
  
    // Fetch the listening questions from Firestore and determine the starting question.
    useEffect(() => {
      async function fetchListeningQuestions() {
        try {
          const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
          const docSnap = await getDoc(placementDocRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            const listeningData: ListeningQuestion[] = data?.listening || [];
  
            // Calculate total difficulty
            const totalDifficulty = listeningData.reduce((sum: number, q: any) => {
              const difficultyValue = Number(q.question.difficulty);
              return sum + difficultyValue;
            }, 0);
  
            // Calculate points for each question and round up
            const calculatedPoints = listeningData.map((q: any) => {
              return Math.ceil((q.question.difficulty / totalDifficulty) * 100);
            });
  
            // Ensure total points is exactly 100 by adjusting the rounding error
            let currentTotalPoints = calculatedPoints.reduce((sum: number, p: number) => sum + p, 0);
            let pointsToAdjust = 100 - currentTotalPoints;
  
            let adjustedPoints = [...calculatedPoints];
            if (pointsToAdjust !== 0) {
                // Adjust points for the highest difficulty questions first
                let questionsSortedByDifficulty = listeningData.map((q: any, index: number) => ({difficulty: q.question.difficulty, index: index}))
                    .sort((a, b) => b.difficulty - a.difficulty); // Sort in descending order of difficulty
  
                for (let i = 0; i < Math.abs(pointsToAdjust); i++) {
                    let questionIndexToAdjust = questionsSortedByDifficulty[i % questionsSortedByDifficulty.length].index;
                    adjustedPoints[questionIndexToAdjust] += pointsToAdjust > 0 ? 1 : -1;
                }
            }
  
            setListeningQuestions(listeningData.map((q: any, index: number) => ({ ...q, points: adjustedPoints[index] }))); // Add points to questions
            setQuestionPoints(adjustedPoints);
  
  
            // Determine if the test was already completed (all questions answered)
            const isTestComplete = listeningData.length > 0 && listeningData.every((q) => q.completed);
            if (isTestComplete) {
              console.log("Test already completed.");
              setIsLoading(false);
            } else {
              // Find the first question that has not been completed.
              const incompleteIndex = listeningData.findIndex((q) => !q.completed);
              if (incompleteIndex !== -1) {
                setCurrentQuestionIndex(incompleteIndex);
                setAnswered(false); // ensure the UI starts with a fresh state
                setIsLoading(false);
              }
            }
          } else {
            setListeningQuestions([]);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error fetching questions:', error);
          setListeningQuestions([]);
        }
      }
      if (userId) {
        fetchListeningQuestions();
      }
    }, [userId, testId]);

    useEffect(() => {
        if (currentQuestion) {
          const difficulty = parseInt(currentQuestion.difficulty, 10);
          if (difficulty >= 1 && difficulty <= 2) {
            setSpeechRate(0.70);
          } else if (difficulty >= 3 && difficulty <= 4) {
            setSpeechRate(0.85);
          } else {
            setSpeechRate(1); // Normal speed for difficulty 5-6 and above, or default
          }
        }
      }, [currentQuestionIndex, currentQuestion]);
  
    // Merged toggle for play, pause, and resume.
    const handleToggle = () => {
      if (playState === "idle") {
        if (playsRemaining > 0) {
          const currentText = listeningQuestions[currentQuestionIndex]?.question?.text;
          if (currentText) {
            const utterance = new SpeechSynthesisUtterance(currentText);
            // Set language based on the passed language prop.
            utterance.lang = language === 'Ingles' ? 'en-US' : language === 'Espanhol' ? 'es-ES' : 'en-US';
            utterance.rate = speechRate;
            utterance.onend = () => setPlayState("idle");
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setPlayState("playing");
            setPlaysRemaining(prevPlays => prevPlays - 1); // Decrement plays remaining
          }
        }
      } else if (playState === "playing") {
        window.speechSynthesis.pause();
        setPlayState("paused");
      } else if (playState === "paused") {
        window.speechSynthesis.resume();
        setPlayState("playing");
      }
    };
  
    const handleRateChange = (rate: number) => {
      setSpeechRate(rate);
    };
  
    // When the user answers a question, update the question in local state and Firestore.
    const handleAnswer = async (selectedOption: string) => {
      const correctAnswer = listeningQuestions[currentQuestionIndex]?.question?.correct;
      const updatedQuestions = [...listeningQuestions];
      let updatedScore = score;
      const currentQuestionPoints = listeningQuestions[currentQuestionIndex]?.points || 0;
  
  
      if (selectedOption === correctAnswer) {
        updatedQuestions[currentQuestionIndex].score = currentQuestionPoints; // Assign points if correct
        updatedScore += currentQuestionPoints; // Add points to total score
      } else {
        updatedQuestions[currentQuestionIndex].score = 0; // 0 points if incorrect
      }
  
      updatedQuestions[currentQuestionIndex].answer = selectedOption;
      updatedQuestions[currentQuestionIndex].completed = true;
  
  
      setListeningQuestions(updatedQuestions);
      setScore(updatedScore); // Update the total score state
      setAnswered(true);
  
      const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
      const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
      const isLastQuestion = nextIndex === -1;
  
      const updatePayload: any = {
        listening: updatedQuestions,
        "abilitiesScore.listeningScore": updatedScore, // Update with accumulated points
      };
  
      if (isLastQuestion) {
        updatePayload["abilitiesCompleted.listeningCompleted"] = true;
      }
  
  
      await updateDoc(placementDocRef, updatePayload)
        .catch((error) => console.error('Error updating Firestore:', error));
    };
  
    // Move to the next question. We try to find the next incomplete question.
    const handleNext = async () => {
        window.speechSynthesis.cancel();
        setPlayState("idle");
        setPlaysRemaining(2); // Reset plays for the next question
  
        // Look for the next incomplete question.
        let nextIndex = currentQuestionIndex + 1;
        while (nextIndex < listeningQuestions.length && listeningQuestions[nextIndex].completed) {
          nextIndex++;
        }
  
        if (nextIndex < listeningQuestions.length) {
          setCurrentQuestionIndex(nextIndex);
          setAnswered(false);
        } else {
          // If no further incomplete question exists, finalize the test.
          const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
          await setDoc(placementDocRef, {
            listening: listeningQuestions,
          }, { merge: true });
          onClose();
        }
      };
  
    const handleSkip = async () => {
      const updatedQuestions = [...listeningQuestions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        completed: true,
        answer: null,
        score: 0, // 0 points for skip
      };
  
      let updatedScore = score; // Score is not increased when skipping
  
      setListeningQuestions(updatedQuestions);
      setScore(updatedScore);
      setAnswered(true);
  
  
      const placementDocRef = doc(db, 'users', userId, 'Placement', testId);
      const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
      const isLastQuestion = nextIndex === -1;
  
  
      const updatePayload: any = {
        listening: updatedQuestions,
        "abilitiesScore.listeningScore": updatedScore, // Score is not changed by skipping
      };
  
      if (isLastQuestion) {
        updatePayload["abilitiesCompleted.listeningCompleted"] = true;
      }
  
  
      await updateDoc(placementDocRef, updatePayload)
        .catch((error) => console.error('Error updating Firestore:', error));
  
      handleNext();
    };
  

  // Render a message if there are no questions loaded.
  if (listeningQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  // Variants for both question and explanation animations
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

  const playButtonText = () => {
    if (playState === "playing") {
        return <WaveAnimation />;
    } else if (playState === "paused") {
        return "Continuar";
    } else if (playsRemaining > 0) {
        return `Ouvir ${playsRemaining}/2`;
    } else {
        return "Ouvir (0/2)"; // Or "No plays left", or disable the button
    }
  };

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
          className='w-full bg-fluency-gray-300 dark:bg-fluency-gray-800 p-4 text-justify rounded-md gap-2 relative'
          >
            <div className='flex flex-col items-center justify-center gap-4'>
              <p className='w-full'>Escute o áudio clicando no botão 'Ouvir' e tente responder às perguntas com base nele. Você terá duas tentativas.</p>
            <FluencyButton variant="purple" onClick={() => setIsExplanationOpen(false)}>
              Voltar
            </FluencyButton>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="absolute -top-4 -right-4 font-bold text-sm">
            <CiCircleQuestion
              onClick={() => setIsExplanationOpen(true)}
              className="w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer"
            />
          </div>
          {currentQuestion && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              variants={questionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.7 }}
              className="w-full flex flex-col items-center gap-4 mt-2"
            >
              <div className="flex flex-row items-center justify-center w-full gap-2 mb-4">
              <FluencyButton
                  onClick={handleToggle}
                  variant="purple"
                  className="flex flex-row items-center justify-center gap-1"
                  disabled={playsRemaining === 0 && playState === 'idle'}
                >
                  {playButtonText()}{" "}
                  {playState === "playing" ? (
                    <MdPauseCircle className="w-5 h-5" />
                  ) : (
                    <MdPlayCircle className="w-5 h-5" />
                  )}
                </FluencyButton>
              </div>
              <p className="mb-4 font-semibold">{currentQuestion.question}</p>
              <div className="flex flex-col items-center justify-center gap-2 w-full">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-2 px-4 bg-gray-100 dark:bg-fluency-gray-800 hover:bg-gray-200 hover:dark:bg-fluency-gray-900 rounded-md disabled:opacity-50 duration-300 ease-in-out transition-all"
                    disabled={answered}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FluencyButton onClick={handleNext} variant="gray">
                      {currentQuestionIndex < listeningQuestions.length - 1 ? 'Próxima' : 'Finalizar'}
                    </FluencyButton>
                  </motion.div>
                )}
                {!answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <motion.button
                      onClick={handleSkip}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Pular
                    </motion.button>
                  </motion.div>
                )}
              </div>
              <div className="text-gray-600 mt-2">
                Texto {currentQuestionIndex + 1} de {listeningQuestions.length}
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  </div>
);
}