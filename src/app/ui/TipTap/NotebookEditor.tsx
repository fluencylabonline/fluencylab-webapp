import React, { useEffect, useState } from 'react';
import { 
  getDoc,
  doc,
  onSnapshot, // Import onSnapshot for real-time updates
  setDoc,
} from 'firebase/firestore';
import { db } from '@/app/firebase';
import Tiptap from './TipTap';
import DocumentAnimation from '../Animations/DocumentAnimation';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const notebookRef = doc(db, `users/${studentID}/Notebooks/${notebookID}`);

    // Fetch initial content
    const fetchNotebookContent = async () => {
      try {
        setLoading(true);
        const notebookSnap = await getDoc(notebookRef);
        if (notebookSnap.exists()) {
          setContent(notebookSnap.data().content);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notebook content: ', error);
        setLoading(false);
      }
    };

    fetchNotebookContent();

    // Listen for real-time updates to the notebook content
    const unsubscribe = onSnapshot(notebookRef, (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.data().content);
      }
    });

    return () => unsubscribe(); // Cleanup function
  }, [studentID, notebookID]);

  const handleContentChange = async (newContent: string) => {
    try {
      await setDoc(
        doc(db, `users/${studentID}/Notebooks/${notebookID}`),
        { content: newContent },
        { merge: true }
      );
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
      />
    </div>
  );
};

export default NotebookEditor;
