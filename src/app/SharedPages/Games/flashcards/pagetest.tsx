'use client';
import React, { useState, useEffect, FC } from 'react';
import { collection, addDoc, getDocs, query, doc as firestoreDoc, setDoc, getDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/app/firebase'; 
import './flashcards.css';
import FluencyButton from '@/app/ui/Components/Button/button';
import toast, { Toaster } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyInput from '@/app/ui/Components/Input/input';
import { FiEdit3 } from 'react-icons/fi';
import { MdArrowForward, MdDeleteOutline } from 'react-icons/md';
import { Tooltip } from '@nextui-org/react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { useSession } from 'next-auth/react';

interface Deck {
    id: string;
    name: string;
}

interface Card {
    id: string;
    front: string;
    back: string;
    lastPlayed?: string;
    status?: string;
    review?: number; 
    reviewCount?: any;
    nextReviewDate?: string; 
}

const FlashCard: FC = () => {
    const { data: session } = useSession();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [cards, setCards] = useState<Card[]>([]);

    const [userDecks, setUserDecks] = useState<Deck[]>([]);
    const [userCards, setUserCards] = useState<Card[]>([]);
    const [selectedUserDeck, setSelectedUserDeck] = useState<string>('');

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
    const [personalDecks, setPersonalDecks] = useState<boolean>(false);
    const [globalDecksPractice, setGlobalDecksPractice] = useState<boolean>(false);
    const [personalDecksPractice, setPersonalDecksPractice] = useState<boolean>(false);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const totalCards = userCards.length;

    const nextCard = () => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
    };
    
    const openPersonalDecks = () => {
        setPersonalDecks(true)
    }

    const closePersonalDecks = () => {
        setPersonalDecks(false)
    }

    const openGlobalDecks = () => {
        setGlobalDecks(true)
    }

    const closeGlobalDecks = () => {
        setGlobalDecks(false)
    }

    const openModal = () => {
        setIsModalOpen(true);
    };
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
        const fetchDecks = async () => {
            try {
                const decksQuery = query(collection(db, 'Flashcards'));
                const decksSnapshot = await getDocs(decksQuery);
                const decksData = decksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
                setDecks(decksData);
            } catch (error) {
                console.error('Error fetching decks:', error);
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
        try {
            const cardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
            const cardsSnapshot = await getDocs(cardsQuery);
            const cardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
            setCards(cardsData);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    //PERSONAL DECKS
    useEffect(() => {
        const fetchUserDecks = async () => {
            try {
                if (session?.user?.id) {
                    const decksQuery = query(collection(db, 'users', session.user.id, 'Decks'));
                    const decksSnapshot = await getDocs(decksQuery);
                    const decksData = decksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.id }));
                    setUserDecks(decksData);
                }

                } catch (error) {
                    console.error('Error fetching personal decks:', error);
                }
        };
        fetchUserDecks();
    }, [session]);

    useEffect(() => {
        if (selectedUserDeck) {
            fetchUserCards(selectedUserDeck);
        }
    }, [selectedUserDeck]);

    const fetchUserCards = async (deckId: string) => {
        try {
            if (session?.user?.id) {
                const cardsQuery = query(collection(db, 'users', session.user.id, 'Decks', deckId, 'cards'));
                const cardsSnapshot = await getDocs(cardsQuery);
                const cardsData = cardsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    review: doc.data().review || 0,
                    nextReviewDate: doc.data().nextReviewDate || new Date().toISOString()
                }) as Card);
                setUserCards(cardsData);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };
    

    const selectUserDeck = (deckId: string) => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedUserDeck(deckId);
        setPersonalDecks(false)
        setGlobalDecksPractice(false)
        setPersonalDecksPractice(true)
    };

    const selectDeck = (deckId: string) => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedDeck(deckId);
        setGlobalDecks(false)
        setPersonalDecksPractice(false)
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
                await addDoc(collection(db, 'Flashcards', selectedDeck, 'cards'), { front: newCardFront, back: newCardBack });
                fetchCards(selectedDeck);
                setNewCardFront('');
                setNewCardBack('');
                toast.success('Card added successfully!');
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
            toast.success('Card updated successfully!');
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const deleteCard = async (cardId: string) => {
        try {
            const cardRef = firestoreDoc(db, 'Flashcards', selectedDeck, 'cards', cardId);
            await deleteDoc(cardRef);
            fetchCards(selectedDeck);
            toast.success('Card deleted successfully!');
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleEditInputChange = (card: Card) => {
        setEditedCardId(card.id);
        setEditedCardFront(card.front);
        setEditedCardBack(card.back);
    };

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

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
            if (selectedDeck) {
                await addSelectDeck(selectedDeck);
                closeConfirmModal();
            } else {
                toast.error('No deck selected to confirm addition.');
            }
        } catch (error: any) {
            toast.error('Error confirming deck addition:', error);
        }
    };
    
    const currentUser = session?.user.id;
    const addSelectDeck = async (deckId: string) => {
        setCurrentCard(0);
        setIsFlipped(false);
        setSelectedDeck(deckId);
    
        try {
            const deckRef = doc(db, 'Flashcards', deckId);
            const deckSnapshot = await getDoc(deckRef);
    
            if (deckSnapshot.exists() && currentUser) {
                const deckData = deckSnapshot.data() as Deck;
    
                const userDeckRef = doc(db, 'users', currentUser, 'Decks', deckId);
                await setDoc(userDeckRef, deckData);
    
                const cardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
                const cardsSnapshot = await getDocs(cardsQuery);
                const cardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
    
                const userCardsCollectionRef = collection(db, 'users', currentUser, 'Decks', deckId, 'cards');
                await Promise.all(cardsData.map(async (card) => {
                    await addDoc(userCardsCollectionRef, {
                        front: card.front,
                        back: card.back,
                        status: 'to_learn',
                        reviewCount: 0,
                        nextReviewDate: '0'
                    });
                }));
    
                toast.success("Deck and cards successfully copied to the user!");
            } else {
                console.error('Deck not found.');
                toast.error("Deck not found.");
            }
        } catch (error) {
            console.error('Error adding deck and cards for the user:', error);
            toast.error("Error adding deck and cards for the user.");
        }
    
        setGlobalDecks(false);
    };
    
 
    const [statusMarked, setStatusMarked] = useState<boolean>(false);
    const updateCardStatus = async (cardId: string, status: string) => {
        try {
            if (session?.user?.id) {
                const cardRef = doc(db, 'users', session.user.id, 'Decks', selectedUserDeck, 'cards', cardId);
                const currentTime = new Date();
                
                // Fetch current card data
                const cardSnapshot = await getDoc(cardRef);
                if (!cardSnapshot.exists()) {
                    throw new Error('Card not found');
                }
                
                const cardData = cardSnapshot.data();
                if (!cardData) {
                    throw new Error('Card data is missing');
                }
                
                let { reviewCount, lastReviewDate } = cardData;
                
                // Increment review count for this review
                reviewCount++;
                
                let nextReviewDate: Date | null = null;
                
                // Determine next review date based on status and review count
                switch (status) {
                    case 'easy':
                        switch (reviewCount) {
                            case 1:
                                nextReviewDate = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day later
                                break;
                            case 2:
                                nextReviewDate = new Date(currentTime.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
                                break;
                            case 3:
                                nextReviewDate = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
                                break;
                            default:
                                nextReviewDate = null; // Handle other cases if necessary
                                break;
                        }
                        break;
                    case 'medium':
                        switch (reviewCount) {
                            case 1:
                                nextReviewDate = new Date(currentTime.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
                                break;
                            case 2:
                                nextReviewDate = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
                                break;
                            case 3:
                                nextReviewDate = new Date(currentTime.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later
                                break;
                            default:
                                nextReviewDate = null; // Handle other cases if necessary
                                break;
                        }
                        break;
                    case 'hard':
                        switch (reviewCount) {
                            case 1:
                                nextReviewDate = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
                                break;
                            case 2:
                                nextReviewDate = new Date(currentTime.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later
                                break;
                            case 3:
                                nextReviewDate = new Date(currentTime.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later
                                break;
                            default:
                                nextReviewDate = null; // Handle other cases if necessary
                                break;
                        }
                        break;
                    default:
                        nextReviewDate = null; // Handle other statuses if necessary
                        break;
                }
                
                // Update document fields including review count and next review date
                await updateDoc(cardRef, {
                    status,
                    reviewCount,
                    nextReviewDate: nextReviewDate ? nextReviewDate.toISOString() : null,
                });
                
                fetchUserCards(selectedUserDeck);
                toast.success(`Status updated to ${status} successfully!`);
                setStatusMarked(true);
            }
        } catch (error) {
            console.error('Error updating card status:', error);
            toast.error('Error updating card status.');
        }
    };

    const reviewDeck = async (deckId: string) => {
        try {
            if (!session || !session.user || !session.user.id) {
                throw new Error('User session not found');
            }
    
            // Fetch cards from the selected deck
            const cardsQuery = query(collection(db, 'users', session.user.id, 'Decks', deckId, 'cards'));
            const cardsSnapshot = await getDocs(cardsQuery);
            const cardsData = cardsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                review: doc.data().review || 0,
                nextReviewDate: doc.data().nextReviewDate || new Date().toISOString()
            }) as Card);
    
            // Filter cards that need review today
            const today = new Date();
            const cardsToReviewToday = cardsData.filter(card => {
                if (!card.nextReviewDate || card.nextReviewDate === '0') return false;
                const cardNextReviewDate = new Date(card.nextReviewDate);
                return cardNextReviewDate <= today;
            });
    
            // Set the filtered cards for review
            setUserCards(cardsToReviewToday);
            setSelectedUserDeck(deckId); // Optionally set selected deck
        } catch (error) {
            console.error('Error fetching cards for review:', error);
            toast.error('Error fetching cards for review.');
        }
    };
    
    
    return (
        <div className="flex flex-row items-center w-full min-h-[90vh] justify-center">
           {/*PRATICAR APENAS*/}
           <div className='flex flex-col w-max items-center justify-center p-6 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>
            <div className='flex flex-row gap-2 items-center'>
                <FluencyButton variant='warning' onClick={openGlobalDecks}>Decks disponíveis</FluencyButton>
                <FluencyButton variant='gray' onClick={openPersonalDecks}>Decks Pessoais</FluencyButton>
                {session?.user.role === 'student' && <FluencyButton variant='confirm' onClick={openModal}>Criar deck</FluencyButton>}
            </div>
            {globalDecksPractice &&
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center gap-2 p-8'>
                <p className='text-lg font-semibold'>{decks.find(deck => deck.id === selectedDeck)?.name}</p>
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
                <div className='flex flex-row gap-3 w-full justify-around'>
                    <button className='text-xl hover:text-fluency-blue-700 duration-200 transition-all ease-in-out' 
                        onClick={() => {
                        setCurrentCard(prevCard => (prevCard + cards.length - 1) % cards.length);
                        setIsFlipped(false);
                    }}>
                        <FaArrowLeft />
                    </button>
                    <button className='text-xl hover:text-fluency-blue-700 duration-200 transition-all ease-in-out'
                        onClick={() => {
                        setCurrentCard(prevCard => (prevCard + 1) % cards.length);
                        setIsFlipped(false);
                    }}>
                        <FaArrowRight />
                    </button>
                </div>
            </div>}
            {personalDecksPractice && 
            <div className='flex flex-col items-center'>
                <div className='flex flex-col items-center gap-2 p-8'>
                    <p className='text-lg font-semibold'>{userDecks.find(deck => deck.id === selectedUserDeck)?.name}</p>
            
            {/* Display counts of cards by status */}
            <div className="flex flex-row gap-4">
                {/* Display counts of cards */}
                <p>Total Cards: {totalCards}</p>
                <p>Cards Seen: {currentCardIndex + 1}</p>
                <p>Cards Left: {totalCards - currentCardIndex - 1}</p>

                <div>
                    <p>Easy Cards: {userCards.filter(card => card.status === 'easy').length}</p>
                    <p>Medium Cards: {userCards.filter(card => card.status === 'medium').length}</p>
                    <p>Hard Cards: {userCards.filter(card => card.status === 'hard').length}</p>
                    <p>Para estudar: {userCards.filter(card => card.status === 'to_learn').length}</p>
                </div>
                
                {/* Display counts of cards by review count */}
                <div>
                    <p>Review Count 0: {userCards.filter(card => card.reviewCount === 0).length}</p>
                    <p>Review Count 1: {userCards.filter(card => card.reviewCount === 1).length}</p>
                    <p>Review Count 2: {userCards.filter(card => card.reviewCount === 2).length}</p>
                    <p>Review Count 3: {userCards.filter(card => card.reviewCount === 3).length}</p>
                    <p>Review Count +4: {userCards.filter(card => card.reviewCount > 3).length}</p>
                </div>

                {/* Display counts of cards by review count */}
                <div>
                <p>To Review Today: {userCards.filter(card => {
                    if (!card.nextReviewDate || card.nextReviewDate === '0') return false; // Handle cases where nextReviewDate might be null
                        const today = new Date(); // Current date
                        const cardNextReviewDate = new Date(card.nextReviewDate);
                        return cardNextReviewDate <= today;
                    }).length}
                </p>

                <p>Still To Review: {userCards.filter(card => {
                    if (!card.nextReviewDate) return false; // Handle cases where nextReviewDate might be null
                        const today = new Date(); // Current date
                        const cardNextReviewDate = new Date(card.nextReviewDate);
                        return cardNextReviewDate >= today;
                    }).length}
                </p>
                </div>
            </div>

                {userCards.length > 0 && currentCardIndex < totalCards ? (
                    <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)} style={{ backgroundColor: isFlipped ? '#65C6E0' : '#65C6E0' }}>
                        <div className={`flashcard__front font-bold ${isFlipped ? 'flipped' : ''}`}>
                            {userCards[currentCardIndex].front}
                        </div>
                        <div className={`flashcard__back font-bold ${isFlipped ? 'flipped' : 'hidden'}`}>
                            {userCards[currentCardIndex].back}
                        </div>
                    </div>
                ) : (
                    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark p-3 rounded-md text-lg font-bold text-fluency-yellow-700'>
                        No cards left to practice or review today  
                    </div>
                )}

                {/* Display options after flipping the card */}
                {isFlipped && (
                    <div className='flex flex-row gap-2 justify-center w-full text-white'>
                        <button className='bg-fluency-green-500 p-2 px-6 rounded-md font-bold' onClick={() => updateCardStatus(userCards[currentCardIndex].id, 'easy')}>Easy</button>
                        <button className='bg-fluency-orange-500 p-2 px-6 rounded-md font-bold' onClick={() => updateCardStatus(userCards[currentCardIndex].id, 'medium')}>Medium</button>
                        <button className='bg-fluency-red-500 p-2 px-6 rounded-md font-bold' onClick={() => updateCardStatus(userCards[currentCardIndex].id, 'hard')}>Hard</button>
                        {statusMarked && (
                            <button className='bg-fluency-blue-500 p-2 px-6 rounded-md font-bold' onClick={() => {
                                nextCard();
                                setIsFlipped(false);
                                setStatusMarked(false);
                            }}>
                                Next Card
                            </button>
                        )}
                    </div>
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
                            <h2>Decks Disponíveis:</h2>

                            <ul className='flex flex-col items-start p-4 gap-2'>
                            {decks.map(deck => (
                                <li className='flex flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between' key={deck.id}>
                                    <p className='font-bold'>{deck.name}</p>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <button className='bg-fluency-yellow-500 hover:bg-fluency-yellow-600 dark:bg-fluency-yellow-700 hover:dark:bg-fluency-yellow-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' value={deck.name} onClick={() => openConfirmModal(deck.id)}>Aprender</button>
                                        <button className='bg-fluency-blue-500 hover:bg-fluency-blue-600 dark:bg-fluency-blue-700 hoverdark:bg-fluency-blue-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' value={deck.name} onClick={() => selectDeck(deck.id)}>Praticar</button>
                                        {session?.user.role === 'teacher' && 
                                        <button className='bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hover:dark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out'>Adicionar como tarefa</button>}
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>}

            {personalDecks &&
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center min-h-screen">  
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all p-8">
                        <FluencyCloseButton onClick={closePersonalDecks}/>
                        
                        <div className='flex flex-col items-center'>
                            <h2>Personal Decks:</h2>
                            <ul className='flex flex-col items-start p-4 gap-2'>
                                {userDecks.map(userDeck => (
                                    <li className='flex flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between' key={userDeck.id}>
                                        <p className='font-bold'>{userDeck.name}</p>
                                        <div className='flex flex-row gap-2 items-center'>                                       
                                        <FluencyButton
                                            disabled={userCards.filter(card => {
                                                if (!card.nextReviewDate) return false; // Handle cases where nextReviewDate might be null
                                                const today = new Date(); // Current date
                                                const cardNextReviewDate = new Date(card.nextReviewDate);
                                                return cardNextReviewDate <= today;
                                            }).length === 0}
                                            variant="confirm"
                                            onClick={() => reviewDeck(selectedUserDeck)}
                                            >Review</FluencyButton>                                       
                                            <FluencyButton className='bg-fluency-blue-500 hover:bg-fluency-blue-600 dark:bg-fluency-blue-700 hoverdark:bg-fluency-blue-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out' 
                                            value={userDeck.name} onClick={() => selectUserDeck(userDeck.id)}>Practice</FluencyButton> 
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
                                                {decks.map(deck => (
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
                                            {cards.map(card => (
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
                                        Deseja adicionar este deck para aprendizado nos seus decks pessoais?
                                    </h3>
                                    <div className="flex justify-center">
                                        <FluencyButton variant='warning' onClick={confirmDeckAddition} >Sim, quero aprender.</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeConfirmModal}>Não, cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Toaster />
        </div>
    );
};

export default FlashCard;

