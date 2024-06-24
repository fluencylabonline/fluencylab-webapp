'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import AudioPlayer from './player';
import { useSession } from "next-auth/react";
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import { TbPencilCheck } from 'react-icons/tb';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { IoMdArrowRoundForward } from 'react-icons/io';

interface NivelamentoDocument {
    id: string;
    transcript: string;
    url: string;
}

interface WordInput {
    word: string;
    isInput: boolean;
    userAnswer: string;
    isCorrect: boolean | null;
}

export default function Listening(){
  const { data: session } = useSession();
  const [nivelamentoData, setNivelamentoData] = useState<NivelamentoDocument[]>([]);
  const [randomDocument, setRandomDocument] = useState<NivelamentoDocument | null>(null);
  const [wordInputs, setWordInputs] = useState<WordInput[]>([]);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchNivelamentoData = async () => {
        const nivelamentoCollectionRef = collection(db, 'Nivelamento');
        const nivelamentoSnapshot = await getDocs(nivelamentoCollectionRef);
        const nivelamentoDocuments: NivelamentoDocument[] = nivelamentoSnapshot.docs.map(doc => {
            const data = doc.data() as NivelamentoDocument; // Explicitly define the type
            return {
                ...data
            };
        });
        setNivelamentoData(nivelamentoDocuments);
    };

    fetchNivelamentoData();
    }, []);

    useEffect(() => {
        if (nivelamentoData.length > 0) {
            const randomIndex = Math.floor(Math.random() * nivelamentoData.length);
            setRandomDocument(nivelamentoData[randomIndex]);
            const words = nivelamentoData[randomIndex].transcript.split(' ');
            const inputIndicesSet = new Set<number>();
            while (inputIndicesSet.size < Math.floor(words.length * 0.2)) {
                inputIndicesSet.add(Math.floor(Math.random() * words.length));
            }
            const inputs: WordInput[] = [];
            words.forEach((word, index) => {
                if (inputIndicesSet.has(index)) {
                    inputs.push({ word, isInput: true, userAnswer: '', isCorrect: null });
                } else {
                    inputs.push({ word, isInput: false, userAnswer: word, isCorrect: null });
                }
            });
            setWordInputs(inputs);
        }
    }, [nivelamentoData]);

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
        let score = 0;
        const updatedWordInputs = wordInputs.map(input => {
            if (input.isInput) {
                const isCorrect = input.word.toLowerCase() === input.userAnswer.trim().toLowerCase();
                if (isCorrect) score++;
                return { ...input, isCorrect };
            }
            return input;
        });
        setWordInputs(updatedWordInputs);
        setInputsDisabled(true);
    };
    
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const confirmModal = () => {
        setIsModalOpen(false);
        checkAnswers();
    };

    return(
        <div className='min-h-[90vh] w-full flex flex-col justify-center items-center px-12 p-8'>
        <Toaster />

            <FluencyButton variant='gray'>Adicionar áudio</FluencyButton>
            {randomDocument && (
                <div className='max-w-[80%] text-justify flex flex-col gap-2 items-center justify-center p-8 rounded-md text-lg' key={randomDocument.id}>
                    <AudioPlayer src={randomDocument.url} />
                    <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark p-10 rounded-md'>
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
                            >
                                Jogar novamente
                            </FluencyButton>
                            <FluencyButton
                            className='mt-4 flex flex-row items-center'
                            variant='confirm'
                            >
                                Praticar outro
                            </FluencyButton>
                        </div>
                    ) : (
                        <FluencyButton
                            variant='orange'
                            onClick={openModal}
                        >
                            Verificar Respostas <TbPencilCheck className='ml-1 w-5 h-auto' />
                        </FluencyButton>
                    )}
                </div>
            )}
            {isModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeModal}/>
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Tem certeza que quer verificar as respostas?                            
                                    </h3>
                                    <div className="flex justify-center">
                                        <FluencyButton variant='confirm' onClick={confirmModal}>Sim, verificar</FluencyButton>
                                        <FluencyButton variant='danger' onClick={closeModal}>Não, cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    </div>
    )
}