'use client'
import React from 'react';
import { useEffect, useState } from 'react';

//Firebase
import {   
  getDoc,
  doc,
  setDoc,} from 'firebase/firestore';
import { db } from '@/app/firebase';

//TipTap
import Tiptap from './TipTap'
import DocumentAnimation from '../Animations/DocumentAnimation';

const NotebookEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');

  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    const fetchNotebookContent = async () => {
      try {
        setLoading(true); // Set loading to true when fetching content
        const notebookDoc = await getDoc(doc(db, `users/${studentID}/Notebooks/${notebookID}`));
        if (notebookDoc.exists()) {
          setContent(notebookDoc.data().content);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notebook content: ', error);
        setLoading(false);
      }
    };

    fetchNotebookContent();
  }, [studentID, notebookID]); // Update content when notebookID changes

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

  if (loading) {
    return <DocumentAnimation /> ;}

  return (
    <div className='px-6 py-4'>
        <Tiptap
        content={content}
        onChange={(newContent: string) => handleContentChange(newContent)}
        isTyping={isTyping}
      />
    </div>
  )
}

export default NotebookEditor;