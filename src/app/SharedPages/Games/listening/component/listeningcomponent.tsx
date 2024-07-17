'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase'; // Ensure 'db' and 'storage' are correctly imported from your Firebase setup
import AudioPlayer from './playerComponent';
import FluencyButton from '@/app/ui/Components/Button/button';

interface NivelamentoDocument {
    id: string;
    transcript: string;
    url: string;
    name: string;
}

interface WordInput {
    word: string;
    isInput: boolean;
    userAnswer: string;
    isCorrect: boolean | null;
}

interface ListeningProps {
    audioId: string;
}

const ListeningComponent: React.FC<ListeningProps> = ({ audioId }) => {
    const { data: session } = useSession();
    const [randomDocument, setRandomDocument] = useState<NivelamentoDocument | null>(null);
    const [wordInputs, setWordInputs] = useState<WordInput[]>([]);
    const [inputsDisabled, setInputsDisabled] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [shouldPlayAgain, setShouldPlayAgain] = useState(false);

    useEffect(() => {
        const fetchNivelamentoData = async () => {
            try {
                const docRef = doc(db, 'Nivelamento', audioId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as NivelamentoDocument;
                    setRandomDocument({
                        id: docSnap.id,
                        transcript: data.transcript,
                        url: data.url,
                        name: data.name,
                    });
                    setSelectedAudio(data.url);
                    prepareWordInputs(data.transcript);
                } else {
                    console.error('Document does not exist.');
                    // Handle case where document with specified ID doesn't exist
                }
            } catch (error) {
                console.error('Error fetching document:', error);
                // Handle error fetching document
            }
        };

        fetchNivelamentoData();
    }, [audioId]);

    const prepareWordInputs = (transcript: string) => {
        const words = transcript.split(' ');
        const inputIndicesSet = new Set<number>();
        while (inputIndicesSet.size < Math.floor(words.length * 0.2)) {
            inputIndicesSet.add(Math.floor(Math.random() * words.length));
        }
        const inputs: WordInput[] = words.map((word, index) => ({
            word,
            isInput: inputIndicesSet.has(index),
            userAnswer: '',
            isCorrect: null
        }));
        setWordInputs(inputs);
        setInputsDisabled(false);
    };

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        const updatedWordInputs = [...wordInputs];
        updatedWordInputs[index].userAnswer = value;
        setWordInputs(updatedWordInputs);
    };

    const checkAnswers = () => {
        const emptyFields = wordInputs.filter(input => input.isInput && input.userAnswer.trim() === '').length;
        if (emptyFields === wordInputs.filter(input => input.isInput).length) {
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
            setShouldPlayAgain(false); // Reset flag
        }
    }, [shouldPlayAgain, randomDocument]);

    return (
        <div className='h-full w-full flex flex-col justify-center items-center'>
                <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 w-full text-justify flex flex-col gap-1 items-center justify-center rounded-md text-lg'>
                    {selectedAudio && <AudioPlayer src={selectedAudio} />}
                    {randomDocument && (
                        <div className='flex flex-col items-center gap-2' key={randomDocument.id}>
                            <div className='h-[60vh] overflow-hidden overflow-y-scroll p-10 rounded-md'>
                                {wordInputs.map((input, index) => (
                                    <span className='w-full' key={index}>
                                        {input.isInput ? <input
                                            type="text"
                                            className={`max-w-[15%] mx-1 font-bold bg-transparent border-fluency-gray-500 dark:border-fluency-gray-100 border-dashed border-b-[1px] outline-none ${input.isCorrect === true ? 'text-green-500' : input.isCorrect === false ? 'text-red-500' : 'text-black dark:text-white'}`}
                                            value={input.userAnswer}
                                            onChange={(e) => handleInputChange(index, e)}
                                            disabled={inputsDisabled}
                                        /> : input.word}
                                        {' '}
                                    </span>
                                ))}
                            </div>
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
                                    variant='confirm'
                                    onClick={checkAnswers}
                                >
                                    Verificar Respostas
                                </FluencyButton>
                            )}
                        </div>
                    )}
                </div>
            </div>
    );
};

export default ListeningComponent;
