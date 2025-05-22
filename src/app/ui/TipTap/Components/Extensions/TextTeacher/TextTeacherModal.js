import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyButton from '@/app/ui/Components/Button/button';

const TextTeacherModal = ({ isOpen, onClose, initialText, editor }) => {
  // State to manage the input text
  const [text, setText] = useState(initialText);

  // Function to handle inserting text into the editor
  const handleText = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'teacherComponent', // This must match the name in your Node.create()
          attrs: {
            text: text,
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
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg leading-6 font-medium p-1">Instrução para professor</h3>
            <div className="flex flex-col items-center gap-3 p-2">
              <textarea
                className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto para professor aqui"
                rows={4}
              />
              <div className="flex justify-center gap-2 mt-4">
                <FluencyButton
                  variant="confirm"
                  onClick={() => {
                    handleText(text);
                    onClose();
                  }}
                >
                  Salvar
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

TextTeacherModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialText: PropTypes.string.isRequired, // Renamed to initialText
  editor: PropTypes.object.isRequired, // Assuming editor is an object
};

export default TextTeacherModal;
