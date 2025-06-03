// /home/ubuntu/src/app/professor/remarcacao/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // Import motion
import {
  FiSave,
  FiCalendar,
  FiSettings,
  FiUsers,
  FiGrid,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

// Import the custom hook and styled components
import { useProfessorData } from "@/app/hooks/useProfessorData";
import AvailableSlotsManager from "@/app/ui/Components/Calendar/components/AvailableSlotsManager";
import ReschedulingRulesManager from "@/app/ui/Components/Calendar/components/ReschedulingRulesManager";
import StudentScheduleManager from "@/app/ui/Components/Calendar/components/StudentScheduleManager";
import ProfessorCalendarView from "@/app/ui/Components/Calendar/components/ProfessorCalendarView";
import RescheduledClassesList from "@/app/ui/Components/Calendar/RescheduledClassesList";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";
import FluencyButton from "@/app/ui/Components/Button/button";

// =============== Animation Variants ===============
const pageFadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const contentFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

// Interfaces (Ensure consistency or move to shared types)
interface TimeSlot {
  id: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceEndDate?: string;
}

interface ReschedulingRules {
  minAdvanceHours: number;
  maxReschedulesPerWeek: number;
  maxReschedulesPerMonth: number;
}

interface EditableClassScheduleEntry {
  tempId: string;
  dayOfWeek: string;
  time: string;
}

const ProfessorReschedulingPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Use the custom hook
  const {
    loading,
    saving,
    availableSlots,
    setAvailableSlots,
    rules,
    setRules,
    students,
    rescheduledClasses,
    saveProfessorSettings,
    saveStudentSchedule,
    fetchData,
  } = useProfessorData();

  const [activeView, setActiveView] = useState<
    "slots" | "rules" | "students" | "calendar" | "reschedules"
  >("slots");

  // Use local state for unsaved changes to provide immediate feedback in components
  const [unsavedSlots, setUnsavedSlots] = useState<TimeSlot[]>([]);
  const [unsavedRules, setUnsavedRules] = useState<ReschedulingRules | null>(
    null
  );

  useEffect(() => {
    setUnsavedSlots(availableSlots);
  }, [availableSlots]);

  useEffect(() => {
    setUnsavedRules(rules);
  }, [rules]);

  // Check for teacher role
  useEffect(() => {
    if (session && session.user.role !== "teacher") {
      toast.error("Acesso restrito a professores");
      router.push("/");
    }
  }, [session, router]);

  const handleSaveChanges = async () => {
    if (!unsavedSlots || !unsavedRules) {
      toast.error("Erro: Dados de slots ou regras não estão prontos.");
      return;
    }
    await saveProfessorSettings(unsavedSlots, unsavedRules);
    // Hook should update the source data, which will flow back down
  };

  const handleSaveStudent = async (
    studentId: string,
    schedule: EditableClassScheduleEntry[]
  ) => {
    const diaAulaToSave = schedule.map((entry) => entry.dayOfWeek);
    const horarioToSave = schedule.map((entry) => entry.time);
    await saveStudentSchedule(studentId, diaAulaToSave, horarioToSave);
    // Hook updates the student list internally
  };

  // Render loading state with Fluency styling
  if (loading || !unsavedRules) {
    // Also wait for rules to be loaded
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
        <SpinningLoader />
      </div>
    );
  }

  // Main component render with Fluency styling and motion
  return (
    <motion.div
      variants={pageFadeIn}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 rounded-lg min-h-[calc(100vh-80px)]"
    >
      {/* Navigation Tabs - Styled */}
      <div className="flex justify-between border-b border-fluency-gray-200 dark:border-fluency-gray-700 mb-6">
        <div className="flex flex-wrap">
          {[
            // Array for easier mapping
            { key: "slots", label: "Horários Disponíveis", icon: FiCalendar },
            { key: "rules", label: "Regras", icon: FiSettings },
            { key: "students", label: "Alunos", icon: FiUsers },
            { key: "calendar", label: "Calendário", icon: FiGrid },
            {
              key: "reschedules",
              label: "Aulas Remarcadas",
              icon: FiAlertCircle,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`py-2 px-3 sm:px-4 -mb-px font-medium text-sm sm:text-base flex items-center border-b-2 transition-colors duration-150
              ${
                activeView === tab.key
                  ? "text-fluency-blue-600 dark:text-fluency-blue-400 border-fluency-blue-600 dark:border-fluency-blue-400"
                  : "text-fluency-gray-500 dark:text-fluency-gray-200 border-transparent hover:text-fluency-gray-700 dark:hover:text-fluency-gray-200 hover:border-fluency-gray-300 dark:hover:border-fluency-gray-600"
              }`}
              onClick={() => setActiveView(tab.key as any)}
            >
              <tab.icon className="inline mr-1.5 w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-2">
          <FluencyButton
            variant="glass"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <FiLoader className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <FiSave className="mr-2 h-4 w-4" />
            )}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </FluencyButton>
        </div>
      </div>

      {/* Content based on active tab - Animated */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView} // Key change triggers animation
            variants={contentFadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeView === "slots" && (
              <AvailableSlotsManager
                initialSlots={unsavedSlots}
                onSlotsChange={setUnsavedSlots}
              />
            )}

            {activeView === "rules" && unsavedRules && (
              <ReschedulingRulesManager
                initialRules={unsavedRules}
                onRulesChange={setUnsavedRules}
              />
            )}

            {activeView === "students" && (
              <StudentScheduleManager
                students={students}
                onSaveChanges={handleSaveStudent}
                saving={saving}
              />
            )}

            {activeView === "calendar" && <ProfessorCalendarView />}

            {activeView === "reschedules" && <RescheduledClassesList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfessorReschedulingPage;