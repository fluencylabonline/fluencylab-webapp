
'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from '../../../ui/TipTap/TipTap';
import DocumentAnimation from '../../../ui/Animations/DocumentAnimation';

// CSS for button animation
import { useSession } from 'next-auth/react';

const NotebookEditor = () => {
  const { data: session } = useSession();
    if (!session) {
        return "Sem sessão iniciada";
  }

  const professorID = session?.user.id;
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');

  const isTeacherNotebook = true;
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
        const notebookDoc = await getDoc(doc(db, `users/${professorID}/Notebooks/${notebookID}`));
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
  }, [professorID, notebookID]);

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
      await setDoc(doc(db, `users/${professorID}/Notebooks/${notebookID}`), { content: newContent }, { merge: true });
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
        isTeacherNotebook={isTeacherNotebook}
      />
    </div>
  );
};

export default NotebookEditor;