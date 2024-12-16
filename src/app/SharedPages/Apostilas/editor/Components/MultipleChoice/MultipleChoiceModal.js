import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';

const MultipleChoiceModal = ({ isOpen, onClose, editor }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(null);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    setCorrectOption(index);
  };

  const handleSave = () => {
    if (!question.trim()) {
      toast.error('Please enter a question.');
      return;
    }

    if (options.some((option) => option.trim() === '') || correctOption === null) {
      toast.error('Please provide all options and select the correct answer.');
      return;
    }

    const content = `<multiple-choice question="${question}" options='${JSON.stringify(options)}' correctOption="${correctOption}"></multiple-choice>`;

    editor.chain().focus().insertContent(content).run();
    toast.success('Multiple choice question saved successfully!');

    clearInputs();
    onClose();
  };

  const clearInputs = () => {
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectOption(null);
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
            <h3 className="text-lg leading-6 font-medium p-1">Criar Pergunta de Múltipla Escolha</h3>
            <div className="mb-4 w-full">
              <textarea
                className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                value={question}
                onChange={handleQuestionChange}
                placeholder="Digite a pergunta"
                rows={2}
              />
            </div>
            {options.map((option, index) => (
              <div key={index} className="mb-4 w-full flex flex-row items-start gap-2">
                <textarea
                  className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  rows={2}
                />
                <input
                  type="radio"
                  name="correctOption"
                  value={index}
                  checked={correctOption === index}
                  onChange={() => handleCorrectOptionChange(index)}
                  className="mt-2"
                />
                <label className="ml-2">Marcar como correta</label>
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-4">
              <FluencyButton variant="confirm" onClick={handleSave}>Salvar</FluencyButton>
              <FluencyButton variant="gray" onClick={() => { clearInputs(); onClose(); }}>Cancelar</FluencyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MultipleChoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default MultipleChoiceModal;
