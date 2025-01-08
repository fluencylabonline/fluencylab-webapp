'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import TiptapMobile from '../Editor/TipTapMobile';

// CSS for button animation
import '@/app/ui/TipTap/styles.scss';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');
  const role = params.get('role');

  /*
  http://localhost:3000/mobile/notebook-editor?notebook=nQVhDReTRyEMJjalVjzM&student=gNU1UzcBeXh7d0cQE6PCEP5G8I33?role=teacher
  */

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
    <div>
      <TiptapMobile
        content={content}
        onChange={(newContent: string) => {
          setContent(newContent);
        }}
        role={role}
      />
    </div>
  );
};

export default NotebookEditor;
