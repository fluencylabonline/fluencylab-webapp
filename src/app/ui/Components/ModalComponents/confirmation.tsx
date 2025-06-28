// src/app/ui/Components/ConfirmationModal.tsx
import React from 'react';

// Interface for ConfirmationModal props
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  title: string;
  confirmButtonText?: string; // Optional text for the confirm button, defaults to 'Confirmar'
  cancelButtonText?: string;  // Optional text for the cancel button, defaults to 'Cancelar'
  confirmButtonVariant?: 'danger' | 'success' | 'primary'; // Optional variant for confirm button styling
}

// ConfirmationModal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title,
  confirmButtonText = 'Confirmar', // Default text
  cancelButtonText = 'Cancelar',    // Default text
  confirmButtonVariant = 'danger'   // Default variant
}) => {
  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;

  let confirmButtonBgClass = '';
  let confirmButtonHoverBgClass = '';

  switch (confirmButtonVariant) {
    case 'success':
      confirmButtonBgClass = 'bg-fluency-green-600';
      confirmButtonHoverBgClass = 'hover:bg-fluency-green-700';
      break;
    case 'primary':
      confirmButtonBgClass = 'bg-fluency-blue-600';
      confirmButtonHoverBgClass = 'hover:bg-fluency-blue-700';
      break;
    case 'danger':
    default: // Default to danger if no variant or unknown variant is provided
      confirmButtonBgClass = 'bg-fluency-red-600';
      confirmButtonHoverBgClass = 'hover:bg-fluency-red-700';
      break;
  }

  return (
    // Fixed overlay for the modal, covering the entire screen
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      {/* Modal content container */}
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
        {/* Modal title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        {/* Modal message */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          {/* Cancel button */}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fluency-gray-200 dark:bg-fluency-gray-500 text-gray-800 dark:text-fluency-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-fluency-gray-600 transition-colors duration-200 font-medium"
          >
            {cancelButtonText}
          </button>
          {/* Confirm button, with dynamic text and color */}
          <button
            onClick={onConfirm}
            className={`px-5 py-2 ${confirmButtonBgClass} text-white rounded-lg ${confirmButtonHoverBgClass} transition-colors duration-200 font-medium shadow-md`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
