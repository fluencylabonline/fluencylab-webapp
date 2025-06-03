"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  isBefore,
  isAfter,
  parseISO,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { useSession } from "next-auth/react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase"; // Ajuste o caminho conforme necessário
import SpinningLoader from "../../Animations/SpinningComponent";
import toast from "react-hot-toast";

// Interfaces
interface Rescheduling {
  id?: string;
  studentId: string;
  professorId: string;
  originalDate: string; // "YYYY-MM-DD"
  originalTime: string; // "HH:MM"
  newDate: string; // "YYYY-MM-DD"
  newTime: string; // "HH:MM - HH:MM"
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any; // Timestamp
}

interface StudentData {
  id: string;
  name: string;
  diaAula?: string[]; // Array of day names in Portuguese, e.g., ["Segunda", "Quarta"]
  horario?: string[]; // Array of time strings, e.g., ["10:00", "14:00"]
  professorId?: string;
  professorName?: string;
}

interface NextClassInfo {
  type: "regular" | "rescheduled";
  date: Date;
  formattedDate: string;
  time: string;
  dayName: string;
  isToday: boolean;
  isTomorrow: boolean;
  daysUntil: number;
  reschedulingId?: string;
}

// Day name to index mapping
const DAYS_OF_WEEK_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Helper to convert day name to its numerical index (0-6)
const dayNameToIndex = (dayName: string): number | null => {
  const normalizedDayName = dayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const index = DAYS_OF_WEEK_NAMES.findIndex(
    (dia) =>
      dia
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === normalizedDayName
  );
  return index >= 0 ? index : null;
};

// Helper to format date for display
const formatDateDisplay = (date: Date): string => {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
};

interface StudentNextClassCardProps {
  studentId?: string; // Optional: if not provided, will use current user's ID from session
  className?: string;
}

