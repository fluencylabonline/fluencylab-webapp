'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

import Tiptap from './TipTap';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

const NotebookEditor = () => {
  const [workbook, setWorkbook] = useState<string | null>(null);
  const [lesson, setLesson] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setWorkbook(params.get('workbook'));
    setLesson(params.get('lesson'));
  }, []);

  useEffect(() => {
    const fetchNotebookContent = async (workbook: string, lesson: string) => {
      try {
        const notebookDoc = await getDoc(doc(db, `Apostilas/${workbook}/Lessons/${lesson}`));
        if (notebookDoc.exists()) {
          setContent(notebookDoc.data().content);
        } else {
          setContent('');
        }
      } catch (error) {
        console.error('Error fetching notebook content: ', error);
      } finally {
        setLoading(false);
      }
    };

    if (workbook && lesson) {
      fetchNotebookContent(workbook, lesson);
    }
  }, [workbook, lesson]);

  const handleContentChange = async (content: string) => {
    try {
      if (workbook && lesson) {
        await setDoc(doc(db, `Apostilas/${workbook}/Lessons/${lesson}`), { content: content }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving notebook content: ', error);
    }
  };

  if (loading) {
    return <DocumentAnimation />;
  }

  return (
    <div className='lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1'>
      <Tiptap
        content={content}
        onChange={(content: string) => handleContentChange(content)}
      />
    </div>
  );
};

export default NotebookEditor;
