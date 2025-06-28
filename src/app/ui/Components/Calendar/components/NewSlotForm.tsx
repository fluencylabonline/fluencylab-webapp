// /home/ubuntu/src/app/professor/remarcacao/components/NewSlotForm.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiClock } from "react-icons/fi"; // Added FiClock
import toast from "react-hot-toast";

// =============== Animation Variants ===============
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Interface for a new slot (subset of TimeSlot)
interface NewSlotData {
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  dayOfWeek?: number;
  date?: string;
  recurrenceEndDate?: string;
}

interface TimeSlot {
  id: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceEndDate?: string;
}

// Update the prop type to use TimeSlot
interface NewSlotFormProps {
  onAddSlot: (slot: TimeSlot) => void;
}
const NewSlotForm: React.FC<NewSlotFormProps> = ({ onAddSlot }) => {
  const [newSlot, setNewSlot] = React.useState<NewSlotData>({
    startTime: "08:00",
    endTime: "08:45", // Calculated based on startTime
    isRecurring: true,
    dayOfWeek: 1, // Default to Monday
    recurrenceEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    date: undefined, // Explicitly undefined when recurring
  });

  const generateId = () => `slot_${Math.random().toString(36).substr(2, 9)}`;

  const handleNewSlotChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewSlot((prev) => ({
        ...prev,
        isRecurring: checked,
        // Clear date if recurring, clear day/recurrence if not recurring
        date: checked
          ? undefined
          : prev.date || new Date().toISOString().split("T")[0],
        dayOfWeek: !checked ? undefined : prev.dayOfWeek ?? 1,
        recurrenceEndDate: !checked
          ? undefined
          : prev.recurrenceEndDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
      }));
    } else if (name === "startTime") {
      const [hours, minutes] = value.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      // Assuming 45 min duration, adjust if needed
      const endDate = new Date(startDate.getTime() + 45 * 60000);
      const endHours = endDate.getHours().toString().padStart(2, "0");
      const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
      const newEndTime = `${endHours}:${endMinutes}`;

      setNewSlot((prev) => ({
        ...prev,
        startTime: value,
        endTime: newEndTime,
      }));
    } else {
      setNewSlot((prev) => ({
        ...prev,
        [name]: name === "dayOfWeek" ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleAddClick = () => {
    // Validation
    if (
      !newSlot.startTime ||
      !newSlot.endTime ||
      newSlot.startTime >= newSlot.endTime
    ) {
      toast.error(
        "Horário de início inválido ou erro no cálculo do término. Verifique o horário de início."
      );
      return;
    }
    if (
      newSlot.isRecurring &&
      (newSlot.dayOfWeek === undefined || !newSlot.recurrenceEndDate)
    ) {
      toast.error(
        "Para horário recorrente, selecione o dia da semana e a data de término da recorrência."
      );
      return;
    }
    if (!newSlot.isRecurring && !newSlot.date) {
      toast.error("Para horário pontual, selecione a data.");
      return;
    }

    const slotToAdd = {
      ...newSlot,
      id: generateId(),
      // Ensure correct fields based on type
      ...(newSlot.isRecurring
        ? { date: undefined }
        : { dayOfWeek: undefined, recurrenceEndDate: undefined }),
    };

    // Pass the validated slot data up to the parent manager component
    onAddSlot(slotToAdd);

    // Reset form to default values (optional, could be handled by parent)
    setNewSlot({
      startTime: "08:00",
      endTime: "08:45",
      isRecurring: true,
      dayOfWeek: 1,
      recurrenceEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      date: undefined,
    });
    // Toast message moved to parent (AvailableSlotsManager) for consistency after state update
    // toast.success("Horário pronto para ser adicionado (será salvo ao clicar em 'Salvar Alterações').");
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 sm:p-6 rounded-lg shadow-lg mb-6"
    >
      <h2 className="text-xl font-semibold mb-5 text-fluency-text-light dark:text-fluency-text-dark flex items-center">
        <FiClock className="mr-2 text-fluency-blue-600 dark:text-fluency-blue-400" />
        Adicionar Novo Horário Disponível
      </h2>
      <motion.div
        variants={staggerChildren}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5"
      >
        {/* Type Toggle - Styled */}
        <motion.div variants={fadeIn} className="md:col-span-2">
          <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
            Tipo de Horário
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={newSlot.isRecurring}
              onChange={handleNewSlotChange}
              className="h-4 w-4 rounded border-fluency-gray-300 dark:border-fluency-gray-600 text-fluency-blue-600 focus:ring-fluency-blue-500 dark:bg-fluency-gray-700 dark:focus:ring-offset-fluency-pages-dark"
            />
            <label
              htmlFor="isRecurring"
              className="ml-2 block text-sm text-fluency-text-light dark:text-fluency-text-dark"
            >
              Horário Recorrente (semanal)
            </label>
          </div>
        </motion.div>

        {/* Conditional Fields - Animated */}
        <AnimatePresence mode="wait">
          {newSlot.isRecurring ? (
            // Recurring Fields
            <motion.div
              key="recurring-fields"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="contents" // Use contents to avoid breaking grid layout
            >
              {/* Day of Week - Styled */}
              <motion.div variants={fadeIn}>
                <label
                  htmlFor="dayOfWeek"
                  className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
                >
                  Dia da Semana
                </label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  value={newSlot.dayOfWeek ?? ""} // Handle undefined case
                  onChange={handleNewSlotChange}
                  required={newSlot.isRecurring}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md shadow-sm 
                             border border-fluency-gray-300 dark:border-fluency-gray-600 
                             bg-fluency-pages-light dark:bg-fluency-gray-700 
                             text-fluency-text-light dark:text-fluency-text-dark 
                             focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                             sm:text-sm"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  <option value={1}>Segunda</option>
                  <option value={2}>Terça</option>
                  <option value={3}>Quarta</option>
                  <option value={4}>Quinta</option>
                  <option value={5}>Sexta</option>
                  <option value={6}>Sábado</option>
                  <option value={0}>Domingo</option>
                </select>
              </motion.div>
              {/* Recurrence End Date - Styled */}
              <motion.div variants={fadeIn}>
                <label
                  htmlFor="recurrenceEndDate"
                  className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
                >
                  Disponível até
                </label>
                <input
                  type="date"
                  id="recurrenceEndDate"
                  name="recurrenceEndDate"
                  value={newSlot.recurrenceEndDate ?? ""}
                  onChange={handleNewSlotChange}
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  required={newSlot.isRecurring}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                             border border-fluency-gray-300 dark:border-fluency-gray-600 
                             bg-fluency-pages-light dark:bg-fluency-gray-700 
                             text-fluency-text-light dark:text-fluency-text-dark 
                             focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                             sm:text-sm"
                />
              </motion.div>
            </motion.div>
          ) : (
            // One-time Slot Fields
            <motion.div
              key="onetime-fields"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="contents" // Use contents to avoid breaking grid layout
            >
              {/* Date for one-time slot - Styled */}
              <motion.div variants={fadeIn}>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
                >
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newSlot.date ?? ""}
                  onChange={handleNewSlotChange}
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  required={!newSlot.isRecurring}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                             border border-fluency-gray-300 dark:border-fluency-gray-600 
                             bg-fluency-pages-light dark:bg-fluency-gray-700 
                             text-fluency-text-light dark:text-fluency-text-dark 
                             focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                             sm:text-sm"
                />
              </motion.div>
              {/* Empty div to maintain grid structure */}
              <div />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Time - Styled */}
        <motion.div variants={fadeIn}>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
          >
            Horário de Início
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={newSlot.startTime}
            onChange={handleNewSlotChange}
            required
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                       border border-fluency-gray-300 dark:border-fluency-gray-600 
                       bg-fluency-pages-light dark:bg-fluency-gray-700 
                       text-fluency-text-light dark:text-fluency-text-dark 
                       focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                       sm:text-sm"
          />
        </motion.div>

        {/* End Time (Calculated) - Styled */}
        <motion.div variants={fadeIn}>
          <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1">
            Horário de Término (calculado)
          </label>
          <div
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-fluency-gray-200 dark:border-fluency-gray-700 
                       bg-fluency-gray-100 dark:bg-fluency-gray-800 
                       sm:text-sm rounded-md text-fluency-text-secondary dark:text-fluency-text-dark-secondary"
          >
            {newSlot.endTime || "--:--"}
          </div>
        </motion.div>

        {/* Add Button - Styled */}
        <motion.div
          variants={fadeIn}
          className="md:col-span-2 flex justify-end mt-2"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddClick}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-fluency-blue-600 hover:bg-fluency-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fluency-pages-light dark:focus:ring-offset-fluency-pages-dark focus:ring-fluency-blue-500 transition-colors"
          >
            <FiPlus className="mr-1.5 -ml-0.5 w-5 h-5" /> Adicionar Horário à
            Lista
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NewSlotForm;
