'use client'
import React, { useEffect, useState } from 'react';
/*
// Firebase
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

import Tiptap from '@/app/SharedPages/Apostilas/editor/TipTap';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

interface ExercicioProps {
  content?: any; // Use `?` for optional props
  languageareaName?: string | null;
  moduleID?: string | null;
  id?: string | null;
}

const Exercicio: React.FC<ExercicioProps> = ({ content: initialContent, languageareaName, moduleID, id }) => {
  const [content, setContent] = useState<string>(initialContent);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id && moduleID && languageareaName) {
      setLoading(false); // No longer fetching content
    }
  }, [id, moduleID, languageareaName]);

  const handleContentChange = async (newContent: string) => {
    try {
      if (id && moduleID && languageareaName) {
        await setDoc(
          doc(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes', id),
          { content: newContent },
          { merge: true }
        );
        setContent(newContent);
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  if (loading) {
    return <DocumentAnimation />;
  }

  return (
    <div className='lg:px-6 lg:py-4 md:px-6 md:py-4 px-2 py-1 h-full '>
      <Tiptap
        content={content}
        onChange={(content: string) => handleContentChange(content)}
      />
    </div>
  );
};

export default Exercicio;
*/

export default function Exercicio(){
  return (
    <div>Oi</div>
  )
}