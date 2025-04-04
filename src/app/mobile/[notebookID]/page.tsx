"use client"; // Keep this directive if necessary for your Next.js setup

import React, { useState, useEffect } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db, firebaseApp } from './firebase'; // Assuming firebaseApp is your initialized Firebase app
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Your component imports
import TiptapMobile from '../Editor/TipTapMobile'; // Assuming this is the correct path
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation'; // Assuming correct path

// Main Component
function NotebookEditor() {
    // State Hooks
    const [content, setContent] = useState(''); // Keep for now if needed elsewhere, but Yjs is source of truth for editor
    const [loading, setLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(600000); // 10 minutes in ms
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecked, setIsChecked] = useState(false); // Theme state

    // Get URL Params
    // Using useEffect to safely access window object after component mounts
    const [notebookID, setNotebookID] = useState<string | null>(null);
    const [studentID, setStudentID] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const notebookParam = params.get('notebook');
        const studentParam = params.get('student');
        const roleParam = params.get('role');
        const themeParam = params.get('theme');
        const isDarkMode = themeParam === 'dark';

        setNotebookID(notebookParam);
        setStudentID(studentParam);
        setRole(roleParam);
        setIsChecked(isDarkMode);

        // Initial theme setup
        document.body.classList.toggle('dark', isDarkMode);
    }, []); // Empty dependency array ensures this runs once on mount

    // Update theme when isChecked changes
    useEffect(() => {
        document.body.classList.toggle('dark', isChecked);
    }, [isChecked]);

    // --- Yjs Initialization (Done ONCE using useState initializer) ---
    const [ydoc] = useState(() => new Y.Doc());

    const [provider, setProvider] = useState<FirestoreProvider | null>(null);

    useEffect(() => {
        // Initialize provider only when IDs are available
        if (studentID && notebookID && !provider) {
            const basePath: string[] = ["users", studentID, "Notebooks", notebookID];
            console.log("Initializing FirestoreProvider for path:", basePath.join('/'));
            const firestoreProvider = new FirestoreProvider(firebaseApp, ydoc, basePath);

            firestoreProvider.on('synced', (isSynced: boolean) => {
                console.log('Provider synced:', isSynced);
                // If synced, we can potentially stop the main loading state
                if (isSynced) {
                    setLoading(false); // Assuming sync means initial content is loaded
                     // Trigger initial version check after sync
                    const currentContent = ydoc.getText('content').toString();
                    checkAndSaveVersion(currentContent);
                }
            });

            firestoreProvider.on('update', (update: any) => {
                // console.log('Update detected by FirestoreProvider:', update); // Can be verbose
            });

             firestoreProvider.on('error', (error: any) => {
                 console.error('FirestoreProvider Error:', error);
                 // Handle provider errors appropriately (e.g., show message to user)
                 setLoading(false); // Stop loading on error too
             });

            setProvider(firestoreProvider);

            // Cleanup function for when component unmounts or IDs change
            return () => {
                console.log("Destroying FirestoreProvider...");
                firestoreProvider.destroy();
                setProvider(null); // Reset provider state
            };
        }
    }, [studentID, notebookID, ydoc, firebaseApp]); // Re-run if IDs, ydoc, or firebaseApp change


    // --- Firebase Authentication ---
    const auth = getAuth(firebaseApp);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUserName(user.displayName || 'Anonymous');
                console.log("User authenticated:", user.displayName || 'Anonymous');
            } else {
                setIsAuthenticated(false);
                setUserName(null);
                 // Optional: Handle unauthenticated state (e.g., redirect)
                console.log("User not authenticated");
            }
            // Removed setLoading(false) here; loading depends on provider sync now
        });
        return () => unsubscribe(); // Cleanup listener
    }, [auth]);


    // --- Version Saving Helper ---
    const checkAndSaveVersion = async (currentContent: string) => {
         if (!studentID || !notebookID) return; // Need IDs
        try {
            const versionRef = collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`);
            const versionSnapshot = await getDocs(versionRef);
            const isAlreadySaved = versionSnapshot.docs.some(
                (doc) => doc.data().content === currentContent
            );

            if (!isAlreadySaved && currentContent) {
                console.log('Content changed since last version, saving new version...');
                const timestamp = new Date();
                await addDoc(versionRef, {
                    content: currentContent,
                    date: timestamp.toLocaleDateString(), // Consider UTC or ISO strings for consistency
                    time: timestamp.toLocaleTimeString(), // Consider UTC or ISO strings for consistency
                });
                setLastSaved(timestamp.toLocaleString()); // Update UI feedback
            } else if (isAlreadySaved) {
                // console.log('Current content is already saved as a version, skipping...'); // Less verbose logging
            } else {
                // console.log('No content to save yet.');
            }
        } catch (error) {
            console.error('Error checking/saving version:', error);
        }
    };


    // --- Content Change Handler (Triggered by Tiptap's onUpdate) ---
    // NOTE: This NO LONGER writes to Firestore directly. Yjs handles sync.
    const handleContentChange = (newContent: string) => {
        // setContent(newContent); // Only needed if you use the 'content' state elsewhere in this component
        // console.log("Tiptap content updated (sync handled by Yjs)"); // Can be noisy
        // DO NOT do this: await updateDoc(...) - Let the provider handle it.
    };


    // --- Auto-Save and Countdown Logic ---
    useEffect(() => {
        // Function to save a version based on Yjs doc content
        const saveVersion = async () => {
            // Ensure provider is connected and IDs are available
            // CORRECTED:
            if (!provider || !studentID || !notebookID) { // Removed !provider.synced check
              console.log("Skipping auto-save: Provider not initialized or IDs missing.");
              return;
            }

            try {
                const currentContent = ydoc.getText('content').toString(); // Get content from Yjs doc

                if (!currentContent) {
                    // console.log("Skipping auto-save: No content.");
                    return;
                }

                // Check if this content is already the latest saved version to avoid redundant writes
                 const versionRef = collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`);
                 const versionSnapshot = await getDocs(versionRef); // Consider ordering/limiting for efficiency
                 const isAlreadySaved = versionSnapshot.docs.some(
                     (doc) => doc.data().content === currentContent
                 );

                 if (isAlreadySaved) {
                    // console.log("Skipping auto-save: Content unchanged since last saved version.");
                    return;
                 }

                // Proceed to save if content is new
                const timestamp = new Date();
                console.log(`Auto-saving version at ${timestamp.toLocaleString()}`);
                await addDoc(versionRef, {
                    content: currentContent,
                    date: timestamp.toLocaleDateString(),
                    time: timestamp.toLocaleTimeString(),
                });
                setLastSaved(timestamp.toLocaleString()); // Update feedback state

            } catch (error) {
                console.error('Error auto-saving version: ', error);
            }
        };

        // Auto-save interval
        const saveInterval = setInterval(() => {
            saveVersion();
            setTimeLeft(600000); // Reset timer
        }, 600000); // 10 minutes

        // Countdown timer interval
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => Math.max(prev - 1000, 0)); // Decrease every second
        }, 1000);

        // Save on page unload
        const handleBeforeUnload = () => {
            console.log("Attempting to save version before unload...");
            saveVersion(); // Attempt synchronous save if possible, or flag for next load
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup intervals and event listener
        return () => {
            clearInterval(saveInterval);
            clearInterval(countdownInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // Dependencies: Include everything used inside the effect's functions
    }, [provider, ydoc, studentID, notebookID]);


    // --- Render Logic ---
    // Show loading animation until authenticated AND provider is initialized and synced
    if (loading || !isAuthenticated || !provider) {
        console.log("Showing loading animation:", { loading, isAuthenticated, provider: !!provider });
        return <DocumentAnimation />;
    }

    // Render the editor once ready
    return (
        <TiptapMobile
            // content={content} // Likely NOT needed if Tiptap reads from provider.doc
            role={role}
            provider={provider} // Pass the stable provider instance
            studentID={studentID}
            notebookID={notebookID} // Pass IDs if needed by TiptapMobile/Tiptap itself
            userName={userName}
            onChange={handleContentChange} // Pass the (now passive) handler
            // Pass other states needed for UI elements within TiptapMobile/Toolbar
            lastSaved={lastSaved}
            timeLeft={timeLeft}
            // Determine editability based on role (example)
            isEditable={role === 'teacher' || role === 'admin'} // Adjust as needed
            // Add any other props TiptapMobile expects
            // isTyping={isTyping} // Example: if you implement typing indicators
            // animation={animation} // Example
            // buttonColor={buttonColor} // Example
            // isTeacherNotebook={role === 'teacher'} // Example
        />
    );
}

export default NotebookEditor;