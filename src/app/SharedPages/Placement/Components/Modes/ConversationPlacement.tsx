"use client";
import { useState, useEffect } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

interface Message {
  role: "user" | "gemini";
  text: string;
}

export default function ConversationPlacement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Setup SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = "en-US";
    recognitionInstance.interimResults = true;

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;

      if (isFinal) {
        sendMessage(transcript);
      }
    };

    recognitionInstance.onstart = () => {
      setIsListening(true);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      recognitionInstance.abort(); // Clean up on component unmount
    };
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
        }),
      });

      const data = await response.json();

      // Extract the text response correctly
      const botMessage = data?.candidates
        ?.flatMap((candidate: any) => candidate.content.parts.map((part: any) => part.text))
        ?.join(" ") || "No response";

      // Display Gemini's text response
      setMessages((prev) => [...prev, { role: "gemini", text: botMessage }]);

      // Convert the response to speech (real-time streaming)
      speakText(botMessage);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to speak the text aloud using SpeechSynthesis API
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <div className="h-80 overflow-y-auto p-2 border-b">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded ${msg.role === "user" ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}`}
          >
            <strong>{msg.role === "user" ? "You" : "Gemini"}:</strong> {msg.text}
          </div>
        ))}
        {loading && <p className="text-gray-500">Gemini is typing...</p>}
      </div>

      {/* Voice Input */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={startListening}
          disabled={loading || isListening}
          className="p-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {isListening ? "Listening..." : "Start Speaking"}
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening || loading}
          className="p-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
