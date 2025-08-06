// src/components/DropZone.tsx
'use client'
import { forwardRef, ReactNode } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface DropZoneProps {
  children: ReactNode;
  isAnswer?: boolean;
  status?: 'correct' | 'incorrect';
}

export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  ({ children, isAnswer, status }, ref) => {
    const hasWord = !!children;

    const baseClasses = "flex-grow h-12 px-2 border-2 rounded-md flex items-center justify-center font-semibold transition-colors";
    
    const stateClasses = clsx({
      'border-fluency-gray-300 dark:border-fluency-gray-600 bg-fluency-gray-100 dark:bg-fluency-gray-800': !hasWord && !status,
      'border-fluency-gray-400 dark:border-fluency-gray-500 bg-fluency-pages-light dark:bg-fluency-pages-dark shadow-inner': hasWord && !status,
      'border-fluency-green-500 bg-fluency-green-100 dark:bg-fluency-green-900 text-fluency-green-800 dark:text-fluency-green-200': status === 'correct' || isAnswer,
      'border-fluency-red-500 bg-fluency-red-100 dark:bg-fluency-red-900 text-fluency-red-800 dark:text-fluency-red-200': status === 'incorrect',
    });

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${stateClasses}`}
        animate={{ scale: hasWord ? 1.0 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        {children}
      </motion.div>
    );
  }
);

DropZone.displayName = 'DropZone';