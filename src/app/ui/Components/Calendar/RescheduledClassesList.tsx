// /home/ubuntu/src/app/ui/Components/Professor/RescheduledClassesList.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfessorData } from "@/app/hooks/useProfessorData"; // Adjust path if needed
import {
  FiInfo,
  FiLoader,
  FiCalendar,
  FiClock,
  FiUser,
  FiAlertCircle,
  FiXCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi"; // Added FiCheckCircle, FiX
import SpinningLoader from "@/app/ui/Animations/SpinningComponent"; // Adjust path if needed
import { RescheduledClass } from "@/app/types";
import { useSession } from "next-auth/react";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// =============== Helper Components ===============
const StatusBadge = ({ status }: { status: RescheduledClass["status"] }) => {
  const badgeConfig = {
    pending: {
      bg: "bg-fluency-orange-100 dark:bg-fluency-orange-900/30",
      text: "text-fluency-orange-800 dark:text-fluency-orange-200",
      label: "Pendente",
      icon: null, // Or FiClock if desired
    },
    confirmed: {
      bg: "bg-fluency-green-100 dark:bg-fluency-green-900/30",
      text: "text-fluency-green-800 dark:text-fluency-green-200",
      label: "Confirmada",
      icon: <FiCheckCircle className="mr-1 w-3 h-3" />,
    },
    cancelled_by_student: {
      bg: "bg-fluency-red-100 dark:bg-fluency-red-900/30",
      text: "text-fluency-red-800 dark:text-fluency-red-200",
      label: "Cancelada (Aluno)",
      icon: <FiX className="mr-1 w-3 h-3" />,
    },
    cancelled_by_teacher: {
      bg: "bg-fluency-gray-100 dark:bg-fluency-gray-700", // Changed to gray for distinction
      text: "text-fluency-gray-800 dark:text-fluency-gray-300",
      label: "Cancelada (Prof)",
      icon: <FiX className="mr-1 w-3 h-3" />,
    },
    default: {
      bg: "bg-fluency-gray-100 dark:bg-fluency-gray-700",
      text: "text-fluency-gray-800 dark:text-fluency-gray-300",
      label: status,
      icon: null,
    },
  };

  const config = badgeConfig[status] || badgeConfig.default;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Helper to format date/time (consider moving to a shared utils file)
const formatDateTime = (dateStr: string, timeStr: string) => {
  try {
    const date = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(date.getTime())) {
      if (dateStr && typeof dateStr === "object" && "toDate" in dateStr) {
        const tsDate = (dateStr as any).toDate();
        return `${tsDate.toLocaleDateString("pt-BR")} ${timeStr}`;
      }
      return "Data/Hora inválida";
    }
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC", // Assume UTC if not specified, adjust if needed
    });
  } catch (e) {
    console.error("Error formatting date/time:", e);
    return `${dateStr} ${timeStr}`;
  }
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(`${dateStr}`); 
    
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date/time:", e);
    return `${dateStr}`;
  }
};

