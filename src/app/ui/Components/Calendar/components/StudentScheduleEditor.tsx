// /home/ubuntu/src/app/professor/remarcacao/components/StudentScheduleEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Interface for the editable schedule entry in the UI
interface EditableClassScheduleEntry {
  tempId: string; // Temporary ID for React list key
  dayOfWeek: string; // Store as name (e.g., "Segunda")
  time: string; // Store as HH:MM
}

// Interface for the student data relevant to the editor
interface Student {
  id: string;
  name: string;
  diaAula?: string[]; // Array of day names
  horario?: string[]; // Array of times
}

interface StudentScheduleEditorProps {
  student: Student;
  onSave: (studentId: string, schedule: EditableClassScheduleEntry[]) => void;
  onCancel: () => void;
  saving: boolean;
}

const DAYS_OF_WEEK_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const StudentScheduleEditor: React.FC<StudentScheduleEditorProps> = ({
  student,
  onSave,
  onCancel,
  saving,
}) => {
  const [editedSchedule, setEditedSchedule] = useState<
    EditableClassScheduleEntry[]
  >([]);

  // Helper to generate temporary IDs
  const generateTempId = () =>
    `entry_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize the editor state based on the student's current schedule
  useEffect(() => {
    const initialSchedule: EditableClassScheduleEntry[] = [];
    if (student.diaAula && student.horario) {
      const minLength = Math.min(
        student.diaAula.length,
        student.horario.length
      );
      for (let i = 0; i < minLength; i++) {
        initialSchedule.push({
          tempId: generateTempId(),
          dayOfWeek: student.diaAula[i] || "", // Ensure it's a string
          time: student.horario[i] || "", // Ensure it's a string
        });
      }
    }
    // If no schedule exists or it's empty, start with one blank entry
    if (initialSchedule.length === 0) {
      initialSchedule.push({ tempId: generateTempId(), dayOfWeek: "", time: "" });
    }
    setEditedSchedule(initialSchedule);
  }, [student]); // Re-initialize if the student prop changes

  const handleScheduleEntryChange = (
    tempId: string,
    field: "dayOfWeek" | "time",
    value: string
  ) => {
    setEditedSchedule((prevSchedule) =>
      prevSchedule.map((entry) =>
        entry.tempId === tempId ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddScheduleEntry = () => {
    setEditedSchedule((prevSchedule) => [
      ...prevSchedule,
      { tempId: generateTempId(), dayOfWeek: "", time: "" },
    ]);
  };

  const handleRemoveScheduleEntry = (tempId: string) => {
    setEditedSchedule((prevSchedule) =>
      prevSchedule.filter((entry) => entry.tempId !== tempId)
    );
  };

  const handleSaveChanges = () => {
    // Filter out empty/invalid entries before saving
    const validSchedule = editedSchedule.filter(
      (entry) =>
        entry.dayOfWeek &&
        entry.time &&
        DAYS_OF_WEEK_NAMES.includes(entry.dayOfWeek)
    );
    onSave(student.id, validSchedule);
  };

  return (
    // Apply fluency styles and motion to the container
    <motion.div
      variants={fadeIn} // Use the overall fadeIn for the editor container
      className="p-4 border-t border-fluency-gray-200 dark:border-fluency-gray-700 bg-fluency-gray-50 dark:bg-fluency-gray-800/60"
    >
      <h4 className="text-md font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark">
        Editar Horários de {student.name}
      </h4>
      <motion.div
        variants={staggerChildren} // Stagger animation for schedule entries
        className="space-y-3 mb-4"
      >
        {editedSchedule.map((entry, index) => (
          <motion.div
            key={entry.tempId}
            variants={fadeIn} // Fade in each entry
            layout // Animate layout changes when adding/removing
            className="flex items-center space-x-2"
          >
            {/* Day of Week Select - Styled */}
            <select
              name={`dayOfWeek-${entry.tempId}`}
              value={entry.dayOfWeek}
              onChange={(e) =>
                handleScheduleEntryChange(entry.tempId, "dayOfWeek", e.target.value)
              }
              className="block w-full sm:w-1/2 pl-3 pr-8 py-2 text-sm rounded-md shadow-sm 
                         border border-fluency-gray-300 dark:border-fluency-gray-600 
                         bg-fluency-pages-light dark:bg-fluency-gray-700 
                         text-fluency-text-light dark:text-fluency-text-dark 
                         focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500"
            >
              <option value="" disabled>
                Dia...
              </option>
              {DAYS_OF_WEEK_NAMES.map((dayName) => (
                <option key={dayName} value={dayName}>
                  {dayName}
                </option>
              ))}
            </select>

            {/* Time Input - Styled */}
            <input
              type="time"
              name={`time-${entry.tempId}`}
              value={entry.time}
              onChange={(e) =>
                handleScheduleEntryChange(entry.tempId, "time", e.target.value)
              }
              className="block w-full sm:w-1/2 pl-3 pr-2 py-2 text-sm rounded-md shadow-sm 
                         border border-fluency-gray-300 dark:border-fluency-gray-600 
                         bg-fluency-pages-light dark:bg-fluency-gray-700 
                         text-fluency-text-light dark:text-fluency-text-dark 
                         focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500"
            />

            {/* Remove Button - Styled */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1, color: "#ef4444" /* fluency-red-500 */ }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRemoveScheduleEntry(entry.tempId)}
              className="p-1.5 rounded-md text-fluency-gray-500 dark:text-fluency-gray-400 hover:bg-fluency-red-100 dark:hover:bg-fluency-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={editedSchedule.length <= 1} // Disable removing if only one entry exists
              aria-label="Remover horário"
            >
              <FiTrash2 size={16} />
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Entry Button - Styled */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddScheduleEntry}
        className="mb-4 inline-flex items-center px-3 py-1.5 border border-dashed border-fluency-gray-400 dark:border-fluency-gray-500 text-sm font-medium rounded-md text-fluency-text-secondary dark:text-fluency-text-dark-secondary bg-transparent hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fluency-gray-50 dark:focus:ring-offset-fluency-gray-800/60 focus:ring-fluency-blue-500 transition-colors"
      >
        <FiPlus className="mr-1.5" size={14} /> Adicionar Horário
      </motion.button>

      {/* Action Buttons - Styled */}
      <div className="flex justify-end space-x-3">
        {/* Cancel Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-lg shadow-sm text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-gray-700 hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fluency-gray-50 dark:focus:ring-offset-fluency-gray-800/60 focus:ring-fluency-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <FiXCircle className="inline mr-1.5 w-4 h-4" /> Cancelar
        </motion.button>
        {/* Save Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveChanges}
          disabled={saving}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-fluency-blue-600 hover:bg-fluency-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fluency-gray-50 dark:focus:ring-offset-fluency-gray-800/60 focus:ring-fluency-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <FiLoader className="animate-spin inline mr-1.5 w-4 h-4" />
          ) : (
            <FiSave className="inline mr-1.5 w-4 h-4" />
          )}
          {saving ? "Salvando..." : "Salvar Horários"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StudentScheduleEditor;

