'use client';
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { Notebook } from "@/app/types";
import LessonViewer from "@/app/ui/Components/Workbook/LessonViewer";
import Sidebar from "@/app/ui/Components/Workbook/Sidebar";
import { useRouter, useSearchParams } from "next/navigation";
import GuidelinesModal from "@/app/ui/Components/Workbook/GuidelinesModal";
import { markdownComponents } from "@/app/ui/Components/Workbook/MarkdownComponents";

export default function WorkbookViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const book = searchParams.get('book');
  const lessonId = searchParams.get("lesson");
  const workbook = searchParams.get("workbook");

  const [lessons, setLessons] = useState<Notebook[]>([]);
  const [activeLesson, setActiveLesson] = useState<Notebook | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [workbookGuidelines, setWorkbookGuidelines] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

 useEffect(() => {
  if (!book) return;

  const colRef = collection(db, `Apostilas/${book}/Lessons`);
  const unsubscribe = onSnapshot(colRef, (snap) => {
    const notes: Notebook[] = [];
    snap.forEach((doc) => {
      const data = doc.data() as Notebook;
      notes.push({ ...data, docID: doc.id, workbook: book });
    });
    notes.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
    setLessons(notes);

    // ✅ Only set the first lesson if there’s no lessonId in the URL
    if (!lessonId && notes.length > 0) {
      setActiveLesson(notes[0]);
    }
  });

  // Fetch workbook guidelines
  const fetchGuidelines = async () => {
    const docRef = doc(db, "Apostilas", book);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setWorkbookGuidelines(docSnap.data()?.guidelines || "");
    }
  };
  fetchGuidelines();

  return () => unsubscribe();
}, [book, lessonId]);


  // Update activeLesson if lessonId and workbook are provided
  useEffect(() => {
    if (!lessonId || !workbook) return;

    const fetchLesson = async () => {
      const docRef = doc(db, `Apostilas`, workbook as string, "Lessons", lessonId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Notebook;
        setActiveLesson({ ...data, docID: lessonId as string, workbook: workbook as string });
      }
    };

    fetchLesson();
  }, [lessonId, workbook]);

  const handleSelectLesson = (lesson: Notebook) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);

    const params = new URLSearchParams();
    params.set("book", lesson.workbook);
    params.set("lesson", lesson.docID);
    params.set("workbook", lesson.workbook);

    router.replace(`?${params.toString()}`);
  };

  if (!book) return null;

  return (
    <div className="flex flex-col md:flex-row h-[95vh] overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-800 dark:text-white">
          {activeLesson?.title || "Selecione uma lição"}
        </h1>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-b dark:border-gray-700 bg-fluency-gray-100 dark:bg-fluency-gray-700 flex justify-between items-center">
          <h1 className={`text-lg font-bold text-gray-800 dark:text-white transition-opacity ${sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Lições
          </h1>

          {workbookGuidelines && (
            <button
              onClick={() => setShowGuidelines(true)}
              className={`px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium ${sidebarCollapsed ? 'hidden' : ''}`}
            >
              Guia
            </button>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        <Sidebar
          lessons={lessons}
          activeLesson={activeLesson}
          onSelectLesson={handleSelectLesson}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeLesson ? (
          <div className="flex-1 p-6 overflow-auto bg-white dark:bg-fluency-gray-900">
            <LessonViewer key={activeLesson.docID} lesson={activeLesson.docID} workbook={activeLesson.workbook} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Selecione uma lição
          </div>
        )}
      </div>

      {/* Guidelines modal */}
      {showGuidelines && (
        <GuidelinesModal 
          guidelines={workbookGuidelines} 
          onClose={() => setShowGuidelines(false)} 
          markdownComponents={markdownComponents}
        />
      )}
    </div>
  );
}