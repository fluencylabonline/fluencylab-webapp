import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';

const VocabLabModal = ({ isOpen, onClose, editor }) => {
  const [sentences1, setSentences1] = useState('Are you __?\nHow are you?\nI am __.\nWhere are you?');
  const [words, setWords] = useState('tired, happy, sad, hungry, angry, sleepy, scared, good, sick');
  const [sentences2, setSentences2] = useState('We are __.\nYou are __.\nThey are not __.');

  const handleInsert = () => {
    if (editor) {
      editor
        .chain().focus().insertContent(
          `<vocab-lab-component sentences1="${sentences1}" words="${words}" sentences2="${sentences2}"></vocab-lab-component>`
        ).run();
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
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-[75%] h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium mb-4">Criar VocabuLab</h3>
            <div className="flex flex-col gap-3 w-full">
            <div className='w-full flex flex-col items-start justify-center gap-2'>
              <p className='font-bold'>Primeiros comandos ou frases</p>
              <textarea
                className="w-full border rounded p-2 mb-3 bg-gray-200 dark:bg-fluency-pages-dark"
                value={sentences1}
                onChange={(e) => setSentences1(e.target.value)}
                placeholder="First Section Sentences"
                rows={4}
              />
            </div>
            <div className='w-full flex flex-col items-start justify-center gap-2'>
              <p className='font-bold'>Word Bank</p>
              <input
                className="w-full border rounded p-2 mb-3 bg-gray-200 dark:bg-fluency-pages-dark"
                value={words}
                onChange={(e) => setWords(e.target.value)}
                placeholder="Word Bank (comma-separated)"
              />
            </div>
            <div className='w-full flex flex-col items-start justify-center gap-2'>
              <p className='font-bold'>Sessão de prática</p>
              <textarea
                className="w-full border rounded p-2 mb-3 bg-gray-200 dark:bg-fluency-pages-dark"
                value={sentences2}
                onChange={(e) => setSentences2(e.target.value)}
                placeholder="Second Section Sentences"
                rows={4}
              />
            </div>
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

VocabLabModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default VocabLabModal;
