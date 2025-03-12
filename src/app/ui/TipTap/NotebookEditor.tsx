'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

// Firebase
import { getDoc, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap and animations
import Tiptap from './TipTap';
import DocumentAnimation from '../Animations/DocumentAnimation';

// CSS for button animation
import './styles.scss';

const NotebookEditor = () => {
  const searchParams = useSearchParams();
  // Since both notebook and student IDs are always provided, we cast them as strings.
  const notebookID = searchParams.get('notebook') as string;
  const studentID = searchParams.get('student') as string;

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000); // 10 minutes in ms
  const [buttonColor, setButtonColor] = useState<string>('black');
  const [animation, setAnimation] = useState<boolean>(false);

  // Using a ref to store the typing timeout id.
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch notebook content on mount
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

  // Debounced content change handler wrapped with useCallback
  const handleContentChange = useCallback(async (newContent: string) => {
    if (!isTyping) {
      setIsTyping(true);
    }

    // Clear previous timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set a new timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    try {
      await setDoc(
        doc(db, `users/${studentID}/Notebooks/${notebookID}`),
        { content: newContent },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving notebook content: ', error);
    }
  }, [isTyping, studentID, notebookID]);

  // Function to save a version of the notebook
  const saveVersion = useCallback(async () => {
    try {
      const timestamp = new Date();
      await addDoc(collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`), {
        content,
        date: timestamp.toLocaleDateString(),
        time: timestamp.toLocaleTimeString(),
      });
      setLastSaved(timestamp.toLocaleString());
      setButtonColor('black');
      setAnimation(true);
      setTimeout(() => setAnimation(false), 1000);
    } catch (error) {
      console.error('Error saving version: ', error);
    }
  }, [content, studentID, notebookID]);

  // Set up auto-save and countdown timers
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveVersion();
      setTimeLeft(600000); // Reset timeLeft to 10 minutes
    }, 600000); // Save every 10 minutes

    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1000, 0)); // Countdown every second
    }, 1000);

    // Add a beforeunload listener to save version on page exit
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveVersion();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      clearInterval(countdownInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveVersion]);

  // Update button color based on remaining time
  useEffect(() => {
    const targetColor = { r: 35, g: 101, b: 51 };
    const startColor = { r: 0, g: 0, b: 0 };
    const ratio = (600000 - timeLeft) / 600000; // Ratio between 0 and 1
    const r = Math.round(startColor.r + ratio * (targetColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (targetColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (targetColor.b - startColor.b));
    setButtonColor(`rgb(${r}, ${g}, ${b})`);
  }, [timeLeft]);

  if (loading) {
    return <DocumentAnimation />;
  }

  return (
    <div className="lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1">
      <Tiptap
        content={content}
        onChange={(newContent: string) => {
          setContent(newContent);
          handleContentChange(newContent);
        }}
        isTyping={isTyping}
        lastSaved={lastSaved}
        buttonColor={buttonColor}
        animation={animation}
        timeLeft={timeLeft}
        isEditable={true}
      />
    </div>
  );
};

export default NotebookEditor;


{/*

import { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { firebaseApp } from '@/app/mobile/[notebookID]/firebase';
import Tiptap from './TipTap';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

function NotebookEditor() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');
  const role = params.get('role');

  const ydoc = new Y.Doc();
  
  const basePath: string[] = ["users", studentID, "Notebooks", notebookID].filter(item => item !== null) as string[];
  
  const provider = new FirestoreProvider(firebaseApp, ydoc, basePath);
  provider.on('synced', (isSynced: any) => {
    console.log('Provider synced:', isSynced);
  });
  
  provider.on('update', (update: any) => {
    console.log('Update sent to Firestore:', update);
  });
  
  useEffect(() => {
    const fetchNotebookContent = async () => {
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
    
          ydoc.getText('content').insert(0, fetchedContent);
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

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    try {
      await updateDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`), {
        content: newContent,
      });
    } catch (error) {
      console.error('Error saving content to Firestore:', error);
    }
  };

  if (loading) return <DocumentAnimation />; // Wait until the user is authenticated

  return (
    <Tiptap
      content={content}
      role={role}
      provider={provider}
      studentID={studentID}
      notebookID={notebookID}
      onChange={handleContentChange}
    />
  );
};

export default NotebookEditor;
*/}