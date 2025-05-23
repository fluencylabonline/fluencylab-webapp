import { BubbleMenu, Editor } from "@tiptap/react";
import { franc } from "franc-min";
import { useState } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { FaAngleDown, FaHeadphonesAlt } from "react-icons/fa";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useSession } from 'next-auth/react';

import {
  GoogleGenerativeAI,
} from "@google/generative-ai";

import { FaTimes } from "react-icons/fa"; // Added FaRobot, FaTimes
import { VscWand } from "react-icons/vsc";

type PopoversProps = {
  editor: Editor;
};

const speechSpeeds = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function Popovers({ editor }: PopoversProps) {
  const { data: session } = useSession();
  
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.75); // Default speed is normal
  const [showSpeedOptions, setShowSpeedOptions] = useState<boolean>(false);

  const [showAiOptions, setShowAiOptions] = useState<boolean>(false);
  const [customAiPrompt, setCustomAiPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const closeBubble = () => {
    editor.commands.setTextSelection({
      from: editor.state.selection.to,
      to: editor.state.selection.to,
    });
  };

  const readAloud = () => {
    if (editor) {
      const selectedText = editor.state.selection.empty
        ? "" // No text selected
        : editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
          );

      if (selectedText) {
        const detectedLanguage = franc(selectedText);
        const languageMap: { [key: string]: string } = {
          eng: "en", // English
          spa: "es", // Spanish
          fra: "fr", // French
          deu: "de", // German
          rus: "ru", // Russian
          jpn: "ja", // Japanese
          kor: "ko", // Korean
          // Add more mappings as needed
        };

        const langCode = languageMap[detectedLanguage] || "en"; // Default to English if language is not found
        const speech = new SpeechSynthesisUtterance(selectedText);
        speech.lang = langCode; // Set the language for speech synthesis
        speech.rate = selectedSpeed; // Set the selected speech rate

        speechSynthesis.speak(speech);
        closeBubble();
      } else {
        toast.error("Please select some text to read.");
      }
    } else {
      console.error("Editor is not available.");
    }
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    setShowSpeedOptions(false); // Hide options after selection
    // If speech is ongoing, you might want to stop and restart with new speed,
    // or just apply to next speech. For simplicity, this applies to the next.
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Stop current speech
      // Optionally, you could restart the speech immediately with the new speed
      // but that requires re-calling readAloud or a similar logic.
      // For now, it will apply to the next time the user clicks "readAloud".
    }
  };

  const [wordInfo, setWordInfo] = useState<{
    word: string;
    definition: string;
    synonyms: string[];
    phonetics: { text: string; audio: string }[];
    examples: string[];
  } | null>(null);

  const fetchWordInfo = async (word: string) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      if (!response.ok) {
        throw new Error("Word not found");
      }
      const data = await response.json();
      const meanings = data[0]?.meanings[0];
      const definition =
        meanings?.definitions[0]?.definition || "Definição não encontrada!.";
      const synonyms = meanings?.synonyms.slice(0, 5) || [];
      const examples = meanings?.definitions[0]?.example
        ? [meanings.definitions[0].example]
        : [];
      const phonetics = data[0]?.phonetics || [];

      setWordInfo({ word, definition, synonyms, phonetics, examples });
    } catch (error) {
      toast.error("Definição não encontrada.");
      setWordInfo(null);
    }
  };

  const showWordDefinition = () => {
    if (editor) {
      const selectedText = editor.state.selection.empty
        ? ""
        : editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
          );

      if (selectedText) {
        fetchWordInfo(selectedText.trim().toLowerCase());
        closeBubble();
      } else {
        toast.error("Please select a word to fetch its definition.");
      }
    }
  };

  const setColorAndCloseBubble = (color: string) => {
    editor.chain().focus().setColor(color).run();
    closeBubble();
  };

  const processTextWithAI = async (
    prompt: string,
    selectedText: string
  ): Promise<string | null> => {
    if (!API_KEY) {
      toast.error("AI API key is not configured.");
      console.error("AI API key is missing.");
      return null;
    }
    if (
      !selectedText &&
      !prompt.toLowerCase().includes("generate") &&
      !prompt.toLowerCase().includes("create")
    ) {
      // Allow prompts that don't need selected text explicitly for generation
      toast.error(
        "Please select text or ensure your prompt is for generation."
      );
      return null;
    }

    setIsAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const fullPrompt = `${prompt}\n\n${selectedText}`;
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const aiResponseText = response.text();

      if (!aiResponseText) {
        toast.error("AI did not return a response.");
        return null;
      }
      return aiResponseText;
    } catch (error: any) {
      console.error("Error processing with AI:", error);
      toast.error(error.message || "An error occurred with the AI request.");
      return null;
    } finally {
      setIsAiLoading(false);
    }
  };

