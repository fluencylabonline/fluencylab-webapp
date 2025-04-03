'use client'
import { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { firebaseApp } from './firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import TiptapMobile from '@/app/ui/TipTap/TipTap';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

function NotebookEditor() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000);
  const [userName, setUserName] = useState<string | null>(null); // State for storing the user's name
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const notebookID = params.get('notebook');
  const studentID = params.get('student');
  const role = params.get('role');
  const isDarkModeParam = params.get('darkMode') === 'true';
  const [isChecked, setIsChecked] = useState(isDarkModeParam !== null ? isDarkModeParam : true);

  useEffect(() => {
    document.body.classList.toggle('dark', isChecked);
  }, [isChecked]);

  // Firebase Auth to check if user is authenticated
  const auth = getAuth(firebaseApp);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserName(user.displayName || 'Anonymous'); // Get user name from Firebase Auth
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth]);
  
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
    window.onbeforeunload = () => {
      saveVersion();
    };
  
    return () => {
      clearInterval(saveInterval);
      clearInterval(countdownInterval);
    };
  }, [content, studentID, notebookID]);
  

  if (loading || !isAuthenticated) return <DocumentAnimation />; // Wait until the user is authenticated

  return (
    <TiptapMobile
      content={content}
      role={role}
      provider={provider}
      studentID={studentID}
      notebookID={notebookID}
      userName={userName}
      onChange={handleContentChange}
    />
  );
};

export default NotebookEditor;
