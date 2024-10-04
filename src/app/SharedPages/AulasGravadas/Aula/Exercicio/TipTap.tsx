"use client";
import React from 'react';
import { useEffect, useState } from 'react';

//Firebase
import { DocumentData } from "firebase/firestore";
import { toast, Toaster } from 'react-hot-toast';
import '@/app/ui/TipTap/styles.scss'
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

import { PiChalkboardTeacher, PiStudentFill } from 'react-icons/pi';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import { LuFileAudio } from 'react-icons/lu';
import { AiFillYoutube } from 'react-icons/ai';
import { CgTranscript } from 'react-icons/cg';
import { GoGoal } from "react-icons/go";

import { Tooltip } from '@nextui-org/react';
import { useSession } from 'next-auth/react';

import ReactComponent from '../../../Apostilas/editor/Components/AudioComponent/Extension';
import Embed from '../../../Apostilas/editor/Components/EmbedComponent/Embed';

import EmbedSelectionModal from '../../../Apostilas/editor/Components/EmbedComponent/EmbedSelectionModal';
import AudioSelectionModal from '../../../Apostilas/editor/Components/AudioComponent/AudioSelectionModal';

import SpeakingExtension from '../../../Apostilas/editor/Components/SpeakingComponent/SpeakingExtension';
import SpeakingSelectionModal from '../../../Apostilas/editor/Components/SpeakingComponent/SpeakingSelectionModal';

import TextDisplayModal from '../../../Apostilas/editor/Components/StudentComponent/StudentModal';
import StudentExtension from '../../../Apostilas/editor/Components/StudentComponent/StudentExtension';

import TextDisplayModalTeacher from '../../../Apostilas/editor/Components/TeacherComponent/TeacherModal';
import TeacherExtension from '../../../Apostilas/editor/Components/TeacherComponent/TeacherExtension';

import TextDisplayModalTip from '../../../Apostilas/editor/Components/TipComponent/TipModal';
import TipExtension from '../../../Apostilas/editor/Components/TipComponent/TipExtension';

import ExerciseModal from './Components/Complete/ExerciseModal';
import ExerciseExtension from './Components/Complete/ExerciseExtension';

type PopoversProps = {
  editor: Editor;
}
interface LessonDoc {
  id: string;
  data: DocumentData;
  unit: string;
}

interface GroupedLessonDocs {
  unit: string;
  docs: LessonDoc[];
}