const RescheduledClassesList: React.FC = () => {
  const {
    rescheduledClasses,
    loading,
    cancelRescheduledClass,
    cancellingId,
    sendConfirmationEmail,
  } = useProfessorData(); // Assuming cancellingId is available from hook
  const { data: session } = useSession(); // Import from 'next-auth/react'

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
        <SpinningLoader />
      </div>
    );
  }

  if (!rescheduledClasses || rescheduledClasses.length === 0) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="p-6 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-lg text-center"
      >
        <FiInfo className="inline mr-2 mb-1 w-5 h-5 text-fluency-blue-500 dark:text-fluency-blue-400" />
        <p className="inline text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
          Nenhuma aula remarcada encontrada.
        </p>
      </motion.div>
    );
  }

  const activeReschedules = rescheduledClasses.filter(
    (r) => r.status === "pending" || r.status === "confirmed"
  );
  const pastReschedules = rescheduledClasses.filter(
    (r) => r.status !== "pending" && r.status !== "confirmed"
  );

  const handleCancel = async (reschedule: RescheduledClass) => {
    const confirm = window.confirm(
      "Tem certeza que deseja cancelar esta remarcação? Esta ação não pode ser desfeita."
    );
    if (!confirm) return;

    try {
      await cancelRescheduledClass(reschedule.id);

      const studentName = reschedule.studentName;
      const professorEmail = session?.user?.email;
      const studentId = reschedule.studentId;

      let studentMail: string | null = null;
      if (studentId) {
        try {
          const docRef = doc(db, "users", studentId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            studentMail = data.email ?? null;
          } else {
            console.warn("Professor não encontrado com ID:", studentId);
          }
        } catch (error) {
          console.error("Erro ao buscar e-mail do professor:", error);
        }
      }

      if (studentName && professorEmail && studentMail) {
        await sendConfirmationEmail({
          studentName,
          professorEmail,
          studentMail,
          selectedDate: new Date(reschedule.newDate + "T12:00:00Z").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
          }),
          selectedTimeSlot: {
            startTime: reschedule.newTime,
          },
          templateType: "classCanceledByStudent",
        });
        console.log("Cancelamento enviado para aluno!");
        await sendConfirmationEmail({
          studentName,
          professorEmail,
          studentMail,
          selectedDate: new Date(reschedule.newDate + "T12:00:00Z").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
          }),
          selectedTimeSlot: {
            startTime: reschedule.newTime,
          },
          templateType: "classCanceledByProfessor",
        });

        console.log("Cancelamento enviado para professor!");
        console.log("Cancelamento enviado");
      } else {
        console.warn("Dados incompletos para envio de e-mail.");
      }
    } catch (error) {
      console.error("Error during cancellation:", error);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 sm:p-6 rounded-lg shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4 text-fluency-text-light dark:text-fluency-text-dark">
        Aulas Remarcadas
      </h3>

      {/* Active/Pending Section */}
      {activeReschedules.length > 0 && (
        <motion.div variants={fadeIn} className="mb-6">
          <h4 className="text-md font-medium mb-3 text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Ativas/Pendentes
          </h4>
          <motion.ul variants={staggerChildren} className="space-y-3">
            {activeReschedules.map((reschedule) => (
              <motion.li
                key={reschedule.id}
                variants={fadeIn}
                layout
                className="p-4 border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-lg bg-fluency-gray-50 dark:bg-fluency-gray-800/50 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  {/* Left Side: Info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-fluency-text-light dark:text-fluency-text-dark flex items-center">
                        <FiUser className="mr-2 text-fluency-blue-600 dark:text-fluency-blue-400 w-4 h-4" />
                        {reschedule.studentName}
                      </span>
                      <StatusBadge status={reschedule.status} />
                    </div>
                    <div className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary space-y-1">
                      <p>
                        <strong className="font-medium text-fluency-text-light dark:text-fluency-text-dark">
                          Original:
                        </strong>{" "}
                        {formatDate(
                          reschedule.originalDate
                        )}
                      </p>
                      <p>
                        <strong className="font-medium text-fluency-text-light dark:text-fluency-text-dark">
                          Remarcada para:
                        </strong>{" "}
                        {formatDateTime(reschedule.newDate, reschedule.newTime)}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  {(reschedule.status === "pending" ||
                    reschedule.status === "confirmed") && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0"
                    >
                      <button
                        onClick={() => handleCancel(reschedule)}
                        disabled={cancellingId === reschedule.id}
                        className={`
                          inline-flex items-center justify-center px-3 py-1.5 border border-transparent
                          text-xs font-medium rounded-lg shadow-sm text-white transition-colors duration-150
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fluency-pages-light dark:focus:ring-offset-fluency-pages-dark focus:ring-fluency-red-500
                          ${
                            cancellingId === reschedule.id
                              ? "bg-fluency-red-300 dark:bg-fluency-red-700 cursor-not-allowed"
                              : "bg-fluency-red-500 hover:bg-fluency-red-600 dark:bg-fluency-red-600 dark:hover:bg-fluency-red-700"
                          }
                        `}
                      >
                        {cancellingId === reschedule.id ? (
                          <FiLoader className="animate-spin mr-1 -ml-0.5 h-4 w-4" />
                        ) : (
                          <FiXCircle className="mr-1 -ml-0.5 h-4 w-4" />
                        )}
                        {cancellingId === reschedule.id
                          ? "Cancelando..."
                          : "Cancelar"}
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* History Section */}
      {pastReschedules.length > 0 && (
        <motion.div variants={fadeIn}>
          <h4 className="text-md font-medium mb-3 text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Histórico (Canceladas/Concluídas)
          </h4>
          <motion.ul variants={staggerChildren} className="space-y-3">
            {pastReschedules.map((reschedule) => (
              <motion.li
                key={reschedule.id}
                variants={fadeIn}
                layout
                className="p-4 border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-lg bg-fluency-gray-50 dark:bg-fluency-gray-800/30 opacity-80"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-fluency-text-secondary dark:text-fluency-text-dark-secondary flex items-center">
                    <FiUser className="mr-2 text-fluency-gray-500 dark:text-fluency-gray-400 w-4 h-4" />
                    {reschedule.studentName}
                  </span>
                  <StatusBadge status={reschedule.status} />
                </div>
                <div className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary space-y-1">
                  <p>
                    <strong className="font-medium text-fluency-text-light dark:text-fluency-text-dark">
                      Original:
                    </strong>{" "}
                    {formatDateTime(
                      reschedule.originalDate,
                      reschedule.originalTime
                    )}
                  </p>
                  <p>
                    <strong className="font-medium text-fluency-text-light dark:text-fluency-text-dark">
                      Remarcada para:
                    </strong>{" "}
                    {formatDateTime(reschedule.newDate, reschedule.newTime)}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}

      {/* Fallback if somehow both lists are empty after filtering */}
      {activeReschedules.length === 0 && pastReschedules.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center py-4"
        >
          <FiInfo className="inline mr-2 mb-1 w-5 h-5 text-fluency-blue-500 dark:text-fluency-blue-400" />
          <p className="inline text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Nenhuma aula remarcada encontrada.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RescheduledClassesList;