const handleAiAction = async (
    actionType: 'simplify' | 'harden' | 'questions' | 'custom',
    customText?: string
  ) => {
    const { from, to, empty } = editor.state.selection;
    const selectedText = empty
      ? ""
      : editor.state.doc.textBetween(from, to, " ");

    if (empty && actionType !== 'custom') {
      toast.error("Please select some text to modify.");
      return;
    }

    let prompt = "";
    let replaceSelection = true;

    switch (actionType) {
      case 'simplify':
        prompt = "Simplify the following text, making it easier to understand while retaining the core meaning";
        break;
      case 'harden':
        prompt = "Make the following text more complex, sophisticated, and elaborate, using richer vocabulary and sentence structures";
        break;
      case 'questions':
        prompt = "Generate 3 simple questions about the following text to check understanding.";
        replaceSelection = false; // do not overwrite
        break;
      case 'custom':
        if (!customText || customText.trim() === "") {
          toast.error("Forneça instruções personalizadas.");
          return;
        }
        prompt = customText.trim();
        break;
      default:
        return;
    }

    const aiResponse = await processTextWithAI(prompt, selectedText);

    if (aiResponse) {
      if (actionType === 'questions') {
        editor.chain().focus()
          .insertContentAt(to, `\nPerguntas\n${aiResponse}`)
          .run();
        toast.success("Perguntas geradas.");
      } else if (actionType === 'custom' && !empty) {
        editor.chain().focus()
          .insertContentAt(to, `\n${aiResponse}`)
          .run();
      } else if (replaceSelection && !empty) {
        // default replace logic
        editor.chain().focus().deleteRange({ from, to }).insertContent(aiResponse).run();
      } else if (replaceSelection && empty && actionType === 'custom') {
        editor.chain().focus().insertContentAt(from, aiResponse).run();
      }
    }

    setShowAiOptions(false);
    setCustomAiPrompt("");
    closeBubble();
  };

  const renderModal = () => {
    if (!wordInfo) return null;

    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={() => setWordInfo(null)} // Close modal on background click
      >
        <div
          className="bg-white dark:bg-fluency-gray-800 p-6 rounded-lg shadow-lg max-w-lg text-black dark:text-white relative overflow-y-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        >
          <FluencyCloseButton onClick={() => setWordInfo(null)} />
          <div className="p-3">
            <h3 className="text-lg font-bold flex flex-row gap-2">
              Palavra: <p className="text-blue-500">{wordInfo.word}</p>
            </h3>
            <p className="mt-2 text-justify">
              Definição: {wordInfo.definition}
            </p>
            {wordInfo.phonetics.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold">Pronúncia:</h4>
                <ul className="list-disc pl-6">
                  {wordInfo.phonetics.map((phonetic, index) => (
                    <li key={index}>
                      {phonetic.text}
                      {phonetic.audio && (
                        <button
                          className="ml-2 text-blue-500 font-bold hover:text-blue-600 duration-200 ease-in-out transition-all"
                          onClick={() => {
                            const audio = new Audio(phonetic.audio);
                            audio.play();
                          }}
                        >
                          ▶ Ouvir
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {wordInfo.synonyms.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold">Sinônimo:</h4>
                <ul className="list-disc pl-6">
                  {wordInfo.synonyms.map((synonym) => (
                    <li key={synonym}>{synonym}</li>
                  ))}
                </ul>
              </div>
            )}

            {wordInfo.examples.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold">Exemplos:</h4>
                <ul className="list-disc pl-6">
                  {wordInfo.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body 
    );
  };

  return (
    <>
      <BubbleMenu className="Popover bg-[#d8d8d8af] dark:bg-[#000000af]" editor={editor}>
        <div className="relative flex items-center">
          <button
            onClick={readAloud}
            className={`p-2 rounded-l-lg duration-300 ease-in-out text-white ${
              speechSynthesis.speaking
                ? "bg-red-500 hover:bg-red-600"
                : "bg-fluency-green-500 hover:bg-fluency-green-600"
            }`}
            title={speechSynthesis.speaking ? "Stop reading" : "Read aloud"}
          >
            <FaHeadphonesAlt />
          </button>
          <button
            onClick={() => setShowSpeedOptions(!showSpeedOptions)}
            className="p-2 bg-fluency-green-500 hover:bg-fluency-green-600 text-white rounded-r-lg duration-300 ease-in-out border-l border-fluency-green-700"
            title="Select speed"
          >
            <FaAngleDown />
          </button>

          {/* Speed Options Dropdown */}
          {showSpeedOptions && (
            <div className="absolute top-full mt-1 right-0 bg-white dark:bg-fluency-gray-700 shadow-lg rounded-md py-1 z-10 w-28">
              {speechSpeeds.map((speed) => (
                <button
                  key={speed.value}
                  onClick={() => handleSpeedChange(speed.value)}
                  className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-fluency-gray-500 dark:text-white ${
                    selectedSpeed === speed.value
                      ? "bg-gray-200 dark:bg-fluency-gray-500 font-semibold"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {session?.user.role === "teacher" && (
        <div className="relative flex items-center">
          <button
            onClick={() => {
              if (isAiLoading) return;
              setShowAiOptions(!showAiOptions);
              setShowSpeedOptions(false); // Close speed options if AI options are opened
            }}
            disabled={isAiLoading}
            className={`p-2 rounded-md duration-300 ease-in-out text-white ${
              isAiLoading
                ? "opacity-50 cursor-not-allowed animate-pulse"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
            title="AI Text Tools"
          >
            {isAiLoading ? (
              <svg
                aria-hidden="true"
                className={`w-5 h-5 text-gray-200 ${
                  isAiLoading
                    ? "animate-spin fill-fluency-indigo-500 ease-in-out transition-all duration-300"
                    : "flex ease-in-out transition-all duration-300"
                } dark:text-gray-600`}
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            ) : <VscWand />}
          </button>

          {showAiOptions && (
            <div className="absolute top-full mt-1 md:left-0 bg-white dark:bg-fluency-gray-700 shadow-lg rounded-md p-3 z-20 w-64 border dark:border-fluency-gray-600">
              <button
                onClick={() => handleAiAction("simplify")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fluency-gray-600 rounded-md mb-1"
              >
                Simplifique
              </button>
              <button
                onClick={() => handleAiAction("harden")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fluency-gray-600 rounded-md mb-1"
              >
                Torne mais complexo
              </button>
              <button
                onClick={() => handleAiAction("questions")}
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-fluency-gray-600 rounded-md mb-2"
              >
                Crie perguntas
              </button>
              <div className="mt-2 pt-2 border-t dark:border-fluency-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Outra instrução:
                </p>
                <textarea
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  placeholder="Ex: Traduza para Francês, Resuma em uma frase..."
                  className="w-full p-2 border rounded-md text-sm bg-white dark:bg-fluency-gray-800 dark:text-white dark:border-fluency-gray-500 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
                <button
                  onClick={() => handleAiAction("custom", customAiPrompt)}
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 text-sm rounded-md"
                >
                  {!isAiLoading ? "Começar" : (
                    <svg
                      aria-hidden="true"
                      className={`w-5 h-5 text-gray-200 ${
                        isAiLoading
                          ? "animate-spin fill-fluency-blue-500 ease-in-out transition-all duration-300"
                          : "flex ease-in-out transition-all duration-300"
                      } dark:text-gray-600`}
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowAiOptions(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                title="Close AI Menu"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>)}
        
        <button
          onClick={showWordDefinition}
          className="bg-slate-300 hover:bg-slate-400 text-white p-2 rounded-lg duration-300 ease-in-out"
        >
          <svg
            height="1rem"
            width="1rem"
            version="1.1"
            id="_x32_"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path
                className="st0"
                d="M511.414,217.728c-1.902-9.034-8.242-16.503-16.852-19.856l-30.197-11.736v31.046l5.718,2.223
                c2.58,1.008,4.483,3.25,5.048,5.953c0.565,2.712-0.263,5.538-2.223,7.497L279.14,426.609c-3.834,3.824-9.561,5.03-14.62,3.071
                l-43.064-16.748v31.046l30.226,11.755c17.18,6.678,36.678,2.581,49.715-10.454l202.594-202.59
                C510.519,236.161,513.317,226.77,511.414,217.728z"
              />
              <path
                className="st0"
                d="M30.914,299.684c1.356-18.895,7.423-43.649,28.466-42.481l192.2,74.751
                c17.228,6.698,36.782,2.553,49.818-10.558l185.771-186.991c6.5-6.538,9.269-15.919,7.357-24.933
                c-1.912-9.023-8.242-16.474-16.832-19.809L286.666,15.374c-17.228-6.698-36.791-2.553-49.818,10.559L21.646,242.538
                C4.625,256.545,0,282.664,0,305.863c0,23.2,1.545,51.043,27.844,61.866l-6.198-1.451l57.942,22.532v-20.742
                c0-3.372,0.42-6.668,1.107-9.88l-38.94-15.147C29.37,338.35,29.36,321.499,30.914,299.684z"
              />
              <path
                className="st0"
                d="M111.048,352.658c-4.088,4.107-6.381,9.645-6.381,15.41v96.076l40.823-8.741l50.888,44.383v-96.048
                c0-5.793,2.298-11.331,6.386-15.419l16.272-16.276l-91.706-35.662L111.048,352.658z"
              />
            </g>
          </svg>
        </button>

        <button
          onClick={() => setColorAndCloseBubble("#4c2fcc")}
          className={
            editor.isActive("textStyle", { color: "#4c2fcc" })
              ? "is-active"
              : ""
          }
          data-testid="setIndigo"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-[#4c2fcc] hover:bg-[#352480] duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble("#FFBF00")}
          className={
            editor.isActive("textStyle", { color: "#FFBF00" })
              ? "is-active"
              : ""
          }
          data-testid="setYellow"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-yellow-500 hover:bg-fluency-yellow-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble("#228B22")}
          className={
            editor.isActive("textStyle", { color: "#228B22" })
              ? "is-active"
              : ""
          }
          data-testid="setGreen"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-green-500 hover:bg-fluency-green-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble("#EE4B2B")}
          className={
            editor.isActive("textStyle", { color: "#EE4B2B" })
              ? "is-active"
              : ""
          }
          data-testid="setRed"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-red-500 hover:bg-fluency-red-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().unsetColor().run();
            closeBubble();
          }}
          className={
            editor.isActive("textStyle", { color: "#000000" })
              ? "is-active"
              : ""
          }
        >
          <div className="w-5 h-5 p-2 rounded-full bg-black dark:bg-white hover:bg-gray-900 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() =>
            editor.commands.setTextSelection({
              from: editor.state.selection.to,
              to: editor.state.selection.to,
            })
          }
        >
          <IoIosCloseCircleOutline className="w-6 h-6 text-black hover:text-indigo-500 dark:hover:text-indigo-500 dark:text-white duration-300 ease-in-out transition-all" />
        </button>
      </BubbleMenu>
      {renderModal()}
    </>
  );
}

export default Popovers;
