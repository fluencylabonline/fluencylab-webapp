// components/ReminderModal.tsx
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlClose } from "react-icons/sl"; // Assuming SlClose is the icon you want to use for close

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    type: "text" | "video";
    value: string;
    title: string;
  } | null;
}

// Define animation variants for the backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Define animation variants for the bottom sheet itself
const bottomSheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: "0%", opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  if (!isOpen || !content) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-end z-50"
          onClick={onClose} // Close modal when clicking outside
        >
          <motion.div
            key="modal"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={bottomSheetVariants}
            className="bg-fluency-pages-light dark:bg-fluency-gray-900 w-full max-w-2xl mx-auto rounded-t-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="sticky top-0 bg-fluency-pages-light dark:bg-fluency-gray-900 p-4 border-b border-fluency-gray-200 dark:border-fluency-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {content.title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-800 transition-colors"
                aria-label="Close reminder"
              >
                <SlClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {content.type === "text" ? (
                <p className="text-fluency-gray-700 dark:text-fluency-gray-300 whitespace-pre-wrap">
                  {content.value}
                </p>
              ) : (
                <div className="aspect-video w-full">
                  <iframe
                    src={content.value}
                    title={content.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-md"
                  ></iframe>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReminderModal;