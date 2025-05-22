import { BubbleMenu, Editor } from "@tiptap/react";
import { franc } from "franc-min";
import { useState } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { FaAngleDown, FaHeadphonesAlt } from "react-icons/fa";
import FluencyCloseButton from "../../Components/ModalComponents/closeModal";
import { IoIosCloseCircleOutline } from "react-icons/io";

type PopoversProps = {
  editor: Editor;
}

const speechSpeeds = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

function Popovers({ editor }: PopoversProps) {
  const [selectedSpeed, setSelectedSpeed] = useState<number>(0.75); // Default speed is normal
  const [showSpeedOptions, setShowSpeedOptions] = useState<boolean>(false);

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
          'eng': 'en', // English
          'spa': 'es', // Spanish
          'fra': 'fr', // French
          'deu': 'de', // German
          'rus': 'ru', // Russian
          'jpn': 'ja', // Japanese
          'kor': 'ko', // Korean
          // Add more mappings as needed
        };

        const langCode = languageMap[detectedLanguage] || 'en'; // Default to English if language is not found
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
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      const data = await response.json();
      const meanings = data[0]?.meanings[0];
      const definition = meanings?.definitions[0]?.definition || 'Definição não encontrada!.';
      const synonyms = meanings?.synonyms.slice(0, 5) || [];
      const examples = meanings?.definitions[0]?.example ? [meanings.definitions[0].example] : [];
      const phonetics = data[0]?.phonetics || [];

      setWordInfo({ word, definition, synonyms, phonetics, examples });
    } catch (error) {
      toast.error('Definição não encontrada.');
      setWordInfo(null);
    }
  };

  const showWordDefinition = () => {
    if (editor) {
      const selectedText = editor.state.selection.empty
        ? ""
        : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ");

      if (selectedText) {
        fetchWordInfo(selectedText.trim().toLowerCase());
        closeBubble();
      } else {
        toast.error('Please select a word to fetch its definition.');
      }
    }
  };

  const setColorAndCloseBubble = (color: string) => {
    editor.chain().focus().setColor(color).run();
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
            <p className="mt-2 text-justify">Definição: {wordInfo.definition}</p>
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
      document.body // Mounts the modal directly to the body
    );
  };

  return (
    <>
      <BubbleMenu className="Popover" editor={editor}>
        <div className="relative flex items-center">
          <button
            onClick={readAloud}
            className={`p-2 rounded-l-lg duration-300 ease-in-out text-white ${speechSynthesis.speaking ? 'bg-red-500 hover:bg-red-600' : 'bg-fluency-green-500 hover:bg-fluency-green-600'}`}
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
            <div className="absolute top-full mt-1 right-0 bg-white dark:bg-fluency-gray-600 shadow-lg rounded-md py-1 z-10 w-28">
              {speechSpeeds.map((speed) => (
                <button
                  key={speed.value}
                  onClick={() => handleSpeedChange(speed.value)}
                  className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-fluency-gray-500 dark:text-white ${selectedSpeed === speed.value ? 'bg-gray-200 dark:bg-fluency-gray-500 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={showWordDefinition}
          className="bg-slate-300 hover:bg-slate-400 text-white p-2 rounded-lg duration-300 ease-in-out"
        >
          <svg height="1.25rem" width="1.25rem" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <g>
              <path className="st0" d="M511.414,217.728c-1.902-9.034-8.242-16.503-16.852-19.856l-30.197-11.736v31.046l5.718,2.223
                c2.58,1.008,4.483,3.25,5.048,5.953c0.565,2.712-0.263,5.538-2.223,7.497L279.14,426.609c-3.834,3.824-9.561,5.03-14.62,3.071
                l-43.064-16.748v31.046l30.226,11.755c17.18,6.678,36.678,2.581,49.715-10.454l202.594-202.59
                C510.519,236.161,513.317,226.77,511.414,217.728z"/>
              <path className="st0" d="M30.914,299.684c1.356-18.895,7.423-43.649,28.466-42.481l192.2,74.751
                c17.228,6.698,36.782,2.553,49.818-10.558l185.771-186.991c6.5-6.538,9.269-15.919,7.357-24.933
                c-1.912-9.023-8.242-16.474-16.832-19.809L286.666,15.374c-17.228-6.698-36.791-2.553-49.818,10.559L21.646,242.538
                C4.625,256.545,0,282.664,0,305.863c0,23.2,1.545,51.043,27.844,61.866l-6.198-1.451l57.942,22.532v-20.742
                c0-3.372,0.42-6.668,1.107-9.88l-38.94-15.147C29.37,338.35,29.36,321.499,30.914,299.684z"/>
              <path className="st0" d="M111.048,352.658c-4.088,4.107-6.381,9.645-6.381,15.41v96.076l40.823-8.741l50.888,44.383v-96.048
                c0-5.793,2.298-11.331,6.386-15.419l16.272-16.276l-91.706-35.662L111.048,352.658z"/>
            </g>
          </svg>
        </button>

        <button
          onClick={() => setColorAndCloseBubble('#21B5DE')}
          className={editor.isActive('textStyle', { color: '#21B5DE' }) ? 'is-active' : ''}
          data-testid="setBlue"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-blue-500 hover:bg-fluency-blue-600 duration-300 ease-in-out transition-all"></div>
        </button>
        
        <button
          onClick={() => setColorAndCloseBubble('#4c2fcc')}
          className={editor.isActive('textStyle', { color: '#4c2fcc' }) ? 'is-active' : ''}
          data-testid="setIndigo"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-[#4c2fcc] hover:bg-[#4c2fcc] duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble('#FFBF00')}
          className={editor.isActive('textStyle', { color: '#FFBF00' }) ? 'is-active' : ''}
          data-testid="setYellow"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-yellow-500 hover:bg-fluency-yellow-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble('#228B22')}
          className={editor.isActive('textStyle', { color: '#228B22' }) ? 'is-active' : ''}
          data-testid="setGreen"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-green-500 hover:bg-fluency-green-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => setColorAndCloseBubble('#EE4B2B')}
          className={editor.isActive('textStyle', { color: '#EE4B2B' }) ? 'is-active' : ''}
          data-testid="setRed"
        >
          <div className="w-5 h-5 p-2 rounded-full bg-fluency-red-500 hover:bg-fluency-red-600 duration-300 ease-in-out transition-all"></div>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().unsetColor().run();
            closeBubble();
          }}
          className={editor.isActive('textStyle', { color: '#000000' }) ? 'is-active' : ''}
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
