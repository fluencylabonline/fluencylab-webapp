import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';

const TranslationModal = ({ isOpen, onClose, editor }) => {
  const [header, setHeader] = useState(''); // Input for instruction/header
  const [sentences, setSentences] = useState(['']); // List of sentences
  const [feedback, setFeedback] = useState('');

  const handleAddSentence = () => {
    setSentences([...sentences, '']);
  };

  const handleSentenceChange = (index, value) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  const handleSave = () => {
    if (!sentences.every(sentence => sentence.trim())) {
      toast.error('All sentences are required.');
      return;
    }

    const sentencesContent = sentences
      .map((sentence, index) => {
        return `<translation-component originalSentence="${sentence}" sentenceNumber="${index + 1}"></translation-component>`;
      })
      .join('');

    const content = `<div>${header ? `<p>${header}</p>` : ''}${sentencesContent}</div>`;

    editor.chain().focus().insertContent(content).run();
    toast.success('Translation exercise saved successfully!');
    clearInputs();
    onClose();
  };

  const clearInputs = () => {
    setHeader('');
    setSentences(['']);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <Toaster />
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-28 h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <FluencyCloseButton onClick={() => { clearInputs(); onClose(); }} />
            <h3 className="text-lg leading-6 font-medium p-1">Crie um exercício de tradução</h3>
            
            {/* Header input */}
            <div className="mb-4 w-full">
              <textarea
                className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                placeholder="Coloque o enunciado (e.g., 'Traduza as frases abaixo')"
                rows={2}
              />
            </div>

            {/* Sentence inputs */}
            {sentences.map((sentence, index) => (
              <div key={index} className="mb-4 w-full">
                <textarea
                  className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                  value={sentence}
                  onChange={(e) => handleSentenceChange(index, e.target.value)}
                  placeholder={`Coloque a frase - ${index + 1}`}
                  rows={2}
                />
              </div>
            ))}

            {/* Add new sentence button */}
            <FluencyButton
              variant="confirm"
              onClick={handleAddSentence}
            >
              Adicionar outra
            </FluencyButton>

            <div className="flex justify-center gap-2 mt-4">
              <FluencyButton variant="confirm" onClick={handleSave}>Salvar</FluencyButton>
              <FluencyButton variant="danger" onClick={() => { clearInputs(); onClose(); }}>Cancelar</FluencyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TranslationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default TranslationModal;
