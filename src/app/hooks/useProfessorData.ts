// /home/ubuntu/src/app/professor/remarcacao/hooks/useProfessorData.ts
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
  // Add other necessary Firebase imports like updateDoc, deleteDoc if needed for cancellation
} from "firebase/firestore";
import { db } from "@/app/firebase"; // Adjust the path if necessary
import toast from "react-hot-toast";
import { daysOfWeek, RescheduledClass, ReschedulingRules, TimeSlot } from "../types";

// This interface is a copy of:
// export interface Aluno {
//   tasks: {};
//   overdueClassesCount: number;
//   doneClassesCount: number;
//   Classes: any;
//   id: string;
//   name: string;
//   email: string;
//   number: string;
//   userName: string;
//   mensalidade: string;
//   idioma: string[];
//   teacherEmails: string[];
//   chooseProfessor: string;
//   diaAula?: string[];
//   horario?: string[];
//   profilePicUrl?: string;
//   frequencia: number;
//   classDatesWithStatus: { date: Date; status: string }[];
// }

interface Student {
  id: string;
  name: string;
  email: string;
  diaAula?: string[];
  horario?: string[];
}

const getDayName = (dayIndex: number): string => {
  return dayIndex >= 0 && dayIndex < daysOfWeek.length
    ? daysOfWeek[dayIndex]
    : "";
};

const sanitizeObjectForFirestore = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const sanitized: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

