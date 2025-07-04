"use client";
import React from "react";
import { useSession } from "next-auth/react";

//TipTap Imports
import Link from "@tiptap/extension-link";
import History from "@tiptap/extension-history";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Image from "@tiptap/extension-image";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import BulletList from "@tiptap/extension-bullet-list";
import Typography from "@tiptap/extension-typography";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Gapcursor from "@tiptap/extension-gapcursor";

//Extensions
import TextStudentExtension from "@/app/ui/TipTap/Components/Extensions/TextStudent/TextStudentExtension";
import TextTeacherExtension from "@/app/ui/TipTap/Components/Extensions/TextTeacher/TextTeacherExtension";
import TextTipExtension from "@/app/ui/TipTap/Components/Extensions/TextTip/TextTipExtension";
import BandImageExtension from "@/app/ui/TipTap/Components/Extensions/BandImage/BandImageExtension";
import BandVideoExtension from "@/app/ui/TipTap/Components/Extensions/BandVideo/BandVideoExtension";
import SentencesExtension from "@/app/ui/TipTap/Components/Extensions/Sentences/SentencesExtension";
import TranslationExtension from "@/app/ui/TipTap/Components/Extensions/Translation/TranslationExtension";
import MultipleChoiceExtension from "@/app/ui/TipTap/Components/Extensions/MultipleChoice/MultipleChoiceExtension";
import QuestionsExtension from "@/app/ui/TipTap/Components/Extensions/Question/QuestionsExtension";
import AudioExtension from "@/app/ui/TipTap/Components/Extensions/Audio/AudioExtension";
import PronounceExtension from "@/app/ui/TipTap/Components/Extensions/Pronounce/PronounceExtension";
import ReviewExtension from "@/app/ui/TipTap/Components/Extensions/Review/ReviewExtension";
import GoalExtension from "@/app/ui/TipTap/Components/Extensions/Goal/GoalExtension";
import VocabulabExtension from "@/app/ui/TipTap/Components/Extensions/Vocabulab/VocabulabExtension";
import DownloadExtension from "@/app/ui/TipTap/Components/Extensions/Download/DownloadExtension";
import FlashcardExtension from "@/app/ui/TipTap/Components/Extensions/Flashcards/FlashcardExtension";
import QuizExtenstion from "@/app/ui/TipTap/Components/Extensions/Quiz/QuizExtension";

//Style
import "./styles.scss";

//Tools
import Bubble from "./Components/Bubble";

import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Toolbar from "./Toolbar";
import FloatTeacherCallButton from "@/app/SharedPages/Video/FloatTeacherCallButton";
import FloatStudentCallButton from "@/app/SharedPages/Video/FloatStudentCallButton";

const Tiptap = ({
  provider,
  onChange,
  content,
  isEditable,
  isTeacherNotebook,
  studentID,
}: any) => {
  const { data: session } = useSession();

  const TabInsertExtension = Extension.create({
    name: "customTab",

    addKeyboardShortcuts() {
      return {
        Tab: () => {
          const { state, dispatch } = this.editor.view;
          const { tr, selection } = state;

          const isSelectionEmpty = selection.from === selection.to;
          if (!isSelectionEmpty) return false; // don't override normal selection behavior

          const tabSpaces = "    "; // 4 spaces
          dispatch(tr.insertText(tabSpaces, selection.from, selection.to));
          return true;
        },
      };
    },
  });

  const userColor = session?.user.role === "teacher" ? "#21B5DE" : "#DE5916";

  const editor = useEditor({
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
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      TabInsertExtension,
      Link.configure({
        openOnClick: true,
      }),
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: provider!.doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: session?.user.name,
          color: userColor,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Color,
      Placeholder.configure({
        placeholder: ({ node }) => {
          const headingPlaceholders: { [key: number]: string } = {
            1: "Coloque um título...",
            2: "Coloque um subtítulo...",
            3: "/",
            4: "/",
            5: "/",
            6: "/",
          };
          if (node.type.name === "heading") {
            return headingPlaceholders[node.attrs.level];
          }
          if (node.type.name === "paragraph") {
            return "O que vamos aprender...";
          }
          return "/";
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "lg:min-w-[794px] md:max-w-[794px] max-w-[90vw] min-h-screen lg:p-16 md:p-10 p-6 border-0 outline-none bg-tiptap-page-light dark:bg-tiptap-page-dark",
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
    <div className="flex justify-center min-h-screen min-w-screen bg-tiptap-page-light dark:bg-tiptap-page-dark">
      <Toolbar
        isTeacherNotebook={isTeacherNotebook}
        isEditable={isEditable}
        editor={editor}
        studentID={studentID}
      />
      <EditorContent editor={editor} />
      <Bubble editor={editor} />

      {session?.user.role === "student" && (
        <FloatStudentCallButton student={studentID} />
      )}

      {session?.user.role === "teacher" && (
        <FloatTeacherCallButton student={studentID} />
      )}

    </div>
  );
};

export default Tiptap;
