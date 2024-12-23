"use client";
import React from 'react';
import { useEffect, useState } from 'react';

import { toast, Toaster } from 'react-hot-toast';
import {franc} from 'franc-min'; 

import '@/app/ui/TipTap//styles.scss'
import Toolbar from "@/app/ui/TipTap/Toolbar";

//Imports
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import BulletList from '@tiptap/extension-bullet-list'
import Typography from '@tiptap/extension-typography'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'
import Gapcursor from '@tiptap/extension-gapcursor'

import { PiChalkboardTeacher, PiStudentFill } from 'react-icons/pi';
import { LuFileAudio, LuFileText } from 'react-icons/lu';
import { AiFillYoutube } from 'react-icons/ai';
import { CgTranscript } from 'react-icons/cg';
import { GoGoal } from "react-icons/go";
import { LuBookOpen } from "react-icons/lu";
import { BsThreeDotsVertical, BsTranslate } from "react-icons/bs";
import { GiChoice } from "react-icons/gi";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { TbVocabulary } from "react-icons/tb";
import { TbReload } from "react-icons/tb";
import { TbCloudDownload } from "react-icons/tb";
import { FaHeadphonesAlt, FaRegImage } from "react-icons/fa";
import { BiBandAid } from "react-icons/bi";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Tooltip } from '@nextui-org/react';
import { useSession } from 'next-auth/react';

import ReactComponent from './Components/AudioComponent/Extension';
import Embed from './Components/EmbedComponent/Embed';

import EmbedSelectionModal from './Components/EmbedComponent/EmbedSelectionModal';
import AudioSelectionModal from './Components/AudioComponent/AudioSelectionModal';

import SpeakingExtension from './Components/SpeakingComponent/SpeakingExtension';
import SpeakingSelectionModal from './Components/SpeakingComponent/SpeakingSelectionModal';

import TextDisplayModal from './Components/StudentComponent/StudentModal';
import StudentExtension from './Components/StudentComponent/StudentExtension';

import TextDisplayModalTeacher from './Components/TeacherComponent/TeacherModal';
import TeacherExtension from './Components/TeacherComponent/TeacherExtension';

import TextDisplayModalGoal from './Components/GoalComponent/GoalModal';
import GoalExtension from './Components/GoalComponent/GoalExtension';

import ReviewModal from './Components/ReviewComponent/ReviewModal';
import ReviewNode from './Components/ReviewComponent/ReviewNode';

import TextDisplayModalTip from './Components/TipComponent/TipModal';
import TipExtension from './Components/TipComponent/TipExtension';

import ExerciseModal from './Components/ExerciseModal/ExerciseModal';
import ExerciseExtension from './Components/ExerciseModal/ExerciseExtension';

import MultipleChoiceModal from './Components/MultipleChoice/MultipleChoiceModal';
import MultipleChoiceExtension from './Components/MultipleChoice/MultipleChoiceExtension';

import TranslationModal from './Components/TranslationComponent/TranslationModal';
import TranslationNode from './Components/TranslationComponent/TranslationNode';

import VocabulabModal from './Components/VocabuLabComponent/VocabulabModal';
import VocabulabNode from './Components/VocabuLabComponent/VocabulabNode';

import ImageTextModal from './Components/ImageComponent/ImageTextModal';
import ImageTextNode from './Components/ImageComponent/ImageTextNode';

import FileSnippetNode from './Components/FileComponent/FileSnippetNode';
import FileUploadSnippet from './Components/FileComponent/FileUploadSnippet';

import SentencesModal from './Components/SentencesComponent/SentencesModal';
import SentencesNode from './Components/SentencesComponent/SentencesNode';
import ReactDOM from 'react-dom';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

type PopoversProps = {
  editor: Editor;
}

