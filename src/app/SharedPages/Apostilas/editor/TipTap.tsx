"use client";
import React from 'react';
import { useEffect, useState } from 'react';

//Firebase
import { collection, doc, getDocs, updateDoc, DocumentData, QuerySnapshot, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

import { toast, Toaster } from 'react-hot-toast';
//Icons
import '@/app/ui/TipTap//styles.scss'

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

import Toolbar from "@/app/ui/TipTap/Toolbar";
import { Popover, PopoverTrigger, PopoverContent, Button, Tooltip } from '@nextui-org/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyButton from '@/app/ui/Components/Button/button';
import { VscWholeWord } from 'react-icons/vsc';
import { useSession } from 'next-auth/react';

import ReactComponent from './Extension';
import Embed from './Embed';

import EmbedSelectionModal from './EmbedSelectionModal';
import AudioSelectionModal from './AudioSelectionModal';
import { LuFileAudio } from 'react-icons/lu';
import { AiFillYoutube } from 'react-icons/ai';
import { CgTranscript } from 'react-icons/cg';

import SpeakingExtension from './SpeakingComponent/SpeakingExtension';
import SpeakingSelectionModal from './SpeakingComponent/SpeakingSelectionModal';


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
  const params = new URLSearchParams(window.location.search);
  const workbook = params.get('workbook');
  const lesson = params.get('lesson');

  const [isModalTranscriptOpen, setIsModalTranscriptOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalEmbedOpen, setIsModalEmbedOpen] = useState<boolean>(false);
  
  const [description, setDescription] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(event.target.value);
  };

  const handleUpdateDescription = async () => {
    try {
      await updateDoc(doc(db, `Notebooks/${workbook}/Lessons/${lesson}`), {
        description: newDescription,
      });
      setDescription(newDescription);
      toast.success('Descrição atualizada!', {
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error updating description: ', error);
      toast.error('Erro ao atualizar descrição!', {
        position: 'top-center',
      });
    }
  };


  const CustomDocument = Document.extend({
    content: 'heading block*',
  })

  const { data: session } = useSession();
  const [editable, setEditable] = useState(false)

  const editor = useEditor({
    extensions: [
      CustomDocument,
      Image,
      TextStyle, 
      FontFamily,
      ReactComponent,
      Embed,
      SpeakingExtension,
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
      {session?.user.role === 'admin' && <Toolbar editor={editor} content={content} addImage={addImage} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}/>}
      <EditorContent editor={editor} />
      
      <Popovers editor={editor} />

        <AudioSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectAudio={handleSelectAudio}
        />

        <SpeakingSelectionModal 
        isOpen={isModalTranscriptOpen} 
        onClose={() => setIsModalTranscriptOpen(false)} 
        onSelectAudio={handleSelectTranscript} />

        <EmbedSelectionModal
          isEmbedOpen={isModalEmbedOpen}
          onEmbedClose={() => setIsModalEmbedOpen(false)}
          onSelectVideo={handleSelectVideo}
        />

        <button
          onClick={scrollToBottom}
          className="fixed bottom-5 right-2 flex items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
        >
          <FaArrowDown />
        </button>

        <button
          onClick={scrollToTop}
          className="fixed bottom-16 right-2 flex items-center justify-center w-10 h-10 bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600"
        >
          <FaArrowUp />
        </button>

        {session?.user.role === 'admin' &&
        <div className="fixed top-32 right-2">
          <div className='flex flex-col items-center gap-2'>
          <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
                <Button className='bg-fluency-gray-200 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-50 duration-150 ease-in-out transition-all p-2 px-2 text-md'>
                  <VscWholeWord className="w-6 h-auto"/>
                </Button>      
            </PopoverTrigger>
            <PopoverContent className="w-[240px] text-fluency-text-light dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-pages-dark border border-fluency-gray-500 p-3 rounded-md">
              {(titleProps) => (
                <div className="px-1 py-2 w-full">
                  <p className="text-md font-bold text-foreground" {...titleProps}>
                    Atualizar a Descrição
                  </p>
                  <div className="mt-2 flex flex-col gap-2 w-full">
                  <FluencyInput className="w-full" defaultValue={description} placeholder="Descrição da aula" onChange={handleDescriptionChange} />
                  <FluencyButton variant="confirm" onClick={handleUpdateDescription} className="w-full">Salvar</FluencyButton>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>

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
          </div>
        </div>}

        <Toaster />
    </div>
  );
};

export default Tiptap;