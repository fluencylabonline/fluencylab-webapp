"use client";
import React, { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";

//Firebase
import { collection, doc, getDocs, updateDoc, DocumentData, QuerySnapshot, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

import { toast, Toaster } from 'react-hot-toast';
//Icons
import './styles.scss'

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
import {FontSize} from './font-size';
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import BulletList from '@tiptap/extension-bullet-list'
import Typography from '@tiptap/extension-typography'

import Toolbar from "./Toolbar";
import { Popover, PopoverTrigger, PopoverContent, Button, Accordion, AccordionItem, Tooltip } from '@nextui-org/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyButton from '@/app/ui/Components/Button/button';
import { VscWholeWord } from 'react-icons/vsc';
import { PiNotebookBold } from 'react-icons/pi';
import FluencyCloseButton from '../Components/ModalComponents/closeModal';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';

import ReactComponent from '@/app/SharedPages/Apostilas/editor/Components/AudioComponent/Extension';
import Embed from '@/app/SharedPages/Apostilas/editor/Components/EmbedComponent/Embed';

import EmbedSelectionModal from '@/app/SharedPages/Apostilas/editor/Components/EmbedComponent/EmbedSelectionModal';
import AudioSelectionModal from '@/app/SharedPages/Apostilas/editor/Components/AudioComponent/AudioSelectionModal';
import { LuFileAudio } from 'react-icons/lu';
import { AiFillYoutube } from 'react-icons/ai';

import { CgTranscript } from 'react-icons/cg';

import SpeakingExtension from '@/app/SharedPages/Apostilas/editor/Components/SpeakingComponent/SpeakingExtension';
import SpeakingSelectionModal from '@/app/SharedPages/Apostilas/editor/Components/SpeakingComponent/SpeakingSelectionModal';

//Realtime
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'

import VersionsModal from "./VersionsModal";
import { FaHistory } from 'react-icons/fa';

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
            onClick={() => editor.chain().focus().unsetColor().run()}
            data-testid="unsetColor"
          >
            <div className='w-5 h-5 p-2 rounded-full dark:bg-white bg-black dark:hover:bg-gray-300 hover:bg-gray-900 duration-300 ease-in-out transition-all'></div>
          </button>
      </BubbleMenu>
  )
}

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor }: any) => {
  const params = new URLSearchParams(window.location.search);
  const { data: session } = useSession();
  const studentID = params.get('student') || ''; // Default to an empty string if null
  const notebookID = params.get('notebook') || '';
  const [isModalTranscriptOpen, setIsModalTranscriptOpen] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalEmbedOpen, setIsModalEmbedOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);

  const [workbooks, setWorkbooks] = useState(false);
  function openWorkbook(){
    setWorkbooks(true)
  }

  function closeWorkbook(){
    setWorkbooks(false)
    setSearchTerm('')
  }

  //REAL TIME PART
  const tiptapApiKey = process.env.NEXT_PUBLIC_TIPTAP_API_KEY;
  const tiptapApiAuth = process.env.NEXT_PUBLIC_TIPTAP_API_AUTH;
  
  if (!tiptapApiKey || !tiptapApiAuth) {
    throw new Error("Tiptap API key or authentication token is missing.");
  }
  
  const ydoc: Y.Doc = useMemo(() => new Y.Doc(), []);
  const provider = new TiptapCollabProvider({
    name: notebookID, 
    appId: tiptapApiKey, 
    token: tiptapApiAuth,
    document: ydoc,
  })

  type GroupedLessonDocsMap = { [key: string]: GroupedLessonDocs[] };

  // Use the above type in useState
  const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocsMap>({});
  const fetchDocs = async () => {
    const workbookNames = ['First Steps', 'The Basics', 'All you need to know', 'Traveling', 'Instrumental'];
    const groupedLessons: GroupedLessonDocsMap = {};
  
    try {
      for (const workbookName of workbookNames) {
        const lessonsRef = collection(db, 'Notebooks', workbookName, 'Lessons');
        const lessonsSnapshot: QuerySnapshot<DocumentData> = await getDocs(lessonsRef);
        const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          unit: doc.data().unit || 'Uncategorized', // Assuming there's a 'unit' field in your documents
        }));
  
        // Group documents by unit
        const groupedByUnit: { [key: string]: LessonDoc[] } = fetchedLessonDocs.reduce((acc: { [key: string]: LessonDoc[] }, doc: LessonDoc) => {
          const unit = doc.unit;
          if (!acc[unit]) {
            acc[unit] = [];
          }
          acc[unit].push(doc);
          return acc;
        }, {});
  
        // Transform grouped object into an array
        const groupedLessonDocs: GroupedLessonDocs[] = Object.keys(groupedByUnit).map(unit => ({
          unit,
          docs: groupedByUnit[unit],
        }));
  
        groupedLessons[workbookName] = groupedLessonDocs;
      }
  
      setLessonDocs(groupedLessons);
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  // Effect to fetch documents from Firestore on component mount
  useEffect(() => {
    fetchDocs();
  }, []);

  const [realtimeContent, setRealtimeContent] = useState<string>(content);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notebookID = params.get('notebook');
    const studentID = params.get('student');

    const notebookRef = doc(db, `users/${studentID}/Notebooks/${notebookID}`);
    const unsubscribe = onSnapshot(notebookRef, (doc) => {
      if (doc.exists()) {
        const { content: updatedContent } = doc.data();
        setRealtimeContent(updatedContent);
      }
    });

    return () => unsubscribe();
  }, [content]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredItems = Object.keys(lessonDocs).flatMap(workbookName => {
    return lessonDocs[workbookName].flatMap(group => {
      return group.docs.filter(doc => doc.data.title.toLowerCase().includes(searchTerm));
    });
  });

  const renderItems = () => {
    return (
      <ul className='flex flex-col gap-1'>
        {filteredItems.map(doc => (
          <li className='flex flex-row gap-2 justify-between items-center' key={doc.id}>
            <p className='text-lg font-semibold'>{doc.data.title} de <span className='font-bold'>{doc.data.workbook}</span></p>
            <button className='p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md' onClick={() => pasteContentFromFirestore(doc.data.content)}>
              Colar
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderAccordion = () => {
    return (
      <Accordion>
        {Object.keys(lessonDocs).map((workbookName, workbookIndex) => (
          <AccordionItem
            className='font-semibold w-full text-xl'
            key={workbookIndex}
            aria-label={workbookName}
            title={workbookName}
            indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
          >
            <div className="mt-2 flex flex-col items-center gap-3 p-4 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-700">
              <p className='font-bold text-xl'>{workbookName}</p>
              <Accordion>
                {lessonDocs[workbookName].map((group, groupIndex) => (
                  <AccordionItem
                    className='font-semibold w-full text-xl'
                    key={groupIndex}
                    aria-label={`Unidade ${groupIndex + 1}`}
                    title={`Unidade ${groupIndex + 1}`}
                    indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack />)}
                  >
                    <ul className='flex flex-col gap-1'>
                      {group.docs.map(doc => (
                        <li className='flex flex-row gap-2 justify-between items-center' key={doc.id}>
                          <p className='text-lg font-bold'>{doc.data.title}</p>
                          <button className='p-1 px-3 bg-fluency-green-500 hover:bg-fluency-green-600 dark:bg-fluency-green-600 hover:dark:bg-fluency-green-700 duration-300 ease-in-out text-white dark:text-white font-semibold rounded-md' onClick={() => pasteContentFromFirestore(doc.data.content)}>
                            Colar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };
  
  const [description, setDescription] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(event.target.value);
  };

  const handleUpdateDescription = async () => {
    try {
      await updateDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`), {
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

  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
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
      FontSize,
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      ReactComponent,
      Embed,
      SpeakingExtension,
      BulletList,
      CustomBulletList,
      Link.configure({
        openOnClick: true,
      }),
      StarterKit.configure({
        document: false,
        history: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Color,

      /*
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          id: session?.user?.id || 'anonymous',
          name: session?.user?.name || 'Anonymous',
          color: session?.user?.role === 'teacher' ? '#65C6E0' : '#E08E65',
        },
      }),
      */

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
    content: realtimeContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    /*
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    */

  }) 

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

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  };

  const pasteContentFromFirestore = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
    setWorkbooks(false)
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
      <Toolbar editor={editor} content={content} addImage={addImage} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}  /> 
      <EditorContent editor={editor} />
      <Popovers editor={editor} />
      
        <VersionsModal
          studentID={studentID}
          notebookID={notebookID}
          isOpen={isVersionsModalOpen}
          onClose={() => setIsVersionsModalOpen(false)} 
          pasteContentFromFirestore={pasteContentFromFirestore} 
        />

        <AudioSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectAudio={handleSelectAudio}
        />

        <EmbedSelectionModal
            isEmbedOpen={isModalEmbedOpen}
            onEmbedClose={() => setIsModalEmbedOpen(false)}
            onSelectVideo={handleSelectVideo}
          />

        <SpeakingSelectionModal 
          isOpen={isModalTranscriptOpen} 
          onClose={() => setIsModalTranscriptOpen(false)} 
          onSelectAudio={handleSelectTranscript} 
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

        {session?.user.role != 'student' && (
        <div>
        <div className="fixed top-32 right-2">
        <div className='flex flex-col items-center gap-2'>
          <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
                <Button className='bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600 text-fluency-gray-700 dark:text-fluency-gray-50 duration-150 ease-in-out transition-all p-2 px-2 text-md'>
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
            className="duration-150 ease-in-out transition-all p-2 px-2 text-md flex flex-col items-center justify-center text-amber-500 bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600"
          >
            <LuFileAudio className="w-5 h-auto"/>
          </button>
          </Tooltip>

          <Tooltip content='Clique para adicionar um texto de prática de pronúncia' className='bg-fluency-green-300 font-bold text-sm rounded-md px-1'>
          <button
          onClick={() => setIsModalTranscriptOpen(true)}
            className="duration-150 ease-in-out transition-all p-2 px-2 text-md flex flex-col items-center justify-center text-blue-500 bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600"
          >
            <CgTranscript  className="w-5 h-auto"/>
          </button>
          </Tooltip>
          
          <Tooltip content='Clique para adicionar um vídeo' className='bg-fluency-red-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={() => setIsModalEmbedOpen(true)}
            className="duration-150 ease-in-out transition-all p-2 px-2 text-md flex flex-col items-center justify-center text-red-500 bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600"
          >
            <AiFillYoutube className="w-5 h-auto"/>
          </button>
          </Tooltip>

          <Tooltip content='Material das apostilas' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <Button onClick={openWorkbook} className='bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600 text-fluency-gray-400 dark:text-fluency-gray-50 duration-150 ease-in-out transition-all p-2 px-2 text-md'>
            <PiNotebookBold className="w-6 h-auto"/>
          </Button> 
          </Tooltip> 

          <Tooltip content='Versões deste caderno' className='bg-fluency-gray-300 font-bold text-sm rounded-md px-1'>
          <button
            onClick={() => setIsVersionsModalOpen(true)}
            className='bg-fluency-gray-100 dark:bg-fluency-gray-400 rounded-full hover:bg-fluency-gray-200 hover:dark:bg-fluency-gray-600 text-fluency-gray-400 dark:text-fluency-gray-50 duration-150 ease-in-out transition-all p-2 px-2 text-md'
            >
            <FaHistory className="w-5 h-auto"/>
          </button> 
          </Tooltip>
          </div>
        </div>

        {workbooks && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-[80vw] h-[80vh] overflow-y-scroll p-4">
              <div className="flex flex-col items-center justify-center">
                <FluencyCloseButton onClick={closeWorkbook} />
                <h3 className="text-2xl font-bold leading-6 mb-2">Apostilas</h3>
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="mb-4 p-2 border border-gray-300 rounded bg-fluency-pages-light dark:bg-fluency-pages-dark text-black dark:text-white"
                />
                {searchTerm ? renderItems() : renderAccordion()}
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        )}

        <Toaster />
    </div>
  );
};

export default Tiptap;
