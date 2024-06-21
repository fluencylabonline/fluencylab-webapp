'use client'
import React, { useEffect, useState } from 'react';

//Firebase
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

//TipTap
import Tiptap from './TipTap'
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

const NotebookEditor = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  const params = new URLSearchParams(window.location.search);
  const workbook = params.get('workbook');
  const lesson = params.get('lesson');
  useEffect(() => {
    // Fetching data only on the client-side
    const fetchNotebookContent = async () => {
      

      try {
        setLoading(true); // Set loading to true when fetching content
        const notebookDoc = await getDoc(doc(db, `Notebooks/${workbook}/Lessons/${lesson}`));
        if (notebookDoc.exists()) {
          setContent(notebookDoc.data().content);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notebook content: ', error);
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      fetchNotebookContent();
    }
  }, []); // Empty dependency array ensures this runs once after the initial render

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
      const params = new URLSearchParams(window.location.search);
      const lesson = params.get('lesson');
      if (lesson) {
        await setDoc(doc(db, `Notebooks/${workbook}/Lessons/${lesson}`), { content: newContent }, { merge: true });
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
        onChange={(newContent: string) => handleContentChange(newContent)}
        isTyping={isTyping}
      />
    </div>
  )
}

export default NotebookEditor;
