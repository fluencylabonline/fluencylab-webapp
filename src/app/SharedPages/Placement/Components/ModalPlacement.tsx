import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: any;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Prevent the modal from rendering if isOpen is false or children is null/undefined
  if (!isOpen || !title) return null;

  const translations: { [key: string]: { translation: string} } = {
    speaking: { translation: "Fala 🗣️" },
    listening: { translation: "Escuta 👂" },
    reading: { translation: "Leitura 📖" },
    writing: { translation: "Escrita ✍️" },
    vocabulary: { translation: "Vocabulário 📚" },
    grammar: { translation: "Gramática 🔠" },
  };

  const translatedTitle =
    typeof title === "string" && translations[title.toLowerCase()]
      ? translations[title.toLowerCase()].translation
      : typeof title === "string"
      ? title.charAt(0).toUpperCase() + title.slice(1)
      : title;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg w-fit overflow-hidden m-8">
        
        <div className="flex justify-between items-center py-3 px-6 bg-fluency-gray-100 dark:bg-fluency-gray-800">
          <h2 className="text-xl font-semibold">
          {translatedTitle || 'Nivelamento'}
          </h2>
          <IoClose onClick={onClose} className="text-indigo-500 hover:text-indigo-600 cursor-pointer w-7 h-7 ease-in-out duration-300" />
        </div>

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;
