// /home/ubuntu/src/app/professor/remarcacao/components/ReschedulingRulesManager.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiSliders } from "react-icons/fi"; // Added icon for title

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

// Interface for ReschedulingRules (should match the one in useProfessorData)
interface ReschedulingRules {
  minAdvanceHours: number;
  maxReschedulesPerWeek: number;
  maxReschedulesPerMonth: number;
}

interface ReschedulingRulesManagerProps {
  initialRules: ReschedulingRules;
  onRulesChange: (rules: ReschedulingRules) => void; // Callback to update rules in the main page state
}

const ReschedulingRulesManager: React.FC<ReschedulingRulesManagerProps> = ({
  initialRules,
  onRulesChange,
}) => {
  // Manage rules locally until saved
  const [currentRules, setCurrentRules] =
    React.useState<ReschedulingRules>(initialRules);

  // Update local state if initialRules prop changes
  React.useEffect(() => {
    setCurrentRules(initialRules);
  }, [initialRules]);

  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedRules = {
      ...currentRules,
      [name]: parseInt(value) || 0, // Ensure value is a number, default to 0 if parsing fails
    };
    setCurrentRules(updatedRules);
    onRulesChange(updatedRules); // Notify parent immediately of the change
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 sm:p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-5 text-fluency-text-light dark:text-fluency-text-dark flex items-center">
        <FiSliders className="mr-2 text-fluency-blue-600 dark:text-fluency-blue-400" />
        Regras de Remarcação
      </h2>
      <motion.div variants={staggerChildren} className="space-y-5">
        {/* Min Advance Hours */}
        <motion.div variants={fadeIn}>
          <label
            htmlFor="minAdvanceHours"
            className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
          >
            Antecedência Mínima (horas)
          </label>
          <input
            type="number"
            id="minAdvanceHours"
            name="minAdvanceHours"
            value={currentRules.minAdvanceHours}
            onChange={handleRuleChange}
            min="1"
            max="168" // 1 week
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                       border border-fluency-gray-300 dark:border-fluency-gray-600 
                       bg-fluency-pages-light dark:bg-fluency-gray-700 
                       text-fluency-text-light dark:text-fluency-text-dark 
                       focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                       sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Alunos devem remarcar com pelo menos este número de horas de
            antecedência.
          </p>
        </motion.div>

        {/* Max Reschedules Per Week */}
        <motion.div variants={fadeIn}>
          <label
            htmlFor="maxReschedulesPerWeek"
            className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
          >
            Máximo de Remarcações por Semana
          </label>
          <input
            type="number"
            id="maxReschedulesPerWeek"
            name="maxReschedulesPerWeek"
            value={currentRules.maxReschedulesPerWeek}
            onChange={handleRuleChange}
            min="0"
            max="7"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                       border border-fluency-gray-300 dark:border-fluency-gray-600 
                       bg-fluency-pages-light dark:bg-fluency-gray-700 
                       text-fluency-text-light dark:text-fluency-text-dark 
                       focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                       sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Número máximo de aulas que um aluno pode remarcar por semana.
          </p>
        </motion.div>

        {/* Max Reschedules Per Month */}
        <motion.div variants={fadeIn}>
          <label
            htmlFor="maxReschedulesPerMonth"
            className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-1"
          >
            Máximo de Remarcações por Mês
          </label>
          <input
            type="number"
            id="maxReschedulesPerMonth"
            name="maxReschedulesPerMonth"
            value={currentRules.maxReschedulesPerMonth}
            onChange={handleRuleChange}
            min="0"
            max="31" // Allow up to 31
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base rounded-md shadow-sm 
                       border border-fluency-gray-300 dark:border-fluency-gray-600 
                       bg-fluency-pages-light dark:bg-fluency-gray-700 
                       text-fluency-text-light dark:text-fluency-text-dark 
                       focus:outline-none focus:ring-1 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 
                       sm:text-sm"
          />
          <p className="mt-1.5 text-xs text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
            Número máximo de aulas que um aluno pode remarcar por mês.
          </p>
        </motion.div>
      </motion.div>
      {/* Save button is typically outside this component, in the main page */}
    </motion.div>
  );
};

export default ReschedulingRulesManager;

