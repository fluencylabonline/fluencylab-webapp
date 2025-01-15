
'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from './TipTap';
import DocumentAnimation from '../Animations/DocumentAnimation';

// CSS for button animation
import './styles.scss';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000);
  const [buttonColor, setButtonColor] = useState<string>('black');
  const [animation, setAnimation] = useState<boolean>(false);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

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
      await setDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`), { content: newContent }, { merge: true });
    } catch (error) {
      console.error('Error saving notebook content: ', error);
    }
  };

  useEffect(() => {
    const saveVersion = async () => {
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
    };

    const saveInterval = setInterval(() => {
      saveVersion();
      setTimeLeft(600000); // Reset timeLeft to 10 minutes
    }, 600000); // Save every 10 minutes

    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1000, 0)); // Countdown every second
    }, 1000);

    window.onbeforeunload = function () {
      saveVersion();
    };

    return () => {
      clearInterval(saveInterval);
      clearInterval(countdownInterval);
    };
  }, [content, studentID, notebookID]);

  useEffect(() => {
    // Define the target color (35, 101, 51)
    const targetColor = { r: 35, g: 101, b: 51 };
    const startColor = { r: 0, g: 0, b: 0 };

    // Calculate the ratio
    const ratio = (600000 - timeLeft) / 600000; // 0 to 1

    // Interpolate color values
    const r = Math.round(startColor.r + ratio * (targetColor.r - startColor.r));
    const g = Math.round(startColor.g + ratio * (targetColor.g - startColor.g));
    const b = Math.round(startColor.b + ratio * (targetColor.b - startColor.b));

    setButtonColor(`rgb(${r}, ${g}, ${b})`);
  }, [timeLeft]);

  if (loading) {
    return <DocumentAnimation />;
  }

  return (
    <div className='lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1'>
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