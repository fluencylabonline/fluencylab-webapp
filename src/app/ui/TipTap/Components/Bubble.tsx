import { BubbleMenu, Editor } from "@tiptap/react";
import { franc } from "franc-min";
import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { FaAngleDown, FaHeadphonesAlt } from "react-icons/fa";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FaTimes } from "react-icons/fa";
import { VscWand } from "react-icons/vsc";

const speechSpeeds = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

type PopoversProps = {
  editor: Editor;
};

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function Popovers({ editor }: PopoversProps) {
  const { data: session } = useSession();
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.75);
  const [showSpeedOptions, setShowSpeedOptions] = useState<boolean>(false);
  const [showAiOptions, setShowAiOptions] = useState<boolean>(false);
  const [customAiPrompt, setCustomAiPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const speedRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedRef.current && !speedRef.current.contains(event.target as Node)) {
        setShowSpeedOptions(false);
      }
      if (aiRef.current && !aiRef.current.contains(event.target as Node)) {
        setShowAiOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Show animation when bubble menu becomes active
    if (editor.isActive("text") && !visible) {
      setVisible(true);
    }
  }, [editor.state.selection]);

  const closeBubble = () => {
    setVisible(false);
    setTimeout(() => {
      editor.commands.setTextSelection({
        from: editor.state.selection.to,
        to: editor.state.selection.to,
      });
    }, 200);
  };

  const readAloud = () => {
    if (editor) {
      const selectedText = editor.state.selection.empty
        ? ""
        : editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
          );

      if (selectedText) {
        const detectedLanguage = franc(selectedText);
        const languageMap: { [key: string]: string } = {
          eng: "en", spa: "es", fra: "fr", deu: "de", rus: "ru", jpn: "ja", kor: "ko",
        };

        const langCode = languageMap[detectedLanguage] || "en";
        const speech = new SpeechSynthesisUtterance(selectedText);
        speech.lang = langCode;
        speech.rate = selectedSpeed;

        speechSynthesis.speak(speech);
        closeBubble();
      } else {
        toast.error("Please select some text to read.");
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    setShowSpeedOptions(false);
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
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
      if (!response.ok) throw new Error("Word not found");
      
      const data = await response.json();
      const meanings = data[0]?.meanings[0];
      const definition = meanings?.definitions[0]?.definition || "Definition not found.";
      const synonyms = meanings?.synonyms.slice(0, 5) || [];
      const examples = meanings?.definitions[0]?.example ? [meanings.definitions[0].example] : [];
      const phonetics = data[0]?.phonetics || [];

      setWordInfo({ word, definition, synonyms, phonetics, examples });
    } catch (error) {
      toast.error("Definition not found.");
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
      return null;
    }

    setIsAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const fullPrompt = `${prompt}\n\n${selectedText}`;
      const result = await model.generateContent(fullPrompt);
      return result.response.text();
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
    const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ");

    if (empty && actionType !== 'custom') {
      toast.error("Please select some text to modify.");
      return;
    }

    let prompt = "";
    let replaceSelection = true;

    switch (actionType) {
      case 'simplify': prompt = "Simplify the following text"; break;
      case 'harden': prompt = "Make the following text more complex"; break;
      case 'questions': 
        prompt = "Generate 3 simple questions about the text";
        replaceSelection = false;
        break;
      case 'custom':
        if (!customText?.trim()) {
          toast.error("Provide custom instructions.");
          return;
        }
        prompt = customText.trim();
        break;
      default: return;
    }

    const aiResponse = await processTextWithAI(prompt, selectedText);
    if (!aiResponse) return;

    if (actionType === 'questions') {
      editor.chain().focus().insertContentAt(to, `\nQuestions\n${aiResponse}`).run();
      toast.success("Questions generated.");
    } else if (replaceSelection && !empty) {
      editor.chain().focus().deleteRange({ from, to }).insertContent(aiResponse).run();
    } else {
      editor.chain().focus().insertContentAt(from, aiResponse).run();
    }

    setShowAiOptions(false);
    setCustomAiPrompt("");
    closeBubble();
  };

  const renderModal = () => {
    if (!wordInfo) return null;

    return ReactDOM.createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setWordInfo(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-fluency-gray-800 p-6 rounded-xl shadow-xl max-w-lg w-full mx-4 text-black dark:text-white relative overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <FluencyCloseButton onClick={() => setWordInfo(null)} />
            <div className="p-3 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Word: <span className="text-blue-500 font-semibold">{wordInfo.word}</span>
              </h3>
              
              <div className="bg-fluency-blue-50 dark:bg-fluency-gray-700 p-4 rounded-lg">
                <p className="text-justify">
                  <span className="font-semibold">Definition:</span> {wordInfo.definition}
                </p>
              </div>

              {wordInfo.phonetics.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg mb-2">Pronunciation:</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordInfo.phonetics.map((phonetic, index) => (
                      <motion.div 
                        key={index}
                        className="bg-fluency-blue-50 dark:bg-fluency-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
                        whileHover={{ scale: 1.03 }}
                      >
                        <span>{phonetic.text}</span>
                        {phonetic.audio && (
                          <button
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            onClick={() => new Audio(phonetic.audio).play()}
                          >
                            <FaHeadphonesAlt />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {wordInfo.synonyms.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg mb-2">Synonyms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordInfo.synonyms.map((synonym) => (
                      <motion.span 
                        key={synonym}
                        className="bg-fluency-green-50 dark:bg-fluency-gray-700 px-3 py-1 rounded-full text-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        {synonym}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {wordInfo.examples.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg mb-2">Examples:</h4>
                  <ul className="space-y-2">
                    {wordInfo.examples.map((example, index) => (
                      <motion.li 
                        key={index}
                        className="bg-fluency-yellow-50 dark:bg-fluency-gray-700 p-3 rounded-lg italic"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        "{example}"
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  const colorButtons = [
    { color: "#4c2fcc", name: "Indigo" },
    { color: "#FFBF00", name: "Yellow" },
    { color: "#228B22", name: "Green" },
    { color: "#EE4B2B", name: "Red" },
    { color: "#000000", name: "Black" },
  ];

  return (
    <>
      <BubbleMenu 
        editor={editor}
        className="Popover"
        tippyOptions={{ 
          duration: 300,
          animation: "scale",
          placement: "bottom",
          moveTransition: "transform 0.2s ease-out",
          onShow: () => setVisible(true),
          onHide: () => setVisible(false)
        }}
      >
        <AnimatePresence>
          {visible && (
            <motion.div 
              className="flex items-center gap-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 300,
                duration: 0.2
              }}
            >
              {/* Speech Controls */}
              <div className="relative flex items-center" ref={speedRef}>
                <motion.button
                  onClick={readAloud}
                  className={`p-2 rounded-l-lg duration-300 ease-in-out text-white ${
                    speechSynthesis.speaking
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-fluency-green-500 hover:bg-fluency-green-600"
                  }`}
                  title={speechSynthesis.speaking ? "Stop reading" : "Read aloud"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaHeadphonesAlt />
                </motion.button>
                <motion.button
                  onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                  className="p-2 bg-fluency-green-500 hover:bg-fluency-green-600 text-white rounded-r-lg duration-300 ease-in-out border-l border-fluency-green-700"
                  title="Select speed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaAngleDown />
                </motion.button>

                {/* Speed Options Dropdown */}
                <AnimatePresence>
                  {showSpeedOptions && (
                    <motion.div
                      className="absolute top-full mt-2 right-0 bg-white dark:bg-fluency-gray-700 shadow-xl rounded-xl py-2 z-10 w-32 border border-gray-200 dark:border-gray-600"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {speechSpeeds.map((speed) => (
                        <motion.button
                          key={speed.value}
                          onClick={() => handleSpeedChange(speed.value)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-fluency-gray-600 dark:text-white ${
                            selectedSpeed === speed.value
                              ? "bg-gray-100 dark:bg-fluency-gray-600 font-semibold"
                              : ""
                          }`}
                          whileHover={{ x: 5 }}
                        >
                          {speed.label}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Tools */}
              {session?.user.role === "teacher" && (
                <div className="relative" ref={aiRef}>
                  <motion.button
                    onClick={() => {
                      if (isAiLoading) return;
                      setShowAiOptions(!showAiOptions);
                      setShowSpeedOptions(false);
                    }}
                    disabled={isAiLoading}
                    className={`p-2 rounded-lg duration-300 ease-in-out text-white ${
                      isAiLoading
                        ? "opacity-50 cursor-not-allowed animate-pulse"
                        : "bg-indigo-500 hover:bg-indigo-600"
                    }`}
                    title="AI Text Tools"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAiLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5"
                      >
                        <VscWand />
                      </motion.div>
                    ) : <VscWand />}
                  </motion.button>

                  <AnimatePresence>
                    {showAiOptions && (
                      <motion.div
                        className="absolute top-full mt-2 left-0 bg-white dark:bg-fluency-gray-700 shadow-xl rounded-xl p-4 z-20 w-64 border dark:border-fluency-gray-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => setShowAiOptions(false)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Close"
                        >
                          <FaTimes />
                        </button>
                        
                        <div className="space-y-2">
                          <motion.button
                            onClick={() => handleAiAction("simplify")}
                            className="block w-full text-left px-4 py-2.5 text-sm rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-fluency-gray-600 dark:hover:bg-fluency-gray-500 text-blue-700 dark:text-blue-300"
                            whileHover={{ x: 5 }}
                          >
                            Simplify
                          </motion.button>
                          <motion.button
                            onClick={() => handleAiAction("harden")}
                            className="block w-full text-left px-4 py-2.5 text-sm rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-fluency-gray-600 dark:hover:bg-fluency-gray-500 text-purple-700 dark:text-purple-300"
                            whileHover={{ x: 5 }}
                          >
                            Make more complex
                          </motion.button>
                          <motion.button
                            onClick={() => handleAiAction("questions")}
                            className="block w-full text-left px-4 py-2.5 text-sm rounded-lg bg-green-50 hover:bg-green-100 dark:bg-fluency-gray-600 dark:hover:bg-fluency-gray-500 text-green-700 dark:text-green-300"
                            whileHover={{ x: 5 }}
                          >
                            Create questions
                          </motion.button>
                        </div>

                        <div className="mt-4 pt-4 border-t dark:border-fluency-gray-600">
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                            Custom instruction:
                          </p>
                          <textarea
                            value={customAiPrompt}
                            onChange={(e) => setCustomAiPrompt(e.target.value)}
                            placeholder="Ex: Translate to French, Summarize in one sentence..."
                            className="w-full p-3 border rounded-xl text-sm bg-white dark:bg-fluency-gray-800 dark:text-white dark:border-fluency-gray-500 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                            rows={2}
                          />
                          <motion.button
                            onClick={() => handleAiAction("custom", customAiPrompt)}
                            className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 text-sm rounded-lg flex justify-center items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isAiLoading}
                          >
                            {isAiLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4"
                              >
                                <VscWand />
                              </motion.div>
                            ) : (
                              <>
                                <VscWand />
                                <span>Generate</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Dictionary Button */}
              <motion.button
                onClick={showWordDefinition}
                className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Word definition"
              >
                <svg
                  height="1rem"
                  width="1rem"
                  viewBox="0 0 512 512"
                  className="fill-current text-gray-800 dark:text-gray-200"
                >
                  <path d="M511.414,217.728c-1.902-9.034-8.242-16.503-16.852-19.856l-30.197-11.736v31.046l5.718,2.223c2.58,1.008,4.483,3.25,5.048,5.953c0.565,2.712-0.263,5.538-2.223,7.497L279.14,426.609c-3.834,3.824-9.561,5.03-14.62,3.071l-43.064-16.748v31.046l30.226,11.755c17.18,6.678,36.678,2.581,49.715-10.454l202.594-202.59C510.519,236.161,513.317,226.77,511.414,217.728z"/>
                  <path d="M30.914,299.684c1.356-18.895,7.423-43.649,28.466-42.481l192.2,74.751c17.228,6.698,36.782,2.553,49.818-10.558l185.771-186.991c6.5-6.538,9.269-15.919,7.357-24.933c-1.912-9.023-8.242-16.474-16.832-19.809L286.666,15.374c-17.228-6.698-36.791-2.553-49.818,10.559L21.646,242.538C4.625,256.545,0,282.664,0,305.863c0,23.2,1.545,51.043,27.844,61.866l-6.198-1.451l57.942,22.532v-20.742c0-3.372,0.42-6.668,1.107-9.88l-38.94-15.147C29.37,338.35,29.36,321.499,30.914,299.684z"/>
                  <path d="M111.048,352.658c-4.088,4.107-6.381,9.645-6.381,15.41v96.076l40.823-8.741l50.888,44.383v-96.048c0-5.793,2.298-11.331,6.386-15.419l16.272-16.276l-91.706-35.662L111.048,352.658z"/>
                </svg>
              </motion.button>

              {/* Color Picker */}
              <div className="flex items-center gap-1">
                {colorButtons.map((btn, index) => (
                  <motion.button
                    key={index}
                    onClick={() => 
                      btn.color === "#000000" 
                        ? editor.chain().focus().unsetColor().run() 
                        : setColorAndCloseBubble(btn.color)
                    }
                    className={
                      editor.isActive("textStyle", { color: btn.color }) 
                        ? "ring-2 ring-offset-2 ring-blue-500 rounded-full" 
                        : ""
                    }
                    title={btn.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: btn.color }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Close Button */}
              <motion.button
                onClick={closeBubble}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 text-gray-700 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-400"
                title="Close toolbar"
              >
                <IoIosCloseCircleOutline className="w-6 h-6" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </BubbleMenu>
      
      {renderModal()}
    </>
  );
}

export default Popovers;