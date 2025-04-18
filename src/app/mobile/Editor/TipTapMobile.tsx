"use client";
import React from 'react';

//TipTap Imports
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
import Gapcursor from '@tiptap/extension-gapcursor'

//Extensions
import TextStudentExtension from '@/app/ui/TipTap/Components/Extensions/TextStudent/TextStudentExtension';
import TextTeacherExtension from '@/app/ui/TipTap/Components/Extensions/TextTeacher/TextTeacherExtension';
import TextTipExtension from '@/app/ui/TipTap/Components/Extensions/TextTip/TextTipExtension';
import BandImageExtension from '@/app/ui/TipTap/Components/Extensions/BandImage/BandImageExtension';
import BandVideoExtension from '@/app/ui/TipTap/Components/Extensions/BandVideo/BandVideoExtension';
import SentencesExtension from '@/app/ui/TipTap/Components/Extensions/Sentences/SentencesExtension';
import TranslationExtension from '@/app/ui/TipTap/Components/Extensions/Translation/TranslationExtension';
import MultipleChoiceExtension from '@/app/ui/TipTap/Components/Extensions/MultipleChoice/MultipleChoiceExtension';
import QuestionsExtension from '@/app/ui/TipTap/Components/Extensions/Question/QuestionsExtension';
import AudioExtension from '@/app/ui/TipTap/Components/Extensions/Audio/AudioExtension';
import PronounceExtension from '@/app/ui/TipTap/Components/Extensions/Pronounce/PronounceExtension';
import ReviewExtension from '@/app/ui/TipTap/Components/Extensions/Review/ReviewExtension';
import GoalExtension from '@/app/ui/TipTap/Components/Extensions/Goal/GoalExtension';
import VocabulabExtension from '@/app/ui/TipTap/Components/Extensions/Vocabulab/VocabulabExtension';
import DownloadExtension from '@/app/ui/TipTap/Components/Extensions/Download/DownloadExtension';
import FlashcardExtension from '@/app/ui/TipTap/Components/Extensions/Flashcards/FlashcardExtension';
import Tools from '@/app/ui/TipTap/Components/Tools';

import './StylesTipTapMobile.scss'

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import ToolbarMobile from './ToolbarMobile';

const TiptapMobile = ({ onChange, content, provider, role, userName, professorName  }: any) => {
  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const userColor = role === 'teacher' ? '#21B5DE' : '#DE5916';
  const cursorName = role === 'teacher' ? professorName : userName;  

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
      FlashcardExtension,
      Document,
      Image,
      History,
      TextStyle, 
      FontFamily,
      Typography,
      Gapcursor,
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
      Collaboration.configure({
        document: provider.doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: cursorName,
          color: userColor
        },
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
          "max-w-[100vw] min-w-[100vw] min-h-screen p-3 outline-none bg-white dark:bg-black",
      },
    },
    autofocus: true,
    content: content,
    onUpdate: async ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className='flex flex-col justify-center items-center text-black dark:text-white'>
        <EditorContent editor={editor} />
        <ToolbarMobile editor={editor} content={content} />
        {role === 'teacher' && (<Tools editor={editor} isTeacherNotebook={true} />)}
    </div>
  );
};

export default TiptapMobile;