"use client"; // Keep this directive if necessary for your Next.js setup

import React, { useState, useEffect } from 'react';
import { getDoc, doc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db, firebaseApp } from './firebase'; // Assuming firebaseApp is your initialized Firebase app
import * as Y from 'yjs';
import { FirestoreProvider } from '@gmcfall/yjs-firestore-provider';
// Removed Firebase Auth imports: import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Your component imports
import TiptapMobile from '../Editor/TipTapMobile'; // Assuming this is the correct path
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation'; // Assuming correct path

// --- CRITICAL SECURITY NOTE ---
// Removing client-side authentication checks means your Firestore Security Rules
// MUST allow unauthenticated access to the relevant paths:
// - `users/{studentID}/Notebooks/{notebookID}` (for Yjs data sync)
// - `users/{studentID}/Notebooks/{notebookID}/versions` (for version saving)
// Failure to update security rules will likely result in PERMISSION_DENIED errors.
// Example (simplistic, adjust for your needs):
// match /users/{userId}/Notebooks/{notebookId}/{document=**} {
//   allow read, write: if true; // Allows anyone - BE CAREFUL in production
// }
// Consider more specific rules if possible, perhaps validating the structure
// of studentID/notebookID if they follow a predictable pattern accessible publicly.

// Main Component
function NotebookEditor() {
    // State Hooks
    const [content, setContent] = useState(''); // Keep if needed, but Yjs is source of truth
    const [loading, setLoading] = useState(true); // Now primarily tracks provider sync
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(600000); // 10 minutes in ms
    // Removed auth state: const [userName, setUserName] = useState<string | null>(null);
    // Removed auth state: const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecked, setIsChecked] = useState(false); // Theme state

    // Get URL Params
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

    // --- Yjs Initialization ---
    const [ydoc] = useState(() => new Y.Doc());
    const [provider, setProvider] = useState<FirestoreProvider | null>(null);

    useEffect(() => {
        // Initialize provider only when IDs are available
        if (studentID && notebookID && !provider) {
            const basePath: string[] = ["users", studentID, "Notebooks", notebookID];
            console.log("Initializing FirestoreProvider (unauthenticated) for path:", basePath.join('/'));
            try {
                const firestoreProvider = new FirestoreProvider(firebaseApp, ydoc, basePath);

                firestoreProvider.on('synced', (isSynced: boolean) => {
                    console.log('Provider synced:', isSynced);
                    if (isSynced) {
                        setLoading(false); // Content loaded/synced
                        // Trigger initial version check after sync
                        const currentContent = ydoc.getText('content').toString();
                        checkAndSaveVersion(currentContent);
                    }
                });

                firestoreProvider.on('update', (update: any) => {
                    // console.log('Update detected by FirestoreProvider:', update);
                });

                firestoreProvider.on('error', (error: any) => {
                    console.error('FirestoreProvider Error:', error);
                    // Check for permission errors specifically
                    if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
                         console.error("PERMISSION DENIED: Check Firestore Security Rules to allow unauthenticated access for this path.");
                         // Optionally show an error message to the user
                    }
                    setLoading(false); // Stop loading on error too
                });

                setProvider(firestoreProvider);

                // Cleanup function
                return () => {
                    console.log("Destroying FirestoreProvider...");
                    firestoreProvider.destroy();
                    setProvider(null);
                };
            } catch (error) {
                 console.error("Error creating FirestoreProvider:", error);
                 setLoading(false); // Stop loading if provider creation fails
            }
        }
    }, [studentID, notebookID, ydoc, firebaseApp]); // Dependencies remain the same

    // --- Firebase Authentication Effect (REMOVED) ---
    // const auth = getAuth(firebaseApp); // Removed
    // useEffect(() => { ... onAuthStateChanged logic ... }, [auth]); // Removed

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
                    date: timestamp.toLocaleDateString(),
                    time: timestamp.toLocaleTimeString(),
                });
                setLastSaved(timestamp.toLocaleString());
            } else if (isAlreadySaved) {
                // console.log('Current content is already saved as a version, skipping...');
            } else {
                // console.log('No content to save yet.');
            }
        } catch (error) {
            console.error('Error checking/saving version:', error);
             // Check for permission errors specifically here too
             if ((error as any).code === 'permission-denied') {
                  console.error("PERMISSION DENIED writing version: Check Firestore Security Rules.");
             }
        }
    };

    // --- Content Change Handler (Triggered by Tiptap's onUpdate) ---
    const handleContentChange = (newContent: string) => {
        // Yjs provider handles the synchronization automatically.
        // This function might still be useful for triggering other side effects if needed.
        // setContent(newContent); // Only if 'content' state is used elsewhere
    };

    // --- Auto-Save and Countdown Logic ---
    useEffect(() => {
        const saveVersion = async () => {
             // Ensure provider is created and IDs are available (sync status isn't strictly required to attempt save)
            if (!provider || !studentID || !notebookID) {
                console.log("Skipping auto-save: Provider not initialized or IDs missing.");
                return;
            }

            try {
                const currentContent = ydoc.getText('content').toString();

                if (!currentContent) {
                    // console.log("Skipping auto-save: No content.");
                    return;
                }

                const versionRef = collection(db, `users/${studentID}/Notebooks/${notebookID}/versions`);
                // Consider ordering/limiting for efficiency if versions list gets long
                const versionSnapshot = await getDocs(versionRef);
                const isAlreadySaved = versionSnapshot.docs.some(
                    (doc) => doc.data().content === currentContent
                );

                if (isAlreadySaved) {
                    // console.log("Skipping auto-save: Content unchanged since last saved version.");
                    return;
                }

                const timestamp = new Date();
                console.log(`Auto-saving version at ${timestamp.toLocaleString()}`);
                await addDoc(versionRef, {
                    content: currentContent,
                    date: timestamp.toLocaleDateString(),
                    time: timestamp.toLocaleTimeString(),
                });
                setLastSaved(timestamp.toLocaleString());

            } catch (error) {
                console.error('Error auto-saving version: ', error);
                // Check for permission errors
                 if ((error as any).code === 'permission-denied') {
                      console.error("PERMISSION DENIED during auto-save: Check Firestore Security Rules.");
                 }
            }
        };

        // Auto-save interval
        const saveInterval = setInterval(() => {
            saveVersion();
            setTimeLeft(600000); // Reset timer
        }, 600000); // 10 minutes

        // Countdown timer interval
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => Math.max(prev - 1000, 0));
        }, 1000);

        // Save on page unload
        const handleBeforeUnload = () => {
            console.log("Attempting to save version before unload...");
            saveVersion(); // Attempt save
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            clearInterval(saveInterval);
            clearInterval(countdownInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [provider, ydoc, studentID, notebookID]); // Dependencies updated slightly

    // --- Render Logic ---
    // Show loading animation until provider is initialized and has attempted sync/load
    if (loading || !provider) {
         // Still loading if the provider hasn't been created yet OR if the loading state is true (waiting for sync/error)
        console.log("Showing loading animation:", { loading, provider: !!provider });
        return <DocumentAnimation />;
    }

    // Render the editor once ready
    return (
        <TiptapMobile
            // content={content} // Likely NOT needed if Tiptap reads from provider.doc
            role={role}
            provider={provider} // Pass the stable provider instance
            studentID={studentID}
            notebookID={notebookID}
            // userName={userName} // Removed prop
            onChange={handleContentChange}
            lastSaved={lastSaved}
            timeLeft={timeLeft}
            // Determine editability based on role (remains unchanged)
            isEditable={role === 'teacher' || role === 'admin'} // Adjust as needed
            // Pass other props TiptapMobile expects
            isChecked={isChecked} // Pass theme state if needed inside
        />
    );
}

export default NotebookEditor;