'use client'
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { db, storage } from '@/app/firebase'; // Ensure 'db' and 'storage' are correctly imported from your Firebase setup
import AudioPlayer from './player';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { MdDelete } from 'react-icons/md';

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

export default function Listening() {
    const { data: session } = useSession();
    const [nivelamentoData, setNivelamentoData] = useState<NivelamentoDocument[]>([]);
    const [randomDocument, setRandomDocument] = useState<NivelamentoDocument | null>(null);
    const [wordInputs, setWordInputs] = useState<WordInput[]>([]);
    const [inputsDisabled, setInputsDisabled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioName, setAudioName] = useState<string>(''); // State to hold the custom audio name
    const [shouldPracticeAnother, setShouldPracticeAnother] = useState(false);
    const [shouldPlayAgain, setShouldPlayAgain] = useState(false);

    useEffect(() => {
        const fetchNivelamentoData = async () => {
            // Retrieve ID from URL params
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
    
            if (id) {
                try {
                    const docRef = doc(db, 'Nivelamento', id);
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
            } else {
                // If no ID provided in URL, fetch all documents and choose randomly
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
    
                const randomIndex = Math.floor(Math.random() * nivelamentoDocuments.length);
                const randomDoc = nivelamentoDocuments[randomIndex];
                setRandomDocument(randomDoc);
                setSelectedAudio(randomDoc.url);
                prepareWordInputs(randomDoc.transcript);
            }
        };
    
        fetchNivelamentoData();
    }, []);

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

    const openCreate = () => {
        setIsCreateOpen(true);
    };

    const closeCreate = () => {
        setIsCreateOpen(false);
    };

    const handlePlayAudio = (doc: NivelamentoDocument) => {
        setSelectedAudio(doc.url);
        setRandomDocument(doc);
        prepareWordInputs(doc.transcript);

        const url = new URL(window.location.href);
        url.searchParams.set('id', doc.id);
        url.searchParams.set('name', doc.name);
    
        window.history.replaceState(null, '', url.toString());
    };

    const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAudioFile(event.target.files[0]);
        }
    };

    const handleTranscriptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTranscript(event.target.value);
    };

    const handleAudioNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAudioName(event.target.value);
    };


    const handleAddAudio = async () => {
        if (!audioFile || !transcript.trim() || !audioName.trim()) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }

        try {
            const storageRef = ref(storage, `audios/${audioFile.name}`);
            await uploadBytes(storageRef, audioFile);
            const audioUrl = await getDownloadURL(storageRef);

            // Use custom name as document ID instead of auto-generated ID
            await addDoc(collection(db, 'Nivelamento'), {
                name: audioName.trim(),
                transcript: transcript,
                url: audioUrl
            });

            toast.success('Áudio adicionado com sucesso!');
            setTranscript('');
            setAudioFile(null);
            setAudioName('');
        } catch (error) {
            toast.error('Ocorreu um erro ao adicionar o áudio. Tente novamente mais tarde.');
            console.error('Error adding audio: ', error);
        }
    };

    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const [audioToDelete, setAudioToDelete] = useState<NivelamentoDocument | null>(null);
    
    const openDeleteConfirmationModal = (audio: NivelamentoDocument) => {
        setAudioToDelete(audio);
        setIsDeleteConfirmationModalOpen(true);
    };
    
    const closeDeleteConfirmationModal = () => {
        setIsDeleteConfirmationModalOpen(false);
    };
    
    const handleDeleteAudio = async () => {
        if (!audioToDelete) return;
    
        try {
            await deleteDoc(doc(db, 'Nivelamento', audioToDelete.id));
            toast.success('Áudio excluído com sucesso!');
            
            // Update state to remove the deleted audio from nivelamentoData
            setNivelamentoData(prevData => prevData.filter(doc => doc.id !== audioToDelete.id));
            
            setIsDeleteConfirmationModalOpen(false); // Close modal after deletion
            setAudioToDelete(null); // Reset audioToDelete state
        } catch (error) {
            toast.error('Ocorreu um erro ao excluir o áudio. Tente novamente mais tarde.');
            console.error('Error deleting audio: ', error);
        }
    };
    
    const handlePracticeAnother = () => {
        setShouldPracticeAnother(true);
        setWordInputs([]); // Reset wordInputs
        setInputsDisabled(false); // Enable inputs
    };
    
    const handlePlayAgain = () => {
        setShouldPlayAgain(true);
        prepareWordInputs(randomDocument?.transcript || '');
    };
    
    useEffect(() => {
        if (shouldPracticeAnother) {
            // Logic to fetch and set another random document or reset necessary states
            // Example: Fetch another random document from nivelamentoData
            const randomIndex = Math.floor(Math.random() * nivelamentoData.length);
            const randomDoc = nivelamentoData[randomIndex];
            setRandomDocument(randomDoc);
            setSelectedAudio(randomDoc.url);
            prepareWordInputs(randomDoc.transcript);
    
            setShouldPracticeAnother(false); // Reset flag
        }
    }, [shouldPracticeAnother, nivelamentoData]);
    
    useEffect(() => {
        if (shouldPlayAgain) {
            // Logic to play the current audio again
            prepareWordInputs(randomDocument?.transcript || '');
    
            setShouldPlayAgain(false); // Reset flag
        }
    }, [shouldPlayAgain, randomDocument]);

    useEffect(() => {
        const fetchAllAudios = async () => {
            try {
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
            } catch (error) {
                console.error('Error fetching all audios: ', error);
                toast.error('Ocorreu um erro ao carregar os áudios. Tente novamente mais tarde.');
            }
        };

        fetchAllAudios();
    }, []);
    
    return (
        <div className='min-h-[90vh] w-full flex flex-col justify-center items-center px-12 p-8'>
            <Toaster />

            <div className='flex flex-row items-start justify-between p-2 w-full gap-2'>
                <div className='max-w-[80%] text-justify flex flex-col gap-1 items-center justify-center rounded-md text-lg'>
                    {selectedAudio && <AudioPlayer src={selectedAudio} />}
                    {randomDocument && (
                        <div className='flex flex-col items-center gap-2' key={randomDocument.id}>
                            <div className='h-[60vh] overflow-hidden overflow-y-scroll bg-fluency-pages-light dark:bg-fluency-pages-dark p-10 rounded-md'>
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
                                    <FluencyButton
                                        className='mt-4 flex flex-row items-center'
                                        variant='confirm'
                                        onClick={handlePracticeAnother}
                                    >
                                        Praticar outro
                                    </FluencyButton>
                                </div>
                            ) : (
                                <FluencyButton
                                    variant='orange'
                                    onClick={openModal}
                                >
                                    Verificar Respostas
                                </FluencyButton>
                            )}
                        </div>
                    )}
                </div>

                <div className='w-[20%] flex flex-col p-3 gap-3 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md'>
                    <h3 className='text-lg font-semibold mb-2'>Lista de áudios</h3>
                    <ul className='w-full h-[50vh] flex gap-1 flex-col overflow-hidden overflow-y-scroll'>
                        {nivelamentoData.map((doc) => (
                            <li key={doc.id} className='flex gap-2 items-center justify-between'>
                                <button
                                    onClick={() => handlePlayAudio(doc)}
                                    className={`py-1 px-4 w-full text-left font-bold rounded-md border-2 border-transparent focus:outline-none ${selectedAudio === doc.url ? 'bg-[#E64E17]' : 'hover:bg-fluency-gray-200 dark:hover:bg-gray-800'}`}
                                >
                                    {doc.name}
                                </button>
                                {session?.user.role === 'teacher' &&
                                <button
                                    onClick={() => openDeleteConfirmationModal(doc)}
                                    className='w-10 text-red-500 hover:text-red-700 focus:outline-none'
                                >
                                <MdDelete />
                                </button>}
                            </li>
                        ))}
                    </ul>

                    {session?.user.role === 'teacher' &&
                    <FluencyButton onClick={openCreate} variant='gray'>Adicionar áudio</FluencyButton>}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeModal} />
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

            {isCreateOpen && (
                <div className='fixed inset-0 flex justify-center items-center z-50'>
                    <div className='bg-gray-900 bg-opacity-70 fixed inset-0' onClick={closeCreate}></div>
                    <div className='relative bg-white dark:bg-[#1D1D1D] rounded-lg p-8 z-10'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-lg font-semibold'>Adicionar Novo Áudio</h2>
                            <input
                                type="file"
                                accept="audio/*"
                                className='border-2 border-fluency-gray-500 dark:border-fluency-gray-100 p-2 rounded-md outline-none'
                                onChange={handleAudioChange}
                            />
                            <input
                                type="text"
                                placeholder="Nome do Áudio"
                                className='border-2 border-fluency-gray-500 dark:border-fluency-gray-100 p-2 rounded-md outline-none'
                                value={audioName}
                                onChange={handleAudioNameChange}
                            />
                            <textarea
                                placeholder='Transcrição'
                                className='border-2 border-fluency-gray-500 dark:border-fluency-gray-100 p-2 rounded-md outline-none'
                                value={transcript}
                                onChange={handleTranscriptChange}
                            />
                            <FluencyButton onClick={handleAddAudio} className='self-center' variant='confirm'>Adicionar Áudio</FluencyButton>
                            
                        </div>
                    </div>
                </div>
            )}

            {isDeleteConfirmationModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeDeleteConfirmationModal}/>
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Tem certeza que deseja excluir o áudio?
                                    </h3>
                                    <div className="flex justify-center">
                                        <FluencyButton variant='danger' onClick={handleDeleteAudio}>
                                            Sim, excluir
                                        </FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeDeleteConfirmationModal}>
                                            Não, cancelar
                                        </FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
