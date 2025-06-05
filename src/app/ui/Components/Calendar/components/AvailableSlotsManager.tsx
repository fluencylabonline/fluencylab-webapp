// /home/ubuntu/src/app/professor/remarcacao/components/AvailableSlotsManager.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import NewSlotForm from "./NewSlotForm";
import SlotsList from "./SlotsList";
import toast from "react-hot-toast";
import { TimeSlot } from "@/app/types";

// Helper functions for conflict detection
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const timeRangesOverlap = (
  start1: number, 
  end1: number, 
  start2: number, 
  end2: number
): boolean => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

interface AvailableSlotsManagerProps {
  initialSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  students: {
    id: string;
    name: string;
    diaAula?: string[];
    horario?: string[];
  }[];
  rescheduledClasses: {
    newDate: string;
    newTime: string;
  }[];
}

const AvailableSlotsManager: React.FC<AvailableSlotsManagerProps> = ({
  initialSlots,
  onSlotsChange,
  students,
  rescheduledClasses,
}) => {
  const [currentSlots, setCurrentSlots] = React.useState<TimeSlot[]>(initialSlots);

  React.useEffect(() => {
    setCurrentSlots(initialSlots);
  }, [initialSlots]);

  // Main conflict detection function
  const hasTimeConflict = (newSlot: TimeSlot): boolean => {
    const newStart = timeToMinutes(newSlot.startTime);
    const newEnd = timeToMinutes(newSlot.endTime);

    // Prepare existing events for conflict detection
    const existingEvents = {
      classes: students.flatMap(student => 
        (student.diaAula || []).map((day, index) => {
          const time = (student.horario || [])[index];
          if (!time) return null;
          
          return {
            dayOfWeek: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].indexOf(day),
            startTime: time,
            endTime: '' // Not needed since classes are fixed duration
          };
        }).filter(Boolean) as { dayOfWeek?: number; startTime: string }[]),
      rescheduled: rescheduledClasses.map(rc => ({
        newDate: rc.newDate,
        newTime: rc.newTime
      }))
    };

    // Check against regular classes
    for (const classEvent of existingEvents.classes) {
      if (newSlot.isRecurring && classEvent.dayOfWeek === newSlot.dayOfWeek) {
        const classStart = timeToMinutes(classEvent.startTime);
        const classEnd = classStart + 60; // Classes are 1 hour
        
        if (timeRangesOverlap(newStart, newEnd, classStart, classEnd)) {
          return true;
        }
      }
      
      if (!newSlot.isRecurring && newSlot.date && classEvent.dayOfWeek) {
        // For non-recurring, we'd need date comparison but student classes are recurring
        // This is a limitation - consider adding date to student classes if needed
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

    // Check against other available slots
    for (const slot of currentSlots) {
      // Skip self
      if (slot.id === newSlot.id) continue;
      
      // Recurring vs recurring
      if (newSlot.isRecurring && slot.isRecurring && slot.dayOfWeek === newSlot.dayOfWeek) {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        
        if (timeRangesOverlap(newStart, newEnd, slotStart, slotEnd)) {
          return true;
        }
      }
      
      // Specific date vs specific date
      if (!newSlot.isRecurring && !slot.isRecurring && newSlot.date && slot.date === newSlot.date) {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        
        if (timeRangesOverlap(newStart, newEnd, slotStart, slotEnd)) {
          return true;
        }
      }
    }

    return false;
  };

  const handleAddSlot = (newSlotData: TimeSlot) => {
    // Check for conflicts
    if (hasTimeConflict(newSlotData)) {
      const timeType = newSlotData.isRecurring 
        ? `recorrente (${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][newSlotData.dayOfWeek!]})`
        : `específico (${newSlotData.date})`;
      
      toast.error(`Conflito de horário: ${timeType} ${newSlotData.startTime}-${newSlotData.endTime}`);
      return;
    }

    // Add the new slot
    const updatedSlots = [...currentSlots, newSlotData];
    setCurrentSlots(updatedSlots);
    onSlotsChange(updatedSlots);
    toast.success("Horário adicionado à lista. Lembre-se de salvar as alterações gerais.");
  };

  const handleRemoveSlot = (idToRemove: string) => {
    const updatedSlots = currentSlots.filter((slot) => slot.id !== idToRemove);
    setCurrentSlots(updatedSlots);
    onSlotsChange(updatedSlots);
    toast.success("Horário removido da lista. Lembre-se de salvar as alterações gerais.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <NewSlotForm onAddSlot={handleAddSlot} />
      <SlotsList slots={currentSlots} onRemoveSlot={handleRemoveSlot} />
    </motion.div>
  );
};

export default AvailableSlotsManager;