export const useProfessorData = () => {
  const { data: session } = useSession();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [rules, setRules] = useState<ReschedulingRules>({
    minAdvanceHours: 24,
    maxReschedulesPerWeek: 1,
    maxReschedulesPerMonth: 2,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [rescheduledClasses, setRescheduledClasses] = useState<RescheduledClass[]>([]); // State for rescheduled classes
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = session?.user?.id;
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch initial data (slots, rules, students)
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 1. Fetch professor data (slots and rules)
      const professorRef = doc(db, "users", userId);
      const professorDoc = await getDoc(professorRef);

      if (professorDoc.exists()) {
        const professorData = professorDoc.data();
        // Ensure slots fetched from Firestore also conform to the expected structure
        const fetchedSlots = (professorData.availableSlots || []).map((slot: any) => ({
            id: slot.id || `slot_${Math.random().toString(36).substr(2, 9)}`, // Ensure ID exists
            dayOfWeek: slot.dayOfWeek,
            date: slot.date,
            startTime: slot.startTime || '00:00', // Provide defaults for required fields if missing
            endTime: slot.endTime || '00:45',
            isRecurring: slot.isRecurring === true, // Ensure boolean
            recurrenceEndDate: slot.recurrenceEndDate,
        }));
        setAvailableSlots(fetchedSlots);
        setRules(professorData.reschedulingRules || {
          minAdvanceHours: 24,
          maxReschedulesPerWeek: 1,
          maxReschedulesPerMonth: 2,
        });
      }

      // 2. Fetch students linked to this professor
      const studentsQuery = query(
        collection(db, "users"),
        where("professorId", "==", userId),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData: Student[] = studentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        // Logic to handle diaAula (converting index/string to name)
        const diaAulaRaw = data.diaAula;
        let diaAulaArray: string[] = [];
        if (Array.isArray(diaAulaRaw)) {
          diaAulaArray = diaAulaRaw
            .map((dayEntry: any) => {
              const parsedDayIndex = parseInt(String(dayEntry), 10);
              return !isNaN(parsedDayIndex) ? getDayName(parsedDayIndex) : String(dayEntry);
            })
            .filter(Boolean); // Filter out empty strings or invalid names
        } else if (typeof diaAulaRaw === 'string' || typeof diaAulaRaw === 'number') {
           const parsedDayIndex = parseInt(String(diaAulaRaw), 10);
           if (!isNaN(parsedDayIndex)) {
               diaAulaArray = [getDayName(parsedDayIndex)];
           } else if (typeof diaAulaRaw === 'string' && diaAulaRaw.trim() !== '') {
               diaAulaArray = [diaAulaRaw];
           }
        }

        const horarioArray = Array.isArray(data.horario)
          ? data.horario.map(String)
          : typeof data.horario === 'string' && data.horario !== ''
          ? [data.horario]
          : [];

        return {
          id: doc.id,
          name: data.name || data.displayName || "Aluno sem nome",
          email: data.email || "",
          diaAula: diaAulaArray,
          horario: horarioArray,
        };
      });
      setStudents(studentsData);

      // 3. Fetch rescheduled classes (Example: assumes a 'reschedulings' collection)
      // Adjust query based on your actual Firestore structure
      const reschedulesQuery = query(
        collection(db, "reschedulings"), // Assuming a collection named 'reschedulings'
        where("professorId", "==", userId)
        // Add other filters if needed, e.g., status != 'cancelled'
      );
      const reschedulesSnapshot = await getDocs(reschedulesQuery);
      const rescheduledData: RescheduledClass[] = reschedulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure timestamps are handled correctly if needed
      } as RescheduledClass));
      setRescheduledClasses(rescheduledData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Falha ao carregar dados do professor.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Effect to fetch data on mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Save professor settings (slots and rules)
  const saveProfessorSettings = useCallback(async (slots: TimeSlot[], currentRules: ReschedulingRules) => {
    if (!userId) return;
    setSaving(true);
    const toastId = toast.loading("Salvando configurações...");
    try {
      const professorRef = doc(db, "users", userId);

      // --- FIX: Sanitize slots and rules before saving --- 
      const sanitizedSlots = slots.map(slot => sanitizeObjectForFirestore(slot));
      const sanitizedRules = sanitizeObjectForFirestore(currentRules);

      // Ensure rules have valid numbers (extra safety check)
      const finalRules = {
          minAdvanceHours: Number(sanitizedRules.minAdvanceHours) || 24,
          maxReschedulesPerWeek: Number(sanitizedRules.maxReschedulesPerWeek) || 1,
          maxReschedulesPerMonth: Number(sanitizedRules.maxReschedulesPerMonth) || 2,
      };

      await setDoc(
        professorRef,
        {
          availableSlots: sanitizedSlots, // Use sanitized slots
          reschedulingRules: finalRules, // Use sanitized and validated rules
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setAvailableSlots(slots); // Update local state with original (potentially undefined) slots for UI consistency
      setRules(currentRules); // Update local state with original rules
      toast.success("Configurações salvas com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error(`Falha ao salvar configurações. ${error instanceof Error ? error.message : ''}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  }, [userId]);

  // Save student schedule changes
  const saveStudentSchedule = useCallback(async (studentId: string, diaAula: string[], horario: string[]) => {
    setSaving(true);
    const toastId = toast.loading("Salvando dados do aluno...");
    try {
      const studentRef = doc(db, "users", studentId);
      // Convert day names back to indices or store as strings based on your model
      // Example: Assuming you store names
      await setDoc(
        studentRef,
        {
          diaAula: diaAula.length > 0 ? diaAula : null, // Store names or convert back to indices
          horario: horario.length > 0 ? horario : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      // Update local student state
      setStudents(prevStudents =>
        prevStudents.map(s =>
          s.id === studentId ? { ...s, diaAula, horario } : s
        )
      );
      toast.success("Dados do aluno salvos!", { id: toastId });
    } catch (error) {
      console.error("Erro ao salvar dados do aluno:", error);
      toast.error("Falha ao salvar dados do aluno.", { id: toastId });
    } finally {
      setSaving(false);
    }
  }, []);

  // Function to handle cancellation of a rescheduled class by a teacher
  // Function to handle cancellation of a rescheduled class by a teacher
  const cancelRescheduledClass = useCallback(async (rescheduleId: string) => {
      setCancellingId(rescheduleId); // Set the cancelling ID
      setSaving(true);
      const toastId = toast.loading("Cancelando remarcação...");
      try {
          const rescheduleRef = doc(db, "reschedulings", rescheduleId);
          const rescheduleSnap = await getDoc(rescheduleRef);
          
          if (!rescheduleSnap.exists()) {
              throw new Error("Remarcação não encontrada.");
          }
          
          await setDoc(rescheduleRef, {
              status: 'cancelled_by_teacher',
              cancelledAt: serverTimestamp()
          }, { merge: true });

          setRescheduledClasses(prev => prev.map(r =>
              r.id === rescheduleId ? { ...r, status: 'cancelled_by_teacher' } : r
          ));

          toast.success("Remarcação cancelada.", { id: toastId });
      } catch (error: any) {
          console.error("Erro ao cancelar remarcação:", error);
          toast.error(`Falha ao cancelar: ${error.message}`, { id: toastId });
      } finally {
          setCancellingId(null); // Reset cancelling ID
          setSaving(false);
      }
  }, []);

  const sendConfirmationEmail = async ({
    studentName,
    professorEmail,
    studentMail,
    selectedDate, 
    selectedTimeSlot,
    templateType
  }: {
    studentName: string;
    professorEmail: string;
    studentMail: string;
    selectedDate: any;
    selectedTimeSlot: any;
    templateType: string;
  }) => {
    try {
      await toast.promise(
        fetch('/api/emails/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName,
            professorEmail,
            studentMail,
            selectedDate, 
            selectedTimeSlot,
            templateType: templateType,
          }),
        }),
        {
          loading: 'Enviando e-mail de confirmação',
          success: 'E-mail enviado com sucesso!',
          error: 'Erro ao enviar e-mail!',
        }
      );
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast.error('Erro ao enviar e-mail!', {
        position: 'top-center',
      });
    }
  };

  return {
    loading,
    saving,
    availableSlots,
    setAvailableSlots, // Allow direct manipulation for adding/removing slots in UI before saving
    rules,
    setRules, // Allow direct manipulation for editing rules in UI before saving
    students,
    rescheduledClasses,
    cancellingId,
    saveProfessorSettings,
    saveStudentSchedule,
    cancelRescheduledClass, // Expose cancellation function
    fetchData, // Expose refetch function if needed
    sendConfirmationEmail
  };
};

