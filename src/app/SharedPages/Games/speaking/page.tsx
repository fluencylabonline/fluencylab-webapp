'use client';
import React, { useEffect, useState, useRef } from 'react';

// Firebase imports
import { db } from '@/app/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import FluencyInput from '@/app/ui/Components/Input/input';
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

export default function Speaking() {
    const [nivelamentoData, setNivelamentoData] = useState<NivelamentoDocument[]>([]);
    const [filteredData, setFilteredData] = useState<NivelamentoDocument[]>([]); // State for filtered data
    const [selectedAudio, setSelectedAudio] = useState<NivelamentoDocument | null>(null);
    const [spokenText, setSpokenText] = useState<string>('');
    const [score, setScore] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
    const [shouldPracticeAnother, setShouldPracticeAnother] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // New state for recording
    const [finalTranscript, setFinalTranscript] = useState<string>(''); // Track final transcript

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const fetchNivelamentoData = async () => {
            try {
                // Fetch all documents
                const nivelamentoCollectionRef = collection(db, 'Nivelamento');
                const nivelamentoSnapshot = await getDocs(nivelamentoCollectionRef);
                const nivelamentoDocuments: NivelamentoDocument[] = nivelamentoSnapshot.docs.map(doc => {
                    const data = doc.data() as NivelamentoDocument;
                    return {
                        id: doc.id,
                        transcript: data.transcript,
                        url: data.url,
                        name: data.name,
                    };
                });
                setNivelamentoData(nivelamentoDocuments);
                setFilteredData(nivelamentoDocuments); // Set filtered data initially

                // Retrieve ID from URL params
                const params = new URLSearchParams(window.location.search);
                const id = params.get('id');

                if (id) {
                    // Fetch specific document
                    const docRef = doc(db, 'Nivelamento', id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data() as NivelamentoDocument;
                        setSelectedAudio(data);
                        const url = new URL(window.location.href);
                        url.searchParams.set('id', docSnap.id);
                        url.searchParams.set('name', data.name);
                        window.history.replaceState(null, '', url.toString());
                    } else {
                        console.error('Document does not exist.');
                    }
                } else {
                    // Select a random document if no ID is provided
                    const randomIndex = Math.floor(Math.random() * nivelamentoDocuments.length);
                    const randomDoc = nivelamentoDocuments[randomIndex];
                    setSelectedAudio(randomDoc);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
                toast.error('Error fetching documents. Please try again later.');
            }
        };

        fetchNivelamentoData();
    }, [shouldPracticeAnother]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true; // Allow continuous recognition
            recognitionRef.current.interimResults = true; // Enable interim results
            recognitionRef.current.lang = 'en-US'; // Set the language as needed

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
                setFinalTranscript(finalTranscript); // Save final transcript
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event);
                toast.error('Speech recognition error. Please try again.');
            };
        } else {
            toast.error('Web Speech API not supported in this browser.');
        }

        // Cleanup function to stop recognition if the component unmounts
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        // Filter data based on search query
        const filtered = nivelamentoData.filter(doc =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchQuery, nivelamentoData]);

    const toggleRecognition = () => {
        if (recognitionRef.current) {
            if (isRecording) {
                recognitionRef.current.stop();
                setIsRecording(false);
                if (selectedAudio) {
                    // Calculate score only after stopping
                    calculateScore(finalTranscript, selectedAudio.transcript);
                }
            } else {
                if (!recognitionRef.current.recognizing) {
                    recognitionRef.current.start();
                    setIsRecording(true);
                    setSpokenText(''); // Clear previous spoken text
                    setScore(null); // Reset score
                }
            }
        }
    };

    const cleanText = (text: string) => {
        return text
            .replace(/[.,!?]/g, '') // Remove punctuation
            .replace(/\b(?:he's|she's|it's|we're|they're|he|she|it|we|they|has|had|does|do)\b/g, '') // Remove contractions
            .toLowerCase(); // Convert to lowercase
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

    const handlePlayAudio = (doc: NivelamentoDocument) => {
        setSelectedAudio(doc);
        const url = new URL(window.location.href);
        url.searchParams.set('id', doc.id);
        url.searchParams.set('name', doc.name);
        window.history.replaceState(null, '', url.toString());
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='flex flex-col sm:flex-row items-start gap-2 w-full p-4'>
            <Toaster />

            <div className='flex flex-col items-center w-full h-max p-4 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>
                <FluencyInput 
                    placeholder='Procure aqui...' 
                    value={searchQuery} 
                    onChange={handleSearchChange} 
                />
                {filteredData.length === 0 ? (
                    <p>No data available.</p>
                ) : (
                    <ul className='min-w-[23vw] h-[75vh] flex gap-1 flex-col overflow-hidden overflow-y-scroll'>
                        {filteredData.map(audio => (
                            <li className='flex flex-col sm:flex sm:flex-row gap-2 items-center justify-between' key={audio.id}>
                                <button 
                                    className={`py-1 px-4 w-full text-center font-bold rounded-md border-2 border-transparent focus:outline-none ${selectedAudio && selectedAudio.id === audio.id ? 'bg-[#E64E17] text-white' : 'hover:bg-fluency-gray-200 hover:text-fluency-orange-500 dark:hover:text-fluency-orange-500 dark:hover:bg-gray-800'}`}
                                    onClick={() => handlePlayAudio(audio)}>{audio.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedAudio && (
                <div className='flex flex-col items-center gap-2 h-full'>
                    <div className='rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 w-full'>
                        <p className='font-semibold'>Instruções:</p>
                        <p>Quando estiver pronto, aperte o botão falar e leia o texto em voz alta. Quando terminar, clique em 'Parar' e veja sua pontuação.</p>
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
            )}
        </div>
    );
}
