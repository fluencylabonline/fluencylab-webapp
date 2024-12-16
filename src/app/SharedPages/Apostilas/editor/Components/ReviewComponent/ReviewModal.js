import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';

const ReviewModal = ({ isOpen, onClose, editor }) => {
  const [title, setTitle] = useState('Personal Pronouns');
  const [content, setContent] = useState(
    'Vimos que os pronomes são palavras bem úteis.\nHoje vimos: I, **you**, **we**, **they**. Ainda lembra o significado deles? Se não lembra, a atividade de casa vai te ajudar a memorizar.'
  );

  const handleInsert = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<review-component title="${title}" content="${content}"></review-component>`
        )
        .run();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
          <div className="w-full flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Review Faixa</h3>
            <div className="flex flex-col gap-3 w-full">
              <input
                className="border rounded p-2 w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="border rounded p-2 w-full"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={6}
              />
              <div className="flex gap-2 justify-end">
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
  editor: PropTypes.object.isRequired,
};

export default ReviewModal;
