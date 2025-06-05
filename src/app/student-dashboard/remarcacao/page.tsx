// StudentReschedulingPage.jsx
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import FluencyButton from "@/app/ui/Components/Button/button";
import {
  FiLoader,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiCheck,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { useStudentReschedulingData } from "@/app/hooks/useStudentReschedulingData";
import { RescheduledClass, ClassDate } from "@/app/types";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import { CalendarClock, CalendarPlus, CalendarSync } from "lucide-react";
import { useSession } from "next-auth/react";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import Tour from "@/app/ui/Components/JoyRide/FluencyTour";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// StatusBadge
// Add this type above the StatusBadge component
type StatusKey =
  | "pending"
  | "confirmed"
  | "cancelled_by_student"
  | "cancelled_by_teacher"
  | "À Fazer"
  | "Cancelada"
  | string; // Allow any string as a fallback

const StatusBadge = ({
  status,
}: {
  status: RescheduledClass["status"] | string;
}) => {
  // Define badgeConfig with index signature
  const badgeConfig: Record<
    string,
    {
      bg: string;
      text: string;
      label: string;
      icon: React.ReactNode | null;
    }
  > = {
    pending: {
      bg: "bg-fluency-orange-100 dark:bg-fluency-orange-900/30",
      text: "text-fluency-orange-800 dark:text-fluency-orange-200",
      label: "Pendente",
      icon: null,
    },
    confirmed: {
      bg: "bg-fluency-green-100 dark:bg-fluency-green-900/30",
      text: "text-fluency-green-800 dark:text-fluency-green-200",
      label: "Confirmada",
      icon: <FiCheckCircle className="mr-1 w-4 h-4" />,
    },
    cancelled_by_student: {
      bg: "bg-fluency-red-100 dark:bg-fluency-red-900/30",
      text: "text-fluency-red-800 dark:text-fluency-red-200 truncate",
      label: "Cancelada por mim",
      icon: <FiX className="mr-1 w-4 h-4" />,
    },
    cancelled_by_teacher: {
      bg: "bg-fluency-red-100 dark:bg-fluency-red-900/30",
      text: "text-fluency-red-800 dark:text-fluency-red-200 truncate",
      label: "Cancelada pelo Professor",
      icon: <FiX className="mr-1 w-4 h-4" />,
    },
    "À Fazer": {
      bg: "bg-fluency-blue-100 dark:bg-fluency-blue-900/30",
      text: "text-fluency-blue-800 dark:text-fluency-blue-200",
      label: "À Fazer",
      icon: <FiClock className="mr-1 w-4 h-4" />,
    },
    Cancelada: {
      bg: "bg-fluency-gray-100 dark:bg-fluency-gray-700",
      text: "text-fluency-gray-800 dark:text-fluency-gray-300",
      label: "Cancelada",
      icon: <FiX className="mr-1 w-4 h-4" />,
    },
  };

  // Get config or fallback to default
  const config = badgeConfig[status] || {
    bg: "bg-fluency-gray-100 dark:bg-fluency-gray-700",
    text: "text-fluency-gray-800 dark:text-fluency-gray-300",
    label: status || "Desconhecido",
    icon: <FiAlertCircle className="mr-1 w-4 h-4" />,
  };

  return (
    <div
      className={`inline-flex items-center px-2.5 py-2 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

// DateCard
const DateCard = ({
  date,
  slotsCount,
  isSelected,
  onSelect,
}: {
  date: string;
  slotsCount: number;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const formatDateDisplay = (dateString: string) => {
    try {
      const dateObj = new Date(dateString + "T12:00:00Z");
      return {
        weekday: dateObj
          .toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" })
          .replace(".", "")
          .toUpperCase(),
        day: dateObj.getUTCDate(),
        month: dateObj
          .toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" })
          .replace(".", "")
          .toUpperCase(),
        fullDate: dateString,
      };
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return { weekday: "---", day: "--", month: "---", fullDate: dateString };
    }
  };

  const dateInfo = formatDateDisplay(date);

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <button
        onClick={onSelect}
        className={`
          w-full text-left rounded-xl transition-all duration-200 overflow-hidden
          border 
          ${
            isSelected
              ? "bg-fluency-blue-50 dark:bg-fluency-blue-900/30 border-fluency-blue-500 dark:border-fluency-blue-400 shadow-lg ring-2 ring-fluency-blue-200 dark:ring-fluency-blue-800/50"
              : "border-fluency-gray-300 dark:border-fluency-gray-600 bg-fluency-gray-50 dark:bg-fluency-gray-800 hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700"
          }
          focus:outline-none focus:ring-2 focus:ring-fluency-blue-500 focus:ring-offset-2 dark:focus:ring-offset-fluency-pages-dark
        `}
      >
        <div
          className={`py-1 px-2 text-center font-medium text-sm ${
            isSelected
              ? "bg-fluency-blue-500 text-white"
              : "bg-fluency-gray-200 dark:bg-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
          }`}
        >
          {dateInfo.weekday}
        </div>
        <div className="p-2">
          <div className="text-center">
            <div className="text-xl font-bold text-fluency-blue-600 dark:text-fluency-blue-300">
              {dateInfo.day}
            </div>
            <div className="text-xs uppercase tracking-wide text-fluency-text-light dark:text-fluency-text-dark mt-1">
              {dateInfo.month}
            </div>
          </div>
          <div className="mt-2 text-center pb-2">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                isSelected
                  ? "bg-fluency-blue-100 dark:bg-fluency-blue-900/40 text-fluency-blue-800 dark:text-fluency-blue-200"
                  : "bg-fluency-gray-100 dark:bg-fluency-gray-700 text-fluency-text-secondary dark:text-fluency-text-dark-secondary"
              }`}
            >
              <FiClock className="mr-1 w-3 h-3" />
              {slotsCount} horário{slotsCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

// TimeSlotButton
const TimeSlotButton = ({
  slot,
  isSelected,
  onSelect,
}: {
  slot: { startTime: string; endTime: string; id: string };
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className="w-full"
  >
    <button
      onClick={onSelect}
      className={`
        w-full text-left p-2 rounded-lg transition-all duration-200
        border 
        ${
          isSelected
            ? "bg-fluency-blue-50 dark:bg-fluency-blue-900/30 border-fluency-blue-500 dark:border-fluency-blue-400 shadow-md ring-2 ring-fluency-blue-200 dark:ring-fluency-blue-800/50"
            : "border-fluency-gray-300 dark:border-fluency-gray-600 bg-fluency-gray-50 dark:bg-fluency-gray-800 hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700"
        }
        focus:outline-none focus:ring-2 focus:ring-fluency-blue-500 focus:ring-offset-2 dark:focus:ring-offset-fluency-pages-dark
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
            isSelected
              ? "bg-fluency-blue-500 text-white"
              : "bg-fluency-gray-200 dark:bg-fluency-gray-700 text-fluency-gray-700 dark:text-fluency-gray-300"
          }`}
        >
          <FiClock className="w-4 h-4" />
        </div>
        <div>
          <p
            className={`font-medium text-sm transition-colors ${
              isSelected
                ? "text-fluency-blue-700 dark:text-fluency-blue-200"
                : "text-fluency-text-light dark:text-fluency-text-dark"
            }`}
          >
            {slot.startTime} - {slot.endTime}
          </p>
          <p
            className={`text-xs mt-0.5 transition-colors ${
              isSelected
                ? "text-fluency-blue-600 dark:text-fluency-blue-300"
                : "text-fluency-text-secondary dark:text-fluency-text-dark-secondary"
            }`}
          >
            50 min
          </p>
        </div>
      </div>
    </button>
  </motion.div>
);

// HistoryItem
const HistoryItem = ({
  rescheduling,
  cancellingId,
  submitting,
  onCancel,
}: {
  rescheduling: RescheduledClass;
  cancellingId: string | null;
  submitting: boolean;
  onCancel: (rescheduling: RescheduledClass) => void;
}) => (
  <motion.div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border-b border-fluency-gray-200 dark:border-fluency-gray-700 hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800/50 transition-colors">
    <div className="md:col-span-1">
      <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark md:hidden">
        Data Original
      </p>
      <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
        {new Date(rescheduling.originalDate + "T12:00:00Z").toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }
        )}
      </p>
    </div>
    <div className="md:col-span-1">
      <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark md:hidden">
        Nova Data
      </p>
      <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
        {new Date(rescheduling.newDate + "T12:00:00Z").toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }
        )}
      </p>
    </div>
    <div className="md:col-span-1">
      <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark md:hidden">
        Novo Horário
      </p>
      <p className="text-sm text-fluency-text-light dark:text-fluency-text-dark">
        {rescheduling.newTime}
      </p>
    </div>
    <div className="md:col-span-1">
      <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark md:hidden">
        Status
      </p>
      <StatusBadge status={rescheduling.status} />
    </div>
    <div className="md:col-span-1 flex justify-start md:justify-end items-center">
      {rescheduling.status === "confirmed" && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={() => onCancel(rescheduling)}
            disabled={cancellingId === rescheduling.id || submitting}
            title="Cancelar esta remarcação"
            className={`
              flex items-center justify-center p-2 rounded-lg text-sm
              ${
                cancellingId === rescheduling.id || submitting
                  ? "bg-fluency-red-300 dark:bg-fluency-red-700 cursor-not-allowed"
                  : "bg-fluency-red-500 hover:bg-fluency-red-600 dark:hover:bg-fluency-red-700"
              }
              text-white transition-colors
            `}
          >
            {cancellingId === rescheduling.id ? (
              <FiLoader className="animate-spin w-4 h-4" />
            ) : (
              <FiTrash2 className="w-4 h-4" />
            )}
            <span className="ml-1.5 md:hidden">Cancelar</span>
          </button>
        </motion.div>
      )}
    </div>
  </motion.div>
);

