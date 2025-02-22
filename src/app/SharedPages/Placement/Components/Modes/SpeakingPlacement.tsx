'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import '../../Placement.css';
import { motion, AnimatePresence } from "framer-motion";
import { MdPauseCircle } from 'react-icons/md';
import { CiCircleQuestion } from 'react-icons/ci';

export interface SpeakingPlacementProps {
  language: string;
  onClose: () => void;
  testId: any;
}

export function SpeakingPlacement({ language, onClose, testId }: SpeakingPlacementProps) {
  const { data: session } = useSession();
  const [speakingText, setSpeakingText] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [activeTestDocId, setActiveTestDocId] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>(''); // final transcript
  const [interimTranscript, setInterimTranscript] = useState<string>(''); // realtime transcript
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);

  // New states for handling multiple questions.
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [questionPoints, setQuestionPoints] = useState<number[]>([]); // State to hold points for each question

  // Ref to hold the SpeechRecognition instance.
  const recognitionRef = useRef<any>(null);

  // Set userId from session.
  useEffect(() => {
    if (session && session.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Fetch the active test document and load the speaking questions array.
  useEffect(() => {
    if (!userId || !testId) return;
    const fetchActiveTest = async () => {
      try {
        const docRef = doc(db, "users", userId, "Placement", testId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setActiveTestDocId(docSnap.id);
          const data = docSnap.data();
          if (data?.speaking && Array.isArray(data.speaking) && data.speaking.length > 0) {
            // Calculate total difficulty
            const totalDifficulty = data.speaking.reduce((sum: number, q: any) => {
              const difficultyValue = Number(q.question.difficulty);
              return sum + difficultyValue;
            }, 0);

            // Calculate points for each question and round up
            const calculatedPoints = data.speaking.map((q: any) => {
              return Math.ceil((q.question.difficulty / totalDifficulty) * 100);
            });
                // Ensure total points is exactly 100 by adjusting the rounding error
                let currentTotalPoints = calculatedPoints.reduce((sum: number, p: number) => sum + p, 0);
                let pointsToAdjust = 100 - currentTotalPoints;

                let adjustedPoints = [...calculatedPoints];
                if (pointsToAdjust !== 0) {
                    // Adjust points for the highest difficulty questions first to minimize impact on easier questions
                    let questionsSortedByDifficulty = data.speaking.map((q: any, index: number) => ({difficulty: q.question.difficulty, index: index}))
                        .sort((a, b) => b.difficulty - a.difficulty); // Sort in descending order of difficulty

                    for (let i = 0; i < Math.abs(pointsToAdjust); i++) {
                        let questionIndexToAdjust = questionsSortedByDifficulty[i % questionsSortedByDifficulty.length].index;
                        adjustedPoints[questionIndexToAdjust] += pointsToAdjust > 0 ? 1 : -1;
                    }
                }

            setQuestions(data.speaking.map((q: any, index: number) => ({ ...q, points: adjustedPoints[index] }))); // Add points to questions
            setQuestionPoints(adjustedPoints);
            
            // Find first incomplete question.
            const firstIncomplete = data.speaking.findIndex((q: any) => !q.completed);
            const initialIndex = firstIncomplete !== -1 ? firstIncomplete : 0;
            setCurrentIndex(initialIndex);
            setSpeakingText(data.speaking[initialIndex].question.text);
          } else {
            setError("Nenhuma pergunta de speaking encontrada.");
          }
        } else {
          setError("Nenhum teste ativo encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar o teste ativo:", err);
        setError("Erro ao carregar os dados do teste.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveTest();
  }, [userId, testId]);

  // Update the current question (and reset transcripts/attempts) when the index or questions change.
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= 0 && currentIndex < questions.length) {
      setSpeakingText(questions[currentIndex].question.text);
      setUserTranscript('');
      setInterimTranscript('');
      setAttemptCount(0);
      setScore(null);
      setError('');
    }
  }, [currentIndex, questions]);

  // Clean up SpeechRecognition instance on unmount.
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Utility: Clean text
  const cleanText = (text: string) =>
    text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .replace(/\s{2,}/g, " ")
      .toLowerCase()
      .trim();

  // Levenshtein distance for fuzzy matching.
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    const aLen = a.length;
    const bLen = b.length;

    for (let i = 0; i <= bLen; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= aLen; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= bLen; i++) {
      for (let j = 1; j <= aLen; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[bLen][aLen];
  };

  // Compute score based on similarity using the Levenshtein distance.
  const computeScore = useCallback(() => {
    const cleanedReference = cleanText(speakingText);
    const cleanedTranscript = cleanText(userTranscript);
    const distance = levenshteinDistance(cleanedReference, cleanedTranscript);
    const maxLen = Math.max(cleanedReference.length, cleanedTranscript.length);
    const similarity = maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100;
    const computedScore = Math.round(similarity);
    setScore(computedScore);
  }, [speakingText, userTranscript]);

  // Start recording with realtime transcript updates.
  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Reconhecimento de voz não é suportado neste navegador.");
      return;
    }
    if (attemptCount >= 2) {
      setError("Você já atingiu o número máximo de tentativas.");
      return;
    }
    setError('');
    setRecording(true);
    setUserTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // allow longer pauses
    recognition.interimResults = true; // enable realtime results
    recognition.lang = language === 'Ingles' ? 'en-US' : 'pt-BR';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscriptLocal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscriptLocal += transcriptChunk;
        }
      }
      if (finalTranscript) {
        setUserTranscript((prev) => prev + finalTranscript + " ");
      }
      setInterimTranscript(interimTranscriptLocal);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      setError("Erro no reconhecimento de voz: " + event.error);
      setRecording(false);
    };

    recognition.onend = () => {
      setInterimTranscript("");
      // Auto-restart if recording is still true.
      if (recording) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Erro ao reiniciar o reconhecimento:", e);
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [attemptCount, language, recording]);

  // Stop recording manually, finalize the transcript, and compute the score.
  const stopRecording = useCallback(() => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInterimTranscript("");
    setAttemptCount((prev) => prev + 1);
    computeScore();
  }, [computeScore]);

  // Submit the answer for the current question and update Firestore.
  const submitAnswer = useCallback(async () => {
    if (!activeTestDocId) {
      setError("Nenhum teste ativo para atualizar.");
      return;
    }
    if (score === null) {
      setError("A pontuação não foi calculada. Grave sua resposta novamente.");
      return;
    }

    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentIndex];
    const currentQuestionPoints = currentQuestion.points || 0;

    // Calculate weighted score for the current question
    const weightedQuestionScore = (score / 100) * currentQuestionPoints;
    const roundedWeightedScore = Math.round(weightedQuestionScore);


    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      answer: userTranscript,
      score: score,
      weightedScore: roundedWeightedScore,
      completed: true,
    };

    try {
      const testDocRef = doc(db, "users", userId, "Placement", activeTestDocId);

      // Get the current speakingScore from Firestore to accumulate weighted scores
      const docSnap = await getDoc(testDocRef);
      let currentSpeakingScore = docSnap.data()?.abilitiesScore?.speakingScore || 0;

      const newSpeakingScore = currentSpeakingScore + roundedWeightedScore;

      // Find the next incomplete question *after* updating `updatedQuestions`
      const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
      const isLastQuestion = nextIndex === -1; // Check if it's the last question

      const updatePayload: any = { // Use 'any' for flexibility in conditionally adding fields
        speaking: updatedQuestions,
        "abilitiesScore.speakingScore": newSpeakingScore,
      };

      if (isLastQuestion) {
        updatePayload["abilitiesCompleted.speakingCompleted"] = true; // Only add this if it's the last question
      }

      await updateDoc(testDocRef, updatePayload);
      setQuestions(updatedQuestions);

      if (isLastQuestion) {
        onClose();
      } else {
        setCurrentIndex(nextIndex);
      }
    } catch (err) {
      console.error("Erro ao atualizar o teste:", err);
      setError("Erro ao atualizar o teste.");
    }
  }, [activeTestDocId, onClose, score, userTranscript, userId, questions, currentIndex]);

  // Skip the current question.
  const skipQuestion = useCallback(async () => {
    if (!activeTestDocId) {
      setError("Nenhum teste ativo para atualizar.");
      return;
    }
    // Stop recording if active.
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
    }
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...updatedQuestions[currentIndex],
      answer: '',     // Mark as skipped.
      score: null,
      completed: true,
    };

    try {
      const testDocRef = doc(db, "users", userId, "Placement", activeTestDocId);

      // Find the next incomplete question *after* updating `updatedQuestions`
      const nextIndex = updatedQuestions.findIndex((q: any) => !q.completed);
      const isLastQuestion = nextIndex === -1; // Check if it's the last question

      const updatePayload: any = {
        speaking: updatedQuestions,
      };

      if (isLastQuestion) {
        updatePayload["abilitiesCompleted.speakingCompleted"] = true; // Only add if it's the last question
      }

      await updateDoc(testDocRef, updatePayload);
      setQuestions(updatedQuestions);

      if (isLastQuestion) {
        onClose();
      } else {
        setCurrentIndex(nextIndex);
      }
    } catch (err) {
      console.error("Erro ao atualizar o teste:", err);
      setError("Erro ao atualizar o teste.");
    }
  }, [activeTestDocId, questions, currentIndex, onClose, recording, userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  const AudioWave = () => (
    <div className="flex items-center h-6 gap-1 mx-2">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1 h-6 bg-current rounded-full animate-audio-wave"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );

  const explanationVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
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
              className='bg-fluency-gray-300 dark:bg-fluency-gray-800 p-4 text-justify rounded-md gap-2'
            >
              <div className='flex flex-col items-center justify-center gap-4'>
                <div className='w-full'>
                  Clique em iniciar e leia em voz alta o texto abaixo. <br />
                  Você tem duas tentativas para ler cada texto.
                </div>
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
              className="flex flex-col items-center justify-center gap-3"
            >
            <div className="absolute -top-4 -right-4 font-bold text-sm">
              <CiCircleQuestion 
                onClick={() => setIsExplanationOpen(true)} 
                className='w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer'
              />
            </div>

            <div className="dark:bg-fluency-gray-800 mt-4 p-4 rounded-md lg:w-[40vw] md:w-[60vw] w-[70vw]">
              <p className="font-bold">Texto: {speakingText}</p>
            </div>

            <div className="flex flex-col items-start dark:bg-fluency-gray-800 p-4 rounded-md gap-2 lg:w-[40vw] md:w-[60vw] w-[70vw]" aria-live="polite">
              <p>Sua leitura:</p>
              <p className="mb-4 font-bold">
                {userTranscript} {interimTranscript}
              </p>
              {score !== null && <p className="font-bold">Pontuação: {score}%</p>}
            </div>

            {error && <p role="alert" className="text-red-500 dark:text-red-700 mb-4">{error}</p>}
            <p className="font-bold">Tentativa: {attemptCount} / 2</p>

            <div className="flex gap-1">
              {!recording ? (
                <FluencyButton variant="purple" onClick={startRecording} aria-label="Iniciar Gravação">
                  Iniciar
                </FluencyButton>
              ) : (
                <FluencyButton variant="orange" onClick={stopRecording} aria-label="Parar Gravação">
                  <MdPauseCircle className="w-5 h-5" /> <AudioWave />
                </FluencyButton>
              )}
              {!recording && (
                <>
                  <FluencyButton
                    variant="gray"
                    onClick={submitAnswer}
                    disabled={!userTranscript || score === null}
                    aria-label="Enviar Resposta"
                  >
                    Enviar Resposta
                  </FluencyButton>
                  <FluencyButton variant="gray" onClick={skipQuestion} aria-label="Pular Pergunta">
                    Pular
                  </FluencyButton>
                </>
              )}
            </div>

            <div className="text-gray-600 dark:text-gray-500 mt-2">
              {`Texto ${currentIndex + 1} de ${questionPoints.length}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}