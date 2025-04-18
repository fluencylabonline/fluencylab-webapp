'use client'
import { useEffect, useState, useRef } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { firebaseApp } from '../Firebase/firebase';
import TiptapMobile from '../Editor/TipTapMobile';
import LoadingAnimation from '../Loading/LoadingAnimation';

function NotebookEditor() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000);
  const [provider, setProvider] = useState<FirestoreProvider | null>(null);
  const [professorName, setProfessorName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  const [notebookID, setNotebookID] = useState<string | null>(null);
  const [studentID, setStudentID] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(true);

  // Parse URL parameters and set state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setNotebookID(params.get('notebookID'));
      setStudentID(params.get('studentID'));
      setRole(params.get('role'));
      const darkModeParam = params.get('darkMode');
      if (darkModeParam !== null) {
        setIsChecked(darkModeParam === 'true');
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isChecked);
  }, [isChecked]);
    
  useEffect(() => {
    const fetchNames = async () => {
      if (!studentID) return;
  
      try {
        const studentDocRef = doc(db, "users", studentID);
        const studentDoc = await getDoc(studentDocRef);
  
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const studentName = studentData.name || 'Estudante';
          setStudentName(studentName);
  
          // Check if the professorID is stored inside the student's document
          if (studentData.professorID) {
            const professorDoc = await getDoc(doc(db, "users", studentData.professorID));
            if (professorDoc.exists()) {
              const professorData = professorDoc.data();
              setProfessorName(professorData.name || 'Professor');
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nomes:", error);
      }
    };
  
    if (studentID) {
      fetchNames();
    }
  }, [studentID]);
  
  // Use refs to hold these values so they don't trigger re-renders
  const ydocRef = useRef<Y.Doc | null>(null);

  // Set up Yjs document and provider when IDs are available
  useEffect(() => {
    // Only proceed if both IDs are available
    if (!studentID || !notebookID) return;

    // Create the Yjs document only once
    if (!ydocRef.current) {
      ydocRef.current = new Y.Doc();
    }

    // Define basePath with non-null values
    const basePath: string[] = ["users", studentID, "Notebooks", notebookID];
    
    // Create provider
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

  // Fetch notebook content
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

  // Handle content changes
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
  
  // Auto-save functionality
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
        setLastSaved(timestamp.toLocaleString());
      } catch (error) {
        console.error('Error saving version: ', error);
      }
    };
  
    // Auto-save every 10 minutes
    const saveInterval = setInterval(() => {
      saveVersion();
      setTimeLeft(600000); // Reset timeLeft to 10 minutes
    }, 600000);
  
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1000, 0)); // Decrease by 1 second
    }, 1000);
  
    // Save on page unload
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
    <TiptapMobile
      content={content}
      role={role}
      provider={provider}
      onChange={handleContentChange}
      studentName={studentName}
      professorName={professorName}
    />
  );
}

export default NotebookEditor;