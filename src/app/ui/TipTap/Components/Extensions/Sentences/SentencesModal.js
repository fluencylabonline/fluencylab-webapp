import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';

const SentencesModal = ({ isOpen, onClose, editor }) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) {
      alert('Please enter a valid text.');
      return;
    }

    editor.chain().focus().insertContent(`<sentences-component text="${text}" sentences="[]" feedback="[]"></sentences-component>`).run();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-black dark:text-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-28 h-auto p-5">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg leading-6 font-medium p-1">Coloque o texto principal</h3>
            <textarea
              className="w-full mt-2 border rounded p-2 bg-gray-200 dark:bg-fluency-pages-dark"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Texto vai aqui"
              rows={4}
            />
            <div className="flex justify-center gap-2 mt-4">
              <FluencyButton variant="confirm" onClick={handleSave}>Salvar</FluencyButton>
              <FluencyButton variant="gray" onClick={onClose}>Cancelar</FluencyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SentencesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default SentencesModal;
