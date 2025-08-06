// src/components/AttemptsTracker.tsx
'use client'
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttemptsTrackerProps {
  attemptsLeft: number;
  maxAttempts: number;
}

export const AttemptsTracker = ({ attemptsLeft, maxAttempts }: AttemptsTrackerProps) => {
  return (
    <div className="flex justify-center items-center gap-2 my-4">
      <span className="text-sm font-semibold text-fluency-gray-600 dark:text-fluency-gray-300 mr-2">Tentativas:</span>
      <div className="flex gap-1.5">
        {Array.from({ length: maxAttempts }).map((_, index) => (
          <AnimatePresence key={index}>
            {index < attemptsLeft && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Heart className="text-fluency-red-500 fill-fluency-red-500" size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};