// ClassSelectionStep
const ClassSelectionStep = ({
  eligibleClasses,
  onClassSelect,
  loading,
  selectedClass,
}: {
  eligibleClasses: ClassDate[];
  onClassSelect: (classDate: ClassDate | null) => void;
  loading: boolean;
  selectedClass: ClassDate | null;
}) => {
  if (loading) {
    return <SpinningLoader />;
  }
  if (!eligibleClasses || eligibleClasses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-fluency-orange-50 dark:bg-fluency-gray-800 border-l-4 border-fluency-orange-400 p-4 rounded-lg text-center my-6"
      >
        <FiInfo className="w-8 h-8 text-fluency-orange-500 mx-auto mb-3" />
        <p className="text-fluency-text-light dark:text-fluency-text-dark">
          Não há aulas com status "À Fazer" disponíveis para remarcação no
          momento.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerChildren}>
      <h3 className="font-medium text-lg text-fluency-text-light dark:text-fluency-text-dark mb-4">
        1. Selecione a aula que deseja remarcar
      </h3>
      <div className="flex flex-col items-center space-y-3 max-h-70 overflow-y-auto py-1 px-2 custom-scrollbar">
        {(selectedClass ? [selectedClass] : eligibleClasses).map(
          (classDate) => {
            const isSelected =
              selectedClass?.date.toISOString() ===
              classDate.date.toISOString();
            return (
              <motion.div
                key={classDate.date.toISOString()}
                variants={fadeIn}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="min-w-full"
              >
                <button
                  onClick={() => onClassSelect(isSelected ? null : classDate)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex justify-between items-center ${
                    isSelected
                      ? "bg-fluency-blue-50 dark:bg-fluency-blue-900/40 border-fluency-blue-400 dark:border-fluency-blue-500 ring-1 ring-fluency-blue-300 dark:ring-fluency-blue-700"
                      : "bg-fluency-gray-50 dark:bg-fluency-gray-800 border-fluency-gray-300 dark:border-fluency-gray-600 hover:bg-fluency-blue-50 dark:hover:bg-fluency-blue-900/30 hover:border-fluency-blue-300 dark:hover:border-fluency-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-fluency-blue-500 focus:ring-offset-1 dark:focus:ring-offset-fluency-pages-dark`}
                >
                  <span
                    className={`font-medium ${
                      isSelected
                        ? "text-fluency-blue-800 dark:text-fluency-blue-100"
                        : "text-fluency-text-light dark:text-fluency-text-dark"
                    }`}
                  >
                    {classDate.date.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                  {isSelected && (
                    <FiCheckCircle className="w-5 h-5 text-fluency-blue-500 dark:text-fluency-blue-400 flex-shrink-0" />
                  )}
                </button>
              </motion.div>
            );
          }
        )}
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
const StudentReschedulingPage = () => {
  // To make the second part of rescheduling appear after selecting a class
  const [selectedClassToReschedule, setSelectedClassToReschedule] =
    useState<ClassDate | null>(null);

  // Hook data
  const {
    loading,
    submitting,
    cancellingId,
    professor,
    originalSchedule,
    processedSlots,
    reschedulingHistory,
    reschedulingCounts,
    submitRescheduling,
    cancelRescheduling,
    sendConfirmationEmail,
  } = useStudentReschedulingData(selectedClassToReschedule);

  const { data: session } = useSession();
  const studentId = session?.user.id;

  // State for rescheduling flow
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    startTime: string;
    endTime: string;
    id: string;
  } | null>(null);

  // Modal states
  useState<RescheduledClass | null>(null);
  const [showRescheduleBottomSheet, setShowRescheduleBottomSheet] =
    useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHistoryBottomSheet, setShowHistoryBottomSheet] = useState(false);
  const [showRescheduleConfirmation, setShowRescheduleConfirmation] =
    useState(false);
  const [cancelReschedule, setCancelReschedule] =
    useState<RescheduledClass | null>(null);

  // For fetching and selecting the class to reschedule
  const [eligibleClasses, setEligibleClasses] = useState<ClassDate[]>([]);
  const [fetchingClasses, setFetchingClasses] = useState(true);

  // Fetch eligible classes ('À Fazer')
  const fetchEligibleClasses = useCallback(async () => {
    if (!studentId) return;
    setFetchingClasses(true);
    try {
      const userRef = doc(db, `users/${studentId}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const classesData = userData.Classes || {};
        const fetchedClassDates: ClassDate[] = [];

        // Get current year and month (local time)
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth(); // 0-indexed (0=Jan, 1=Feb, ...)

        const monthMapPT: Record<string, string> = {
          January: "01",
          February: "02",
          March: "03",
          April: "04",
          May: "05",
          June: "06",
          July: "07",
          August: "08",
          September: "09",
          October: "10",
          Novembe: "11",
          December: "12",
        };

        // Iterate only through the current year's data if it exists
        if (classesData[currentYear]) {
          for (const monthKeyPT of Object.keys(classesData[currentYear])) {
            const monthNumber = monthMapPT[monthKeyPT];
            if (!monthNumber) continue;

            // Check if the month from Firestore matches the current month (using 0-indexed comparison)
            if (parseInt(monthNumber, 10) - 1 === currentMonthIndex) {
              for (const dayKey of Object.keys(
                classesData[currentYear][monthKeyPT]
              )) {
                const status = classesData[currentYear][monthKeyPT][dayKey];

                // Check status AND ensure date is valid and in the current month/year
                if (status === "À Fazer") {
                  try {
                    const dateString = `${currentYear}-${monthNumber}-${dayKey.padStart(
                      2,
                      "0"
                    )}`;
                    const date = new Date(dateString + "T00:00:00Z"); // Interpret as UTC

                    // Double-check validity and month/year match (using UTC methods)
                    if (
                      !isNaN(date.getTime()) &&
                      date.getUTCFullYear() === currentYear &&
                      date.getUTCMonth() === currentMonthIndex
                    ) {
                      fetchedClassDates.push({ date, status });
                    }
                  } catch (e) {
                    console.error(
                      `Error parsing date: ${currentYear}-${monthKeyPT}-${dayKey}`,
                      e
                    );
                  }
                }
              }
            }
          }
        }

        // Sort the filtered classes by date
        fetchedClassDates.sort((a, b) => a.date.getTime() - b.date.getTime());
        setEligibleClasses(fetchedClassDates);
      } else {
        setEligibleClasses([]);
      }
    } catch (error) {
      console.error("Error fetching eligible classes: ", error);
      toast.error("Erro ao buscar aulas disponíveis para remarcação.");
      setEligibleClasses([]);
    } finally {
      setFetchingClasses(false);
    }
  }, [studentId]);

  // Fetch classes when studentId is available
  useEffect(() => {
    if (studentId) {
      fetchEligibleClasses();
    }
  }, [studentId, fetchEligibleClasses]);

  // Reset selection when bottom sheet closes
  useEffect(() => {
    if (!showRescheduleBottomSheet) {
      setSelectedClassToReschedule(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  }, [showRescheduleBottomSheet]);

  // --- Event Handlers ---

  // Handler to open the bottom sheet
  const handleOpenRescheduleSheet = () => {
    fetchEligibleClasses();
    if (eligibleClasses.length === 0 && !fetchingClasses) {
      toast("Não há aulas com status 'À Fazer' para remarcar.", {
        icon: <FiInfo />,
      });
      return;
    }
    setShowRescheduleBottomSheet(true);
  };

  // Handler to open the history bottom sheet
  const handleOpenHistorySheet = () => {
    if (reschedulingHistory.length === 0) {
      toast("Você ainda não tem histórico de remarcações.", {
        icon: <FiInfo />,
      });
      return;
    }
    setShowHistoryBottomSheet(true);
  };

  // Handler for selecting the class to reschedule
  const handleClassSelect = (classDate: ClassDate | null) => {
    setSelectedClassToReschedule(classDate);
    if (classDate) {
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  };

  // handleDateSelect
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  // handleTimeSlotSelect
  const handleTimeSlotSelect = (slot: {
    startTime: string;
    endTime: string;
    id: string;
  }) => {
    setSelectedTimeSlot(slot);
  };

  // handleConfirmRescheduleClick
  const handleConfirmRescheduleClick = () => {
    if (!selectedClassToReschedule) {
      // Check if class is selected first
      toast.error("Por favor, selecione a aula que deseja remarcar.");
      return;
    }
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Por favor, selecione uma nova data e horário.");
      return;
    }
    // Check limits before showing confirmation
    if (
      reschedulingCounts.weekly >=
      (professor?.reschedulingRules.maxReschedulesPerWeek ?? 1)
    ) {
      toast.error(`Limite semanal atingido.`);
      return;
    }
    if (
      reschedulingCounts.monthly >=
      (professor?.reschedulingRules.maxReschedulesPerMonth ?? 2)
    ) {
      toast.error(`Limite mensal atingido.`);
      return;
    }
    setShowRescheduleConfirmation(true);
  };

  // handleConfirmReschedule
  const handleConfirmReschedule = async () => {
    if (!selectedClassToReschedule || !selectedDate || !selectedTimeSlot) {
      toast.error("Seleção incompleta para remarcação.");
      setShowRescheduleConfirmation(false);
      return;
    }

    const success = await submitRescheduling(
      selectedClassToReschedule,
      selectedDate,
      selectedTimeSlot
    );

    setShowRescheduleConfirmation(false); // Close modal

    if (success) {
      const originallySelectedClassDate = selectedClassToReschedule.date;
      // Reset state
      setSelectedClassToReschedule(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setShowRescheduleBottomSheet(false);

      // Update eligible classes list locally or refetch
      setEligibleClasses((prev) =>
        prev.filter(
          (c) => c.date.getTime() !== originallySelectedClassDate.getTime()
        )
      );

      const studentName = session?.user.name;
      const studentMail = session?.user.email;
      const professorEmail = professor?.email;

      if (
        studentName &&
        professorEmail &&
        studentMail &&
        sendConfirmationEmail
      ) {
        const originalClassDateStr =
          originallySelectedClassDate.toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          });
        const selectedDateStr = new Date(
          selectedDate + "T00:00:00Z"
        ).toLocaleDateString("pt-BR", { timeZone: "UTC" });
        sendConfirmationEmail({
          studentName,
          professorEmail,
          studentMail,
          originalClassDateStr,
          selectedDate: selectedDateStr,
          selectedTimeSlot,
          templateType: "studentClassConfirmation",
        });
        sendConfirmationEmail({
          studentName,
          professorEmail,
          studentMail,
          originalClassDateStr,
          selectedDate: selectedDateStr,
          selectedTimeSlot,
          templateType: "professorClassConfirmation",
        });
      } else {
        console.warn("Dados incompletos para envio de e-mail de confirmação.");
        toast.error("Remarcação concluída, mas falha ao enviar e-mails.");
      }
    } else {
      fetchEligibleClasses(); // Refetch on failure might be useful
    }
  };

  // handleCancelClick
  const handleCancelClick = (rescheduling: RescheduledClass) => {
    setCancelReschedule(rescheduling);
    setShowCancelModal(true);
  };

  // handleConfirmCancel
  const handleConfirmCancel = async () => {
    if (!cancelReschedule) {
      toast.error("Nenhuma remarcação selecionada para cancelamento.");
      return;
    }

    const success = await cancelRescheduling(cancelReschedule.id!);
    if (success) {
      setCancelReschedule(null);
      setShowCancelModal(false);

      const studentName = session?.user.name;
      const studentMail = session?.user.email;
      const professorId = session?.user.professorId;

      let professorEmail: string | null = null;

      if (professorId) {
        try {
          const docRef = doc(db, "users", professorId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            professorEmail = data.email ?? null;
          } else {
            console.warn("Professor não encontrado com ID:", professorId);
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
          selectedDate: new Date(
            cancelReschedule.newDate + "T12:00:00Z"
          ).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }),
          selectedTimeSlot: {
            startTime: cancelReschedule.newTime,
          },
          templateType: "classCanceledByStudent",
        });
        console.log("Cancelamento enviado para professor!");
        console.log("Cancelamento enviado");
      } else {
        console.warn("Dados incompletos para envio de e-mail.");
      }
    }
  };

  if (!professor) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <SpinningLoader />
      </div>
    );
  }

  const tourSteps = [
    {
      target: ".tour-professor-info",
      title: "Informações do Professor",
      content:
        "Aqui você encontra detalhes sobre seu professor, horários regulares e regras de remarcação.",
      placement: "right" as const,
      disableBeacon: true,
    },
    {
      target: ".tour-rescheduling-status",
      title: "Status de Remarcações",
      content:
        "Acompanhe quantas remarcações você já fez nesta semana e neste mês.",
      placement: "left" as const,
    },
    {
      target: ".tour-reschedule-button",
      title: "Remarcar Aula",
      content: "Clique aqui para iniciar o processo de remarcação da sua aula.",
      placement: "top" as const,
    },
    {
      target: ".tour-history-button",
      title: "Histórico de Remarcações",
      content: "Veja aqui seu histórico completo de aulas remarcadas.",
      placement: "top" as const,
    },
  ];

  const getOriginalClassInfo =
    originalSchedule.diaAula && originalSchedule.horario
      ? originalSchedule.diaAula
          .map(
            (day, index) =>
              `${day} às ${originalSchedule.horario?.[index] || "N/A"}`
          )
          .join("\n")
          .split("\n")
          .map((item, index) => (
            <React.Fragment key={index}>
              {item}
              <br />
            </React.Fragment>
          ))
      : "Horário de aula não definido";

  const canRescheduleBasedOnLimits =
    reschedulingCounts.weekly <
      professor.reschedulingRules.maxReschedulesPerWeek &&
    reschedulingCounts.monthly <
      professor.reschedulingRules.maxReschedulesPerMonth;
  const hasEligibleClasses = eligibleClasses.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full p-4 min-h-[80vh] overflow-y-auto space-y-3 max-w-7xl mx-auto "
    >
      <Tour
        steps={tourSteps}
        pageKey="rescheduling"
        userId={session?.user.id || undefined}
        delay={1000}
        onTourEnd={() => console.log("Rescheduling tour completed")}
      />

      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start w-full gap-3">
        <div className="flex flex-col gap-3 w-full ">
          <motion.div
            variants={fadeIn}
            className="flex flex-col gap-3 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-5 shadow-lg"
          >
            <h2 className="text-xl font-bold text-fluency-orange-800 dark:text-fluency-orange-200 flex items-center gap-2">
              <CalendarSync className="w-5 h-5" />
              Ações
            </h2>
            <div className="flex flex-row gap-3">
              <motion.button
                variants={scaleUp}
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                onClick={handleOpenRescheduleSheet}
                disabled={
                  !canRescheduleBasedOnLimits ||
                  !hasEligibleClasses ||
                  submitting ||
                  cancellingId !== null
                }
                className="w-full flex flex-row items-center justify-center gap-2 p-4 font-semibold rounded-lg bg-fluency-orange-100 dark:bg-fluency-orange-900/20 border border-fluency-orange-200 dark:border-fluency-orange-800/50"
              >
                <CalendarPlus className="w-5 h-5" />
                {!canRescheduleBasedOnLimits
                  ? "Limite de remarcações atingido"
                  : !hasEligibleClasses
                  ? "Nenhuma aula 'À Fazer' disponível"
                  : "Remarcar uma aula"}
              </motion.button>

              <motion.button
                variants={scaleUp}
                whileHover={{
                  scale: 1.02,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
                onClick={handleOpenHistorySheet}
                className="w-full flex flex-row items-center justify-center gap-2 p-4 font-semibold rounded-lg bg-fluency-orange-100 dark:bg-fluency-orange-900/20 border border-fluency-orange-200 dark:border-fluency-orange-800/50"
              >
                <CalendarClock className="w-5 h-5" /> Ver histórico
              </motion.button>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3">
            {/* Rescheduling Status */}
            <motion.div
              variants={fadeIn}
              className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-5 shadow-lg tour-rescheduling-status"
            >
              <h2 className="text-xl font-bold text-fluency-green-800 dark:text-fluency-green-200 mb-5 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Status de Remarcações
              </h2>

              <div className="flex flex-col gap-4">
                <motion.div
                  variants={scaleUp}
                  className={`p-4 rounded-lg shadow-md w-full ${
                    reschedulingCounts.weekly >=
                    professor.reschedulingRules.maxReschedulesPerWeek
                      ? "bg-fluency-red-100 dark:bg-fluency-red-900"
                      : "bg-fluency-green-100 dark:bg-fluency-green-900"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {reschedulingCounts.weekly >=
                    professor.reschedulingRules.maxReschedulesPerWeek ? (
                      <div className="bg-fluency-red-200 dark:bg-fluency-red-900/50 p-1.5 rounded-full">
                        <FiX className="w-4 h-4 text-fluency-red-700 dark:text-fluency-red-300" />
                      </div>
                    ) : (
                      <div className="bg-fluency-green-200 dark:bg-fluency-green-900/50 p-1.5 rounded-full">
                        <FiCheck className="w-4 h-4 text-fluency-green-700 dark:text-fluency-green-300" />
                      </div>
                    )}
                    <span className="font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                      Semanal
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark">
                      {reschedulingCounts.weekly}
                    </span>
                    <span className="text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                      / {professor.reschedulingRules.maxReschedulesPerWeek}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  variants={scaleUp}
                  className={`p-4 rounded-lg shadow-md w-full ${
                    reschedulingCounts.monthly >=
                    professor.reschedulingRules.maxReschedulesPerMonth
                      ? "bg-fluency-red-100 dark:bg-fluency-red-900"
                      : "bg-fluency-green-100 dark:bg-fluency-green-900"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {reschedulingCounts.monthly >=
                    professor.reschedulingRules.maxReschedulesPerMonth ? (
                      <div className="bg-fluency-red-200 dark:bg-fluency-red-900/50 p-1.5 rounded-full">
                        <FiX className="w-4 h-4 text-fluency-red-700 dark:text-fluency-red-300" />
                      </div>
                    ) : (
                      <div className="bg-fluency-green-200 dark:bg-fluency-green-900/50 p-1.5 rounded-full">
                        <FiCheck className="w-4 h-4 text-fluency-green-700 dark:text-fluency-green-300" />
                      </div>
                    )}
                    <span className="font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                      Mensal
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark">
                      {reschedulingCounts.monthly}
                    </span>
                    <span className="text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                      / {professor.reschedulingRules.maxReschedulesPerMonth}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Professor Information */}
        <motion.div
          variants={fadeIn}
          className="w-full rounded-lg p-5 shadow-lg bg-fluency-pages-light dark:bg-fluency-pages-dark tour-professor-info"
        >
          <h2 className="text-xl font-bold text-fluency-blue-800 dark:text-fluency-blue-200 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5" />
            Informações da Aula
          </h2>

          <div className="flex flex-col gap-3 mb-4">
            <div className="bg-fluency-blue-100 dark:bg-fluency-blue-900/20 p-4 rounded-lg flex items-start gap-3 shadow">
              <div className="bg-fluency-blue-100 dark:bg-fluency-blue-900/20 p-2 rounded-full">
                <FiUser className="w-5 h-5 text-fluency-blue-600 dark:text-fluency-blue-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-fluency-blue-800 dark:text-fluency-blue-200">
                  Professor
                </p>
                <p className="font-medium text-lg text-fluency-text-light dark:text-fluency-text-dark">
                  {professor.name}
                </p>
              </div>
            </div>

            <div className="bg-fluency-blue-100 dark:bg-fluency-blue-900/20 p-4 rounded-lg flex items-start gap-3 shadow">
              <div className="bg-fluency-blue-100 dark:bg-fluency-blue-900/20 p-2 rounded-full">
                <FiClock className="w-5 h-5 text-fluency-blue-600 dark:text-fluency-blue-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-fluency-blue-800 dark:text-fluency-blue-200">
                  Horário(s) regular(es)
                </p>
                <p className="font-medium text-md text-fluency-text-light dark:text-fluency-text-dark">
                  {getOriginalClassInfo}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-fluency-blue-100 dark:bg-fluency-blue-900/20 p-4 rounded-lg border border-fluency-blue-200 dark:border-fluency-blue-800/50">
            <div className="flex items-start gap-4">
              <div className="bg-fluency-blue-200 dark:bg-fluency-blue-900/30 p-2 rounded-full flex-shrink-0 mt-1">
                <FiInfo className="w-5 h-5 text-fluency-blue-700 dark:text-fluency-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-fluency-blue-800 dark:text-fluency-blue-200 mb-2">
                  Regras de Remarcação
                </h3>
                <ul className="space-y-2 text-fluency-text-light dark:text-fluency-text-dark">
                  <li className="flex gap-3 items-center">
                    <div className="bg-fluency-blue-200 dark:bg-fluency-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span>
                      Antecedência mínima:{" "}
                      <strong className="text-fluency-blue-700 dark:text-fluency-blue-300">
                        {professor.reschedulingRules.minAdvanceHours} horas
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap=3 items-center">
                    <div className="bg-fluency-blue-200 dark:bg-fluency-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span>
                      Máximo de remarcações por semana:{" "}
                      <strong className="text-fluency-blue-700 dark:text-fluency-blue-300">
                        {professor.reschedulingRules.maxReschedulesPerWeek}
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <div className="bg-fluency-blue-200 dark:bg-fluency-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span>
                      Máximo de remarcações por mês:{" "}
                      <strong className="text-fluency-blue-700 dark:text-fluency-blue-300">
                        {professor.reschedulingRules.maxReschedulesPerMonth}
                      </strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* History BottomSheet */}
      <AnimatePresence>
        {showHistoryBottomSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowHistoryBottomSheet(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-t-2xl shadow-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-fluency-pages-light dark:bg-fluency-pages-dark py-4 px-6 border-b border-fluency-gray-200 dark:border-fluency-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-fluency-blue-800 dark:text-fluency-blue-200">
                  <FiClock className="inline mr-2 w-5 h-5" />
                  Histórico de Remarcações
                </h2>
                <button
                  onClick={() => setShowHistoryBottomSheet(false)}
                  className="text-fluency-gray-500 dark:text-fluency-gray-300 hover:text-fluency-gray-700 dark:hover:text-fluency-gray-100"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {reschedulingHistory.length === 0 ? (
                  <p className="text-fluency-text-secondary dark:text-fluency-text-dark-secondary text-center py-8">
                    Você ainda não remarcou nenhuma aula.
                  </p>
                ) : (
                  <div className="border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-lg overflow-hidden">
                    {/* Table Header - Hidden on mobile */}
                    <div className="hidden md:grid md:grid-cols-6 bg-fluency-gray-100 dark:bg-fluency-gray-800 px-5 py-3 text-sm text-fluency-text-light dark:text-fluency-text-dark font-semibold">
                      <div>Data Original</div>
                      <div>Nova Data</div>
                      <div>Novo Horário</div>
                      <div>Status</div>
                      <div className="text-right">Ações</div>
                    </div>

                    {/* History Items */}
                    <motion.div
                      variants={staggerChildren}
                      className="divide-y divide-fluency-gray-200 dark:divide-fluency-gray-700"
                    >
                      <AnimatePresence>
                        {reschedulingHistory.map((rescheduling) => (
                          <div key={rescheduling.id}>
                            <HistoryItem
                              rescheduling={rescheduling}
                              cancellingId={cancellingId}
                              submitting={submitting}
                              onCancel={handleCancelClick}
                            />
                          </div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Rescheduling Bottom Sheet --- */}
      <AnimatePresence>
        {showRescheduleBottomSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            aria-labelledby="reschedule-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 min-h-screen bg-black bg-opacity-50"
              onClick={() => setShowRescheduleBottomSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 w-full max-w-5xl bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-t-2xl shadow-lg max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-fluency-pages-light dark:bg-fluency-pages-dark py-4 px-6 border-b border-fluency-gray-200 dark:border-fluency-gray-700 flex justify-between items-center flex-shrink-0">
                <h2
                  id="reschedule-title"
                  className="text-xl font-bold text-fluency-blue-800 dark:text-fluency-blue-200 flex items-center gap-2"
                >
                  <FiCalendar className="w-5 h-5" />
                  Remarcar Aula
                </h2>
                <button
                  onClick={() => setShowRescheduleBottomSheet(false)}
                  className="text-fluency-gray-500 dark:text-fluency-gray-300 hover:text-fluency-gray-700 dark:hover:text-fluency-gray-100 p-1 rounded-full hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-700"
                  aria-label="Fechar"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-6 overflow-y-auto flex flex-col items-center">
                {/* Step 1: Select Class (NEW) */}
                <ClassSelectionStep
                  eligibleClasses={eligibleClasses}
                  onClassSelect={handleClassSelect}
                  loading={fetchingClasses}
                  selectedClass={selectedClassToReschedule}
                />

                {selectedClassToReschedule && (
                  <hr className="my-6 border-fluency-gray-200 dark:border-fluency-gray-700" />
                )}

                {/* Steps 2, 3, 4: Select Date/Time & Confirm (Conditional) */}
                <AnimatePresence>
                  {selectedClassToReschedule && (
                    <>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <SpinningLoader />
                        </div>
                      ) : processedSlots.length === 0 ? (
                        <div className="bg-fluency-orange-50 dark:bg-fluency-gray-800 border-l-4 border-fluency-orange-400 p-4 rounded-lg text-center">
                          <FiAlertCircle className="w-8 h-8 text-fluency-orange-500 mx-auto mb-3" />
                          <p className="text-fluency-text-light dark:text-fluency-text-dark">
                            Não há horários disponíveis para remarcação neste
                            período.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Step 2: Select a new date */}
                          <div>
                            <h3 className="font-medium text-lg text-fluency-text-light dark:text-fluency-text-dark mb-3">
                              2. Selecione uma nova data
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {processedSlots.map((dateSlot) => (
                                <DateCard
                                  key={dateSlot.date}
                                  date={dateSlot.date}
                                  slotsCount={dateSlot.slots.length}
                                  isSelected={selectedDate === dateSlot.date}
                                  onSelect={() =>
                                    handleDateSelect(dateSlot.date)
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          {/* Step 3: Select a new time */}
                          {selectedDate && (
                            <div>
                              <h3 className="font-medium text-lg text-fluency-text-light dark:text-fluency-text-dark mb-3 mt-6">
                                3. Selecione um novo horário
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {processedSlots
                                  .find((s) => s.date === selectedDate)
                                  ?.slots.map((slot) => (
                                    <TimeSlotButton
                                      key={slot.id}
                                      slot={slot}
                                      isSelected={
                                        selectedTimeSlot?.id === slot.id &&
                                        selectedDate ===
                                          processedSlots.find(
                                            (s) => s.date === selectedDate
                                          )?.date
                                      }
                                      onSelect={() =>
                                        handleTimeSlotSelect(slot)
                                      }
                                    />
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Step 4: Confirm reschedule */}
                          {selectedDate && selectedTimeSlot && (
                            <div className="pt-6 border-t border-fluency-gray-200 dark:border-fluency-gray-700 mt-6">
                              <h3 className="font-medium text-lg text-fluency-text-light dark:text-fluency-text-dark mb-3">
                                4. Confirme a remarcação
                              </h3>

                              <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 p-4 rounded-xl mb-5 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="p-3 bg-fluency-pages-light dark:bg-fluency-gray-700 rounded-lg">
                                    <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary mb-1">
                                      Aula Original
                                    </p>
                                    <p className="font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                                      {selectedClassToReschedule.date.toLocaleDateString(
                                        "pt-BR",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          timeZone: "UTC",
                                        }
                                      )}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-fluency-pages-light dark:bg-fluency-gray-700 rounded-lg">
                                    <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary mb-1">
                                      Nova Data
                                    </p>
                                    <p className="font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                                      {new Date(
                                        selectedDate + "T12:00:00Z"
                                      ).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        timeZone: "UTC",
                                      })}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-fluency-pages-light dark:bg-fluency-gray-700 rounded-lg">
                                    <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary mb-1">
                                      Novo Horário
                                    </p>
                                    <p className="font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                                      {selectedTimeSlot
                                        ? `${selectedTimeSlot.startTime} - ${selectedTimeSlot.endTime}`
                                        : "--:--"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <FluencyButton
                                onClick={handleConfirmRescheduleClick}
                                variant="confirm"
                                className="w-full px-4 py-3 text-lg"
                                disabled={submitting || cancellingId !== null}
                              >
                                {submitting ? (
                                  <span className="flex items-center justify-center">
                                    <FiLoader className="animate-spin w-5 h-5" />
                                    Processando...
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center">
                                    <FiCheck className="w-5 h-5" />
                                    Confirmar Remarcação
                                  </span>
                                )}
                              </FluencyButton>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showRescheduleConfirmation && selectedDate && selectedTimeSlot && (
          <ConfirmationModal
            isOpen={showRescheduleConfirmation}
            onClose={() => setShowRescheduleConfirmation(false)}
            onConfirm={handleConfirmReschedule}
            title="Confirmar Remarcação"
            message={`Você está prestes a remarcar sua aula para ${selectedDate} às ${selectedTimeSlot.startTime}. Deseja confirmar?`}
            confirmButtonText="Confirmar"
            confirmButtonVariant="success"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && cancelReschedule && (
          <ConfirmationModal
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setCancelReschedule(null);
            }}
            onConfirm={handleConfirmCancel}
            title="Cancelar Remarcação"
            message={`Tem certeza que deseja cancelar esta remarcação para ${cancelReschedule.newDate} às ${cancelReschedule.newTime}?`}
            confirmButtonText="Cancelar Remarcação"
            confirmButtonVariant="danger"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentReschedulingPage;
