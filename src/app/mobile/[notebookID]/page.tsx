'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from '@/app/ui/TipTap/TipTap';

// CSS for button animation
import '@/app/ui/TipTap/styles.scss';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotebookContent = async () => {
      try {
        setLoading(true);
        const notebookDoc = await getDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`));
        if (notebookDoc.exists()) {
          setContent(notebookDoc.data().content);
        }
      } catch (error) {
        console.error('Error fetching notebook content: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotebookContent();
  }, [studentID, notebookID]);

  if (loading) {
    return <DocumentAnimation />;
  }

  return (
    <div className='lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1'>
      <Tiptap
        content={content}
        onChange={(newContent: string) => {
          setContent(newContent);
        }}
      />
    </div>
  );
};

export default NotebookEditor;
