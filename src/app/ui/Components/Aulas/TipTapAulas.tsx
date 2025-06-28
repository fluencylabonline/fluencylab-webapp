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
import { EditorContent, Extension, useEditor } from '@tiptap/react'
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

//Style
import '../../TipTap/styles.scss'

//Tools
import QuizExtenstion from "@/app/ui/TipTap/Components/Extensions/Quiz/QuizExtension";
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
import ToolbarAulas from './ToolbarAulas';
import Tools from '../../TipTap/Components/Tools';

const Tiptap = ({ onChange, content, isTyping, lastSaved, animation, timeLeft, buttonColor, isEditable, isTeacherNotebook }: any) => {

  const TabInsertExtension = Extension.create({
    name: "customTab",

    addKeyboardShortcuts() {
      return {
        Tab: () => {
          const { state, dispatch } = this.editor.view;
          const { tr, selection } = state;
          const tabSpaces = "    "; // 4 spaces

          dispatch(tr.insertText(tabSpaces, selection.from, selection.to));
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    editable: isEditable,
    extensions: [
      QuizExtenstion,
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
      TabInsertExtension,
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
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Color,
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
          "lg:min-w-[794px] md:max-w-[794px] max-w-[90vw] min-h-screen outline-none",
      },
    },
    autofocus: true,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }) 

  if (!editor) {
    return null;
  }

  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center text-black dark:text-white'>
      <ToolbarAulas editor={editor} studentID={undefined} isTeacherNotebook={true} isEditable={true}/>
      <EditorContent editor={editor} />
      <div className='fixed bottom-[5rem] right-5 z-[999] rounded-md bg-gray-400 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700'>
        <Tools editor={editor} isTeacherNotebook={true} isEditable={true} />
      </div>
      <Bubble editor={editor}/>
    </div>
  );
};

export default Tiptap;