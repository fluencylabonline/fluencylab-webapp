import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase'; // Ensure correct import
import AudioPlayer from '../../Games/listening/component/playerComponent';
import FluencyButton from '@/app/ui/Components/Button/button';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { toast, Toaster } from 'react-hot-toast';

const ListeningComponent = ({ node }) => {
  const { audioId } = node.attrs;
  const { data: session } = useSession();
  const [randomDocument, setRandomDocument] = useState(null);
  const [wordInputs, setWordInputs] = useState([]);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [shouldPlayAgain, setShouldPlayAgain] = useState(false);
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
  const [showAllWords, setShowAllWords] = useState(false);

  useEffect(() => {
    if (!audioId) {
      console.error('No audio ID provided');
      return;
    }

    const fetchNivelamentoData = async () => {
      try {
        const docRef = doc(db, 'Nivelamento', audioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRandomDocument({
            id: docSnap.id,
            transcript: data.transcript,
            url: data.url,
            name: data.name,
          });
          setSelectedAudio(data.url);
          prepareWordInputs(data.transcript);
          setTranscript(data.transcript); // Set transcript for toggling visibility
        } else {
          console.error('Document does not exist.');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };

    fetchNivelamentoData();
  }, [audioId]);

  const prepareWordInputs = (transcript) => {
    const words = transcript.split(' ');
    const inputIndicesSet = new Set();
    while (inputIndicesSet.size < Math.floor(words.length * 0.2)) {
      inputIndicesSet.add(Math.floor(Math.random() * words.length));
    }
    const inputs = words.map((word, index) => ({
      word,
      isInput: inputIndicesSet.has(index),
      userAnswer: '',
      isCorrect: null
    }));
    setWordInputs(inputs);
    setInputsDisabled(false);
  };

  const handleInputChange = (index, event) => {
    const { value } = event.target;
    const updatedWordInputs = [...wordInputs];
    updatedWordInputs[index].userAnswer = value;
    setWordInputs(updatedWordInputs);
  };

  const checkAnswers = () => {
    const emptyFields = wordInputs.filter(input => input.isInput && input.userAnswer.trim() === '').length;
    if (emptyFields === wordInputs.filter(input => input.isInput).length) {
      toast.error('Coloque pelo menos uma palavra!', {
        position: 'top-center',
      });
      return null;
    }
    const updatedWordInputs = wordInputs.map(input => {
      if (input.isInput) {
        const isCorrect = input.word.toLowerCase() === input.userAnswer.trim().toLowerCase();
        return { ...input, isCorrect };
      }
      return input;
    });
    setWordInputs(updatedWordInputs);
    setInputsDisabled(true);
  };

  const handlePlayAgain = () => {
    prepareWordInputs(randomDocument?.transcript || '');
  };

  useEffect(() => {
    if (shouldPlayAgain) {
      prepareWordInputs(randomDocument?.transcript || '');
      setShouldPlayAgain(false);
    }
  }, [shouldPlayAgain, randomDocument]);

  const toggleTranscriptVisibility = () => {
    setIsTranscriptVisible(!isTranscriptVisible);
  };

  const toggleShowAllWords = () => {
    setShowAllWords(!showAllWords);
  };

  const getWordDisplay = (input, index) => {
    if (showAllWords) {
      return input.word;
    }
    return input.isInput ? (
      <input
        type="text"
        className={`max-w-[15%] mx-1 font-bold bg-transparent border-fluency-gray-500 dark:border-fluency-gray-100 border-dashed border-b-[1px] outline-none ${input.isCorrect === true ? 'text-green-500' : input.isCorrect === false ? 'text-red-500' : 'text-black dark:text-white'}`}
        value={input.userAnswer}
        onChange={(e) => handleInputChange(index, e)}
        disabled={inputsDisabled}
      />
    ) : input.word;
  };

  return (
    <NodeViewWrapper className="react-component">
      <Toaster />
      <div className='h-min w-full flex flex-col justify-center items-center'>
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 w-full text-justify flex flex-col gap-1 items-center justify-center rounded-md text-lg'>
          {selectedAudio && <AudioPlayer src={selectedAudio} />}
          {randomDocument && (
            <div className='flex flex-col items-center gap-2' key={randomDocument.id}>
              <div className='flex gap-2'>
                <FluencyButton
                  className='mt-4'
                  onClick={toggleTranscriptVisibility}
                >
                  {isTranscriptVisible ? 'Esconder texto' : 'Mostrar texto'}
                </FluencyButton>
                <FluencyButton
                  className='mt-4'
                  variant='confirm'
                  onClick={toggleShowAllWords}
                >
                  {showAllWords ? 'Mostrar respostas' : 'Esconder respostas'}
                </FluencyButton>
              </div>
              {isTranscriptVisible && (
                <div className='h-max overflow-hidden overflow-y-scroll p-10 rounded-md'>
                  {wordInputs.map((input, index) => (
                    <span className='w-full' key={index}>
                      {getWordDisplay(input, index)}
                      {' '}
                    </span>
                  ))}
                </div>
              )}
              {inputsDisabled ? (
                <div className='flex flex-row gap-2 items-center'>
                  <FluencyButton
                    className='mt-4 flex flex-row items-center'
                    variant='warning'
                    onClick={handlePlayAgain}
                  >
                    Jogar novamente
                  </FluencyButton>
                </div>
              ) : (
                <FluencyButton
                  variant='gray'
                  onClick={checkAnswers}
                >
                  Verificar Respostas
                </FluencyButton>
              )}
            </div>
          )}
        </div>
      </div>
      <NodeViewContent className="content is-editable" />
    </NodeViewWrapper>
  );
};

export default ListeningComponent;
