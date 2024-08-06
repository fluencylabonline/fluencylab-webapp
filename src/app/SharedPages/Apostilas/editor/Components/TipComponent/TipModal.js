import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';

const TextDisplayModalTip = ({ isOpen, onClose, initialTextTip, editor }) => {
  // State to manage the input text
  const [text, setText] = useState(initialTextTip);

  // Function to handle inserting text into the editor
  const handleText = (text) => {
    if (editor && text) {
      editor.chain().focus().insertContent(`<tip-component text="${text}"></tip-component>`).run();
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
            <FluencyCloseButton onClick={onClose} />
            <h3 className="text-lg leading-6 font-medium p-1">Texto</h3>
            <div className="flex flex-col items-center gap-3 p-2">
              <textarea
                className="w-full mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark p-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto aqui"
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
                <FluencyButton variant="danger" onClick={onClose}>
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

TextDisplayModalTip.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialTextTip: PropTypes.string.isRequired, // Renamed to initialText
  editor: PropTypes.object.isRequired, // Assuming editor is an object
};

export default TextDisplayModalTip;
