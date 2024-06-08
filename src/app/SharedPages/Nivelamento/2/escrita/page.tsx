"use client";

import FluencyButton from "@/app/ui/Components/Button/button";
import { Toaster, toast } from "react-hot-toast";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/app/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoMdArrowRoundForward } from "react-icons/io";
import { PiExam } from "react-icons/pi";

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

const topics = [
  "Discuss the impact of technology on modern society.",
  "Describe your favorite book and explain why you recommend it.",
  "Discuss the importance of environmental conservation.",
  "Explain the concept of cultural diversity and its significance.",
  "Describe a memorable travel experience and its impact on you.",
];

const getRandomTopic = () => {
  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex];
};

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<string>("");
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

  const [topic, setTopic] = useState<string>("");
  const [score, setScore] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [scoreOutput, setScoreOutput] = useState(false);
  const [isTextAreaDisabled, setIsTextAreaDisabled] = useState(false);
  const [proceedToNextLesson, setProceedToNextLesson] = useState(false);
  
  useEffect(() => {
    provideRandomTopic();
  }, []);

  const saveInFirebase = useCallback(
    async (userText: string, analysis: string, score: string) => {
      if (session && session.user) {
        const userId = session.user.id;
        const scoreData = {
          userText: userText,
          score: score,
          timestamp: serverTimestamp(),
          analysis: analysis,
        };
        try {
          await addDoc(collection(db, "users", userId, "Nivelamento", "Nivel-2", "Escrita"), scoreData);
          console.log("Dados salvos com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar os dados: ", error);
        }
      }
    },
    [session]
  );

  useEffect(() => {
    if (score && data && userInput) {
      saveInFirebase(userInput, data, score);
    }
  }, [score, data, userInput, saveInFirebase]);

  const runChat = async (prompt: string) => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "HELLO" }],
        },
        {
          role: "model",
          parts: [{ text: "Hello there! How can I assist you today?" }],
        },
      ],
    });

    const instruction = `Por favor, analise o seguinte texto e forneça uma pontuação de 1 a 5 (permitidos decimais) com base em sua qualidade: gramática, vocabulário, ortografia, uso do tópico fornecido: "${topic}", e uso de linguagem natural. Faça pequenos comentários sobre cada um. No final, mostre a pontuação final assim: **Pontuação Final: 5.0**; **Pontuação Final: 4.7**; **Pontuação Final: 2.3**`;
    const fullPrompt = `${instruction}\n\nText: ${prompt}`;

    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const responseText = response.text();
    const formattedData = responseText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                      .replace(/\n\n/g, "<br/><br/>");

    const scoreMatch = responseText.match(/\*\*Pontuação Final: (\d\.\d)\*\*/);
    const extractedScore = scoreMatch ? scoreMatch[1] : "";
    setScore(extractedScore);
    setData(formattedData);
    toast.success("Análise concluída");

    if (extractedScore) {
      setScoreOutput(true);
      setIsTextAreaDisabled(true);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = (event.target as HTMLFormElement)?.prompt?.value || "";
    setUserInput(prompt);
    runChat(prompt);
  };
  
  const provideRandomTopic = () => {
    const randomTopic = getRandomTopic();
    setTopic(randomTopic);
  };

  useEffect(() => {
    if (proceedToNextLesson) {
      router.push("/student-dashboard/nivelamento/nivel-3/audicao");
    }
  }, [proceedToNextLesson, router]);
  

return (
  <main className="text-fluency-text-light dark:text-fluency-text-dark flex h-[90vh] flex-row overflow-y-hidden items-start justify-around p-6 w-full gap-2">
    {nivelamentoPermitido === false ? 
    (
    <div className='w-max h-max relative top-[36%] rounded-md bg-fluency-green-700 text-white font-bold p-6'>
        <div className='flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
    </div>
    ):(
    <>
      <form onSubmit={onSubmit} className="min-h-[85vh] max-h-[85vh] w-[50%] bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 rounded-md">
        <p className="text-xl font-bold p-3">Seu tema: {topic}</p>
        <p className="mb-2 text-lg font-semibold">Escreva seu texto aqui:</p>
        <textarea
          placeholder="Escreva aqui"
          name="prompt"
          className="w-full min-h-[50vh] max-h-full border-none outline-none p-4 rounded-lg bg-fluency-bg-light dark:bg-fluency-bg-dark"
          disabled={scoreOutput}
        />
        <div className="w-full flex flex-col items-center p-4">
        {!isTextAreaDisabled ? (
            <FluencyButton variant="confirm" type="submit">
              Analisar <TbDeviceDesktopAnalytics className="w-6 h-auto" />
            </FluencyButton>
          ) : (
            <FluencyButton variant="warning" type="button" onClick={() => setProceedToNextLesson(true)}>
              Próxima Lição <IoMdArrowRoundForward className="w-4 h-auto"/>
            </FluencyButton>
          )}
        </div>
      </form>

      <div className="min-h-[85vh] max-h-[85vh] w-[50%] overflow-y-scroll bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 rounded-md">
        <h1 className="text-xl font-bold p-3">Análise do seu texto:</h1>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" dangerouslySetInnerHTML={{ __html: data }} />
      </div></>)}
      <Toaster />
    </main>
  );
}
