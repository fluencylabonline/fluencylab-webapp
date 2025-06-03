// /home/ubuntu/src/app/professor/remarcacao/components/SlotsList.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiTrash2, FiRepeat, FiCalendar, FiInfo } from "react-icons/fi";

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Interface for TimeSlot (should match the one in useProfessorData)
interface TimeSlot {
  id: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceEndDate?: string;
}

interface SlotsListProps {
  slots: TimeSlot[];
  onRemoveSlot: (id: string) => void;
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

const getDayName = (dayIndex: number | undefined): string => {
  if (
    dayIndex === undefined ||
    dayIndex < 0 ||
    dayIndex >= DAYS_OF_WEEK_NAMES.length
  ) {
    return "Inválido";
  }
  return DAYS_OF_WEEK_NAMES[dayIndex];
};

// Helper to format date (consider moving to a shared utils file)
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  try {
    // Handle potential Firebase Timestamp object if needed
    if (typeof dateString === "object" && "toDate" in dateString) {
      return (dateString as any).toDate().toLocaleDateString("pt-BR");
    }
    // Assuming dateString is 'YYYY-MM-DD'
    const date = new Date(`${dateString}T00:00:00`); // Add time to avoid timezone issues
    if (isNaN(date.getTime())) return "Data inválida";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC", // Assume UTC
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Return original string on error
  }
};

const SlotsList: React.FC<SlotsListProps> = ({ slots, onRemoveSlot }) => {
  if (!slots || slots.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg shadow-lg text-center"
      >
        <h2 className="text-xl font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark">
          Horários Disponíveis
        </h2>
        <div className="flex items-center justify-center py-5 text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
          <FiInfo className="mr-2 w-5 h-5" />
          <p>Nenhum horário disponível definido.</p>
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
      <h2 className="text-xl font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark">
        Horários Disponíveis
      </h2>
      <div className="overflow-x-auto rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-700">
        <table className="min-w-full divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700">
          <thead className="bg-fluency-gray-100 dark:bg-fluency-gray-800">
            <tr>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Dia/Data
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Horário
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Recorrência
              </th>
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerChildren}
            className="bg-fluency-pages-light dark:bg-fluency-pages-dark divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700"
          >
            {slots.map((slot) => (
              <motion.tr
                key={slot.id}
                variants={fadeIn}
                layout
                className="hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800/50 transition-colors"
              >
                {/* Type */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  {slot.isRecurring ? (
                    <span className="flex items-center">
                      <FiRepeat className="mr-1.5 w-4 h-4 text-fluency-blue-500 dark:text-fluency-blue-400" />
                      Recorrente
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiCalendar className="mr-1.5 w-4 h-4 text-fluency-green-500 dark:text-fluency-green-400" />
                      Pontual
                    </span>
                  )}
                </td>
                {/* Day/Date */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-fluency-text-light dark:text-fluency-text-dark">
                  {slot.isRecurring
                    ? getDayName(slot.dayOfWeek)
                    : formatDate(slot.date)}
                </td>
                {/* Time */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-fluency-text-light dark:text-fluency-text-dark">
                  {slot.startTime} - {slot.endTime}
                </td>
                {/* Recurrence */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                  {slot.isRecurring
                    ? `Até ${formatDate(slot.recurrenceEndDate)}`
                    : "-"}
                </td>
                {/* Actions */}
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                      color: "#ef4444" /* fluency-red-500 */,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRemoveSlot(slot.id)}
                    className="p-1.5 rounded-md text-fluency-gray-500 dark:text-fluency-gray-400 hover:bg-fluency-red-100 dark:hover:bg-fluency-red-900/30 focus:outline-none focus:ring-1 focus:ring-fluency-red-500 focus:ring-offset-1 focus:ring-offset-fluency-pages-light dark:focus:ring-offset-fluency-pages-dark transition-colors"
                    aria-label={`Remover horário ${slot.id}`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SlotsList;
