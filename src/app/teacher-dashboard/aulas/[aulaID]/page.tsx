'use client'
import React, { useEffect, useState } from 'react';

// Firebase
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// TipTap
import Tiptap from '../../../ui/TipTap/TipTap';
import DocumentAnimation from '../../../ui/Animations/DocumentAnimation';

// Autenticação
import { useSession } from 'next-auth/react';

const NotebookEditor = () => {
  const { data: session } = useSession();

  // Declaração dos hooks (sempre executados)
  const professorID = session?.user.id;
  // Usa guard para acesso ao objeto window, caso seja renderizado no lado do servidor
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('');
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

  // Se não houver sessão, exibe mensagem (agora após os hooks)
  if (!session) {
    return <p>Sem sessão iniciada</p>;
  }

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

    if (professorID && notebookID) {
      fetchNotebookContent();
    }
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
      await setDoc(
        doc(db, `users/${professorID}/Notebooks/${notebookID}`),
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
