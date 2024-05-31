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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import { useSession } from "next-auth/react";

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
  const [data, setData] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const { data: session } = useSession();
  const [score, setScore] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");

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
          await addDoc(collection(db, "users", userId, "nivelamento", "nivel2", "escrita"), scoreData);
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

    const instruction = `Please analyze the following text and provide a score from 1 to 5 (decimals permitted) based on its quality: grammar, vocabulary, orthography, use of the provided topic: "${topic}", and use of natural language. Make small comments on each, showing the errors. At the end, show Final Score like this: **Final Score: 5.0**; **Final Score: 4.7**; **Final Score: 2.3**`;
    const fullPrompt = `${instruction}\n\nText: ${prompt}`;

    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const responseText = response.text();
    const formattedData = responseText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                      .replace(/\n\n/g, "<br/><br/>");

    const scoreMatch = responseText.match(/\*\*Final Score: (\d\.\d)\*\*/);
    const extractedScore = scoreMatch ? scoreMatch[1] : "";
    setScore(extractedScore);
    setData(formattedData);
    toast.success("Análise concluída");
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

  return (
    <main className="text-fluency-text-light dark:text-fluency-text-dark flex h-[90vh] flex-row overflow-y-hidden items-start justify-around p-6 w-full gap-2">
      <form onSubmit={onSubmit} className="min-h-[85vh] max-h-[85vh] w-[50%] bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 rounded-md">
        <p className="text-xl font-bold p-3">Seu tema: {topic}</p>
        <p className="mb-2 text-lg font-semibold">Escreva seu texto aqui:</p>
        <textarea
          placeholder="Escreva aqui"
          name="prompt"
          className="w-full min-h-[50vh] max-h-full border-none outline-none p-4 rounded-lg bg-fluency-bg-light dark:bg-fluency-bg-dark"
        />
        <div className="w-full flex flex-col items-center p-4">
          <FluencyButton variant="confirm" type="submit">
            Analisar <TbDeviceDesktopAnalytics className="w-6 h-auto" />
          </FluencyButton>
        </div>
      </form>

      <div className="min-h-[85vh] max-h-[85vh] w-[50%] overflow-y-scroll bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 rounded-md">
        <h1 className="text-xl font-bold p-3">Análise do seu texto:</h1>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" dangerouslySetInnerHTML={{ __html: data }} />
      </div>
      <Toaster />
    </main>
  );
}
