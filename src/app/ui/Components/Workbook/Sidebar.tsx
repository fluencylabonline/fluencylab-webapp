"use client";
import { useState, useRef, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { Notebook } from "@/app/types";
import { useSession } from "next-auth/react";

export default function Sidebar({
  lessons,
  activeLesson,
  onSelectLesson,
  collapsed,
}: {
  lessons: Notebook[];
  activeLesson: Notebook | null;
  onSelectLesson: (lesson: Notebook) => void;
  collapsed: boolean;
}) {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const activeLessonRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const grouped = lessons.reduce((acc, lesson) => {
    acc[lesson.unit] = acc[lesson.unit] || [];
    acc[lesson.unit].push(lesson);
    return acc;
  }, {} as Record<string, Notebook[]>);

  // Scroll to active lesson when it changes
  useEffect(() => {
    if (activeLesson && activeLessonRef.current && !collapsed) {
      activeLessonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeLesson, collapsed]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingLessonId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingLessonId]);

  const handleEditStart = (lesson: Notebook, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLessonId(lesson.docID);
    setEditingTitle(lesson.title);
  };

  const handleEditCancel = () => {
    setEditingLessonId(null);
    setEditingTitle("");
  };

  const handleEditSave = async (lesson: Notebook) => {
    if (!editingTitle.trim() || editingTitle === lesson.title) {
      handleEditCancel();
      return;
    }

    setIsUpdating(true);
    try {
      const docRef = doc(db, `Apostilas/${lesson.workbook}/Lessons`, lesson.docID);
      await updateDoc(docRef, { title: editingTitle.trim() });
      setEditingLessonId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Error updating lesson title:", error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, lesson: Notebook) => {
    if (e.key === 'Enter') {
      handleEditSave(lesson);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <aside
      className={`h-[85vh] p-5 overflow-y-auto border-r bg-fluency-pages-light dark:bg-fluency-pages-dark border-gray-200 dark:border-gray-700
        w-full md:h-[85vh] md:p-4
        md:transition-all md:duration-300
        ${collapsed ? "md:w-22" : "md:w-72"}`}
    >
      {!collapsed ? (
        Object.entries(grouped).map(([unit, items]) => (
          <div key={unit} className="mb-4 overflow-y-auto">
            <h2 className="font-bold mb-2 text-gray-800 dark:text-gray-200">
              Unidade - {unit}
            </h2>
            <ul className="space-y-1">
              {items.map((lesson) => (
                <li key={lesson.docID} className="relative group">
                  {editingLessonId === lesson.docID ? (
                    // Edit mode
                    <div className="flex items-center space-x-1 p-1">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, lesson)}
                        onBlur={() => handleEditSave(lesson)}
                        disabled={isUpdating}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleEditSave(lesson)}
                        disabled={isUpdating}
                        className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleEditCancel}
                        disabled={isUpdating}
                        className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center">
                      <button
                        ref={activeLesson?.docID === lesson.docID ? activeLessonRef : null}
                        onClick={() => onSelectLesson(lesson)}
                        className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeLesson?.docID === lesson.docID
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {lesson.title}
                      </button>
                      {session?.user.role === "admin" && (
                        <button
                        onClick={(e) => handleEditStart(lesson, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-opacity"
                        title="Edit title"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        // Collapsed sidebar: show units only, popover on hover with lessons
        <div className="flex flex-col items-center space-y-2">
          {Object.entries(grouped).map(([unit, items]) => (
            <div key={unit} className="relative group w-full text-center">
              <button
                onClick={() => onSelectLesson(items[0])}
                title={`Unidade ${unit}`}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 w-full"
              >
                {unit}
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}