'use client'
import { useEffect, useState, useRef } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { db, firebaseApp } from '@/app/mobile/Firebase/firebase';
import { useSearchParams } from 'next/navigation';
import LoadingAnimation from '@/app/mobile/Loading/LoadingAnimation';
import Tiptap from './TipTap';

function NotebookEditor() {
  const searchParams = useSearchParams();
  const notebookID = searchParams.get('notebook') as string;
  const studentID = searchParams.get('student') as string;

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [provider, setProvider] = useState<FirestoreProvider | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000);

  const ydocRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!studentID || !notebookID) return;

    if (!ydocRef.current) {
      ydocRef.current = new Y.Doc();
    }

    const basePath: string[] = ["users", studentID, "Notebooks", notebookID];
    const newProvider = new FirestoreProvider(firebaseApp, ydocRef.current, basePath);
    
    newProvider.on('synced', (isSynced: boolean) => {
      console.log('Provider synced:', isSynced);
    });
    
    newProvider.on('update', (update: any) => {
      console.log('Update sent to Firestore:', update);
    });

    setProvider(newProvider);
    return () => {
      if (newProvider) {
        newProvider.destroy();
      }
    };
  }, [studentID, notebookID]);

  useEffect(() => {
    const fetchNotebookContent = async () => {
      if (!studentID || !notebookID) return;

      try {
        setLoading(true);
        const notebookDoc = await getDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`));
        
        if (notebookDoc.exists()) {
          const fetchedContent = notebookDoc.data().content;
          const versionRef = collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`);
          const versionSnapshot = await getDocs(versionRef);
    
          const isAlreadySaved = versionSnapshot.docs.some(
            (doc) => doc.data().content === fetchedContent
          );
    
          if (!isAlreadySaved) {
            const timestamp = new Date();
            await addDoc(versionRef, {
              content: fetchedContent,
              date: timestamp.toLocaleDateString(),
              time: timestamp.toLocaleTimeString(),
            });
          } else {
            console.log('Fetched content is already saved, skipping...');
          }
    
          if (ydocRef.current) {
            ydocRef.current.getText('content').delete(0, ydocRef.current.getText('content').length);
            ydocRef.current.getText('content').insert(0, fetchedContent);
          }
          
          setContent(fetchedContent);
        }
      } catch (error) {
        console.error('Error fetching notebook content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotebookContent();
  }, [studentID, notebookID]);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    
    if (!studentID || !notebookID) return;
    
    try {
      await updateDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`), {
        content: newContent,
      });
    } catch (error) {
      console.error('Error saving content to Firestore:', error);
    }
  };
  
  useEffect(() => {
    if (!studentID || !notebookID || !content) return;
    
    const saveVersion = async () => {
      try {
        const timestamp = new Date();
        await addDoc(collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`), {
          content,
          date: timestamp.toLocaleDateString(),
          time: timestamp.toLocaleTimeString(),
        });
      } catch (error) {
        console.error('Error saving version: ', error);
      }
    };
  
    const saveInterval = setInterval(() => {
      saveVersion();
      setTimeLeft(600000); 
    }, 600000);
  
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1000, 0));
    }, 1000);
  
    const handleBeforeUnload = () => {
      saveVersion();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      clearInterval(saveInterval);
      clearInterval(countdownInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [content, studentID, notebookID]);
  
  if (loading) return <LoadingAnimation />;

  return (
    <Tiptap
      content={content}
      provider={provider}
      onChange={handleContentChange}
      isEditable={true}
      studentID={studentID}
    />
  );
}

export default NotebookEditor;