// /home/ubuntu/src/app/professor/remarcacao/components/StudentScheduleManager.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit, FiUsers, FiInfo } from "react-icons/fi";
import StudentScheduleEditor from "./StudentScheduleEditor"; // Assuming this will also be styled

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const editorAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } },
};

// Interface for Student (should match the one in useProfessorData)
interface Student {
  id: string;
  name: string;
  email: string;
  diaAula?: string[]; // Array of day names
  horario?: string[]; // Array of times
}

// Interface for the editable schedule entry (passed to editor)
interface EditableClassScheduleEntry {
  tempId: string;
  dayOfWeek: string;
  time: string;
}

interface StudentScheduleManagerProps {
  students: Student[];
  onSaveChanges: (
    studentId: string,
    schedule: EditableClassScheduleEntry[]
  ) => Promise<void>; // Make async to handle saving state
  saving: boolean;
}

const StudentScheduleManager: React.FC<StudentScheduleManagerProps> = ({
  students,
  onSaveChanges,
  saving,
}) => {
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const handleEditClick = (studentId: string) => {
    setEditingStudentId(studentId);
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
  };

  const handleSaveStudent = async (
    studentId: string,
    schedule: EditableClassScheduleEntry[]
  ) => {
    await onSaveChanges(studentId, schedule); // Call the async save function from props
    // Parent component handles closing the editor upon successful save
  };

  if (!students || students.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 sm:p-6 rounded-lg shadow-lg"
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark flex items-center">
          <FiUsers className="mr-2 text-fluency-blue-600 dark:text-fluency-blue-400" /> Horários dos Alunos
        </h2>
        <div className="flex items-center justify-center py-5 text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
          <FiInfo className="mr-2 w-5 h-5" />
          <p>Nenhum aluno encontrado.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 sm:p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark flex items-center">
        <FiUsers className="mr-2 text-fluency-blue-600 dark:text-fluency-blue-400" /> Horários dos Alunos
      </h2>
      <div className="overflow-x-auto rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-700">
        <table className="min-w-full divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700">
          <thead className="bg-fluency-gray-100 dark:bg-fluency-gray-800">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Aluno
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Dias/Horários
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          {/* Use motion component for tbody if staggering is desired, otherwise apply to rows */}
          <tbody className="bg-fluency-pages-light dark:bg-fluency-pages-dark divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700">
            {students.map((student) => (
              <React.Fragment key={student.id}>
                {/* Student Info Row */}
                <motion.tr
                  layout // Animate layout changes when editor appears/disappears
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800/50 transition-colors"
                >
                  {/* Student Name */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark">
                      {student.name}
                    </div>
                  </td>
                  {/* Student Email */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                      {student.email}
                    </div>
                  </td>
                  {/* Class Schedule */}
                  <td className="px-3 sm:px-6 py-4 whitespace-normal">
                    <div className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                      {student.diaAula && student.diaAula.length > 0 ? (
                        student.diaAula.map((dia, index) => (
                          <div key={index} className="whitespace-nowrap">
                            {dia} - {student.horario?.[index] || "--:--"}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-fluency-gray-400 dark:text-fluency-gray-500 italic">
                          Nenhum horário definido
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingStudentId !== student.id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditClick(student.id)}
                        className="text-fluency-blue-600 hover:text-fluency-blue-800 dark:text-fluency-blue-400 dark:hover:text-fluency-blue-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-fluency-blue-500 focus:ring-offset-1 focus:ring-offset-fluency-pages-light dark:focus:ring-offset-fluency-pages-dark"
                        aria-label={`Editar horários de ${student.name}`}
                      >
                        <FiEdit className="w-4 h-4" />
                      </motion.button>
                    )}
                  </td>
                </motion.tr>

                {/* Editor Row - Render conditionally with animation */}
                <AnimatePresence initial={false}>
                  {editingStudentId === student.id && (
                    <motion.tr
                        key={`editor-${student.id}`}
                        // variants={editorAnimation} // Apply animation variants here
                        // initial="initial"
                        // animate="animate"
                        // exit="exit"
                        // layout // Ensure layout animation works well with variants
                        className="bg-fluency-gray-50 dark:bg-fluency-gray-800/60"
                    >
                      {/* Apply animation directly to td if tr animation causes issues */}
                      <motion.td
                        colSpan={4}
                        className="px-0 py-0 overflow-hidden" // Prevent content spill during animation
                        variants={editorAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
                        <StudentScheduleEditor
                          student={student}
                          onSave={handleSaveStudent}
                          onCancel={handleCancelEdit}
                          saving={saving} // Pass saving state down
                        />
                      </motion.td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default StudentScheduleManager;

