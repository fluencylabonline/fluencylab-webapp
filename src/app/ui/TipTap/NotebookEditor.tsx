'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from './TipTap';
import DocumentAnimation from '../Animations/DocumentAnimation';

// CSS for button animation
import './styles.scss'; // Import your CSS file for animations
import { usePathname } from 'next/navigation';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120000); // 30 seconds in milliseconds
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
      setTimeLeft(120000);
    }, 120000);

    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1000, 0));
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
    const ratio = (120000 - timeLeft) / 120000; // 0 to 1

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