function Popovers({ editor }: PopoversProps) {

  return (
      <BubbleMenu className="Popover" editor={editor}>
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
            onClick={() => editor.chain().focus().setColor('#FFFFFF').run()}
            className={editor.isActive('textStyle', { color: '#FFFFFF' }) ? 'is-active' : ''}
            data-testid="setWhite"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-white hover:bg-gray-300 duration-300 ease-in-out transition-all'></div>
          </button>

          <button
            onClick={() => editor.chain().focus().setColor('#000000').run()}
            className={editor.isActive('textStyle', { color: '#000000' }) ? 'is-active' : ''}
            data-testid="setBlack"
            >        
            <div className='w-5 h-5 p-2 rounded-full bg-black hover:bg-gray-900 duration-300 ease-in-out transition-all'></div>
          </button>
      </BubbleMenu>
  )
}

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor }: any) => {
  const [isModalTranscriptOpen, setIsModalTranscriptOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalEmbedOpen, setIsModalEmbedOpen] = useState<boolean>(false);

  const [isModalTextOpen, setModalTextOpen] = useState(false);
  const [initialText, setInitialText] = useState('');
  const handleOpenModal = () => setModalTextOpen(true);
  const handleCloseModal = () => setModalTextOpen(false);

  const [isModalTextTeacherOpen, setModalTextTeacherOpen] = useState(false);
  const [initialTextTeacher, setInitialTextTeacher] = useState('');
  const handleOpenModalTeacher = () => setModalTextTeacherOpen(true);
  const handleCloseModalTeacher = () => setModalTextTeacherOpen(false);

  const [isModalTextTipOpen, setModalTextTipOpen] = useState(false);
  const [initialTextTip, setInitialTextTip] = useState('');
  const handleOpenModalTip = () => setModalTextTipOpen(true);
  const handleCloseModalTip = () => setModalTextTipOpen(false);

  const [isModalExerciseOpen, setModalExerciseOpen] = useState(false);

  const handleOpenModalExercise = () => setModalExerciseOpen(true);
  const handleCloseModalExercise = () => {
    
    setModalExerciseOpen(false)
  };

  const CustomDocument = Document.extend({
    content: 'heading block*',
  })

  const { data: session } = useSession();
  const [editable, setEditable] = useState(false)

  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        // ↓ your new keyboard shortcut
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const editor = useEditor({
    extensions: [
      CustomDocument,
      Image,
      TextStyle, 
      FontFamily,
      ReactComponent,
      Embed,
      SpeakingExtension,
      StudentExtension,
      TeacherExtension,
      TipExtension,
      ExerciseExtension,
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
            return '/'
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
    if (session?.user.role === 'teacher') {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  };

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
  
  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center text-black dark:text-white'>
      {session?.user.role === 'teacher' && <Toolbar editor={editor} content={content} addImage={addImage} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}/>}
      <div className='flex flex-row items-start'>
        <EditorContent editor={editor} />
        <div className='flex flex-col items-center gap-8 p-3'>
          {session?.user.role === 'teacher' &&
            <div>
              <div className='flex flex-col items-center gap-2'>

              <Tooltip content='Clique para adicionar um áudio de prática' className='bg-fluency-orange-300 font-bold text-sm rounded-md px-1'>
              <button
                onClick={() => setIsModalOpen(true)}
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

              <Tooltip content='Clique para faixa de aluno' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
              <button
                onClick={handleOpenModal}
                className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
              >
                <PiStudentFill />
              </button>
              </Tooltip>

              <Tooltip content='Clique para faixa de professor' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
              <button
                onClick={handleOpenModalTeacher}
                className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
              >
                <PiChalkboardTeacher />
              </button>
              </Tooltip>

              <Tooltip content='Clique para adicionar uma dica' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
              <button
                onClick={handleOpenModalTip}
                className="flex flex-col items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
              >
                <GoGoal />
              </button>
              </Tooltip>
              
              </div>
            </div>}

              <div className='flex flex-col items-center gap-2'>
                <button
                  onClick={scrollToTop}
                  className="flex items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
                >
                  <FaArrowUp />
                </button>
                <button
                  onClick={scrollToBottom}
                  className="flex items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
                >
                  <FaArrowDown />
                </button>
              </div>
          </div>
      </div>
      <button onClick={handleOpenModalExercise}>Open Exercise Modal</button>
      <Popovers editor={editor} />

      <ExerciseModal
        isOpen={isModalExerciseOpen}
        onClose={handleCloseModalExercise}
        editor={editor}
      />

        <TextDisplayModal isOpen={isModalTextOpen} onClose={handleCloseModal} initialText={initialText} editor={editor} />
        <TextDisplayModalTeacher isOpen={isModalTextTeacherOpen} onClose={handleCloseModalTeacher} initialTextTeacher={initialTextTeacher} editor={editor} />
        <TextDisplayModalTip isOpen={isModalTextTipOpen} onClose={handleCloseModalTip} initialTextTip={initialTextTip} editor={editor} />

        <AudioSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectAudio={handleSelectAudio}
        />

        <SpeakingSelectionModal 
          isOpen={isModalTranscriptOpen} 
          onClose={() => setIsModalTranscriptOpen(false)} 
          onSelectAudio={handleSelectTranscript} 
        />

        <EmbedSelectionModal
          isEmbedOpen={isModalEmbedOpen}
          onEmbedClose={() => setIsModalEmbedOpen(false)}
          onSelectVideo={handleSelectVideo}
        />
        <Toaster />
    </div>
  );
};

export default Tiptap;