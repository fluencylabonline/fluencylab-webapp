'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import FluencyButton from "@/app/ui/Components/Button/button";
import { motion, AnimatePresence } from "framer-motion";
import { CiCircleQuestion } from "react-icons/ci";
import '../../Placement.css'
import { IoClose } from "react-icons/io5";

// Variantes de animação
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const explanationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

const analysisVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const questionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

interface WritingQuestion {
  question: {
    topic: string;
    difficulty: number;
  };
  answer: string | null;
  analysis: string | null;
  score: number | null;
  completed: boolean;
  points?: number;
}


export default function WritingPlacement({ testId, language, onClose }: { testId: any, language: string, onClose: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>("");
  const [writingQuestions, setWritingQuestions] = useState<WritingQuestion[]>([]);
  const [currentWritingIndex, setCurrentWritingIndex] = useState<number>(0);
  const [isTextAreaDisabled, setIsTextAreaDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [questionPoints, setQuestionPoints] = useState<number[]>([]); // State to hold points for each question


  // analysisStatus values: "completed" | "off-topic" | "error" | null
  const [analysisStatus, setAnalysisStatus] = useState<"completed" | "off-topic" | "error" | null>(null);

  const currentQuestion = writingQuestions[currentWritingIndex] || {};
  const currentTopic = currentQuestion.question?.topic || "";

  // Set user ID from session
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);

  // Fetch writing test from Firestore
// Update the useEffect that fetches writing test
useEffect(() => {
  async function fetchWritingTest() {
    if (!userId) return;
    try {
      const docSnap = await getDoc(doc(db, "users", userId, "Placement", testId));
      if (docSnap.exists()) {
        const writingData: WritingQuestion[] = docSnap.data()?.writing;
        if (Array.isArray(writingData) && writingData.length > 0) {

          // Calculate total difficulty
          const totalDifficulty = writingData.reduce((sum: number, q: any) => {
            const difficultyValue = Number(q.question.difficulty);
            return sum + difficultyValue;
          }, 0);

          // Calculate points for each question and round up
          const calculatedPoints = writingData.map((q: any) => {
            return Math.ceil((q.question.difficulty / totalDifficulty) * 100);
          });

          // Ensure total points is exactly 100 by adjusting the rounding error
          let currentTotalPoints = calculatedPoints.reduce((sum: number, p: number) => sum + p, 0);
          let pointsToAdjust = 100 - currentTotalPoints;

          let adjustedPoints = [...calculatedPoints];
          if (pointsToAdjust !== 0) {
              // Adjust points for the highest difficulty questions first
              let questionsSortedByDifficulty = writingData.map((q: any, index: number) => ({difficulty: q.question.difficulty, index: index}))
                  .sort((a, b) => b.difficulty - a.difficulty); // Sort in descending order of difficulty

              for (let i = 0; i < Math.abs(pointsToAdjust); i++) {
                  let questionIndexToAdjust = questionsSortedByDifficulty[i % questionsSortedByDifficulty.length].index;
                  adjustedPoints[questionIndexToAdjust] += pointsToAdjust > 0 ? 1 : -1;
              }
          }

          setWritingQuestions(writingData.map((q: any, index: number) => ({ ...q, points: adjustedPoints[index] }))); // Add points to questions
          setQuestionPoints(adjustedPoints);


          // Find first incomplete question
          const firstIncompleteIndex = writingData.findIndex(q => !q.completed);
          setCurrentWritingIndex(
            firstIncompleteIndex !== -1
              ? firstIncompleteIndex
              : writingData.length - 1 // Fallback to last if all completed
          );

          setIsLoading(false);
        }
      } else {
        console.log("Nenhum teste de escrita encontrado para hoje.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao buscar teste de escrita:", error);
      toast.error("Falha ao carregar o teste de escrita");
      setIsLoading(false);
    }
  }
  fetchWritingTest();
}, [userId, testId]); // Added testId to dependencies

  const saveResults = useCallback(async (updatedQuestions: WritingQuestion[]) => {
    if (!session?.user?.id) return;
    try {
      const placementDocRef = doc(db, "users", session.user.id, "Placement", testId);
      let totalScore = 0;
      updatedQuestions.forEach(q => {
        totalScore += q.score || 0; // Sum up the weighted scores
      });
      const allCompleted = updatedQuestions.every(q => q.completed);
      await updateDoc(placementDocRef, {
        writing: updatedQuestions,
        "abilitiesScore.writingScore": totalScore,
        "abilitiesCompleted.writingCompleted": allCompleted,
      });
      toast.success("Progresso salvo!");
    } catch (error) {
      console.error("Erro ao salvar os dados de escrita:", error);
      toast.error("Falha ao salvar o progresso");
    }
  }, [session, testId]);

  const validateResponse = (response: string, prompt: string): boolean => {
    const topicKeywords = currentQuestion.question?.topic?.toLowerCase().split(/\W+/) || [];
    const responseText = prompt.toLowerCase() + response.toLowerCase();
    return topicKeywords.some((keyword: string) => responseText.includes(keyword));
  };

  // Run AI analysis and return results
  const runAIAnalysis = async (prompt: string): Promise<{ analysis: string; score: string }> => {
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048
      };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      ];
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          { role: "user", parts: [{ text: "Olá" }] },
          { role: "model", parts: [{ text: "Olá! Como posso ajudar?" }] }
        ]
      });
      const instruction = `Por favor, analise o seguinte texto escrito em "${language}" sobre o tópico "${currentTopic}" e avalie-o com base em gramática, vocabulário, coerência, ortografia e relevância para o tópico. Se o texto estiver fora do tópico, retorne "OFF_TOPIC_ERROR". No final, apresente a pontuação final como um número inteiro entre 0 e 100.  Por exemplo: **Pontuação Final: 75**.`;
      const fullPrompt = `${instruction}\n\nTexto: ${prompt}`;
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text();

      if (responseText.includes("OFF_TOPIC_ERROR") || !validateResponse(responseText, prompt)) {
        throw new Error("O texto não está relacionado ao tópico");
      }

      const scoreMatch = responseText.match(/\*\*Pontuação Final: (\d+)\*\*/); // Modified regex to capture integers
      if (!scoreMatch) throw new Error("Formato de pontuação inválido");

      const aiScore = parseInt(scoreMatch[1], 10); // Parse as integer
      if (isNaN(aiScore) || aiScore < 0 || aiScore > 100) {  // Validate score range
          throw new Error("Pontuação fora do intervalo válido (0-100).");
      }

      return {
        analysis: responseText, // full analysis is stored but not exibited ao aluno
        score: scoreMatch[1]
      };
    } catch (error) {
      console.error("Erro na análise AI:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Validate user input length
  const validateInput = (input: string): boolean => {
    if (input.trim().length < 50) {
      setAnalysisStatus("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsExplanationOpen(false)
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt")?.toString() || "";
    if (!prompt.trim()) {
      toast.error("Escreva algo antes de enviar");
      return;
    }
    if (!validateInput(prompt)) {
      setAnalysisStatus("error");
      return;
    }
    try {
      const { analysis, score: aiScoreStr } = await runAIAnalysis(prompt);
      const aiScore = parseInt(aiScoreStr, 10);
      const currentQuestionPoints = writingQuestions[currentWritingIndex]?.points || 0;
      const weightedQuestionScore = (aiScore / 100) * currentQuestionPoints;


      const updatedQuestions = writingQuestions.map((q, i) =>
        i === currentWritingIndex ? {
          ...q,
          answer: prompt,
          analysis,
          score: weightedQuestionScore, // Store weighted score
          completed: true
        } : q
      );
      setWritingQuestions(updatedQuestions);
      setIsTextAreaDisabled(true);
      await saveResults(updatedQuestions);
      setAnalysisStatus("completed");
      // If it's the last topic, close automatically after a short delay.
      if (currentWritingIndex === writingQuestions.length - 1) {
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      }
    } catch (error: any) {
      setAnalysisStatus(error.message.includes("tópico") ? "off-topic" : "error");
      setIsTextAreaDisabled(false);
    }
  };

  const handleNext = () => {
    if (currentWritingIndex < writingQuestions.length - 1) {
      setCurrentWritingIndex(prev => prev + 1);
      setIsTextAreaDisabled(false);
      setAnalysisStatus(null)
      document.querySelector<HTMLTextAreaElement>('textarea[name="prompt"]')!.value = ""; // Clear the text area
    } else {
      onClose();
      router.refresh();
    }
  };

  const handleSkip = useCallback(async () => {
    const updatedQuestions = [...writingQuestions];
    updatedQuestions[currentWritingIndex] = {
      ...updatedQuestions[currentWritingIndex],
      completed: true,
      answer: null,
      analysis: null,
      score: 0, // Score 0 for skipped questions
    };

    setWritingQuestions(updatedQuestions);
    setIsTextAreaDisabled(true); // Disable textarea after skipping
    await saveResults(updatedQuestions); // Save progress to Firestore - important to save completion status

    if (currentWritingIndex === writingQuestions.length - 1) {
      onClose();
      router.refresh();
    } else {
      handleNext(); // Proceed to the next question
    }
  }, [writingQuestions, currentWritingIndex, saveResults, onClose, router, handleNext]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-indigo-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative lg:flex lg:flex-row md:flex md:flex-col flex flex-col lg:items-start md:items-center items-center h-[80vh] w-[90vw] overflow-y-auto justify-start gap-4 text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >

      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-fluency-gray-100 dark:bg-fluency-gray-800 p-4 rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWritingIndex}
            variants={questionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <p className="text-md text-justify font-semibold p-2 mb-4 lg:w-[45vw] md:w-full w-full">
              {writingQuestions.length > 0
                ? `Tema ${currentWritingIndex + 1}: ${currentTopic}`
                : "Carregando tema..."}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.textarea
          placeholder="Escreva aqui seu texto..."
          name="prompt"
          defaultValue={currentQuestion.answer || ""}
          className={`w-full h-[40vh] p-4 border bg-fluency-gray-100 dark:bg-fluency-gray-800 border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? "animated-textarea" : ""
          }`}
          disabled={isTextAreaDisabled || loading}
        />

        <div className="mt-4 flex justify-center space-x-2">
          {!isTextAreaDisabled && (
             <FluencyButton
                variant="gray"
                onClick={handleSkip}
                disabled={loading}
              >
                Pular
              </FluencyButton>
          )}
          <FluencyButton
            type="submit"
            disabled={loading || isTextAreaDisabled}
            variant="purple"
            className="relative"
          >
            {loading ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                Analisar <TbDeviceDesktopAnalytics className="w-6 h-auto" />
              </motion.div>
            )}
          </FluencyButton>
        </div>
        <div className="text-gray-600 dark:text-gray-500 mt-2">
          {`Texto ${currentWritingIndex + 1} de ${writingQuestions.length}`}
        </div>
      </form>

      <div className="flex-1 bg-fluency-gray-100 dark:bg-fluency-gray-800 p-4 rounded-lg relative">
          <div className="absolute top-4 right-4 font-bold text-sm">
            {isExplanationOpen ? (
              <IoClose
                onClick={() => setIsExplanationOpen(false)}
                className="w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer"
              />
            ):(
              <CiCircleQuestion
                onClick={() => setIsExplanationOpen(true)}
                className="w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer"
              />
            )}
          </div>
        <h2 className="text-lg font-bold mb-3">{isExplanationOpen ? "Instruções" : "Status da Análise"}</h2>
          {isExplanationOpen ? (
            <motion.div
              key="explanation"
              variants={explanationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="flex flex-col items-center justify-center text-justify gap-4 w-full p-2">
                <p className="w-full p-3">Escreva um texto abordando o tópico escolhido. Seu texto será analisado com base em alguns critérios. Essa análise ficará disponível depois de finalizar seu teste.</p>
                <FluencyButton variant="purple" onClick={() => setIsExplanationOpen(false)}>
                  Começar
                </FluencyButton>
              </div>
            </motion.div>
          ):(
            <>
              <div className="min-h-[10vh] p-4 bg-fluency-gray-900 rounded-lg text-center font-bold">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={analysisStatus || 'default'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={
                      analysisStatus === "completed" ? "text-green-400" :
                      analysisStatus === "off-topic" ? "text-red-500" :
                      analysisStatus === "error" ? "text-yellow-400" : "text-white"
                    }
                  >
                    {analysisStatus === "completed" && "Análise: Concluída!"}
                    {analysisStatus === "off-topic" && "O texto não aborda o tópico corretamente."}
                    {analysisStatus === "error" && "Erro na análise. Tente novamente."}
                    {!analysisStatus && "Análise pendente..."}
                  </motion.p>
                </AnimatePresence>
              </div>
              <motion.div
                key="analysis"
                variants={analysisVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {currentQuestion.completed && (
                  <div className="w-full flex justify-center pt-4">
                    <FluencyButton
                      onClick={handleNext}
                      variant="gray"
                    >
                      {currentWritingIndex < writingQuestions.length - 1 ? "Próximo Tópico" : "Finalizar Teste"}
                    </FluencyButton>
                  </div>
                )}
              </motion.div>
            </>
          )}
      </div>
    </motion.div>
  );
}