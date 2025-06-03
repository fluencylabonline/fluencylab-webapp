import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button'; // Assuming this path is correct

const ReviewModal = ({ isOpen, onClose, editor }) => {
  const [title, setTitle] = useState('Personal Pronouns');
  const [reviewContent, setReviewContent] = useState(
    'Vimos que os pronomes são palavras bem úteis.\nHoje vimos: I, **you**, **we**, **they**. Ainda lembra o significado deles? Se não lembra, a atividade de casa vai te ajudar a memorizar.'
  );

  const handleInsert = () => {
    if (editor) {
      // Instead of inserting an HTML string, insert a JSON object
      // representing the node and its attributes. Tiptap will handle
      // the correct rendering and escaping.
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'review-component', // This must match the name in your Node.create()
          attrs: {
            title: title,
            reviewContent: reviewContent,
          },
        })
        .run();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full p-5">
          {/* Added sm:max-w-lg sm:w-full for better responsiveness on small screens, adjust as needed */}
          <div className="w-full flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Faixa de Revisão</h3>
            <div className="flex flex-col gap-3 w-full">
              <input
                className="border rounded p-2 w-full bg-gray-200 dark:bg-fluency-pages-dark text-black dark:text-white" // Added text colors for better visibility
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="border rounded p-2 w-full bg-gray-200 dark:bg-fluency-pages-dark text-black dark:text-white" // Added text colors
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Content"
                rows={6}
              />
              <div className="flex gap-2 justify-end mt-4"> {/* Added mt-4 for spacing */}
                <FluencyButton variant="confirm" onClick={handleInsert}>
                  Inserir
                </FluencyButton>
                <FluencyButton variant="gray" onClick={onClose}>
                  Cancelar
                </FluencyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired, // Consider more specific shape if available
};

export default ReviewModal;
