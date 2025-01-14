'use client';
import React, { useState, useEffect, FC } from 'react';
import { collection, addDoc, getDocs, query, doc as firestoreDoc, setDoc, getDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/app/firebase'; 
import './flashcards.css';
import FluencyButton from '@/app/ui/Components/Button/button';
import toast, { Toaster } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyInput from '@/app/ui/Components/Input/input';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { Tooltip } from '@nextui-org/react';
import { FaArrowRight } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';
import {Tabs, Tab} from "@nextui-org/tabs";
import { IoClose } from 'react-icons/io5';

interface Deck {
    id: string;
    name: string;
    tags: string[];
}

interface Card {
    id: string;
    front: string;
    back: string;
    interval: number;
    dueDate: string;
    easeFactor: number;
    reviewCount: number;
}

interface Student {
    id: string;
    [key: string]: any;
}

const FlashCard: FC = () => {
    const { data: session } = useSession();
    const currentUserId = session?.user.id;
    const [decks, setDecks] = useState<any[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [currentCard, setCurrentCard] = useState<number>(0);
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [newDeckName, setNewDeckName] = useState<string>('');
    const [newCardFront, setNewCardFront] = useState<string>('');
    const [newCardBack, setNewCardBack] = useState<string>('');
    const [editedCardId, setEditedCardId] = useState<string>('');
    const [editedCardFront, setEditedCardFront] = useState<string>('');
    const [editedCardBack, setEditedCardBack] = useState<string>('');
    const [globalDecks, setGlobalDecks] = useState<boolean>(false);
    const [globalDecksPractice, setGlobalDecksPractice] = useState<boolean>(false);
    const [otherDecks, setOtherDecks] = useState<Deck[]>([]);
    const [otherCards, setOtherCards] = useState<Card[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);

    useEffect(() => {
        const fetchOtherDecks = async () => {
            try {
                const decksQuery = query(collection(db, 'Flashcards'));
                const decksSnapshot = await getDocs(decksQuery);
                const decksData = decksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.id, // Modify if the name is different in your document
                    tags: doc.data().tags || [], // Ensure tags is retrieved from the document
                }));
                setOtherDecks(decksData);
                setFilteredDecks(decksData); // Initially, show all decks
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        };
    
        fetchOtherDecks();
    }, []);
    
    useEffect(() => {
        const filtered = otherDecks.filter(deck => 
            deck.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredDecks(filtered);
    }, [searchTerm, otherDecks]);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const openModal = () => {setIsModalOpen(true);};
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDeck('');
        setNewDeckName('');
        setNewCardFront('');
        setNewCardBack('');
        setEditedCardId('');
        setEditedCardFront('');
        setEditedCardBack('');
    };
    
    useEffect(() => {
        if (selectedDeck) {
            fetchOtherCards(selectedDeck);
        }
    }, [selectedDeck]);

    const fetchOtherCards = async (deckId: string) => {
        try {
            const cardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
            const cardsSnapshot = await getDocs(cardsQuery);
            const otherCardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
            setOtherCards(otherCardsData);
            console.log(otherCardsData)
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    const fetchDecksWithReviewCount = async (userId: string) => {
        const decksQuery = query(collection(db, 'users', userId, 'Decks'));
        const decksSnapshot = await getDocs(decksQuery);
        const decksData = [];
        for (const deckDoc of decksSnapshot.docs) {
            const deckId = deckDoc.id;
            const cardsQuery = query(
                collection(db, 'users', userId, 'Decks', deckId, 'cards'),
                where('dueDate', '<=', new Date().toISOString())
            );
            const cardsSnapshot = await getDocs(cardsQuery);
            const cardsToReviewCount = cardsSnapshot.docs.length;
            decksData.push({ id: deckId, name: deckDoc.id, cardsToReviewCount });
            console.log(deckId, cardsToReviewCount)
        }
        return decksData;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (currentUserId) {
                try {
                    const fetchedDecks = await fetchDecksWithReviewCount(currentUserId);
                    setDecks(fetchedDecks);
                } catch (error) {
                    console.error('Error fetching decks:', error);
                }
            }
        };
        fetchData();
    }, [currentUserId]);

    useEffect(() => {
        if (selectedDeck) {
            fetchCards(selectedDeck);
        }
    }, [selectedDeck]);

    const fetchCards = async (deckId: string) => {
        if(currentUserId){
            try {
                const cardsQuery = query(
                    collection(db, 'users', currentUserId, 'Decks', deckId, 'cards'),
                    where('dueDate', '<=', new Date().toISOString())
                );
                const cardsSnapshot = await getDocs(cardsQuery);
                const cardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
                setCards(cardsData);
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        }
    };
    
    const selectDeck = (deckId: string) => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedDeck(deckId);
        setGlobalDecks(false)
        setGlobalDecksPractice(true)
    };

    const setDeckNull = () => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedDeck('');
        setGlobalDecksPractice(false)
    }

    const handleDeckSelection = async (deckId: string) => {
        setSelectedDeck(deckId);
        if (deckId) {
            try {
                const deckRef = firestoreDoc(db, 'Flashcards', deckId);
                const deckDoc = await getDoc(deckRef);
    
                if (deckDoc.exists()) {
                    const { tags: fetchedTags = [] } = deckDoc.data();
                    setTags(fetchedTags);
                    toast.success("Tags carregadas com sucesso!");
                } else {
                    setTags([]);
                    toast.error("Deck não possui tags.");
                }
            } catch (error) {
                console.error("Erro ao carregar tags:", error);
                toast.error("Erro ao carregar tags do deck.");
            }
        } else {
            setTags([]);
        }
    };
    
    const createDeck = async () => {
        if (newDeckName) {
            try {
                const deckRef = firestoreDoc(db, 'Flashcards', newDeckName);
                const deckDoc = await getDoc(deckRef);
                if (!deckDoc.exists()) {
                    await setDoc(deckRef, { tags });
                    setDecks((prevDecks) => [
                        ...prevDecks,
                        { id: newDeckName, name: newDeckName, tags },
                    ]);
                    setSelectedDeck(newDeckName);
                    toast.success("Deck criado com tags!");
                } else {
                    toast.error('Deck já existe!');
                }
            } catch (error) {
                console.error('Erro ao criar deck:', error);
                toast.error('Erro ao criar deck!');
            }
        }
    };    

    const addTag = async () => {
        if (newTag && !tags.includes(newTag) && selectedDeck) {
            const updatedTags = [...tags, newTag];
            try {
                const deckRef = firestoreDoc(db, 'Flashcards', selectedDeck);
                await updateDoc(deckRef, { tags: updatedTags }); // Update Firestore
                setTags(updatedTags); // Update state
                setNewTag(''); // Clear input field
                toast.success('Tag adicionada!');
            } catch (error) {
                console.error('Erro ao adicionar tag:', error);
                toast.error('Erro ao adicionar tag!');
            }
        }
    };
    
    const removeTag = async (index: number) => {
        if (selectedDeck) {
            const updatedTags = tags.filter((_, i) => i !== index);
            try {
                const deckRef = firestoreDoc(db, 'Flashcards', selectedDeck);
                await updateDoc(deckRef, { tags: updatedTags }); // Update Firestore
                setTags(updatedTags); // Update state
                toast.success('Tag removida!');
            } catch (error) {
                console.error('Erro ao remover tag:', error);
                toast.error('Erro ao remover tag!');
            }
        }
    };

    const addCard = async () => {
        if (selectedDeck && newCardFront && newCardBack) {
            try {
                const newCard = {
                    front: newCardFront,
                    back: newCardBack,
                    interval: 1,
                    dueDate: new Date().toISOString(),
                    easeFactor: 2.5,
                    reviewCount: 0,
                };
                await addDoc(collection(db, 'Flashcards', selectedDeck, 'cards'), newCard);
                    fetchOtherCards(selectedDeck);
                    setNewCardFront('');
                    setNewCardBack('');
                    toast.success('Cartão adicionado!');
            } catch (error) {
                console.error('Error adding card:', error);
            }
        }
    };
    
    const updateCard = async () => {
        try {
            const cardRef = firestoreDoc(db, 'Flashcards', selectedDeck, 'cards', editedCardId);
            await updateDoc(cardRef, { front: editedCardFront, back: editedCardBack });
            fetchCards(selectedDeck);
            toast.success('Cartão atualizado!');
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const deleteCard = async (cardId: string) => {
        try {
            const cardRef = firestoreDoc(db, 'Flashcards', selectedDeck, 'cards', cardId);
            await deleteDoc(cardRef);
            fetchCards(selectedDeck);
            toast.error('Cartão deletado!');
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleEditInputChange = (card: Card) => {
        setEditedCardId(card.id);
        setEditedCardFront(card.front);
        setEditedCardBack(card.back);
    };

    const reviewCard = async (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
        const card = cards.find(c => c.id === cardId);
        if (!card) return;
            let { interval, easeFactor, reviewCount } = card;
            const now = new Date();
        switch (rating) {
            case 'easy':
                easeFactor += 0.1;
                interval *= easeFactor;
                break;
            case 'medium':
                interval *= 1;
                break;
            case 'hard':
                easeFactor -= 0.2;
                interval = Math.max(1, interval / 2);
                break;
        }
        reviewCount += 1;
        const dueDate = new Date(now.setDate(now.getDate() + interval)).toISOString();
        if(currentUserId){
            try {
                const cardRef = doc(db, 'users', currentUserId, 'Decks', selectedDeck, 'cards', cardId);

                await updateDoc(cardRef, { interval, easeFactor, reviewCount, dueDate });
                fetchCards(selectedDeck);
                toast.success('Card reviewed successfully!');
            } catch (error) {
                console.error('Error reviewing card:', error);
            }
        }
        setIsFlipped(false)
    };

    const [isOtherConfirmModalOpen, setIsOtherConfirmModalOpen] = useState<boolean>(false);
    const openOtherConfirmModal = (deckId: string) => {
        setSelectedDeck(deckId);
        setIsOtherConfirmModalOpen(true);
    };
    
    const closeOtherConfirmModal = () => {
        setIsOtherConfirmModalOpen(false);
        setSelectedDeck('');
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    useEffect(() => {
        const fetchStudents = async () => {
            if (session) {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', session.user.id));
                const querySnapshot = await getDocs(q);
                
                const fetchedStudents: Student[] = [];
                
                querySnapshot.forEach((doc) => {
                    fetchedStudents.push({ id: doc.id, ...doc.data() });
                });
                
                setStudents(fetchedStudents);
            }
        };
        fetchStudents();
    }, [session]);
    
    const openConfirmModal = (deckId: string) => {
        setSelectedDeck(deckId);
        setIsConfirmModalOpen(true);
    };
    
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedDeck('');
    };

    const confirmDeckAddition = async () => {
        try {
            if (selectedStudentId && selectedDeck) {
                await addSelectDeck(selectedDeck, selectedStudentId);
                closeConfirmModal();
            } else {
                toast.error('Please select both student and deck.');
            }
        } catch (error) {
            console.error('Error adding deck to student:', error);
            toast.error('Failed to add deck to student.');
        }
    };

    const confirmOtherDeckAddition = async () => {
        const studentId = session?.user.id;
        try {
            if (studentId && selectedDeck) {
                await addSelectDeck(selectedDeck, studentId);
                closeConfirmModal();
            } else {
                toast.error('Please select both student and deck.');
            }
        } catch (error) {
            console.error('Error adding deck to student:', error);
            toast.error('Failed to add deck to student.');
        }
    };

    const addSelectDeck = async (deckId: string, studentId: string) => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedDeck(deckId);
    
        try {
            const deckRef = doc(db, 'Flashcards', deckId);
            const deckSnapshot = await getDoc(deckRef);
            if (deckSnapshot.exists()) {
                const deckData = deckSnapshot.data() as Deck;
                const userDeckRef = doc(db, 'users', studentId, 'Decks', deckId);
                await setDoc(userDeckRef, deckData);
                const cardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
                const cardsSnapshot = await getDocs(cardsQuery);
                const cardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
                const userCardsCollectionRef = collection(db, 'users', studentId, 'Decks', deckId, 'cards');
                await Promise.all(cardsData.map(async (card) => {
                    await addDoc(userCardsCollectionRef, {
                        front: card.front,
                        back: card.back,
                        interval: 1,
                        dueDate: new Date().toISOString(),
                        easeFactor: 2.5,
                        reviewCount: 0,
                    });
                }));
                toast.success("Deck adicionado! Recarregue a página.")
                fetchDecksWithReviewCount(studentId)
            } else {
                console.error('Deck not found.');
                toast.error("Deck not found.");
            }
        } catch (error) {
            console.error('Error adding deck and cards for the user:', error);
            toast.error("Error adding deck and cards for the user.");
        }
        setGlobalDecks(false);
        setIsOtherConfirmModalOpen(false);
    };
    
    return (
        <div className="flex flex-row items-center w-full min-h-[90vh] justify-center">
           <div className="flex flex-col items-center justify-start min-h-[87vh] w-full mt-4">
                <Tabs aria-label="Options" radius="lg" color="primary" classNames={{
                    tabList: "gap-2 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-fluency-gray-500 rounded-t-lg",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-white px-4 font-bold",
                    }}>
                    <Tab key="seus" title="Praticar">
                        <div>
                        {!globalDecksPractice ? (
                            <div className='flex flex-col items-center'>
                            <h2 className='font-bold text-lg'>Seus decks:</h2>
                            <ul className='flex flex-col items-start p-4 gap-2'>
                            {decks.map(deck => (
                                <li id='deck-bg' className='flex flex-col items-center gap-6 p-2 py-8 px-3 rounded-lg w-full justify-between' key={deck.id}>
                                    <p className='font-bold px-4'>{deck.name}</p>
                                    <div className='flex flex-col sm:flex-row gap-6 items-center'>
                                        <div className={`flex font-bold text-sm p-1 rounded-md ${
                                            deck.cardsToReviewCount > 0 ? 'text-orange-500' : 'text-green-500'
                                        }`}>
                                            {deck.cardsToReviewCount > 0
                                                ? `À Revisar: ${deck.cardsToReviewCount}`
                                                : 'Sem cartões para revisar'}
                                        </div>
                                        <button disabled={deck.cardsToReviewCount === 0} 
                                        className={`text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out ${
                                            deck.cardsToReviewCount === 0
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hover:dark:bg-fluency-orange-800'
                                            }`}
                                            value={deck.name} onClick={() => selectDeck(deck.id)}>
                                                Praticar
                                        </button>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                        ):(
                        <div className='flex flex-col items-center'>
                            <div className='flex flex-col items-center gap-2 p-2'>
                                <p>
                                    <span className='font-semibold'>
                                        Deck: {decks.find(deck => deck.id === selectedDeck)?.name}
                                    </span>
                                </p>
                                <p className='flex flex-row gap-1 items-center justify-around w-[90%] p-1 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-400'>
                                    <span className='font-bold flex flex-row items-center gap-1'>
                                        Cartões: {cards.length}
                                    </span>
                                    <button onClick={setDeckNull}><IoClose className='w-6 h-6' /></button>
                                </p>
                                {cards[currentCard] && (
                                    <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)} style={{ backgroundColor: isFlipped ? '#65C6E0' : '#65C6E0' }}>
                                        <div className={`flashcard__front font-bold px-4 text-center ${isFlipped ? 'flipped' : ''}`}>
                                            {cards[currentCard].front}
                                        </div>
                                        <div className={`flashcard__back font-bold px-4 text-center ${isFlipped ? 'flipped' : 'hidden'}`}>
                                            {cards[currentCard].back}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='flex flex-row gap-3 w-full justify-center'>
                                <div className='flex flex-row items-center gap-2 text-white'>
                                    {isFlipped && 
                                    <>
                                        <button
                                            className='bg-fluency-green-500 p-2 px-4 rounded-md font-bold'
                                            onClick={() => reviewCard(cards[currentCard].id, 'easy')}
                                        >
                                            Fácil
                                        </button>
                                        <button
                                            className='bg-fluency-orange-500 p-2 px-4 rounded-md font-bold'
                                            onClick={() => reviewCard(cards[currentCard].id, 'medium')}
                                        >
                                            Médio
                                        </button>
                                        <button
                                            className='bg-fluency-red-500 p-2 px-4 rounded-md font-bold'
                                            onClick={() => reviewCard(cards[currentCard].id, 'hard')}
                                        >
                                            Difícil
                                        </button>
                                        
                                        <button className='bg-fluency-blue-500 p-2 px-4 rounded-md font-bold'
                                            onClick={() => {
                                            setCurrentCard(prevCard => (prevCard + 1) % cards.length);
                                            setIsFlipped(false);
                                            }}>
                                            <FaArrowRight className='w-6 h-auto' />
                                        </button>
                                    </>}
                                </div>
                                {isFlipped ? (
                                    <></>
                                ):(
                                <button className='bg-fluency-orange-500 p-2 px-4 rounded-md font-bold text-white'
                                        onClick={() => {
                                        setCurrentCard(prevCard => (prevCard + 1) % cards.length);
                                        setIsFlipped(false);}}>
                                    Pular
                                </button>
                                )}
                            </div>
                        </div>)}
                        </div>
                    </Tab>

                    <Tab key="disponiveis" title="Decks">
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-xl mb-2">Decks</h2>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Procurar por nome ou tags..."
                                className="w-full dark:bg-fluency-pages-dark border border-gray-300 focus:outline-none rounded-md px-3 py-2 mb-2"
                            />
                            <ul className="flex flex-col items-start p-4 gap-2">
                                {filteredDecks.length > 0 ? (
                                    filteredDecks.map((deck) => (
                                        <li
                                            key={deck.id}
                                            className="flex flex-col sm:flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between"
                                        >
                                        <p className="font-bold">{deck.name}</p>
                                            <div className="flex flex-row gap-2 items-center">
                                                <button
                                                    className="bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hoverdark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out"
                                                    value={deck.name}
                                                    onClick={() => openOtherConfirmModal(deck.id)}
                                                >
                                                    Praticar
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-center text-gray-500">Nenhum deck encontrado.</li>
                                )}
                            </ul>
                        </div>
                    </Tab>

                    {session?.user.role === 'teacher' && (
                    <Tab key="criar" title="Criar/Editar">
                        <div>
                            <div className='flex flex-col items-center gap-2 p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>           
                                <div className='flex flex-row justify-center items-center gap-1 w-full px-4'>
                                    <FluencyButton className='w-full' variant='confirm' onClick={openModal}>Criar ou Editar deck</FluencyButton>
                                    <FluencyInput
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Procurar por nome ou tag"
                                        className="w-full"
                                    />
                                </div>
                            
                                <div className='flex flex-col items-center gap-1 h-fit max-h-[65vh] overflow-hidden overflow-y-scroll'>
                                    <ul className='flex flex-col items-start p-4 gap-2'>
                                        {filteredDecks.map(deck => (
                                            <li className='flex flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark w-full justify-between' key={deck.id}>
                                                <p className='font-bold'>{deck.name}</p>
                                                <div className='flex flex-row gap-2 items-center'>
                                                    <button className='bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hover:dark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' value={deck.name} onClick={() => openConfirmModal(deck.id)}>Enviar para Aluno</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Tab>)}
                </Tabs>
            </div>

            {isModalOpen && 
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-[95vh] p-3 m-5">
                        <div className="flex flex-col items-center h-[90vh]">
                            <FluencyCloseButton onClick={closeModal}/>
                            
                            <h3 className="text-xl leading-6 font-bold mb-2">
                                FlashCards
                            </h3>
                   
                            <div className='flex flex-col lg:flex lg:flex-row items-start w-full justify-around gap-4 overflow-y-auto h-[100vh]'>
                                <div className='flex flex-col gap-3 items-center w-full h-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md'>
                                <h4 className="text-lg leading-6 font-medium">Criar ou editar cartão</h4>
                                    <div className='flex flex-col gap-2 w-full items-start'>
                                        <select
                                            className="ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            value={selectedDeck}
                                            onChange={(e) => handleDeckSelection(e.target.value)}
                                            >
                                            <option value="">Selecione um deck</option>
                                            {otherDecks.map((deck) => (
                                                <option key={deck.id} value={deck.id}>
                                                    {deck.name}
                                                </option>
                                            ))}
                                        </select>

                                        <div className='flex flex-row gap-1 w-full'>
                                            <FluencyInput 
                                                type="text" 
                                                value={newDeckName} 
                                                onChange={e => setNewDeckName(e.target.value)} 
                                                className='w-full'
                                                placeholder="Ou crie um deck novo: 'Nome do deck - Idioma'" 
                                            />
                                            <FluencyButton className='w-min' onClick={createDeck}>Criar</FluencyButton>
                                        </div>

                                        <div className='flex flex-col items-start justify-center gap-2'>
                                            <h5 className="font-medium">Tags</h5>
                                            <div className="flex gap-2 items-center">
                                                <FluencyInput
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    placeholder="Adicionar Tag"
                                                    className="flex-grow"
                                                />
                                                <FluencyButton onClick={addTag}>Adicionar</FluencyButton>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag, index) => (
                                                    <div
                                                        key={index}
                                                        className="text-xs font-bold flex items-center bg-fluency-blue-200 dark:bg-fluency-blue-800 text-fluency-text-light dark:text-fluency-text-dark px-2 py-1 rounded-full"
                                                    >
                                                        <span>{tag}</span>
                                                        <button
                                                            className="ml-2 text-red-500"
                                                            onClick={() => removeTag(index)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <FluencyInput 
                                        type="text" 
                                        value={newCardFront} 
                                        onChange={e => setNewCardFront(e.target.value)} 
                                        placeholder="Frente do Cartão" 
                                    />
                                    <FluencyInput 
                                        type="text" 
                                        value={newCardBack}
                                        onChange={e => setNewCardBack(e.target.value)} 
                                        placeholder="Fundo do Cartão" 
                                    />
                                    <FluencyButton onClick={addCard}>Adicionar</FluencyButton>
                                </div>

                                <div className='flex flex-col items-center w-full h-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-2'>
                                    <h4 className="text-lg leading-6 font-medium">Cartões no deck</h4>
                                    {editedCardId && (
                                    <div className="flex flex-row gap-3 items-center w-full">
                                        <FluencyInput 
                                            type="text" 
                                            value={editedCardFront} 
                                            onChange={e => setEditedCardFront(e.target.value)} 
                                            placeholder="Frente do Cartão" 
                                        />
                                        <FluencyInput 
                                            type="text" 
                                            value={editedCardBack} 
                                            onChange={e => setEditedCardBack(e.target.value)} 
                                            placeholder="Fundo do Cartão" 
                                        />
                                        <FluencyButton onClick={updateCard}>Salvar</FluencyButton>
                                    </div>)}
                                    <ul className='w-full h-full overflow-y-scroll p-4 flex flex-col gap-2'>
                                        {otherCards.map(card => (
                                            <li key={card.id} className="flex flex-row items-center border-b border-gray-200">
                                                <div className='flex flex-col lg:flex lg:flex-row items-center w-full justify-around bg-fluency-blue-200 dark:bg-fluency-blue-1100 p-2 rounded-md'>
                                                    <div className="font-bold">Frente:</div> {card.front}
                                                    <div className="font-bold">Fundo:</div> {card.back}
                                                    <div className="flex gap-1">
                                                        <Tooltip className='bg-fluency-blue-500 font-bold text-sm text-white p-1 rounded-md' content="Editar cartão">
                                                        <button className='bg-fluency-blue-700 p-1 text-white rounded-md' onClick={() => handleEditInputChange(card)}>
                                                            <FiEdit3 />
                                                        </button>
                                                        </Tooltip>
                                                        <Tooltip className='bg-fluency-red-500 font-bold text-sm text-white p-1 rounded-md' content="Deletar cartão">
                                                        <button className='bg-fluency-red-700 p-1 text-white rounded-md' onClick={() => deleteCard(card.id)}>
                                                            <MdDeleteOutline />
                                                        </button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>}

            {isOtherConfirmModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeOtherConfirmModal} />
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Deseja adicionar este deck para aprendizado nos seus decks pessoais?
                                    </h3>
                                    <div className="flex justify-center">
                                        <FluencyButton variant='warning' onClick={confirmOtherDeckAddition} >Sim, quero aprender.</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeOtherConfirmModal}>Não, cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isConfirmModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeConfirmModal} />
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Enviar para aluno praticar
                                    </h3>
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className='p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark px-4'
                                        >
                                        <option value="">Selecione o Aluno</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>{student.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex justify-center">
                                        <FluencyButton variant='warning' onClick={confirmDeckAddition}>Sim, quero enviar.</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeConfirmModal}>Não, cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
         <Toaster />
      </div>
    );
};
export default FlashCard;

