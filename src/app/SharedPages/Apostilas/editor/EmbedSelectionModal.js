import React, { useEffect, useState } from 'react';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { toast } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

const AudioSelectionModal = ({ isEmbedOpen, onEmbedClose, onSelectVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url) {
      onSelectVideo(url);
      onEmbedClose();
      setUrl('');
    } else {
      toast.error('Please provide or select an audio ID.');
    }
  };

  if (!isEmbedOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <FluencyCloseButton onClick={onEmbedClose} />
            <h3 className="text-lg leading-6 font-medium p-4">Coloque o link</h3>
            <div className="flex flex-col items-center gap-3 p-4">
              <FluencyInput
                variant='solid'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Link"
              />
              <div className="flex justify-center gap-2 mt-4">
                <FluencyButton variant='confirm' onClick={handleSubmit}>Adicionar</FluencyButton>
                <FluencyButton variant='gray' onClick={onEmbedClose}>Cancelar</FluencyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioSelectionModal;
