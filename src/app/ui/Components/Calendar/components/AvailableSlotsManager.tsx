// /home/ubuntu/src/app/professor/remarcacao/components/AvailableSlotsManager.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import NewSlotForm from "./NewSlotForm"; // Assumes this is styled
import SlotsList from "./SlotsList"; // Assumes this is styled
import toast from "react-hot-toast";

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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

interface AvailableSlotsManagerProps {
  initialSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void; // Callback to update slots in the main page state
}

const AvailableSlotsManager: React.FC<AvailableSlotsManagerProps> = ({
  initialSlots,
  onSlotsChange,
}) => {
  // Manage the slots locally within this manager until saved
  const [currentSlots, setCurrentSlots] =
    React.useState<TimeSlot[]>(initialSlots);

  // Update local state when initialSlots prop changes (e.g., after saving/fetching)
  React.useEffect(() => {
    setCurrentSlots(initialSlots);
  }, [initialSlots]);

  const handleAddSlot = (newSlotData: TimeSlot) => {
    // Add the new slot to the local state
    const updatedSlots = [...currentSlots, newSlotData];
    setCurrentSlots(updatedSlots);
    onSlotsChange(updatedSlots); // Notify parent about the change
    // Use a consistent success message
    toast.success("Horário adicionado à lista. Lembre-se de salvar as alterações gerais.");
  };

  const handleRemoveSlot = (idToRemove: string) => {
    const updatedSlots = currentSlots.filter((slot) => slot.id !== idToRemove);
    setCurrentSlots(updatedSlots);
    onSlotsChange(updatedSlots); // Notify parent about the change
    toast.success("Horário removido da lista. Lembre-se de salvar as alterações gerais.");
  };

  return (
    // Add motion.div container for overall animation if desired
    <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="space-y-3" // Add spacing between form and list
    >
      <NewSlotForm onAddSlot={handleAddSlot} />
      <SlotsList slots={currentSlots} onRemoveSlot={handleRemoveSlot} />
    </motion.div>
  );
};

export default AvailableSlotsManager;

