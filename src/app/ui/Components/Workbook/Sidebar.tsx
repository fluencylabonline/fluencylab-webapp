"use client";
import { useState } from "react";
import { Notebook } from "@/app/types";

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


  const grouped = lessons.reduce((acc, lesson) => {
    acc[lesson.unit] = acc[lesson.unit] || [];
    acc[lesson.unit].push(lesson);
    return acc;
  }, {} as Record<string, Notebook[]>);

  return (
    <aside
      className={`h-[85vh] p-4 overflow-y-auto border-r bg-fluency-pages-light dark:bg-fluency-pages-dark border-gray-200 dark:border-gray-700
        w-full md:h-[85vh] md:p-4
        md:transition-all md:duration-300
        ${collapsed ? "md:w-22" : "md:w-64"}`}
    >
      {!collapsed ? (
        Object.entries(grouped).map(([unit, items]) => (
          <div key={unit} className="mb-4 overflow-y-auto">
            <h2 className="font-bold mb-2 text-gray-800 dark:text-gray-200">
              Unidade - {unit}
            </h2>
            <ul className="space-y-1">
              {items.map((lesson) => (
                <li key={lesson.docID}>
                  <button
                    onClick={() => onSelectLesson(lesson)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeLesson?.docID === lesson.docID
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {lesson.title}
                  </button>
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
