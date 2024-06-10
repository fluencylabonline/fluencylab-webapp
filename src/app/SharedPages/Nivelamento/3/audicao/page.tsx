'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, serverTimestamp, getDocs, setDoc } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import AudioPlayer from './player';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { db } from '@/app/firebase';
import { PiExam } from 'react-icons/pi';
import FluencyButton from '@/app/ui/Components/Button/button';
import { IoMdArrowRoundForward } from 'react-icons/io';
import { TbPencilCheck } from 'react-icons/tb';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

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

  const [nivelamentoData, setNivelamentoData] = useState<NivelamentoDocument[]>([]);
  const [randomDocument, setRandomDocument] = useState<NivelamentoDocument | null>(null);
  const [wordInputs, setWordInputs] = useState<WordInput[]>([]);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [score, setScore] = useState(0);
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

            // Create placeholders for input fields
            const words = nivelamentoData[randomIndex].transcript.split(' ');
            const inputIndicesSet = new Set<number>();
            while (inputIndicesSet.size < Math.floor(words.length * 0.2)) { // Replace 20% of words with input fields
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
        setScore(score);
    };


    const handleNextLevel = async () => {
        if (!session) {
            return;
        }
    
        const userId = session.user.id;
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { NivelamentoPermitido: false }, { merge: true });
            router.push("/student-dashboard/nivelamento");
        } catch (error) {
            console.error('Error updating NivelamentoPermitido field:', error);
        }
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
            <Toaster />
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
                        <FluencyButton
                            className='mt-4 flex flex-row items-center'
                            variant='warning'
                            onClick={handleNextLevel}
                        >
                            Finalizar <IoMdArrowRoundForward className="w-4 h-auto"/>
                        </FluencyButton>
                    ) : (
                        <button
                            className="text-lg text-white font-bold gap-1 cursor-pointer flex flex-row items-center justify-center bg-fluency-orange-500 hover:bg-fluency-orange-600 duration-300 ease-in-out p-2 rounded-md px-3"
                            onClick={openModal}
                        >
                            Verificar Respostas <TbPencilCheck className='w-6 h-auto' />
                        </button>
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
            </>
            
          )}
          
      
    </div>
);
}