function Popovers({ editor }: PopoversProps) {
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

        speechSynthesis.speak(speech);
      } else {
        toast.error("Please select some text to read.");
      }
    } else {
      console.error("Editor is not available.");
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

        // Collapse the selection to close the BubbleMenu
        editor.commands.setTextSelection({
          from: editor.state.selection.to,
          to: editor.state.selection.to,
        });
      } else {
        toast.error('Please select a word to fetch its definition.');
      }
    }
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
          <FluencyCloseButton onClick={() => setWordInfo(null)}/>
          <div className='p-3'>
            <h3 className="text-lg font-bold flex flex-row gap-2">Palavra: <p className='text-blue-500'>{wordInfo.word}</p></h3>
            <p className="mt-2 text-justify">Definiçao: {wordInfo.definition}</p>
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
                <h4 className="font-bold">Examplos:</h4>
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
          <button
            onClick={readAloud}
            className="bg-fluency-green-500 hover:bg-fluency-green-600 text-white p-2 rounded-lg duration-300 ease-in-out"
            >
            < FaHeadphonesAlt/>
          </button>

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
            onClick={() => editor.chain().focus().setColor('#21B5DE').run()}
            className={editor.isActive('textStyle', { color: '#0047AB' }) ? 'is-active' : ''}
            data-testid="setBlue"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-fluency-blue-500 hover:bg-fluency-blue-600 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
            onClick={() => editor.chain().focus().setColor('#FFBF00').run()}
            className={editor.isActive('textStyle', { color: '#FFBF00' }) ? 'is-active' : ''}
            data-testid="setYellow"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-fluency-yellow-500 hover:bg-fluency-yellow-600 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
            onClick={() => editor.chain().focus().setColor('#228B22').run()}
            className={editor.isActive('textStyle', { color: '#228B22' }) ? 'is-active' : ''}
            data-testid="setGreen"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-fluency-green-500 hover:bg-fluency-green-600 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
            onClick={() => editor.chain().focus().setColor('#EE4B2B').run()}
            className={editor.isActive('textStyle', { color: '#EE4B2B' }) ? 'is-active' : ''}
            data-testid="setRed"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-fluency-red-500 hover:bg-fluency-red-600 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
            onClick={() => editor.chain().focus().setColor('#FFA500').run()}
            className={editor.isActive('textStyle', { color: '#FFA500' }) ? 'is-active' : ''}
            data-testid="setOrange"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
             onClick={() => editor.chain().focus().unsetColor().run()}
            className={editor.isActive('textStyle', { color: '#000000' }) ? 'is-active' : ''}
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-black dark:bg-white hover:bg-gray-900 duration-300 ease-in-out transition-all'></div>
          </button>
      </BubbleMenu>
      {renderModal()}
      </>
  )
}

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor }: any) => {
  const [isModalTranscriptOpen, setIsModalTranscriptOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalAudioOpen, setIsModalAudioOpen] = useState<boolean>(false);
  const [isModalTranslationOpen, setIsModalTranslationOpen] = useState<boolean>(false);
  const [isModalEmbedOpen, setIsModalEmbedOpen] = useState<boolean>(false);
  const [isModalVocabulabOpen, setIsModalVocabulabOpen] = useState<boolean>(false);
  const [isModalImageTextOpen, setIsModalImageTextOpen] = useState<boolean>(false);
  const [isModalFileOpen, setIsModalFileOpen] = useState<boolean>(false);
  const [isModalSentencesOpen, setIsModalSentencesOpen] = useState<boolean>(false);
  
  const [isModalTextOpen, setModalTextOpen] = useState(false);
  const [initialText, setInitialText] = useState('');
  const handleOpenModal = () => setModalTextOpen(true);
  const handleCloseModal = () => setModalTextOpen(false);

  const [isModalTextTeacherOpen, setModalTextTeacherOpen] = useState(false);
  const [initialTextTeacher, setInitialTextTeacher] = useState('');
  const handleOpenModalTeacher = () => setModalTextTeacherOpen(true);
  const handleCloseModalTeacher = () => setModalTextTeacherOpen(false);

  const [isModalTextGoalOpen, setModalTextGoalOpen] = useState(false);
  const handleOpenModalGoal = () => setModalTextGoalOpen(true);
  const handleCloseModalGoal = () => setModalTextGoalOpen(false);

  const [isModalTextReviewOpen, setModalTextReviewOpen] = useState(false);
  const handleOpenModalReview = () => setModalTextReviewOpen(true);
  const handleCloseModalReview = () => setModalTextReviewOpen(false);

  const [isModalTextTipOpen, setModalTextTipOpen] = useState(false);
  const [initialTextTip, setInitialTextTip] = useState('');
  const handleOpenModalTip = () => setModalTextTipOpen(true);
  const handleCloseModalTip = () => setModalTextTipOpen(false);

  const [isModalExerciseOpen, setModalExerciseOpen] = useState(false);
  const handleOpenModalExercise = () => setModalExerciseOpen(true);
  const handleCloseModalExercise = () => {
    setModalExerciseOpen(false)
  };

  const { data: session } = useSession();
  const [editable, setEditable] = useState(false)

  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const editor = useEditor({
    extensions: [
      Document,
      Image,
      TextStyle, 
      FontFamily,
      Text,
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ReactComponent,
      Embed,
      SpeakingExtension,
      StudentExtension,
      TeacherExtension,
      TipExtension,
      GoalExtension,
      ExerciseExtension,
      MultipleChoiceExtension,
      TranslationNode,
      VocabulabNode,
      ReviewNode,
      ImageTextNode,
      FileSnippetNode,
      SentencesNode,
      Typography,
      BulletList,
      CustomBulletList,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: true,
      }),
      StarterKit.configure({
        document: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Color,
      Placeholder.configure({
        placeholder: ({ node }) => {
          const headingPlaceholders: { [key: number]: string } = {
            1: "Coloque um título...",
            2: "Coloque um subtítulo...",
            3: '/',
            4: '/',
            5: '/',
            6: '/',
          };
      
          if (node.type.name === "heading") {
            return headingPlaceholders[node.attrs.level];
          }
          if (node.type.name === 'paragraph') {
            return "O que vamos aprender..."
          }

          return '/'
        },
      }),

    ],
    editorProps: {
      attributes: {
        class:
          "lg:min-w-[794px] md:max-w-[700px] max-w-[380px] min-h-screen p-16 border-[0.5px] border-[#cfcfcf] dark:border-fluency-gray-300 outline-none bg-white dark:bg-fluency-gray-900",
      },
    },
    autofocus: true,
    editable,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }) 

  useEffect(() => {
    if (session?.user.role === 'admin') {
      setEditable(true)
    }
    editor?.setEditable(editable)
  }, [editable])

  const addImage = () => {
    const url = window.prompt('URL');
  
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  const handleSelectAudio = (audioId: string) => {
    if (editor && audioId) {
      editor.chain().focus().insertContent(`<listening-component audioId="${audioId}"></listening-component>`).run();
    }
  };

  const handleSelectVideo = (url: string) => {
    if (editor && url) {
      editor.chain().focus().insertContent(`<embed-component url="${url}"></embed-component>`).run();
    }
  };

  const handleSelectTranscript = (audioId: string) => {
    if (editor && audioId) {
      editor.chain().focus().insertContent(`<speaking-component audioId="${audioId}"></speaking-component>`).run();
    }
  };
  
  const openMultipleChoiceModal = () => {
    setIsModalOpen(true);
  };

  const closeMultipleChoiceModal = () => {
    setIsModalOpen(false);
  };

  const openVocabulabModal = () => {
    setIsModalVocabulabOpen(true);
  };

  const closeVocabulabModal = () => {
    setIsModalVocabulabOpen(false);
  };

  const openTranslationModal = () => {
    setIsModalTranslationOpen(true);
  };

  const closeTranslationModal = () => {
    setIsModalTranslationOpen(false);
  };

  const openImageTextModal = () => {
    setIsModalImageTextOpen(true);
  };

  const closeImageTextModal = () => {
    setIsModalImageTextOpen(false);
  };

  const openFileModal = () => {
    setIsModalFileOpen(true);
  };

  const closeFileModal = () => {
    setIsModalFileOpen(false);
  };

  const openSentencesModal = () => {
    setIsModalSentencesOpen(true);
  };

  const closeSentencesModal = () => {
    setIsModalSentencesOpen(false);
  };

  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center text-black dark:text-white'>
        {session?.user.role === 'admin' && <Toolbar editor={editor} content={content} addImage={addImage} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}/>}
        <EditorContent editor={editor} />
        <Popovers editor={editor} />

        <TextDisplayModal isOpen={isModalTextOpen} onClose={handleCloseModal} initialText={initialText} editor={editor} />
        <TextDisplayModalTeacher isOpen={isModalTextTeacherOpen} onClose={handleCloseModalTeacher} initialTextTeacher={initialTextTeacher} editor={editor} />
        <TextDisplayModalGoal isOpen={isModalTextGoalOpen} onClose={handleCloseModalGoal} editor={editor} />
        <TextDisplayModalTip isOpen={isModalTextTipOpen} onClose={handleCloseModalTip} initialTextTip={initialTextTip} editor={editor} />
        <VocabulabModal isOpen={isModalVocabulabOpen} onClose={closeVocabulabModal} editor={editor} />
        <ReviewModal isOpen={isModalTextReviewOpen} onClose={handleCloseModalReview} editor={editor} />
        <ImageTextModal isOpen={isModalImageTextOpen} onClose={closeImageTextModal} editor={editor} />
        <FileUploadSnippet isOpen={isModalFileOpen} onClose={closeFileModal} editor={editor} />
        <SentencesModal isOpen={isModalSentencesOpen} onClose={closeSentencesModal} editor={editor} />
        <AudioSelectionModal isOpen={isModalAudioOpen} onClose={() => setIsModalAudioOpen(false)} onSelectAudio={handleSelectAudio} />
        <SpeakingSelectionModal isOpen={isModalTranscriptOpen} onClose={() => setIsModalTranscriptOpen(false)} onSelectAudio={handleSelectTranscript} />
        <EmbedSelectionModal isEmbedOpen={isModalEmbedOpen} onEmbedClose={() => setIsModalEmbedOpen(false)} onSelectVideo={handleSelectVideo} />
        <ExerciseModal isOpen={isModalExerciseOpen} onClose={handleCloseModalExercise} editor={editor} />
        <MultipleChoiceModal isOpen={isModalOpen} onClose={closeMultipleChoiceModal} editor={editor} />
        <TranslationModal isOpen={isModalTranslationOpen} onClose={closeTranslationModal} editor={editor} />

        {session?.user.role === 'admin' &&
        <div className="fixed top-[6.5rem] right-2">
          <div className='flex flex-col items-center gap-1'>
          
          <Tooltip content='Clique para adicionar um áudio de prática' className='bg-fluency-orange-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={() => setIsModalAudioOpen(true)}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <LuFileAudio />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um texto de prática de pronúncia' className='bg-fluency-green-300 font-bold text-sm rounded-md px-1'>
          <button
          onClick={() => setIsModalTranscriptOpen(true)}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <CgTranscript  />
          </button>
          </Tooltip>
          
          <Tooltip content='Clique para adicionar um vídeo' className='bg-fluency-red-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={() => setIsModalEmbedOpen(true)}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <AiFillYoutube />
          </button>
          </Tooltip>

          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-400 hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
              >
                <BiBandAid className="w-5 h-auto" />
              </Button>
            </DropdownTrigger>
            
            <DropdownMenu className="p-3 bg-fluency-gray-300 dark:bg-fluency-gray-400 rounded-md" aria-label="User Actions">
              <DropdownItem 
                onClick={handleOpenModal}
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2 font-bold"><PiStudentFill className="w-5 h-auto" /><span>Aluno</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={handleOpenModalTeacher}
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2 font-bold"><PiChalkboardTeacher className="w-5 h-auto" /><span>Professor</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={handleOpenModalTip}
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2 font-bold"><MdOutlineTipsAndUpdates className="w-5 h-auto" /><span>Dica</span></p>
              </DropdownItem>
              <DropdownItem 
                onClick={openFileModal}
                className="text-md text-fluency-gray-100 hover:text-fluency-blue-300"
              >
                <p className="flex flex-row gap-2 font-bold"><TbCloudDownload className="w-5 h-auto" /><span>Arquivo</span></p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>


          <Tooltip content='Clique para adicionar uma meta' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={handleOpenModalGoal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <GoGoal />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar uma revisão' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={handleOpenModalReview}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <TbReload />
          </button>
          </Tooltip>
          
          <Tooltip content='Clique para adicionar um complete a frase' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={handleOpenModalExercise}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <LuBookOpen />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um múltipla escolha' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={openMultipleChoiceModal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <GiChoice />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um exercício de tradução' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={openTranslationModal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <BsTranslate />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um VocabuLab' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={openVocabulabModal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <TbVocabulary />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar uma imagem' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={openImageTextModal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
          >
            <FaRegImage />
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um texto' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={openSentencesModal}
            className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
                    >
            <LuFileText />
          </button>
          </Tooltip>

          </div>
        </div>}
        <Toaster />
    </div>
  );
};

export default Tiptap;