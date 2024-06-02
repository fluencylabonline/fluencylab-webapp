"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { toast, Toaster } from 'react-hot-toast';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Document from '@tiptap/extension-document';
import Toolbar from "./Toolbar";
import { FaArrowDown, FaArrowUp } from 'react-icons/fa6';
import { VscWholeWord } from 'react-icons/vsc';
import { PiNotebookBold } from 'react-icons/pi';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Replace 'http://your-server-url' with your server URL

const Tiptap = ({ onChange, content, isTyping }: any) => {
  const { data: session } = useSession();
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

  const editor = useEditor({
    extensions: [
      Document,
      Image,
      TextStyle,
      FontFamily,
      StarterKit.configure({ document: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Coloque um título...";
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
        class: "lg:min-w-[794px] md:max-w-[700px] max-w-[380px] min-h-screen p-16 border-[0.5px] border-[#cfcfcf] dark:border-fluency-gray-300 outline-none bg-white dark:bg-fluency-gray-900",
      },
    },
    autofocus: true,
    content: realtimeContent,
    onUpdate: async ({ editor }) => {
      const updatedContent = editor.getHTML();
      setRealtimeContent(updatedContent);
      socket.emit('contentChange', { content: updatedContent });
      onChange(updatedContent);

      // Update content in Firebase Firestore
      const params = new URLSearchParams(window.location.search);
      const notebookID = params.get('notebook');
      const studentID = params.get('student');
      const notebookRef = doc(db, `users/${studentID}/Notebooks/${notebookID}`);
      try {
        await updateDoc(notebookRef, {
          content: updatedContent,
        });
        console.log('Content updated in Firestore');
      } catch (error) {
        console.error('Error updating content in Firestore: ', error);
      }
    },
  });

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
  };

  if (!editor) {
    return null;
  }

  return (
    <div className='flex flex-col min-w-full min-h-full gap-8 justify-center items-center'>
      <Toolbar editor={editor} content={content} isTyping={isTyping} addImage={undefined} />
      <EditorContent editor={editor} />
      <BubbleMenu editor={editor} children={undefined} />
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
      {session?.user.role !== 'student' && (
        <div>
          {/* Your modal and other UI elements */}
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Tiptap;
