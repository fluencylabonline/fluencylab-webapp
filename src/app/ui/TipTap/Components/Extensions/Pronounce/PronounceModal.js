import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { toast } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

const PronounceModal = ({ isOpen, onClose, editor }) => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSelectTranscript = (audioId) => {
    if (editor && audioId) {
      editor.chain().focus().insertContent(`<speaking-component audioId="${audioId}"></speaking-component>`).run();
      setSelectedAudioId('');
      onClose();
    }else {
      toast.error('Please select an audio.');
      setSelectedAudioId('');
    }
  };

  if (!isOpen) return null;

  const filteredAudios = availableAudios.filter(audio =>
    audio.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
          <div className="flex flex-col items-center justify-center">
            <FluencyCloseButton onClick={onClose} />
            <h3 className="text-lg leading-6 font-medium p-4">Selecione um texto para prática</h3>
            <div className="flex flex-col items-center gap-3 p-4">
              <FluencyInput
                variant='solid'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar Texto"
              />
              <div className="w-full max-h-60 overflow-y-auto mt-2 border rounded bg-fluency-pages-light dark:bg-fluency-pages-dark">
                {filteredAudios.map(audio => (
                  <div
                    key={audio.id}
                    className={`p-2 cursor-pointer ${selectedAudioId === audio.id ? 'bg-blue-300 dark:bg-fluency-gray-800' : 'hover:bg-blue-200 dark:hover:bg-fluency-gray-600'}`}
                    onClick={() => setSelectedAudioId(audio.id)}
                  >
                    {audio.name}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <FluencyButton variant='confirm' onClick={() => handleSelectTranscript(selectedAudioId)}>Adicionar</FluencyButton>
                <FluencyButton variant='gray' onClick={onClose}>Cancelar</FluencyButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronounceModal;
