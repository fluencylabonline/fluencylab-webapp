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
} from "firebase/firestore";
import { db } from "@/app/firebase";
import toast from "react-hot-toast";
import { daysOfWeek, RescheduledClass, ReschedulingRules, TimeSlot } from "../types";

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

// Helper to convert time string to minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two time ranges overlap
const timeRangesOverlap = (
  start1: number, 
  end1: number, 
  start2: number, 
  end2: number
): boolean => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

// Main conflict detection function
const hasTimeConflict = (
  newSlot: TimeSlot,
  existingEvents: {
    classes: { date?: string; dayOfWeek?: number; startTime: string; endTime: string }[];
    rescheduled: { newDate: string; newTime: string }[];
  }
): boolean => {
  const newStart = timeToMinutes(newSlot.startTime);
  const newEnd = timeToMinutes(newSlot.endTime);

  // Check against regular classes
  for (const classEvent of existingEvents.classes) {
    if (newSlot.isRecurring && classEvent.dayOfWeek === newSlot.dayOfWeek) {
      const classStart = timeToMinutes(classEvent.startTime);
      const classEnd = classStart + 60; // Classes are 1 hour
      
      if (timeRangesOverlap(newStart, newEnd, classStart, classEnd)) {
        return true;
      }
    }
    
    if (!newSlot.isRecurring && newSlot.date && classEvent.date === newSlot.date) {
      const classStart = timeToMinutes(classEvent.startTime);
      const classEnd = classStart + 60; // Classes are 1 hour
      
      if (timeRangesOverlap(newStart, newEnd, classStart, classEnd)) {
        return true;
      }
    }
  }

  // Check against rescheduled classes
  for (const rescheduled of existingEvents.rescheduled) {
    if (!newSlot.isRecurring && newSlot.date && rescheduled.newDate === newSlot.date) {
      const rescheduledStart = timeToMinutes(rescheduled.newTime);
      const rescheduledEnd = rescheduledStart + 60; // Rescheduled classes are 1 hour
      
      if (timeRangesOverlap(newStart, newEnd, rescheduledStart, rescheduledEnd)) {
        return true;
      }
    }
  }

  return false;
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
  const [rescheduledClasses, setRescheduledClasses] = useState<RescheduledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = session?.user?.id;
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch professor data
      const professorRef = doc(db, "users", userId);
      const professorDoc = await getDoc(professorRef);

      if (professorDoc.exists()) {
        const professorData = professorDoc.data();
        const fetchedSlots = (professorData.availableSlots || []).map((slot: any) => ({
          id: slot.id || `slot_${Math.random().toString(36).substr(2, 9)}`,
          dayOfWeek: slot.dayOfWeek,
          date: slot.date,
          startTime: slot.startTime || '00:00',
          endTime: slot.endTime || '00:45',
          isRecurring: slot.isRecurring === true,
          recurrenceEndDate: slot.recurrenceEndDate,
        }));
        setAvailableSlots(fetchedSlots);
        setRules(professorData.reschedulingRules || {
          minAdvanceHours: 24,
          maxReschedulesPerWeek: 1,
          maxReschedulesPerMonth: 2,
        });
      }

      // Fetch students
      const studentsQuery = query(
        collection(db, "users"),
        where("professorId", "==", userId),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData: Student[] = studentsSnapshot.docs.map((doc) => {
        const data = doc.data();
        const diaAulaRaw = data.diaAula;
        let diaAulaArray: string[] = [];
        
        if (Array.isArray(diaAulaRaw)) {
          diaAulaArray = diaAulaRaw
            .map((dayEntry: any) => {
              const parsedDayIndex = parseInt(String(dayEntry), 10);
              return !isNaN(parsedDayIndex) ? getDayName(parsedDayIndex) : String(dayEntry);
            })
            .filter(Boolean);
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

      // Fetch rescheduled classes
      const reschedulesQuery = query(
        collection(db, "reschedulings"),
        where("professorId", "==", userId),
        where("status", "==", "confirmed") // Only confirmed classes
      );
      const reschedulesSnapshot = await getDocs(reschedulesQuery);
      const rescheduledData: RescheduledClass[] = reschedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as RescheduledClass));
      setRescheduledClasses(rescheduledData);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Falha ao carregar dados do professor.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Save professor settings with conflict detection
  const saveProfessorSettings = useCallback(async (slots: TimeSlot[], currentRules: ReschedulingRules) => {
    if (!userId) return;
    setSaving(true);
    const toastId = toast.loading("Salvando configurações...");
    
    try {
      // Prepare existing events for conflict detection
      const existingEvents = {
        classes: students.flatMap(student => 
          (student.diaAula || []).map((day, index) => ({
            dayOfWeek: daysOfWeek.indexOf(day),
            startTime: (student.horario || [])[index] || '00:00',
            endTime: '' // Not needed since classes are fixed duration
          }))
        ),
        rescheduled: rescheduledClasses.map(rc => ({
          newDate: rc.newDate,
          newTime: rc.newTime
        }))
      };

      // Check for conflicts in each new slot
      const conflicts: TimeSlot[] = [];
      slots.forEach(slot => {
        if (hasTimeConflict(slot, existingEvents)) {
          conflicts.push(slot);
        }
      });

      // Handle conflicts
      if (conflicts.length > 0) {
        const conflictTimes = conflicts.map(c => 
          `${c.isRecurring ? daysOfWeek[c.dayOfWeek!] : c.date} ${c.startTime}-${c.endTime}`
        ).join(', ');
        
        toast.error(`Conflito de horário encontrado: ${conflictTimes}`, { id: toastId });
        setSaving(false);
        return;
      }

      // Proceed with saving if no conflicts
      const professorRef = doc(db, "users", userId);
      const sanitizedSlots = slots.map(slot => sanitizeObjectForFirestore(slot));
      const sanitizedRules = sanitizeObjectForFirestore(currentRules);

      const finalRules = {
        minAdvanceHours: Number(sanitizedRules.minAdvanceHours) || 24,
        maxReschedulesPerWeek: Number(sanitizedRules.maxReschedulesPerWeek) || 1,
        maxReschedulesPerMonth: Number(sanitizedRules.maxReschedulesPerMonth) || 2,
      };

      await setDoc(
        professorRef,
        {
          availableSlots: sanitizedSlots,
          reschedulingRules: finalRules,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      
      setAvailableSlots(slots);
      setRules(currentRules);
      toast.success("Configurações salvas com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error(`Falha ao salvar configurações. ${error instanceof Error ? error.message : ''}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  }, [userId, students, rescheduledClasses]);

  // Save student schedule changes
  const saveStudentSchedule = useCallback(async (studentId: string, diaAula: string[], horario: string[]) => {
    setSaving(true);
    const toastId = toast.loading("Salvando dados do aluno...");
    try {
      const studentRef = doc(db, "users", studentId);
      await setDoc(
        studentRef,
        {
          diaAula: diaAula.length > 0 ? diaAula : null,
          horario: horario.length > 0 ? horario : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      
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

  // Cancel rescheduled class
  const cancelRescheduledClass = useCallback(async (rescheduleId: string) => {
    setCancellingId(rescheduleId);
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
      setCancellingId(null);
      setSaving(false);
    }
  }, []);

  // Send confirmation email
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
    setAvailableSlots,
    rules,
    setRules,
    students,
    rescheduledClasses,
    cancellingId,
    saveProfessorSettings,
    saveStudentSchedule,
    cancelRescheduledClass,
    fetchData,
    sendConfirmationEmail
  };
};