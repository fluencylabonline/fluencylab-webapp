import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';

const ExerciseModal = ({ isOpen, onClose, editor }) => {
  const [sentences, setSentences] = useState([{ sentence: '' }]);
  const [canAddSentence, setCanAddSentence] = useState(false);

  const handleSentenceChange = (index, value) => {
    const newSentences = [...sentences];
    newSentences[index].sentence = value;
    setSentences(newSentences);

    // Check if the current sentence has a valid answer in curly braces
    const hasAnswer = /\{.*?\}/.test(value);
    setCanAddSentence(hasAnswer);
  };

  const addSentence = () => {
    if (canAddSentence) {
      setSentences([...sentences, { sentence: '' }]);
      setCanAddSentence(false); // Reset the flag after adding a sentence
      toast.success(`A valid answer detected in sentence ${sentences.length}`);
    } else {
      toast.error('No valid answer detected. Make sure to include an answer in { }.');
    }
  };

  const extractAnswer = (sentence) => {
    const match = sentence.match(/\{(.*?)\}/);
    return match ? match[1] : '';
  };

  const handleSave = () => {
    // Filter out empty sentences
    const filteredSentences = sentences.filter(({ sentence }) => {
      return sentence.trim() !== '' && /\{.*?\}/.test(sentence);
    });

    if (filteredSentences.length === 0) {
      toast.error('No valid sentences to save. Please add sentences with valid answers.');
      return;
    }

    const content = filteredSentences.map(({ sentence }, index) => {
      const answer = extractAnswer(sentence);
      const cleanedSentence = sentence.replace(/\{.*?\}/, '{{gap}}');
      return `<exercise-component sentence="${index + 1}) ${cleanedSentence}" answer="${answer}"></exercise-component>`;
    }).join('');
    
    if (content) {
      editor.chain().focus().insertContent(content).run();
      toast.success('Exercise saved successfully!');
    }

    clearInputs();
    onClose();
  };

  const clearInputs = () => {
    setSentences([{ sentence: '' }]);
    setCanAddSentence(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <Toaster />
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <FluencyCloseButton onClick={() => { clearInputs(); onClose(); }} />
            <h3 className="text-lg leading-6 font-medium p-1">Criar Exercício</h3>
            {sentences.map((item, index) => (
              <div key={index} className="mb-4">
                <textarea
                  className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                  value={item.sentence}
                  onChange={(e) => handleSentenceChange(index, e.target.value)}
                  placeholder={`Digite a ${index + 1}ª frase com a resposta entre chaves { }`}
                  rows={2}
                />
              </div>
            ))}
            <FluencyButton variant="confirm" onClick={addSentence} className="mt-2">Adicionar Sentença</FluencyButton>
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

ExerciseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default ExerciseModal;
