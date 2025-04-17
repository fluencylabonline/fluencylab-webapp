"use client";
import React, { useState } from 'react';

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

import './StylesTipTapMobile.scss'

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Toolbar from '@/app/ui/TipTap/Toolbar';

const TiptapMobile = ({ onChange, content, provider, role, userName }: any) => {
  const CustomBulletList = BulletList.extend({
    addKeyboardShortcuts() {
      return {
        'Tab': () => this.editor.commands.toggleBulletList(),
      }
    },
  })

  const userColor = userName === 'Matheus' ? '#21B5DE' : '#DE5916';

  const editor = useEditor({
    extensions: [
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
      StarterKit.configure({
        history: false
      }),
      Collaboration.configure({
        document: provider.doc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: userName,
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
          "max-w-[100vw] min-w-[100vw] min-h-screen p-3 outline-none bg-black",
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
    <div className='flex flex-col justify-center items-center text-white dark:text-white'>
        <EditorContent editor={editor} />
        <Toolbar editor={editor} content={content} isTyping={''} lastSaved={''} buttonColor={''} animation={false} timeLeft={0} />
    </div>
  );
};

export default TiptapMobile;