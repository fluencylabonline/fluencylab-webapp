'use client'
import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

const SpeakingComponent = ({ node }) => {
  const { audioId } = node.attrs;
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const docRef = doc(db, 'Nivelamento', audioId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedAudio(data);
        } else {
          console.error('Document does not exist.');
          toast.error('Document not found.');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Error fetching document. Please try again later.');
      }
    };

    fetchTranscript();
  }, [audioId]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        setSpokenText(finalTranscript + interimTranscript);
        setFinalTranscript(finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event);
        toast.error('Speech recognition error. Please try again.');
      };
    } else {
      toast.error('Web Speech API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecognition = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        // Set a 3-second delay before stopping and calculating score
        setTimeout(() => {
          recognitionRef.current.stop();
          setIsRecording(false);
          if (selectedAudio) {
            calculateScore(finalTranscript, selectedAudio.transcript);
          }
        }, 3000);
      } else {
        if (!recognitionRef.current.recognizing) {
          recognitionRef.current.start();
          setIsRecording(true);
          setSpokenText('');
          setScore(null);
        }
      }
    }
  };

  const cleanText = (text) => {
    return text
      .replace(/[.,!?]/g, '')
      .replace(/\b(?:he's|she's|it's|we're|they're|he|she|it|we|they|has|had|does|do)\b/g, '')
      .toLowerCase();
  };

  const calculateScore = (spoken, original) => {
    const cleanedSpoken = cleanText(spoken);
    const cleanedOriginal = cleanText(original);

    const spokenWords = cleanedSpoken.split(' ').filter(word => word.length > 0); // Filter out empty strings
    const originalWords = cleanedOriginal.split(' ').filter(word => word.length > 0); // Filter out empty strings

    // Debugging logs
    console.log('Cleaned Spoken:', cleanedSpoken);
    console.log('Cleaned Original:', cleanedOriginal);
    console.log('Spoken Words:', spokenWords);
    console.log('Original Words:', originalWords);

    const matchedWords = spokenWords.filter(word => originalWords.includes(word));

    // More Debugging logs
    console.log('Matched Words:', matchedWords);

    const score = (matchedWords.length / originalWords.length) * 100;

    // Ensure we don't divide by zero
    const roundedScore = originalWords.length > 0 ? Math.round(score) : 0;
    setScore(roundedScore);

    // Show toast if score is less than 10
    if (roundedScore < 10) {
      toast.error('Tente novamente');
    }
  };

  return (
    <NodeViewWrapper className="react-component">
      <div className='h-min w-full flex flex-col justify-center items-center'>
        <Toaster />
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 w-full text-justify flex flex-col gap-1 items-center justify-center rounded-md text-lg'>
          {selectedAudio ? (
            <div className='flex flex-col items-center gap-2'>
              <div className='text-sm rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark p-4 w-full'>
                <p className='font-semibold'>Instruções:</p>
                <p>Quando estiver pronto, aperte o botão falar e leia o texto em voz alta. Quando terminar, clique em 'Parar' e veja sua pontuação. <span className='text-fluency-yellow-600 font-semibold'>Talvez você precise tentar mais de uma vez. Este ainda é um recurso em teste.</span></p>
              </div>
              <div className='rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 w-full'>
                <h2 className='font-bold text-lg'>{selectedAudio.name}</h2>
                <p>{selectedAudio.transcript}</p>
                <FluencyButton
                  className='px-2 mt-3'
                  variant={isRecording ? 'danger' : 'orange'}
                  onClick={toggleRecognition}
                >
                  {isRecording ? 'Parar' : 'Falar'}
                </FluencyButton>
              </div>

              <div className='rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 w-full'>
                <p className='font-bold text-lg'>Texto falado: <span className='font-normal text-ld'>{spokenText}</span></p>
                {score !== null && <p className='font-bold text-lg'>Pontuação: <span className='text-fluency-orange-500'>{score}%</span></p>}
              </div>

            </div>
          ) : (
            <p>Carregando texto...</p>
          )}
        </div>
      </div>
      <NodeViewContent className="content is-editable" />
    </NodeViewWrapper>
  );
};

export default SpeakingComponent;
