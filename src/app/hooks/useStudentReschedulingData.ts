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
} from "firebase/firestore";
import { db } from "@/app/firebase";
import toast from "react-hot-toast";
import { format, startOfWeek, startOfMonth, isAfter } from "date-fns";
import { Aluno, daysOfWeek, TimeSlot, ClassDate } from "../types"; // Assuming ClassDate is defined in types

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
  professorId: string;
  originalDate: string; // Store as YYYY-MM-DD string
  // originalTime: string; // Keep if needed
  newDate: string;
  newTime: string;
  status:
    | "pending"
    | "confirmed"
    | "cancelled_by_student"
    | "cancelled_by_teacher";
  createdAt: any;
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

const dayNameToIndex = (dayName: string): number | null => {
  const normalizedDayName = dayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const index = daysOfWeek.findIndex(
    (dia) =>
      dia
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === normalizedDayName
  );
  return index >= 0 ? index : null;
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

      processAvailableSlots(
        fetchedProfessor.availableSlots,
        fetchedProfessor.reschedulingRules.minAdvanceHours
      );

      const reschedulingsQuery = query(
        collection(db, "reschedulings"),
        where("studentId", "==", userId),
        where("professorId", "==", professorId)
      );

      const reschedulingsSnapshot = await getDocs(reschedulingsQuery);
      const reschedulingsData: Rescheduling[] = reschedulingsSnapshot.docs
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
    (slots: TimeSlot[], minAdvanceHours: number) => {
      // ... (processAvailableSlots implementation as provided) ...
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

  // MODIFIED: submitRescheduling now accepts originalClass
  const submitRescheduling = useCallback(
    async (
      originalClass: ClassDate, // The specific class being rescheduled
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
        return false; // Indicate failure
      }
      // Removed dependency on originalSchedule.diaAula/horario for original class info

      // Check rescheduling limits (remains the same)
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
        // Use a batch write for atomicity
        const batch = writeBatch(db);

        // --- 1. Update the status of the original class to 'Cancelada' ---
        const originalDateObj = originalClass.date; // Use the date object from originalClass
        const year = originalDateObj.getUTCFullYear();
        const month = getPortugueseMonthName(originalDateObj); // Get Portuguese month name
        const day = originalDateObj.getUTCDate();

        if (!month) {
          throw new Error(
            `Could not determine Portuguese month for date: ${originalDateObj.toISOString()}`
          );
        }

        // Path to the specific month document within the student's Classes
        const userDocRef = doc(db, `users/${userId}`);

        // Construção do path aninhado: Classes.2025.Março.10
        const updatePayload: { [key: string]: string } = {};
        updatePayload[`Classes.${year}.${month}.${day}`] = "Cancelada";

        batch.update(userDocRef, updatePayload);

        console.log(
          `Batch: Updating ${userId}/Classes/${year}/${month}.${day} to 'Cancelada'`
        );

        // --- 2. Add the new rescheduling record ---
        const originalYearUTC = originalDateObj.getUTCFullYear();
        const originalMonthUTC = String(originalDateObj.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const originalDayUTC = String(originalDateObj.getUTCDate()).padStart(2, '0');
        const originalDateFormatted = `${originalYearUTC}-${originalMonthUTC}-${originalDayUTC}`;
        

        const reschedulingData: Omit<Rescheduling, "id" | "createdAt"> & {
          createdAt: any;
        } = {
          studentId: userId,
          professorId: professor.id,
          originalDate: originalDateFormatted, // Store the specific original date
          // originalTime: originalClass.time, // Add if original time is available and needed
          newDate: selectedDate,
          newTime: selectedTimeSlot.startTime, // Or format as needed (e.g., startTime - endTime)
          status: "confirmed", // Or 'pending' based on workflow
          createdAt: serverTimestamp(),
        };

        // Create a new document reference for the rescheduling record
        const newRescheduleRef = doc(collection(db, "reschedulings"));
        batch.set(newRescheduleRef, reschedulingData);
        console.log(
          `Batch: Creating new reschedule record in 'reschedulings' collection`
        );

        // --- 3. Commit the batch ---
        await batch.commit();
        console.log("Batch commit successful");

        // --- 4. Optimistic Update (UI) ---
        const newRescheduling: Rescheduling = {
          ...reschedulingData,
          id: newRescheduleRef.id, // Use the ID from the newly created ref
          createdAt: new Date(), // Estimate timestamp for UI
        };
        const updatedHistory = [newRescheduling, ...reschedulingHistory];
        setReschedulingHistory(updatedHistory);
        calculateReschedulingCounts(updatedHistory);

        toast.success(
          "Aula remarcada com sucesso! A aula original foi cancelada.",
          { id: toastId }
        );

        return true; // Indicate success
      } catch (error) {
        console.error("Erro ao remarcar aula:", error);
        toast.error(
          "Falha ao remarcar aula. Verifique o console para detalhes.",
          { id: toastId }
        );
        return false; // Indicate failure
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
    ]
  ); // Removed originalSchedule dependency

  // cancelRescheduling remains the same
  const cancelRescheduling = useCallback(
    async (reschedulingId: string) => {
      if (!reschedulingId) return;

      setCancellingId(reschedulingId);
      const toastId = toast.loading("Cancelando remarcação...");

      try {
        const reschedulingRef = doc(db, "reschedulings", reschedulingId);
        await updateDoc(reschedulingRef, { status: "cancelled_by_student" });

        const updatedHistory = reschedulingHistory.map((r) =>
          r.id === reschedulingId
            ? { ...r, status: "cancelled_by_student" as const }
            : r
        ) as Rescheduling[];
        setReschedulingHistory(updatedHistory);
        calculateReschedulingCounts(updatedHistory);

        toast.success("Remarcação cancelada!", { id: toastId });
        return true;
      } catch (error) {
        console.error("Erro ao cancelar remarcação:", error);
        toast.error("Falha ao cancelar remarcação", { id: toastId });
        return false; // Indicate failure
      } finally {
        setCancellingId(null);
      }
    },
    [reschedulingHistory, calculateReschedulingCounts]
  );

  // sendConfirmationEmail remains the same
  const sendConfirmationEmail = async ({
    // ... (arguments as provided) ...
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
