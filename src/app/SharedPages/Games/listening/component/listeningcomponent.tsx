"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { db } from "@/app/firebase"; // Ensure 'db' and 'storage' are correctly imported from your Firebase setup
import AudioPlayer from "./playerComponent";
import FluencyButton from "@/app/ui/Components/Button/button";
import toast, { Toaster } from "react-hot-toast";

interface NivelamentoDocument {
  id: string;
  transcript: string;
  url: string;
  name: string;
}

interface WordInput {
  word: string;
  isInput: boolean;
  userAnswer: string;
  isCorrect: boolean | null;
}

interface ListeningProps {
  audioId: string;
}

const ListeningComponent: React.FC<ListeningProps> = ({ audioId }) => {
  const { data: session } = useSession();
  const [randomDocument, setRandomDocument] =
    useState<NivelamentoDocument | null>(null);
  const [wordInputs, setWordInputs] = useState<WordInput[]>([]);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [shouldPlayAgain, setShouldPlayAgain] = useState(false);
  const [mode, setMode] = useState<"listening" | "practice">("listening");

  const toggleMode = () => {
    setMode((prev) => (prev === "listening" ? "practice" : "listening"));
  };

  useEffect(() => {
    const fetchNivelamentoData = async () => {
      try {
        const docRef = doc(db, "Nivelamento", audioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as NivelamentoDocument;
          setRandomDocument({
            id: docSnap.id,
            transcript: data.transcript,
            url: data.url,
            name: data.name,
          });
          setSelectedAudio(data.url);
          prepareWordInputs(data.transcript);
        } else {
          console.error("Document does not exist.");
          // Handle case where document with specified ID doesn't exist
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        // Handle error fetching document
      }
    };

    fetchNivelamentoData();
  }, [audioId]);

  const prepareWordInputs = (transcript: string) => {
    // Split the original transcript into words
    const words = transcript.split(" ");

    // Create a set to track which words will become inputs
    const inputIndicesSet = new Set();
    while (inputIndicesSet.size < Math.floor(words.length * 0.2)) {
      inputIndicesSet.add(Math.floor(Math.random() * words.length));
    }

    // Create the word input objects
    const inputs = words.map((word: any, index: unknown) => ({
      word,
      isInput: inputIndicesSet.has(index),
      userAnswer: "",
      isCorrect: null,
    }));

    setWordInputs(inputs);
    setInputsDisabled(false);
  };

  const checkAnswers = () => {
    const emptyFields = wordInputs.filter(
      (input) => input.isInput && input.userAnswer.trim() === ""
    ).length;
    if (emptyFields === wordInputs.filter((input) => input.isInput).length) {
      toast.error("Coloque pelo menos uma palavra!", {
        position: "top-center",
      });
      return null;
    }

    const updatedWordInputs = wordInputs.map((input) => {
      if (input.isInput) {
        // Remove punctuation from both the original word and the user answer for comparison
        const cleanWord = input.word.replace(/[!?]/g, "").toLowerCase();
        const cleanUserAnswer = input.userAnswer
          .trim()
          .replace(/[!?]/g, "")
          .toLowerCase();
        const isCorrect = cleanWord === cleanUserAnswer;
        return { ...input, isCorrect };
      }
      return input;
    });

    setWordInputs(updatedWordInputs);
    setInputsDisabled(true);
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    const updatedWordInputs = [...wordInputs];
    updatedWordInputs[index].userAnswer = value;
    setWordInputs(updatedWordInputs);
  };

  const handlePlayAgain = () => {
    prepareWordInputs(randomDocument?.transcript || "");
  };

  useEffect(() => {
    if (shouldPlayAgain) {
      prepareWordInputs(randomDocument?.transcript || "");
      setShouldPlayAgain(false); // Reset flag
    }
  }, [shouldPlayAgain, randomDocument]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 w-full text-justify flex flex-col gap-1 items-center justify-center rounded-md text-lg">
        {selectedAudio && (
          <AudioPlayer
            src={selectedAudio}
            mode={mode}
            toggleMode={toggleMode}
          />
        )}
        {randomDocument && (
          <div
            className="flex flex-col items-center gap-2"
            key={randomDocument.id}
          >
            <div className="h-[60vh] overflow-hidden overflow-y-scroll p-10 rounded-md">
              {wordInputs.map((input, index) => (
                <span className="w-full" key={index}>
                  {input.isInput ? (
                    <input
                      type="text"
                      className={`max-w-[15%] mx-1 font-bold bg-transparent border-fluency-gray-500 dark:border-fluency-gray-100 border-dashed border-b-[1px] outline-none ${
                        input.isCorrect === true
                          ? "text-green-500"
                          : input.isCorrect === false
                          ? "text-red-500"
                          : "text-black dark:text-white"
                      }`}
                      value={input.userAnswer}
                      onChange={(e) => handleInputChange(index, e)}
                      disabled={inputsDisabled}
                    />
                  ) : (
                    input.word
                  )}{" "}
                </span>
              ))}
            </div>
            {inputsDisabled ? (
              <div className="flex flex-row gap-2 items-center">
                <FluencyButton
                  className="mt-4 flex flex-row items-center"
                  variant="warning"
                  onClick={handlePlayAgain}
                >
                  Jogar novamente
                </FluencyButton>
              </div>
            ) : (
              <FluencyButton variant="confirm" onClick={checkAnswers}>
                Verificar Respostas
              </FluencyButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningComponent;
