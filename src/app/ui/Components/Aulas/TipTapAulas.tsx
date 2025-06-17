"use client";
import React from 'react';

//Other imports
import { Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { usePomodoro } from '@/app/context/PomodoroContext';

//TipTap Imports
import Toolbar from "./ToolbarAulas";
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

//Extensions

//Icons
import { LuTimerOff, LuTimer } from 'react-icons/lu';

//Style
import '../../TipTap/styles.scss'
//Tools
import AudioExtension from '../../TipTap/Components/Extensions/Audio/AudioExtension';
import BandImageExtension from '../../TipTap/Components/Extensions/BandImage/BandImageExtension';
import BandVideoExtension from '../../TipTap/Components/Extensions/BandVideo/BandVideoExtension';
import DownloadExtension from '../../TipTap/Components/Extensions/Download/DownloadExtension';
import FlashcardExtension from '../../TipTap/Components/Extensions/Flashcards/FlashcardExtension';
import GoalExtension from '../../TipTap/Components/Extensions/Goal/GoalExtension';
import MultipleChoiceExtension from '../../TipTap/Components/Extensions/MultipleChoice/MultipleChoiceExtension';
import PronounceExtension from '../../TipTap/Components/Extensions/Pronounce/PronounceExtension';
import QuestionsExtension from '../../TipTap/Components/Extensions/Question/QuestionsExtension';
import ReviewExtension from '../../TipTap/Components/Extensions/Review/ReviewExtension';
import SentencesExtension from '../../TipTap/Components/Extensions/Sentences/SentencesExtension';
import TextStudentExtension from '../../TipTap/Components/Extensions/TextStudent/TextStudentExtension';
import TextTeacherExtension from '../../TipTap/Components/Extensions/TextTeacher/TextTeacherExtension';
import TextTipExtension from '../../TipTap/Components/Extensions/TextTip/TextTipExtension';
import TranslationExtension from '../../TipTap/Components/Extensions/Translation/TranslationExtension';
import VocabulabExtension from '../../TipTap/Components/Extensions/Vocabulab/VocabulabExtension';
import Bubble from '../../TipTap/Components/Bubble';
import Tools from '../../TipTap/Components/Tools';

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor, isEditable, isTeacherNotebook }: any) => {
  const { data: session } = useSession();
  const { isPomodoroVisible, togglePomodoroVisibility } = usePomodoro();

  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const editor = useEditor({
    editable: isEditable,
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
      FlashcardExtension,
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
      //Part of collaboration that might work now, but I'm not using yet
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
            return "..."
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

    //Mark this one when real-time
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
      
      {isEditable && <Toolbar editor={editor} content={content} isTyping={isTyping} lastSaved={lastSaved} animation={animation} timeLeft={timeLeft} buttonColor={buttonColor}/>}
      <EditorContent editor={editor} />
      <Bubble editor={editor}/>
      {session?.user.role !== 'student' && isEditable && <Tools isTeacherNotebook={isTeacherNotebook} editor={editor} isEditable={true}/>}
      {session?.user.role === 'student' && (
        <div className='fixed bottom-5 right-5'>
          {isPomodoroVisible ? (
           <LuTimerOff onClick={togglePomodoroVisibility} className="w-10 h-10 cursor-pointer p-2 rounded-full bg-fluency-gray-100 dark:bg-fluency-gray-400 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-500 hover:text-fluency-red-500 duration-300 ease-in-out transition-all" />
          ):(
           <LuTimer onClick={togglePomodoroVisibility} className="w-10 h-10 cursor-pointer p-2 rounded-full bg-fluency-gray-100 dark:bg-fluency-gray-400 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-500 hover:text-fluency-green-500 duration-300 ease-in-out transition-all" />
          )}
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Tiptap;