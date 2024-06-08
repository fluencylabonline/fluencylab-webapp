'use client'
import React, { useEffect, useState } from 'react';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import './player.css';
import FluencyButton from '@/app/ui/Components/Button/button';
import { TbPencilCheck } from 'react-icons/tb';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { db } from '@/app/firebase';
import { IoMdArrowRoundForward } from 'react-icons/io';
import { PiExam } from 'react-icons/pi';

export default function Audio() {
    const router = useRouter();
    const { data: session } = useSession();

    const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                    } else {
                      console.log("No such document!");
                  }
              } catch (error) {
                  console.error("Error fetching document: ", error);
              }
          }
      };

      fetchUserInfo()
  }, [session]);

    const [score, setScore] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioFileName, setAudioFileName] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [wordInputs, setWordInputs] = useState<{ word: string; isInput: boolean; userAnswer: string; isCorrect: boolean | null }[]>([]);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputsDisabled, setInputsDisabled] = useState(false);

    useEffect(() => {
        const fetchAudioAndTranscript = async () => {
            try {
                const storageRef = getStorage();
                const firestore = getFirestore();
                const audioRef = ref(storageRef, 'audios');

                const res = await listAll(audioRef);
                const audioFiles = res.items;

                if (audioFiles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * audioFiles.length);
                    const audioFile = audioFiles[randomIndex];
                    const url = await getDownloadURL(audioFile);
                    setAudioUrl(url);

                    // Extract audio file name
                    const audioFileName = audioFile.name;
                    setAudioFileName(audioFileName);

                    // Fetch transcript from Firestore
                    const transcriptDocRef = doc(firestore, 'transcriptions', audioFileName);
                    const transcriptDocSnap = await getDoc(transcriptDocRef);
                    if (transcriptDocSnap.exists()) {
                        const transcriptData = transcriptDocSnap.data();
                        if (transcriptData && transcriptData.transcript) {
                            const originalTranscript = transcriptData.transcript;
                            setTranscript(originalTranscript);

                            // Create placeholders for input fields
                            const words = originalTranscript.split(' ');
                            const inputIndices = new Set<number>();
                            while (inputIndices.size < Math.floor(words.length * 0.1)) {
                                inputIndices.add(Math.floor(Math.random() * words.length));
                            }
                            const inputs: { word: string; isInput: boolean; userAnswer: string; isCorrect: boolean | null }[] = [];
                            words.forEach((word: any, index: number) => {
                                if (inputIndices.has(index)) {
                                    inputs.push({ word, isInput: true, userAnswer: '', isCorrect: null });
                                } else {
                                    inputs.push({ word, isInput: false, userAnswer: word, isCorrect: null });
                                }
                            });
                            setWordInputs(inputs);
                        }
                    } else {
                        console.log('Transcript not found for', audioFileName);
                    }
                }
            } catch (error) {
                console.error("Error fetching audio and transcript:", error);
            }
        };

        fetchAudioAndTranscript();
    }, []);

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
        setScore(score);
        toast.success(`You got ${score} out of ${wordInputs.filter(input => input.isInput).length} correct!`);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const confirmModal = () => {
        closeModal();
        checkAnswers();
        handleChecking();
    };

    function handleChecking() {
        if (session && session.user) {
            const userId = session.user.id;
            const scoreData = {
                pontos: score,
                data: serverTimestamp(),
            };
    
            // Check if at least one answer is provided
            const hasAnswer = wordInputs.some(input => input.isInput && input.userAnswer.trim() !== '');
    
            if (hasAnswer) {
                try {
                    // Adding a new document with an auto-generated ID
                    addDoc(collection(db, "users", userId, "Nivelamento", "Nivel-3", "Audicao"), scoreData);
                    toast.success("Pontuação salva com sucesso!");
                } catch (error) {
                    toast.error("Erro ao salvar a pontuação");
                    console.error("Erro ao salvar a pontuação: ", error);
                }
            } else {
                toast.error("Por favor, preencha pelo menos uma resposta antes de salvar.");
            }
        }
    }
    
    function handleNextLevel(){
        router.push(`/student-dashboard/nivelamento/nivel-4/fala`);
    }

    return (
        <div className='min-h-[90vh] w-full flex flex-col justify-center items-center px-12 p-8'>
            <Toaster />

            {nivelamentoPermitido === false ? 
              (
              <div className='w-max h-full rounded-md bg-fluency-green-700 text-white font-bold p-6'>
                  <div className='flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
              </div>
              ):(
              <>
                {audioUrl && 
                <div className='flex flex-col gap-6 items-center w-full h-full'>
                    <p className='text-xl font-semibold'>Instrução: escute o áudio e complete os espaços com as palavras que faltam. Depois verifique suas respostas.</p>

                    <audio controls className="audio-player">
                        <source src={audioUrl} type="audio/mpeg" />
                    </audio>

                <div className='flex flex-col gap-2 items-center justify-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-8 rounded-md text-lg'>
                    {transcript && 
                        <p className='text-justify'>
                            {wordInputs.map((input, index) => (
                                <span key={index}>
                                    {input.isInput ? (
                                        <input
                                            type="text"
                                            className={`max-w-[8%] mx-2 font-bold bg-transparent border-fluency-gray-500 dark:border-fluency-gray-100 border-dashed border-b-[1px] outline-none ${input.isCorrect === true ? 'text-green-500' : input.isCorrect === false ? 'text-red-500' : 'text-black dark:text-white'}`}
                                            value={input.userAnswer}
                                            onChange={(event) => handleInputChange(index, event)}
                                            style={{ display: 'inline' }}
                                            disabled={inputsDisabled}
                                        />
                                    ) : (
                                        `${input.word} `
                                    )}
                                </span>
                            ))}
                        </p>
                    }
                    {inputsDisabled ? (
                        <FluencyButton
                        className='mt-4 flex flex-row items-center'
                        variant='warning'
                        onClick={handleNextLevel}
                        >
                        Próxima Lição <IoMdArrowRoundForward className="w-4 h-auto"/>
                        </FluencyButton>
                    ) : (
                        <FluencyButton
                        className='mt-4 flex flex-row items-center'
                        variant='confirm'
                        onClick={openModal}
                        >
                        Verificar Respostas <TbPencilCheck className='w-6 h-auto' />
                        </FluencyButton>
                    )}                
                </div>
            </div>}

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
            </div>)}
              </>
              )}
              
          
        </div>
    );
}
