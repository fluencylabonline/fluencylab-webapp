import React, { useState } from 'react';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import toast from 'react-hot-toast';

const BandVideoModal = ({ isOpen, onClose, editor }) => {
  const [url, setUrl] = useState('');

  const handleSelectVideo = (url) => {
    if (editor && url) {
      editor.chain().focus().insertContent(`<embed-component url="${url}"></embed-component>`).run();
      onClose();
      setUrl('');
    }else{
      toast.error('Please select an audio.');
      setUrl('');
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
            <h3 className="text-lg leading-6 font-medium p-4">Coloque o link</h3>
            <div className="flex flex-col items-center gap-3 p-4">
              <FluencyInput
                variant='solid'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Link"
              />
              <div className="flex justify-center gap-2 mt-4">
                <FluencyButton variant='confirm' onClick={() => handleSelectVideo(url)}>Adicionar</FluencyButton>
                <FluencyButton variant='gray' onClick={onClose}>Cancelar</FluencyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BandVideoModal;
