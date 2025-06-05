import React, { FC, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FaRegCalendarCheck, 
  FaRegCalendarMinus, 
  FaRegCalendarTimes 
} from 'react-icons/fa';

interface ClassDateItemProps {
  date: Date;
  status: string;
  onDone: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

// Centralized status configuration
const STATUS_CONFIG: Record<string, { 
  textColor: string; 
  bgColor: string; 
  icon?: React.ReactNode;
}> = {
  'Feita': {
    textColor: 'text-fluency-green-500 dark:text-fluency-green-300',
    bgColor: 'bg-fluency-green-500'
  },
  'Cancelada': {
    textColor: 'text-fluency-orange-800 dark:text-fluency-orange-300',
    bgColor: 'bg-fluency-orange-800'
  },
  'À Fazer': {
    textColor: 'text-fluency-blue-400 dark:text-fluency-blue-300',
    bgColor: 'bg-fluency-blue-500'
  },
  'Atrasada': {
    textColor: 'text-fluency-red-600 dark:text-fluency-red-300',
    bgColor: 'bg-fluency-red-500'
  },
  'Reagendada': {
    textColor: 'text-fluency-gray-600 dark:text-fluency-gray-100 font-bold',
    bgColor: 'bg-fluency-gray-500 dark:bg-fluency-gray-600'
  },
  'Cancelada pelo Aluno': {
    textColor: 'text-fluency-gray-600 dark:text-fluency-gray-100 font-bold',
    bgColor: 'bg-fluency-gray-500 dark:bg-fluency-gray-600'
  },
};

const ClassDateItem: FC<ClassDateItemProps> = ({ 
  date, 
  status, 
  onDone, 
  onCancel, 
  onDelete 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[status] || { 
    textColor: '', 
    bgColor: '' 
  };

  const formattedDate = `${new Intl.DateTimeFormat('pt-PT', { weekday: 'short' })
    .format(date)
    .replace(/^\w/, (c) => c.toUpperCase())}, ${date.getDate()}`;

  return (
    <motion.div 
      className="flex flex-row gap-2 items-center justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <div 
        className="group cursor-pointer relative inline-block text-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.p
          className={`flex flex-row font-semibold gap-1 p-1 px-2 rounded-lg text-sm ${statusConfig.textColor}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {formattedDate}
        </motion.p>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={`!text-white font-bold w-28 text-center text-xs rounded-lg py-2 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 px-3 pointer-events-none ${statusConfig.bgColor} shadow-lg`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        className="text-white flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-blue-600 dark:bg-fluency-blue-700"
        onClick={onDone}
        whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="lg:block md:block hidden">Feita</span>
        <FaRegCalendarCheck className="icon" />
      </motion.button>

      <motion.button
        className="text-white flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-orange-600 dark:bg-fluency-orange-700"
        onClick={onCancel}
        whileHover={{ scale: 1.05, backgroundColor: '#ea580c' }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="lg:block md:block hidden">Cancelar</span>
        <FaRegCalendarTimes className="icon" />
      </motion.button>

      <motion.button
        className="text-white flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-[4px] font-bold bg-fluency-red-600 dark:bg-fluency-red-700"
        onClick={onDelete}
        whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="lg:block md:block hidden">Deletar</span>
        <FaRegCalendarMinus className="icon" />
      </motion.button>
    </motion.div>
  );
};

export default ClassDateItem;