import React, { useEffect, useState } from 'react';
import { doc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { toast } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

const AudioSelectionModal = ({ isOpen, onClose, onSelectAudio }) => {
  const [audioId, setAudioId] = useState('');
  const [availableAudios, setAvailableAudios] = useState([]);
  const [selectedAudioId, setSelectedAudioId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchAudios = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'Nivelamento'));
          const audios = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setAvailableAudios(audios);
        } catch (error) {
          console.error('Error fetching audios:', error);
          toast.error('Failed to fetch audios.');
        }
      };

      fetchAudios();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (audioId || selectedAudioId) {
      onSelectAudio(selectedAudioId || audioId);
      setAudioId('');
      setSelectedAudioId('');
      onClose();
    } else {
      toast.error('Please provide or select an audio ID.');
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
            <h3 className="text-lg leading-6 font-medium p-4">Coloque o ID ou Selecione um Áudio</h3>
            <div className="flex flex-col items-center gap-3 p-4">
              <FluencyInput
                variant='solid'
                value={audioId}
                onChange={(e) => setAudioId(e.target.value)}
                placeholder="Áudio ID"
              />
              <select
                className="p-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark"
                value={selectedAudioId}
                onChange={(e) => setSelectedAudioId(e.target.value)}
              >
                <option value="">Selecione um áudio</option>
                {availableAudios.map(audio => (
                  <option key={audio.id} value={audio.id}>
                    {audio.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-center gap-2 mt-4">
                <FluencyButton variant='confirm' onClick={handleSubmit}>Adicionar</FluencyButton>
                <FluencyButton variant='gray' onClick={onClose}>Cancelar</FluencyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioSelectionModal;
