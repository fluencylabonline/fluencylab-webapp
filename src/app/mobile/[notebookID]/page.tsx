'use client'
import { useEffect, useState, useRef } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { firebaseApp } from '../Firebase/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import TiptapMobile from '../Editor/TipTapMobile';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';

function NotebookEditor() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600000);
  const [userName, setUserName] = useState<string | null>(null);
  const [provider, setProvider] = useState<FirestoreProvider | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isDarkModeParam = true;
  const [isChecked, setIsChecked] = useState<boolean>(isDarkModeParam !== null ? isDarkModeParam : true);

  const [notebookID, setNotebookID] = useState<string | null>(null);
  const [studentID, setStudentID] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  
  const auth = getAuth(firebaseApp);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!auth.currentUser) return;
  
      const uid = auth.currentUser.uid;
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.name || 'Anônimo');
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
      }
    };
  
    if (isAuthenticated) {
      fetchUserName();
    }
  }, [isAuthenticated]);

  
  // Use refs to hold these values so they don't trigger re-renders
  const ydocRef = useRef<Y.Doc | null>(null);

  // Parse URL parameters and set state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setNotebookID(params.get('notebookID'));
      setStudentID(params.get('studentID'));
      setRole(params.get('role'));
    }
  }, []);

  // Handle dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', isChecked);
  }, [isChecked]);

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

    // Cleanup function
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
  
  if (loading) return <DocumentAnimation />;

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
}

export default NotebookEditor;