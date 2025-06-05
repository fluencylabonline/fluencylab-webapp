//app/hooks/useStudentReschedulingData.ts (Updated)
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  writeBatch, // Import writeBatch
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import toast from "react-hot-toast";
import { format, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { Aluno, TimeSlot, ClassDate } from "../types"; // Assuming ClassDate is defined in types

interface ReschedulingRules {
  minAdvanceHours: number;
  maxReschedulesPerWeek: number;
  maxReschedulesPerMonth: number;
}

interface Professor {
  id: string;
  name: string;
  email?: string;
  availableSlots: TimeSlot[];
  reschedulingRules: ReschedulingRules;
}

interface Rescheduling {
  id?: string;
  studentId: string;
  studentName: string;
  professorId: string;
  originalDate: string; // Store as YYYY-MM-DD string
  originalTime: string; // Keep if needed
  newDate: string;
  newTime: string;
  status:
    | "pending"
    | "confirmed"
    | "cancelled_by_student"
    | "cancelled_by_teacher";
  createdAt: any;
  originalClassStatus?: string;

  newYear: number;
  newMonth: string;
  newDay: string;
}

// Month mapping (ensure consistency with how months are stored in Firestore)
const monthMap: Record<string, string> = {
  January: "January",
  February: "February",
  March: "March",
  April: "April",
  May: "May",
  June: "June",
  July: "July",
  August: "August",
  September: "September",
  October: "October",
  November: "November",
  December: "December",
};

// Helper to get Portuguese month name from Date object
const getPortugueseMonthName = (date: Date): string => {
  // Ensure UTC methods are used if dates are stored/handled as UTC
  const monthIndex = date.getUTCMonth();
  const englishMonth = Object.keys(monthMap)[monthIndex];
  return monthMap[englishMonth];
};

// --- Custom Hook ---
export const useStudentReschedulingData = (selectedClass: ClassDate | null) => {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  // --- State managed by the hook ---
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [originalSchedule, setOriginalSchedule] = useState<{
    diaAula?: string[];
    horario?: string[];
  }>({});
  const [processedSlots, setProcessedSlots] = useState<
    Array<{
      date: string;
      slots: { startTime: string; endTime: string; id: string }[];
    }>
  >([]);
  const [reschedulingHistory, setReschedulingHistory] = useState<
    Rescheduling[]
  >([]);
  const [reschedulingCounts, setReschedulingCounts] = useState({
    weekly: 0,
    monthly: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // --- Data Fetching Logic (remains the same) ---
  const fetchData = useCallback(async () => {
    if (!userId) {
      toast.error("ID do usuário não encontrado na sessão.");
      return;
    }

    setLoading(true);
    try {
      // Fetch student data
      const studentRef = doc(db, "users", userId);
      const studentDoc = await getDoc(studentRef);
      if (!studentDoc.exists()) {
        toast.error("Dados do aluno não encontrados.");
        setLoading(false);
        return;
      }
      const studentData = studentDoc.data() as Aluno;
      setOriginalSchedule({
        diaAula: studentData.diaAula || [],
        horario: studentData.horario || [],
      });

      const professorId = studentData.professorId;
      if (!professorId) {
        toast.error("Você não tem um professor associado.");
        setLoading(false);
        return;
      }

      // Fetch professor data
      const professorRef = doc(db, "users", professorId);
      const professorDoc = await getDoc(professorRef);
      if (!professorDoc.exists()) {
        toast.error("Dados do professor não encontrados.");
        setLoading(false);
        return;
      }
      const professorData = professorDoc.data();
      const fetchedProfessor: Professor = {
        id: professorId,
        name: professorData.name || professorData.displayName || "Professor",
        email: professorData.email,
        availableSlots: professorData.availableSlots || [],
        reschedulingRules: professorData.reschedulingRules || {
          minAdvanceHours: 24,
          maxReschedulesPerWeek: 1,
          maxReschedulesPerMonth: 2,
        },
      };
      setProfessor(fetchedProfessor);

      // Create reverse month mapping for Portuguese to English conversion
      const reverseMonthMap: Record<string, string> = {};
      Object.entries(monthMap).forEach(([english, portuguese]) => {
        reverseMonthMap[portuguese] = english;
      });

      // Fetch all occupied time slots
      const occupiedSlots = new Set<string>();

      // 1. Get confirmed reschedulings
      const reschedulingsQuery = query(
        collection(db, "reschedulings"),
        where("professorId", "==", professorId),
        where("status", "==", "confirmed")
      );
      const reschedulingsSnapshot = await getDocs(reschedulingsQuery);
      reschedulingsSnapshot.forEach((doc) => {
        const data = doc.data();
        occupiedSlots.add(`${data.newDate}_${data.newTime}`);
      });

      // 2. Get original scheduled classes from all students
      const studentsQuery = query(
        collection(db, "users"),
        where("professorId", "==", professorId),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);

      studentsSnapshot.forEach((studentDoc) => {
        const studentData = studentDoc.data() as Aluno;
        if (studentData.Classes) {
          Object.entries(studentData.Classes).forEach(([year, months]) => {
            Object.entries(months as Record<string, any>).forEach(
              ([monthPt, days]) => {
                const englishMonth = reverseMonthMap[monthPt];
                if (!englishMonth) return;

                const monthIndex = new Date(
                  `${englishMonth} 1, ${year}`
                ).getMonth();
                const monthNum = (monthIndex + 1).toString().padStart(2, "0");

                Object.entries(days).forEach(([day, status]) => {
                  if (status === "À Fazer" && studentData.horario) {
                    const dateStr = `${year}-${monthNum}-${day.padStart(
                      2,
                      "0"
                    )}`;
                    studentData.horario.forEach((time) => {
                      occupiedSlots.add(`${dateStr}_${time}`);
                    });
                  }
                });
              }
            );
          });
        }
      });

      // Process available slots with occupied filter
      processAvailableSlots(
        fetchedProfessor.availableSlots,
        fetchedProfessor.reschedulingRules.minAdvanceHours,
        occupiedSlots
      );

      // Fetch student's rescheduling history
      const studentReschedulingsQuery = query(
        collection(db, "reschedulings"),
        where("studentId", "==", userId),
        where("professorId", "==", professorId)
      );
      const studentReschedulingsSnapshot = await getDocs(
        studentReschedulingsQuery
      );
      const reschedulingsData: Rescheduling[] =
        studentReschedulingsSnapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Rescheduling)
          )
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : new Date(0);
            const dateB = b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

      setReschedulingHistory(reschedulingsData);
      calculateReschedulingCounts(reschedulingsData);
    } catch (error) {
      console.error("Erro ao carregar dados de remarcação:", error);
      toast.error("Falha ao carregar dados para remarcação.");
    } finally {
      setLoading(false);
    }
  }, [userId, session, selectedClass]);

  // Add this useEffect to trigger fetch when class changes:
  useEffect(() => {
    if (selectedClass) {
      fetchData();
    }
  }, [selectedClass, fetchData]);

  // --- Effect to run fetch data (remains the same) ---
  useEffect(() => {
    if (!session?.user) {
      toast.error("Acesso restrito a alunos autenticados");
      router.push("/");
      setLoading(false);
      return;
    }
    if (session?.user && userId) {
      fetchData();
    }
  }, [session, userId, fetchData, router, session?.user?.role]);

  // --- Helper Functions within the Hook Scope (remain the same) ---
  const processAvailableSlots = useCallback(
    (
      slots: TimeSlot[],
      minAdvanceHours: number,
      occupiedSlots: Set<string>
    ) => {
      if (!slots || slots.length === 0) {
        setProcessedSlots([]);
        return;
      }

      const now = new Date();
      const minDate = new Date(
        now.getTime() + minAdvanceHours * 60 * 60 * 1000
      );
      const dates: Array<{
        date: string;
        slots: { startTime: string; endTime: string; id: string }[];
      }> = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        if (date < minDate) continue;

        const dateString = format(date, "yyyy-MM-dd");
        const dayOfWeek = date.getDay();
        const availableSlotsForDate: {
          startTime: string;
          endTime: string;
          id: string;
        }[] = [];

        slots.forEach((slot) => {
          // Skip occupied slots
          const slotKey = `${dateString}_${slot.startTime}`;
          if (occupiedSlots.has(slotKey)) return;

          if (!slot.isRecurring && slot.date === dateString) {
            availableSlotsForDate.push({
              startTime: slot.startTime,
              endTime: slot.endTime,
              id: slot.id,
            });
          } else if (
            slot.isRecurring &&
            slot.dayOfWeek === dayOfWeek &&
            (!slot.recurrenceEndDate || dateString <= slot.recurrenceEndDate)
          ) {
            availableSlotsForDate.push({
              startTime: slot.startTime,
              endTime: slot.endTime,
              id: slot.id,
            });
          }
        });

        if (availableSlotsForDate.length > 0) {
          availableSlotsForDate.sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
          dates.push({ date: dateString, slots: availableSlotsForDate });
        }
      }
      setProcessedSlots(dates);
    },
    []
  );

  const calculateReschedulingCounts = useCallback((history: Rescheduling[]) => {
    // ... (calculateReschedulingCounts implementation as provided) ...
    const now = new Date();
    const startOfWeekDate = startOfWeek(now, { weekStartsOn: 0 });
    startOfWeekDate.setHours(0, 0, 0, 0);
    const startOfMonthDate = startOfMonth(now);

    const weekly = history.filter((r) => {
      if (r.status !== "confirmed" || !r.createdAt) return false;
      const createdAt = r.createdAt.toDate
        ? r.createdAt.toDate()
        : new Date(r.createdAt);
      return (
        isAfter(createdAt, startOfWeekDate) ||
        createdAt.getTime() === startOfWeekDate.getTime()
      );
    }).length;

    const monthly = history.filter((r) => {
      if (r.status !== "confirmed" || !r.createdAt) return false;
      const createdAt = r.createdAt.toDate
        ? r.createdAt.toDate()
        : new Date(r.createdAt);
      return (
        isAfter(createdAt, startOfMonthDate) ||
        createdAt.getTime() === startOfMonthDate.getTime()
      );
    }).length;

    setReschedulingCounts({ weekly, monthly });
  }, []);

  // --- Action Handlers ---

const submitRescheduling = useCallback(
  async (
    originalClass: ClassDate,
    selectedDate: string,
    selectedTimeSlot: { startTime: string; endTime: string; id: string }
  ) => {
    if (
      !userId ||
      !professor ||
      !originalClass ||
      !selectedDate ||
      !selectedTimeSlot
    ) {
      toast.error("Informações incompletas para remarcação.");
      return false;
    }

    // Get student name from session
    const studentName = session?.user?.name;
    if (!studentName) {
      toast.error("Nome do aluno não encontrado na sessão.");
      return false;
    }

    // Check rescheduling limits
    if (
      reschedulingCounts.weekly >=
      professor.reschedulingRules.maxReschedulesPerWeek
    ) {
      toast.error(
        `Limite semanal de ${professor.reschedulingRules.maxReschedulesPerWeek} remarcação(ões) atingido.`
      );
      return false;
    }
    if (
      reschedulingCounts.monthly >=
      professor.reschedulingRules.maxReschedulesPerMonth
    ) {
      toast.error(
        `Limite mensal de ${professor.reschedulingRules.maxReschedulesPerMonth} remarcação(ões) atingido.`
      );
      return false;
    }

    setSubmitting(true);
    const toastId = toast.loading("Processando remarcação...");

    try {
      const batch = writeBatch(db);
      
      // 1. Get student document reference
      const studentRef = doc(db, `users/${userId}`);
      const studentDoc = await getDoc(studentRef);
      const studentData = studentDoc.data() as Aluno;

      // 2. Update the original class to 'Cancelada'
      const originalDateObj = originalClass.date;
      const originalYear = originalDateObj.getUTCFullYear();
      const originalMonth = getPortugueseMonthName(originalDateObj);
      const originalDay = originalDateObj.getUTCDate().toString(); // Convert to string to match storage format

      if (!originalMonth) {
        throw new Error("Mês original inválido");
      }

      const originalStatus =
        studentData.Classes?.[originalYear]?.[originalMonth]?.[originalDay] || "À Fazer";
      
      // Update original class to 'Cancelada'
      batch.update(studentRef, {
        [`Classes.${originalYear}.${originalMonth}.${originalDay}`]: "Cancelada pelo Aluno",
      });

      // 3. Create new class entry with status 'Reagendada'
      const newDateObj = new Date(selectedDate);
      const newYear = newDateObj.getUTCFullYear();
      const newMonth = getPortugueseMonthName(newDateObj);
      const newDay = newDateObj.getUTCDate().toString(); // Convert to string to match storage format

      if (!newMonth) {
        throw new Error("Mês novo inválido");
      }

      // Add new class entry with status 'Reagendada'
      batch.update(studentRef, {
        [`Classes.${newYear}.${newMonth}.${newDay}`]: "Reagendada",
      });

      // 4. Format original date for storage (YYYY-MM-DD)
      const originalYearUTC = originalDateObj.getUTCFullYear();
      const originalMonthUTC = String(
        originalDateObj.getUTCMonth() + 1
      ).padStart(2, "0");
      const originalDayUTC = String(originalDateObj.getUTCDate()).padStart(
        2,
        "0"
      );
      const originalDateFormatted = `${originalYearUTC}-${originalMonthUTC}-${originalDayUTC}`;

      // 5. Create rescheduling record
      const reschedulingData: Omit<Rescheduling, "id" | "createdAt"> & {
        createdAt: any;
        studentName: string;
        originalClassStatus: string;
        newYear: number;
        newMonth: string;
        newDay: string;
      } = {
        studentId: userId,
        studentName: studentName,
        professorId: professor.id,
        originalDate: originalDateFormatted,
        originalTime: String(originalSchedule.horario).padStart(5, '0'), // Format to 00:00
        newDate: selectedDate,
        newTime: selectedTimeSlot.startTime.padStart(5, '0'), // Format to 00:00
        status: "confirmed",
        createdAt: serverTimestamp(),
        originalClassStatus: originalStatus,
        newYear,
        newMonth,
        newDay,
      };

      const newRescheduleRef = doc(collection(db, "reschedulings"));
      batch.set(newRescheduleRef, reschedulingData);

      // 6. Commit all changes in a single batch
      await batch.commit();

      // 7. Optimistic UI updates
      const newRescheduling: Rescheduling = {
        ...reschedulingData,
        id: newRescheduleRef.id,
        createdAt: new Date(),
      };
      const updatedHistory = [newRescheduling, ...reschedulingHistory];
      setReschedulingHistory(updatedHistory);
      calculateReschedulingCounts(updatedHistory);

      toast.success(
        "Aula remarcada com sucesso! A aula original foi cancelada e uma nova aula reagendada foi criada.",
        { id: toastId }
      );

      return true;
    } catch (error) {
      console.error("Erro ao remarcar aula:", error);
      toast.error(
        "Falha ao remarcar aula. Verifique o console para detalhes.",
        { id: toastId }
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  },
  [
    userId,
    professor,
    reschedulingHistory,
    reschedulingCounts,
    calculateReschedulingCounts,
    session?.user?.name,
  ]
);

  // cancelRescheduling remains the same
  const cancelRescheduling = useCallback(
  async (reschedulingId: string) => {
    if (!reschedulingId || !userId) {
      toast.error("ID de remarcação ou usuário inválido");
      return false;
    }

    setCancellingId(reschedulingId);
    const toastId = toast.loading("Cancelando remarcação...");

    try {
      // Find the rescheduling record
      const reschedulingRecord = reschedulingHistory.find(
        (r) => r.id === reschedulingId
      );

      if (!reschedulingRecord) {
        throw new Error("Registro de remarcação não encontrado");
      }

      // Ensure we have all required data
      if (
        !reschedulingRecord.originalDate ||
        !reschedulingRecord.originalClassStatus ||
        !reschedulingRecord.newYear ||
        !reschedulingRecord.newMonth ||
        !reschedulingRecord.newDay
      ) {
        throw new Error("Dados incompletos para cancelamento da remarcação");
      }

      const batch = writeBatch(db);
      const studentRef = doc(db, `users/${userId}`);

      // 1. Update rescheduling status to cancelled
      const reschedulingRef = doc(db, "reschedulings", reschedulingId);
      batch.update(reschedulingRef, { status: "cancelled_by_student" });

      // 2. Revert original class status
      const { originalDate, originalClassStatus } = reschedulingRecord;
      
      // Parse the originalDate (stored as YYYY-MM-DD)
      const [year, monthStr, dayStr] = originalDate.split("-");
      const monthIndex = parseInt(monthStr, 10) - 1; // Convert to 0-indexed month

      // Get Portuguese month name
      const englishMonths = Object.keys(monthMap);
      if (monthIndex < 0 || monthIndex >= englishMonths.length) {
        throw new Error(`Índice de mês inválido: ${monthIndex}`);
      }
      const englishMonth = englishMonths[monthIndex];
      const portugueseMonth = monthMap[englishMonth];

      // Remove leading zeros from day
      const day = parseInt(dayStr, 10).toString();

      // Revert original class status
      batch.update(studentRef, {
        [`Classes.${year}.${portugueseMonth}.${day}`]: originalClassStatus,
      });

      // 3. Delete the rescheduled class entry (Reagendada)
      const { newYear, newMonth, newDay } = reschedulingRecord;
      batch.update(studentRef, {
        [`Classes.${newYear}.${newMonth}.${newDay}`]: deleteField(),
      });

      await batch.commit();

      // Update UI state
      const updatedHistory = reschedulingHistory.map((r) =>
        r.id === reschedulingId ? { ...r, status: "cancelled_by_student" } : r
      ) as Rescheduling[];

      setReschedulingHistory(updatedHistory);
      calculateReschedulingCounts(updatedHistory);

      toast.success("Remarcação cancelada com sucesso! Aula original restaurada e aula reagendada removida.", {
        id: toastId,
      });
      return true;
    } catch (error) {
      console.error("Erro ao cancelar remarcação:", error);
      toast.error("Falha ao cancelar remarcação", { id: toastId });
      return false;
    } finally {
      setCancellingId(null);
    }
  },
  [reschedulingHistory, calculateReschedulingCounts, userId]
);
  // sendConfirmationEmail remains the same
  const sendConfirmationEmail = async ({
    studentName,
    professorEmail,
    studentMail,
    selectedDate,
    selectedTimeSlot,
    originalClassDateStr,
    templateType,
  }: {
    studentName: string;
    professorEmail: string;
    studentMail: string;
    selectedDate: any;
    selectedTimeSlot: any;
    originalClassDateStr?: string; // Optional: Pass original date to email
    templateType: string;
  }) => {
    // ... (sendConfirmationEmail implementation as provided) ...
    try {
      await toast.promise(
        fetch("/api/emails/receipts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName,
            professorEmail,
            studentMail,
            selectedDate,
            selectedTimeSlot,
            originalClassDateStr, // Pass it along
            templateType: templateType,
          }),
        }),
        {
          loading: "Enviando e-mail de confirmação",
          success: "E-mail enviado com sucesso!",
          error: "Erro ao enviar e-mail!",
        }
      );
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      toast.error("Erro ao enviar e-mail!", {
        position: "top-center",
      });
    }
  };

  // --- Return values from the hook ---
  return {
    loading,
    submitting,
    cancellingId,
    professor,
    originalSchedule, // Keep if needed elsewhere
    processedSlots,
    reschedulingHistory,
    reschedulingCounts,
    fetchData, // Keep if manual refetch is needed
    submitRescheduling, // Updated function
    cancelRescheduling,
    sendConfirmationEmail,
  };
};
