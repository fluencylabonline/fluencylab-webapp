"use client";
import React from 'react';

//Other imports
import { Toaster } from 'react-hot-toast';
import './styles.scss'
import { useSession } from 'next-auth/react';

//TipTap Imports
import Toolbar from "./Toolbar";
import Link from '@tiptap/extension-link'
import History from '@tiptap/extension-history'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import { EditorContent, useEditor } from '@tiptap/react'
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
import Tools from './Components/Tools';

//Extensions
import TextStudentExtension from './Components/Extensions/TextStudent/TextStudentExtension';
import TextTeacherExtension from './Components/Extensions/TextTeacher/TextTeacherExtension';
import TextTipExtension from './Components/Extensions/TextTip/TextTipExtension';
import BandImageExtension from './Components/Extensions/BandImage/BandImageExtension';
import BandVideoExtension from './Components/Extensions/BandVideo/BandVideoExtension';
import SentencesExtension from './Components/Extensions/Sentences/SentencesExtension';
import TranslationExtension from './Components/Extensions/Translation/TranslationExtension';
import MultipleChoiceExtension from './Components/Extensions/MultipleChoice/MultipleChoiceExtension';
import QuestionsExtension from './Components/Extensions/Question/QuestionsExtension';
import AudioExtension from './Components/Extensions/Audio/AudioExtension';
import PronounceExtension from './Components/Extensions/Pronounce/PronounceExtension';
import ReviewExtension from './Components/Extensions/Review/ReviewExtension';
import GoalExtension from './Components/Extensions/Goal/GoalExtension';
import VocabulabExtension from './Components/Extensions/Vocabulab/VocabulabExtension';
import DownloadExtension from './Components/Extensions/Download/DownloadExtension';
import Bubble from './Components/Bubble';

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor }: any) => {
  const { data: session } = useSession();
  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const editor = useEditor({
    extensions: [
      TextStudentExtension,
      TextTeacherExtension,
      TextTipExtension,
      BandImageExtension,
      BandVideoExtension,
      SentencesExtension,
      TranslationExtension,
      MultipleChoiceExtension,
      QuestionsExtension,
      AudioExtension,
      PronounceExtension,
      ReviewExtension,
      GoalExtension,
      VocabulabExtension,
      DownloadExtension,
      Document,
      Image,
      History,
      TextStyle, 
      FontFamily,
      Typography,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
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
      //Part of collaboration that might work now
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
      

      
      Collaboration.configure({
        document: provider.doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          color: 'blue'
        },
      }),
      */

      Placeholder.configure({
        placeholder: ({ node }) => {
          const headingPlaceholders: { [key: number]: string } = {
            1: "Coloque um título...",
            2: "Coloque um subtítulo...",
            3: '/',
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
          "lg:min-w-[794px] md:max-w-[794px] max-w-[90vw] min-h-screen lg:p-16 md:p-10 p-6 border-[0.5px] border-[#cfcfcf] dark:border-fluency-gray-300 outline-none bg-white dark:bg-fluency-gray-900",
      },
    },
    autofocus: true,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    /*
    onUpdate: async ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
    },
    */
  }) 

  if (!editor) {
    return null;
  }

  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center text-black dark:text-white'>
      <Toolbar editor={editor} content={content} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}  /> 
      <EditorContent editor={editor} />
      <Bubble editor={editor}/>
      {session?.user.role === 'teacher' &&<Tools editor={editor}/>}
      <Toaster />
    </div>
  );
};

export default Tiptap;
