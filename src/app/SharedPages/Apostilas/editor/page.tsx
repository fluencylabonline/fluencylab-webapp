'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from './TipTap';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

const NotebookEditor = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [workbook, setWorkbook] = useState<string | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setWorkbook(params.get('workbook'));
      setLesson(params.get('lesson'));
    }
  }, []);

  useEffect(() => {
    const fetchNotebookContent = async () => {
      if (workbook && lesson) {
        try {
          setLoading(true);
          const notebookDoc = await getDoc(doc(db, `Notebooks/${workbook}/Lessons/${lesson}`));
          if (notebookDoc.exists()) {
            setContent(notebookDoc.data().content);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching notebook content: ', error);
          setLoading(false);
        }
      }
    };

    fetchNotebookContent();
  }, [workbook, lesson]);

  const handleContentChange = async (newContent: string) => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    try {
      if (workbook && lesson) {
        await setDoc(doc(db, `Notebooks/${workbook}/Lessons/${lesson}`), { content: newContent }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving notebook content: ', error);
    }
  };

  return (
    <div className='lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1'>
      <Tiptap
        content={content}
        onChange={(newContent: string) => handleContentChange(newContent)}
        isTyping={isTyping}
      />
    </div>
  );
};

export default NotebookEditor;