const StudentNextClassCard: React.FC<StudentNextClassCardProps> = ({
  studentId,
  className = "",
}) => {
  const { data: session, status: sessionStatus } = useSession();
  const [nextClass, setNextClass] = useState<NextClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [reschedulings, setReschedulings] = useState<Rescheduling[]>([]);
  const [professorName, setProfessorName] = useState<string>("");

  // Determine which student ID to use
  const effectiveStudentId = studentId || session?.user?.id;

  // Fetch student data and reschedulings from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!effectiveStudentId) {
        if (sessionStatus === "loading") {
          // Still loading session, wait
          return;
        } else {
          // Session loaded but no ID available
          setError("ID do aluno não disponível");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch student data
        const studentRef = doc(db, "users", effectiveStudentId);
        const studentDoc = await getDoc(studentRef);

        if (!studentDoc.exists()) {
          throw new Error("Dados do aluno não encontrados");
        }

        const data = studentDoc.data();
        const studentInfo: StudentData = {
          id: studentDoc.id,
          name: data.name || data.displayName || "Aluno",
          diaAula: data.diaAula || [],
          horario: data.horario || [],
          professorId: data.professorId,
        };

        setStudentData(studentInfo);

        // Initialize with empty array for reschedulings
        let fetchedReschedulings: Rescheduling[] = [];

        // 2. If professor ID exists, fetch professor name and reschedulings
        if (studentInfo.professorId) {
          const professorRef = doc(db, "users", studentInfo.professorId);
          const professorDoc = await getDoc(professorRef);

          if (professorDoc.exists()) {
            const professorData = professorDoc.data();
            setProfessorName(
              professorData.name || professorData.displayName || "Professor"
            );
          }

          // 3. Fetch reschedulings
          const reschedulingsQuery = query(
            collection(db, "reschedulings"),
            where("studentId", "==", effectiveStudentId),
            where("professorId", "==", studentInfo.professorId)
          );

          const reschedulingsSnapshot = await getDocs(reschedulingsQuery);

          reschedulingsSnapshot.forEach((doc) => {
            fetchedReschedulings.push({
              id: doc.id,
              ...doc.data(),
            } as Rescheduling);
          });
        }

        // Update state with fetched reschedulings
        setReschedulings(fetchedReschedulings);

        // Now calculate the next class with the fetched data
        calculateNextClass(studentInfo, fetchedReschedulings);
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error);
        setError(
          error instanceof Error ? error.message : "Erro ao buscar dados"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveStudentId, sessionStatus]);

  const calculateNextClass = (
    student: StudentData,
    reschedulingsList: Rescheduling[]
  ) => {
    try {
      // Validate student data
      if (!student) {
        throw new Error("Dados do aluno não disponíveis");
      }

      if (
        !student.diaAula ||
        !student.horario ||
        student.diaAula.length === 0 ||
        student.horario.length === 0
      ) {
        throw new Error("Horário de aula não definido para este aluno");
      }

      const now = new Date();
      const today = startOfDay(now);

      // 1. Calculate next regular class
      let nextRegularClass: NextClassInfo | null = null;
      let closestDate: Date | null = null;
      let closestTime: string = "";
      let closestDayIndex: number = -1;

      // Check each day in the student's schedule
      for (let i = 0; i < student.diaAula.length; i++) {
        const dayName = student.diaAula[i];
        const time = student.horario[i];
        const dayIndex = dayNameToIndex(dayName);

        if (dayIndex === null) {
          console.warn(`Dia inválido: ${dayName}`);
          continue;
        }

        // Calculate the next occurrence of this day
        const nextOccurrence = calculateNextDayOccurrence(now, dayIndex, time);

        // If this is the closest date so far, update our tracking variables
        if (!closestDate || isBefore(nextOccurrence, closestDate)) {
          closestDate = nextOccurrence;
          closestTime = time;
          closestDayIndex = dayIndex;
        }
      }

      // Create next regular class info if we found one
      if (closestDate && closestDayIndex >= 0) {
        nextRegularClass = {
          type: "regular",
          date: closestDate,
          formattedDate: formatDateDisplay(closestDate),
          time: closestTime,
          dayName: DAYS_OF_WEEK_NAMES[closestDayIndex],
          isToday: isSameDay(closestDate, now),
          isTomorrow: isSameDay(closestDate, addDays(today, 1)),
          daysUntil: calculateDaysUntil(now, closestDate),
        };
      }

      // 2. Find next confirmed rescheduling
      let nextRescheduledClass: NextClassInfo | null = null;

      if (reschedulingsList && reschedulingsList.length > 0) {
        const confirmedReschedulings = reschedulingsList
          .filter((r) => r.status === "confirmed")
          .map((r) => {
            // Parse the date and time
            const [startTime] = r.newTime.split(" - ");
            const [hours, minutes] = startTime.split(":").map(Number);

            const rescheduledDate = parseISO(r.newDate);
            rescheduledDate.setHours(hours, minutes, 0, 0);

            return {
              ...r,
              parsedDate: rescheduledDate,
            };
          })
          .filter((r) => isAfter(r.parsedDate, now)) // Only future reschedulings
          .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()); // Sort by date

        // If there are future reschedulings, get the closest one
        if (confirmedReschedulings.length > 0) {
          const nextRescheduling = confirmedReschedulings[0];
          const rescheduledDate = nextRescheduling.parsedDate;

          nextRescheduledClass = {
            type: "rescheduled",
            date: rescheduledDate,
            formattedDate: formatDateDisplay(rescheduledDate),
            time: nextRescheduling.newTime,
            dayName: DAYS_OF_WEEK_NAMES[rescheduledDate.getDay()],
            isToday: isSameDay(rescheduledDate, now),
            isTomorrow: isSameDay(rescheduledDate, addDays(today, 1)),
            daysUntil: calculateDaysUntil(now, rescheduledDate),
            reschedulingId: nextRescheduling.id,
          };
        }
      }

      // 3. Compare and choose the closest class (regular vs rescheduled)
      let nextClassInfo: NextClassInfo | null = null;

      if (nextRegularClass && nextRescheduledClass) {
        // Both exist, choose the one that's closer in time
        if (isBefore(nextRegularClass.date, nextRescheduledClass.date)) {
          nextClassInfo = nextRegularClass;
        } else {
          nextClassInfo = nextRescheduledClass;
        }
      } else if (nextRegularClass) {
        // Only regular class exists
        nextClassInfo = nextRegularClass;
      } else if (nextRescheduledClass) {
        // Only rescheduled class exists
        nextClassInfo = nextRescheduledClass;
      }

      // Update state with the calculated next class
      setNextClass(nextClassInfo);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao calcular próxima aula:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setLoading(false);
    }
  };

  // Helper to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Helper to calculate days until a date
  const calculateDaysUntil = (from: Date, to: Date): number => {
    const fromDate = startOfDay(from);
    const toDate = startOfDay(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to calculate the next occurrence of a specific day of the week
  const calculateNextDayOccurrence = (
    from: Date,
    dayIndex: number,
    timeStr: string
  ): Date => {
    const currentDayIndex = from.getDay();
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Create a date for today with the class time
    const todayWithClassTime = new Date(from);
    todayWithClassTime.setHours(hours, minutes, 0, 0);

    // If today is the target day and the class time hasn't passed yet
    if (currentDayIndex === dayIndex && isAfter(todayWithClassTime, from)) {
      return todayWithClassTime;
    }

    // Calculate days until the next occurrence
    const daysUntil = (dayIndex - currentDayIndex + 7) % 7;
    const nextOccurrence = addDays(from, daysUntil === 0 ? 7 : daysUntil); // If same day but time passed, go to next week
    nextOccurrence.setHours(hours, minutes, 0, 0);

    return nextOccurrence;
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    toast.promise(
      new Promise((resolve) => {
        if (studentData) {
          calculateNextClass(studentData, reschedulings);
          resolve(true);
        }
      }),
      {
        loading: 'Atualizando...',
        success: 'Atualizado com sucesso!',
        error: 'Erro ao atualizar',
      }
    );
    if (studentData) {
      calculateNextClass(studentData, reschedulings);
    } else if (effectiveStudentId) {
      // If we don't have student data yet, trigger the useEffect
      const fetchTrigger = async () => {
        const studentRef = doc(db, "users", effectiveStudentId);
        await getDoc(studentRef); // This is just to trigger the useEffect
      };
      fetchTrigger();
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div
        className={`bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-center py-4">
          <SpinningLoader />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center text-red-500 dark:text-red-400">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span>Erro: {error}</span>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-2 text-blue-500 dark:text-blue-400 flex items-center text-sm"
        >
          <FiRefreshCw className="w-4 h-4 mr-1" /> Tentar novamente
        </button>
      </div>
    );
  }

  // Render no class state
  if (!nextClass) {
    return (
      <div
        className={`bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 ${className}`}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Próxima Aula
        </h3>
        <div className="mt-2 text-gray-600 dark:text-gray-300">
          Nenhuma aula agendada encontrada.
        </div>
        <button
          onClick={handleRefresh}
          className="mt-2 text-blue-500 dark:text-blue-400 flex items-center text-sm"
        >
          <FiRefreshCw className="w-4 h-4 mr-1" /> Atualizar
        </button>
      </div>
    );
  }

  // Render next class info
  return (
    <div
      className={`bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-2 px-4 ${className}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Próxima Aula
        </h3>
        <button
          onClick={handleRefresh}
          className="text-blue-500 dark:text-blue-400"
          aria-label="Atualizar"
          title="Atualizar"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2">
        {nextClass.type === "rescheduled" && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 mb-2">
            Aula Remarcada
          </div>
        )}

        <div className="flex items-center text-gray-700 dark:text-gray-300 mb-1">
          <FiCalendar className="w-4 h-4 mr-2" />
          <span className="font-medium">
            {nextClass.isToday
              ? "Hoje"
              : nextClass.isTomorrow
              ? "Amanhã"
              : nextClass.formattedDate}
          </span>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <FiClock className="w-4 h-4 mr-2" />
          <span>{nextClass.time}</span>
        </div>

        {nextClass.daysUntil > 0 && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {nextClass.daysUntil === 1
              ? "Falta 1 dia"
              : `Faltam ${nextClass.daysUntil} dias`}
          </div>
        )}

        {nextClass.isToday && (
          <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
            Sua aula é hoje!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNextClassCard;
