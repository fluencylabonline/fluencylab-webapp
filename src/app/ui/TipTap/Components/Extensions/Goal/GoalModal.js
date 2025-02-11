// Modal to Insert Weekly Goals
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';

const GoalModal = ({ isOpen, onClose, editor }) => {
  const [title, setTitle] = useState('Weekly Goals');
  const [description, setDescription] = useState('Estudar todos os dias pelo menos 10 minutos.');
  const [schedule, setSchedule] = useState('Dia 1 - Criar Flashcards dos pronomes.\nDia 2 - Ler os flashcards em voz alta.\nDia 3 - Fazer atividade 1.\nDia 4 - Revisar anotações e flashcards.\nDia 5 - Fazer atividade 2.\nDia 6 - Revisar flashcards e terminar o homework.');

  const handleInsert = () => {
    if (editor) {
      editor.chain().focus().insertContent(
        `<goal-component title="${title}" description="${description}" schedule="${schedule}"></goal-component>`
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
            <h3 className="text-lg font-medium mb-4">Weekly Goals</h3>
            <div className="flex flex-col gap-3 w-full">
              <div className='w-full flex flex-col items-start justify-center gap-2'>
              <p>Título:</p>
              <input
                className="w-full border rounded p-2 bg-fluency-pages-light dark:bg-fluency-pages-dark"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
              />
              </div>
              <div className='flex flex-col items-start justify-center gap-2'>
              <p>Objetivo:</p>
              <textarea
                className="w-full border rounded p-2 bg-fluency-pages-light dark:bg-fluency-pages-dark"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo"
                rows={1}
              />
              </div>
              <div className='flex flex-col items-start justify-center gap-2'>
              <p>Programação por dia:</p>
              <textarea
                className="w-full border rounded p-2 bg-fluency-pages-light dark:bg-fluency-pages-dark"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="Programação Semanal"
                rows={6}
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

GoalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

export default GoalModal;