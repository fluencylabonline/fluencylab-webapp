'use client';
import React, { useEffect, useState, useRef } from 'react';

// Firebase imports
import { db } from '@/app/firebase';
import { doc, getDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import FluencyButton from '@/app/ui/Components/Button/button';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

interface NivelamentoDocument {
    id: string;
    transcript: string;
    url: string;
    name: string;
}

interface SpeechPracticeProps {
    transcriptId: string; // Required prop for the transcript ID
}

const SpeechPractice: React.FC<SpeechPracticeProps> = ({ transcriptId }) => {
    const [selectedAudio, setSelectedAudio] = useState<NivelamentoDocument | null>(null);
    const [spokenText, setSpokenText] = useState<string>('');
    const [score, setScore] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [finalTranscript, setFinalTranscript] = useState<string>('');

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const docRef = doc(db, 'Nivelamento', transcriptId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as NivelamentoDocument;
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
    }, [transcriptId]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
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

            recognitionRef.current.onerror = (event: any) => {
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
                recognitionRef.current.stop();
                setIsRecording(false);
                if (selectedAudio) {
                    calculateScore(finalTranscript, selectedAudio.transcript);
                }
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

    const cleanText = (text: string) => {
        return text
            .replace(/[.,!?]/g, '')
            .replace(/\b(?:he's|she's|it's|we're|they're|he|she|it|we|they|has|had|does|do)\b/g, '')
            .toLowerCase();
    };

    const calculateScore = (spoken: string, original: string) => {
        const cleanedSpoken = cleanText(spoken);
        const cleanedOriginal = cleanText(original);

        const spokenWords = cleanedSpoken.split(' ');
        const originalWords = cleanedOriginal.split(' ');

        const matchedWords = spokenWords.filter(word => originalWords.includes(word));
        const score = (matchedWords.length / originalWords.length) * 100;
        setScore(Math.round(score));
    };

    return (
        <div className='flex flex-col items-center gap-2 w-full p-4'>
            <Toaster />

            {selectedAudio ? (
                <div className='flex flex-col items-center gap-2 h-full'>
                    <div className='rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 w-full'>
                        <p className='font-semibold'>Instruções:</p>
                        <p>Quando estiver pronto, aperte o botão falar e leia o texto em voz alta. Quando terminar, clique em Parar e veja sua pontuação.</p>
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
                        <p className='font-bold text-lg'>Texto falado: {spokenText}</p>
                        {score !== null && <p className='font-bold text-lg'>Pontuação: {score}%</p>}
                    </div>
                </div>
            ) : (
                <p>Carregando texto...</p>
            )}
        </div>
    );
}

export default SpeechPractice;
