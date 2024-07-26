'use client';
import React, { useState, useEffect, FC } from 'react';
import { collection, addDoc, getDocs, query, doc as firestoreDoc, setDoc, getDoc, updateDoc, deleteDoc, doc, where, onSnapshot } from 'firebase/firestore';
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

interface Deck {
    id: string;
    name: string;
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

interface DeckData {
    id: string;
    name: string;
    cardsToReviewCount: number;
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
    const [otherDecksList, setOtherDecksList] = useState<boolean>(false);

    const openOtherlDecks = () => {setOtherDecksList(true)}
    const closeOtherlDecks = () => {setOtherDecksList(false)}
    const openGlobalDecks = () => {setGlobalDecks(true)}
    const closeGlobalDecks = () => {setGlobalDecks(false)}
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
        const fetchOtherDecks = async () => {
            try {
                const decksQuery = query(collection(db, 'Flashcards'));
                const decksSnapshot = await getDocs(decksQuery);
                const decksData = decksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
                setOtherDecks(decksData);
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        };
        fetchOtherDecks();
    }, []);

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
        const fetchDecks = async () => {
            if(currentUserId){
                try {
                    const decksQuery = query(collection(db, 'users', currentUserId, 'Decks'));
                    const decksSnapshot = await getDocs(decksQuery);
                    const decksData = decksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
                    setDecks(decksData);
                } catch (error) {
                    console.error('Error fetching decks:', error);
                }
            }
        };
        fetchDecks();
    }, []);

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

    const createDeck = async () => {
        if (newDeckName) {
            try {
                const deckRef = firestoreDoc(db, 'Flashcards', newDeckName);
                const deckDoc = await getDoc(deckRef);

                if (!deckDoc.exists()) {
                    await setDoc(deckRef, {});
                    setDecks(prevDecks => [...prevDecks, { id: newDeckName, name: newDeckName }]);
                    setSelectedDeck(newDeckName);
                    toast.success("Deck criado!");
                } else {
                    alert('Deck already exists!');
                }
            } catch (error) {
                console.error('Error creating deck:', error);
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

    const fetchDecks = async () => {
        if(currentUserId){
            try {
                const decksQuery = query(collection(db, 'users', currentUserId, 'Decks'));
                const decksSnapshot = await getDocs(decksQuery);
                const decksData = decksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
                setDecks(decksData);
            } catch (error) {
                console.error('Error fetching decks:', error);
            }
        }
    };
    fetchDecks();

    const confirmOtherDeckAddition = async () => {
        const studentId = session?.user.id;
        try {
            if (studentId && selectedDeck) {
                await addSelectDeck(selectedDeck, studentId);
                closeConfirmModal();
                fetchDecks()
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
                toast.success("Deck e cartões adicionados ao aluno!");
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
           <div className='flex flex-col w-max items-center justify-center p-6 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>
            <div className='flex flex-row gap-2 items-center'>
                {session?.user.role === 'student' &&
                <>
                    <FluencyButton variant='gray' onClick={openGlobalDecks}>Seus decks</FluencyButton>
                    <FluencyButton variant='warning' onClick={openOtherlDecks}>Outros decks</FluencyButton>
                    
                </>}
                {decks.some(deck => deck.cardsToReviewCount > 0) && (
                <div className='flex flex-col items-center'>
                    <h2 className='text-xl font-semibold mb-4'>Decks para Revisão</h2>
                    <ul className='flex flex-col items-start p-4 gap-2'>
                        {decks.filter(deck => deck.cardsToReviewCount > 0).map(deck => (
                            <li className='flex flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark w-full justify-between' key={deck.id}>
                                <p className='font-bold'>{deck.name}</p>
                                <div className='flex flex-row gap-2 items-center'>
                                    <span className='font-semibold'>{deck.cardsToReviewCount} cartões para revisar</span>
                                    <button className='bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hoverdark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' onClick={() => selectDeck(deck.id)}>Revisar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
                {session?.user.role === 'teacher' &&
                <div className='flex flex-col items-center gap-2 p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>
                {session?.user.role === 'teacher' && <FluencyButton variant='confirm' onClick={openModal}>Criar ou Editar deck</FluencyButton>}
                {session?.user.role === 'teacher' && 
                <div className='flex flex-col items-center gap-2 p-2'>
                    Lista de decks
                    <ul className='flex flex-col items-start p-4 gap-2'>
                        {otherDecks.map(deck => (
                            <li className='flex flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-bg-light dark:bg-fluency-bg-dark w-full justify-between' key={deck.id}>
                                <p className='font-bold'>{deck.name}</p>
                                <div className='flex flex-row gap-2 items-center'>
                                    <button className='bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hoverdark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' value={deck.name} onClick={() => openConfirmModal(deck.id)}>Enviar para Aluno</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>}
                </div>}
            </div>
            {globalDecksPractice &&
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center gap-2 p-8'>
                <p><span className='font-semibold'>Deck: </span>{decks.find(deck => deck.id === selectedDeck)?.name}</p>
                <p className='flex flex-row gap-1 items-center p-1 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'><span className='font-bold'>Cartões:</span> {cards.length}</p>
                {cards[currentCard] && (
                        <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)} style={{ backgroundColor: isFlipped ? '#65C6E0' : '#65C6E0' }}>
                            <div className={`flashcard__front font-bold ${isFlipped ? 'flipped' : ''}`}>
                                {cards[currentCard].front}
                            </div>
                            <div className={`flashcard__back font-bold ${isFlipped ? 'flipped' : 'hidden'}`}>
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
             </div>}
            </div>

            {globalDecks &&
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all p-8">
                        <FluencyCloseButton onClick={closeGlobalDecks}/>
                        <div className='flex flex-col items-center'>
                            <h2>Seus decks:</h2>
                            <ul className='flex flex-col items-start p-4 gap-2'>
                            {decks.map(deck => (
                                <li className='flex flex-col sm:flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between' key={deck.id}>
                                    <p className='font-bold'>{deck.name}</p>
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
                    </div>
                </div>
            </div>}

            {otherDecksList &&
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all p-8">
                        <FluencyCloseButton onClick={closeOtherlDecks}/>
                        
                        <div className='flex flex-col items-center'>
                            <h2>Outros decks:</h2>

                            <ul className='flex flex-col items-start p-4 gap-2'>
                            {otherDecks.map(otherDecks => (
                                <li className='flex flex-col sm:flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between' key={otherDecks.id}>
                                    <p className='font-bold'>{otherDecks.name}</p>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <button className='bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hoverdark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' value={otherDecks.name} onClick={() => openOtherConfirmModal(otherDecks.id)}>Praticar</button>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>}

            {isModalOpen && 
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-[90vh] p-5 m-8">
                        <div className="flex flex-col items-center">
                            <FluencyCloseButton onClick={closeModal}/>
                            
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                FlashCards
                            </h3>

                            <div className="mt-2 flex flex-col gap-3 p-4 w-full h-full">                    
                                <div className='flex flex-row items-start w-full justify-around gap-4'>
                                    
                                    <div className='flex flex-col gap-3 items-center w-full h-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md'>
                                    <h4 className="text-lg leading-6 font-medium">Criar cartão</h4>
                                        <div className='flex flex-row gap-2 w-full items-center'>
                                            <select className="ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)}>
                                                <option value="">Selecione um deck</option>
                                                {otherDecks.map(deck => (
                                                    <option key={deck.id} value={deck.id}>
                                                        {deck.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <FluencyInput 
                                                type="text" 
                                                value={newDeckName} 
                                                onChange={e => setNewDeckName(e.target.value)} 
                                                className='w-full'
                                                placeholder="Ou crie um deck novo" 
                                            />
                                            <FluencyButton className='w-full' onClick={createDeck}>Criar deck</FluencyButton>
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
                                        <ul className='w-full h-[65vh] overflow-y-scroll p-4 flex flex-col gap-2'>
                                            {otherCards.map(card => (
                                                <li key={card.id} className="flex flex-row items-center border-b border-gray-200">
                                                    <div className='flex flex-row items-center w-full justify-around bg-fluency-blue-200 dark:bg-fluency-blue-1100 p-2 rounded-md'>
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
                                    </div>
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

