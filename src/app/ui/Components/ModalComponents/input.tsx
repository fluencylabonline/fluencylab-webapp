import FluencyInput from "../Input/input";
import React, { useEffect, useCallback } from 'react'; // Import useEffect and useCallback

// Interface for a simpler input modal, similar to your ConfirmationModal structure
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

// A simple custom modal component for input
const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder,
  value,
  onChange,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar'
}) => {
  // Use useCallback to memoize the event handler for performance
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onConfirm();
    }
  }, [onConfirm]); // Dependency array: recreate if onConfirm changes

  useEffect(() => {
    if (isOpen) {
      // Add event listener when the modal is open
      window.addEventListener('keydown', handleKeyDown);
    } else {
      // Clean up event listener when the modal is closed
      window.removeEventListener('keydown', handleKeyDown);
    }

    // Cleanup function to remove event listener when component unmounts or isOpen changes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]); // Dependency array: run effect when isOpen or handleKeyDown changes

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
        <FluencyInput
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full mb-6"
          // You might not need to add onKeyDown directly here if you're listening globally
          // But if FluencyInput exposes an onKeyDown prop, you could pass handleKeyDown to it.
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-fluency-gray-200 dark:bg-fluency-gray-500 text-gray-800 dark:text-fluency-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-fluency-gray-600 transition-colors duration-200 font-medium"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-fluency-blue-600 text-white rounded-lg hover:bg-fluency-blue-700 transition-colors duration-200 font-medium shadow-md"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;