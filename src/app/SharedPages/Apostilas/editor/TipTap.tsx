"use client";
import React from 'react';
import { useEffect, useState } from 'react';

//Firebase
import { collection, doc, getDoc, getDocs, query, updateDoc, DocumentData, QuerySnapshot, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

import { toast, Toaster } from 'react-hot-toast';
//Icons
import '@/app/ui/TipTap//styles.scss'

//Imports
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
import { Popover, PopoverTrigger, PopoverContent, Button, Accordion, AccordionItem } from '@nextui-org/react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyButton from '@/app/ui/Components/Button/button';
import { VscWholeWord } from 'react-icons/vsc';
import { PiNotebookBold } from 'react-icons/pi';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';
import { useSession } from 'next-auth/react';

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
      </BubbleMenu>
  )
}

const Tiptap = ({ onChange, content, isTyping }: any) => {
  const params = new URLSearchParams(window.location.search);
  const workbook = params.get('workbook');
  const lesson = params.get('lesson');
  const [workbooks, setWorkbooks] = useState(false);
  function openWorkbook(){
    setWorkbooks(true)
  }

  function closeWorkbook(){
    setWorkbooks(false)
  }

  const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocs[]>([]); // Store the fetched documents

  // Function to fetch all documents from Firestore
  const fetchDocs = async () => {
    try {
      const lessonsRef = collection(db, 'Notebooks', 'The Basics', 'Lessons');
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

      setLessonDocs(groupedLessonDocs);
    } catch (error) {
      console.error('Error fetching documents: ', error);
    }
  };

  // Effect to fetch documents from Firestore on component mount
  useEffect(() => {
    fetchDocs();
  }, []);


  const [description, setDescription] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [realtimeContent, setRealtimeContent] = useState<string>(content);

  useEffect(() => {
    const notebookRef = doc(db, `Notebooks/First Steps/Lessons/${lesson}`);
    const unsubscribe = onSnapshot(notebookRef, (doc) => {
      if (doc.exists()) {
        const { content: updatedContent } = doc.data();
        setRealtimeContent(updatedContent);
      }
    });

    return () => unsubscribe();
  }, [content]);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(event.target.value);
  };

  const handleUpdateDescription = async () => {
    try {
      await updateDoc(doc(db, `Notebooks/First Steps/Lessons/${lesson}`), {
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
    content: realtimeContent,
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

  const pasteContentFromFirestore = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
    }
  };

  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center'>
      {session?.user.role === 'admin' && <Toolbar editor={editor} content={content} isTyping={isTyping} addImage={addImage}/>}
      <EditorContent editor={editor} />
      <Popovers editor={editor} />


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
        </div>}

        <Toaster />
    </div>
  );
};

export default Tiptap;