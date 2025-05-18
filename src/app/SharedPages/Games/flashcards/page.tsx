'use client';
import React, { useState, useEffect, FC, useCallback } from 'react'; // --- MODIFIED --- added useCallback
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
import { useSession } from 'next-auth/react';
import { Tabs, Tab } from "@nextui-org/tabs";
import { IoClose } from 'react-icons/io5';
import Papa from 'papaparse'; // --- NEW --- Import papaparse

interface Deck {
    id: string;
    name: string;
    tags: string[];
}

interface Card {
    id: string;
    front: string;
    back: string;
    // SRS fields are only for user's personal cards, not global template cards
    interval?: number;
    dueDate?: string;
    easeFactor?: number;
    reviewCount?: number;
}

interface Student {
    id: string;
    [key: string]: any;
}

// --- NEW --- Define expected CSV row structure
interface CsvCardRow {
    Front: string;
    Back: string;
    [key: string]: string; // Allow other columns, but Front and Back are key
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

    // --- NEW --- State for CSV file upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // --- MODIFIED --- Extract fetchOtherDecks to be callable
    const fetchAndSetOtherDecks = useCallback(async () => {
        try {
            const decksQuery = query(collection(db, 'Flashcards'));
            const decksSnapshot = await getDocs(decksQuery);
            const decksData = decksSnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.id,
                tags: doc.data().tags || [],
            }));
            setOtherDecks(decksData);
            // No need to setFilteredDecks here if the useEffect for filtering is set up correctly
        } catch (error) {
            console.error('Error fetching decks:', error);
            toast.error('Falha ao buscar decks globais.');
        }
    }, []); // Empty dependency array, it's stable

    useEffect(() => {
        fetchAndSetOtherDecks();
    }, [fetchAndSetOtherDecks]);

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

    const openModal = () => { setIsModalOpen(true); };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDeck('');
        setNewDeckName('');
        setNewCardFront('');
        setNewCardBack('');
        setEditedCardId('');
        setEditedCardFront('');
        setEditedCardBack('');
        setSelectedFile(null); // --- NEW --- Reset selected file on modal close
        setIsUploading(false); // --- NEW --- Reset uploading state
    };

    useEffect(() => {
        if (selectedDeck && isModalOpen) { // --- MODIFIED --- Fetch only if modal is open to avoid unnecessary fetches
            fetchOtherCards(selectedDeck);
        } else {
            setOtherCards([]); // Clear cards if no deck is selected or modal is closed
        }
    }, [selectedDeck, isModalOpen]);

    const fetchOtherCards = async (deckId: string) => {
        try {
            const cardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
            const cardsSnapshot = await getDocs(cardsQuery);
            const otherCardsData = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
            setOtherCards(otherCardsData);
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

    // This useEffect is for practice cards, ensure it's specific
    useEffect(() => {
        if (selectedDeck && globalDecksPractice && currentUserId) {
            fetchCardsForPractice(selectedDeck);
        } else {
            setCards([]); // Clear practice cards if not in practice mode
        }
    }, [selectedDeck, globalDecksPractice, currentUserId]);

    const fetchCardsForPractice = async (deckId: string) => { // Renamed for clarity
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
                console.error('Error fetching practice cards:', error);
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
                } else {
                    setTags([]);
                    // toast.error("Deck não possui tags."); // Might be too noisy
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
                    await setDoc(deckRef, { tags }); // Use current tags state for the new deck
                    // --- MODIFIED --- Update otherDecks state directly for immediate UI update
                    const newDeckData = { id: newDeckName, name: newDeckName, tags };
                    setOtherDecks(prevDecks => [...prevDecks, newDeckData]);
                    setSelectedDeck(newDeckName); // Select the new deck
                    setNewDeckName(''); // Clear input
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
                await updateDoc(deckRef, { tags: updatedTags });
                setTags(updatedTags);
                // --- MODIFIED --- Update the specific deck in otherDecks
                setOtherDecks(prevDecks => prevDecks.map(deck =>
                    deck.id === selectedDeck ? { ...deck, tags: updatedTags } : deck
                ));
                setNewTag('');
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
                await updateDoc(deckRef, { tags: updatedTags });
                setTags(updatedTags);
                 // --- MODIFIED --- Update the specific deck in otherDecks
                setOtherDecks(prevDecks => prevDecks.map(deck =>
                    deck.id === selectedDeck ? { ...deck, tags: updatedTags } : deck
                ));
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
                const newCardData = { // --- MODIFIED --- Use specific fields for global cards
                    front: newCardFront,
                    back: newCardBack,
                };
                const docRef = await addDoc(collection(db, 'Flashcards', selectedDeck, 'cards'), newCardData);
                // --- MODIFIED --- Add new card to otherCards state for immediate UI update
                setOtherCards(prev => [...prev, {id: docRef.id, ...newCardData}]);
                setNewCardFront('');
                setNewCardBack('');
                toast.success('Cartão adicionado!');
            } catch (error) {
                console.error('Error adding card:', error);
                toast.error('Erro ao adicionar cartão');
            }
        }
    };

    const updateCard = async () => {
        if (selectedDeck && editedCardId && (editedCardFront || editedCardBack)) { // --- MODIFIED --- ensure front/back are not empty
            try {
                const cardRef = firestoreDoc(db, 'Flashcards', selectedDeck, 'cards', editedCardId);
                await updateDoc(cardRef, { front: editedCardFront, back: editedCardBack });
                // --- MODIFIED --- Update card in otherCards state
                setOtherCards(prev => prev.map(c => c.id === editedCardId ? {...c, front: editedCardFront, back: editedCardBack} : c));
                setEditedCardId(''); // Clear edit state
                setEditedCardFront('');
                setEditedCardBack('');
                toast.success('Cartão atualizado!');
            } catch (error) {
                console.error('Error updating card:', error);
                toast.error('Erro ao atualizar cartão.');
            }
        }
    };

    const deleteCard = async (cardId: string) => {
        if (selectedDeck) { // --- MODIFIED --- ensure selectedDeck is present
            try {
                const cardRef = firestoreDoc(db, 'Flashcards', selectedDeck, 'cards', cardId);
                await deleteDoc(cardRef);
                // --- MODIFIED --- Remove card from otherCards state
                setOtherCards(prev => prev.filter(c => c.id !== cardId));
                toast.error('Cartão deletado!'); // Should this be success? or warning?
            } catch (error) {
                console.error('Error deleting card:', error);
                toast.error('Erro ao deletar cartão.');
            }
        }
    };


    const handleEditInputChange = (card: Card) => {
        setEditedCardId(card.id);
        setEditedCardFront(card.front);
        setEditedCardBack(card.back);
    };

    const reviewCard = async (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
        const cardToReview = cards.find(c => c.id === cardId); // Use a different variable name
        if (!cardToReview || !currentUserId) return; // Check currentUserId as well

        let { interval = 1, easeFactor = 2.5, reviewCount = 0 } = cardToReview; // Provide defaults
        const now = new Date();

        switch (rating) {
            case 'easy':
                easeFactor += 0.1;
                interval = reviewCount === 0 ? interval * 4 : interval * easeFactor; // SM-2 like for first easy
                break;
            case 'medium':
                interval = reviewCount === 0 ? interval * 2.5 : interval * (easeFactor - 0.1 < 1.3 ? 1.3 : easeFactor - 0.1); // Adjust interval
                break;
            case 'hard':
                easeFactor = Math.max(1.3, easeFactor - 0.2); // Min easeFactor
                interval = reviewCount === 0 ? 1 : Math.max(1, interval * 0.5); // Reset interval more aggressively if hard
                break;
        }
        interval = Math.round(interval * 10) / 10; // Round to one decimal place
        reviewCount += 1;
        const newDueDate = new Date(now.setDate(now.getDate() + Math.max(1, interval))).toISOString(); // Ensure at least 1 day

        try {
            const cardRef = doc(db, 'users', currentUserId, 'Decks', selectedDeck, 'cards', cardId);
            await updateDoc(cardRef, { interval, easeFactor, reviewCount, dueDate: newDueDate });
            // --- MODIFIED --- Remove card from practice list and update deck count
            setCards(prevCards => prevCards.filter(c => c.id !== cardId));
            setDecks(prevDecks => prevDecks.map(d =>
                d.id === selectedDeck ? { ...d, cardsToReviewCount: Math.max(0, d.cardsToReviewCount - 1) } : d
            ));
            if (cards.length -1 === 0) { // If it was the last card
                toast.success('Deck concluído por agora!');
                setDeckNull(); // Go back to deck list
            } else {
                toast.success('Cartão revisado!');
            }
            setIsFlipped(false);
            if (currentCard >= cards.length - 1 && cards.length -1 > 0) { // If current was last, go to 0
                 setCurrentCard(0);
            }
            // No need to advance currentCard here if the reviewed card is removed from the list
        } catch (error) {
            console.error('Error reviewing card:', error);
            toast.error('Erro ao revisar cartão');
        }
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
            if (session?.user.role === 'teacher' && session?.user.id) { // Check role and id
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', session.user.id));
                const querySnapshot = await getDocs(q);
                const fetchedStudents: Student[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
        setSelectedStudentId(''); // Reset student selection
    };

    const confirmDeckAddition = async () => {
        try {
            if (selectedStudentId && selectedDeck) {
                await addSelectDeck(selectedDeck, selectedStudentId);
                toast.success(`Deck enviado para o aluno!`);
                closeConfirmModal();
            } else {
                toast.error('Por favor, selecione o aluno e o deck.');
            }
        } catch (error) {
            console.error('Error adding deck to student:', error);
            toast.error('Falha ao adicionar deck para o aluno.');
        }
    };

    const confirmOtherDeckAddition = async () => {
        const studentId = session?.user.id;
        try {
            if (studentId && selectedDeck) {
                await addSelectDeck(selectedDeck, studentId);
                // No success toast here, addSelectDeck has its own
                // Fetch user's decks again to update review counts if needed
                const fetchedDecks = await fetchDecksWithReviewCount(studentId);
                setDecks(fetchedDecks);
                closeOtherConfirmModal(); // Close this specific modal
            } else {
                toast.error('Usuário não encontrado ou deck não selecionado.');
            }
        } catch (error) {
            console.error('Error adding deck to self:', error);
            toast.error('Falha ao adicionar deck para seus estudos.');
        }
    };

    const addSelectDeck = async (deckId: string, targetUserId: string) => { // Renamed studentId to targetUserId
        try {
            const globalDeckRef = doc(db, 'Flashcards', deckId);
            const globalDeckSnapshot = await getDoc(globalDeckRef);

            if (globalDeckSnapshot.exists()) {
                const globalDeckData = globalDeckSnapshot.data() as Deck; // Assuming Deck interface matches global deck structure

                // Check if user already has this deck
                const userDeckRef = doc(db, 'users', targetUserId, 'Decks', deckId);
                const userDeckSnap = await getDoc(userDeckRef);
                if (userDeckSnap.exists()) {
                    toast.error("Você já possui este deck em sua coleção pessoal.");
                    return; // Exit if deck already exists for the user
                }

                await setDoc(userDeckRef, { name: globalDeckData.name, tags: globalDeckData.tags || [] }); // Copy relevant deck info

                const globalCardsQuery = query(collection(db, 'Flashcards', deckId, 'cards'));
                const globalCardsSnapshot = await getDocs(globalCardsQuery);
                const globalCardsData = globalCardsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Card));

                const userCardsCollectionRef = collection(db, 'users', targetUserId, 'Decks', deckId, 'cards');
                for (const card of globalCardsData) {
                    await addDoc(userCardsCollectionRef, {
                        front: card.front,
                        back: card.back,
                        interval: 1, // Initial SRS values
                        dueDate: new Date().toISOString(),
                        easeFactor: 2.5,
                        reviewCount: 0,
                    });
                }
                toast.success(`Deck '${globalDeckData.name}' adicionado! Recarregue a página para praticar ou ver na sua lista.`);
                 if (targetUserId === currentUserId) { // If adding to current user, update their decks list
                    const updatedUserDecks = await fetchDecksWithReviewCount(targetUserId);
                    setDecks(updatedUserDecks);
                }

            } else {
                console.error('Deck global não encontrado.');
                toast.error("Deck global não encontrado.");
            }
        } catch (error) {
            console.error('Erro ao adicionar deck e cartões para o usuário:', error);
            toast.error("Erro ao adicionar deck e cartões para o usuário.");
        }
        // No need to setGlobalDecks(false) or setIsOtherConfirmModalOpen(false) here,
        // as those are typically handled by the calling confirmation modals.
    };


    // --- NEW --- CSV Import Functionality
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            if (event.target.files[0].type === "text/csv") {
                setSelectedFile(event.target.files[0]);
            } else {
                toast.error("Por favor, selecione um arquivo .csv");
                setSelectedFile(null);
                event.target.value = ""; // Reset file input
            }
        } else {
            setSelectedFile(null);
        }
    };

    const handleImportFromCSV = async () => {
        if (!selectedFile) {
            toast.error("Por favor, selecione um arquivo CSV.");
            return;
        }
        setIsUploading(true);

        const deckNameFromCSV = selectedFile.name.replace(/\.[^/.]+$/, ""); // Use filename as deck name (remove extension)

        try {
            // Check if deck already exists
            const deckRef = firestoreDoc(db, 'Flashcards', deckNameFromCSV);
            const deckDocSnapshot = await getDoc(deckRef);
            if (deckDocSnapshot.exists()) {
                toast.error(`Um deck chamado '${deckNameFromCSV}' já existe. Renomeie o arquivo CSV ou o deck existente.`);
                setIsUploading(false);
                return;
            }

            Papa.parse(selectedFile, {
                header: true, // Assumes CSV has headers: "Front", "Back"
                skipEmptyLines: true,
                complete: async (results) => {
                    const parsedCards = results.data as CsvCardRow[];

                    if (results.errors.length > 0) {
                        console.error("Erros no parse do CSV:", results.errors);
                        toast.error("Erro ao ler o arquivo CSV. Verifique o formato.");
                        setIsUploading(false);
                        return;
                    }

                    if (!parsedCards || parsedCards.length === 0) {
                        toast.error("CSV vazio ou não contém dados válidos.");
                        setIsUploading(false);
                        return;
                    }

                    // Validate that each card has 'Front' and 'Back'
                    const validCards = parsedCards.filter(card => card.Front && card.Back);
                    if (validCards.length !== parsedCards.length) {
                        toast.error("Alguns cartões no CSV não tinham 'Front' ou 'Back' e foram ignorados.");
                    }
                    if (validCards.length === 0) {
                        toast.error("Nenhum cartão válido encontrado no CSV. Certifique-se de que as colunas 'Front' e 'Back' existem e estão preenchidas.");
                        setIsUploading(false);
                        return;
                    }

                    // Create the new deck in Firestore
                    await setDoc(deckRef, { tags: [] }); // Add empty tags array, or prompt user for tags

                    // Add cards to the new deck
                    const cardsCollectionRef = collection(db, 'Flashcards', deckNameFromCSV, 'cards');
                    for (const card of validCards) {
                        await addDoc(cardsCollectionRef, {
                            front: card.Front,
                            back: card.Back,
                        });
                    }

                    toast.success(`Deck '${deckNameFromCSV}' importado com ${validCards.length} cartões!`);
                    setSelectedFile(null); // Clear selected file
                    // Update the global decks list
                    await fetchAndSetOtherDecks();
                    setSelectedDeck(deckNameFromCSV); // Optionally select the newly imported deck
                    setIsUploading(false);
                },
                error: (error: any) => {
                    console.error("Erro ao parsear CSV:", error);
                    toast.error(`Erro ao parsear CSV: ${error.message}`);
                    setIsUploading(false);
                }
            });
        } catch (error: any) {
            console.error("Erro ao importar CSV:", error);
            toast.error(`Erro ao importar deck do CSV: ${error.message || 'Erro desconhecido'}`);
            setIsUploading(false);
        }
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
                            {decks.length === 0 && <p className="text-gray-500 mt-4">Você ainda não tem decks para praticar. Explore a aba 'Decks'!</p>}
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
                                        Deck: {decks.find(deck => deck.id === selectedDeck)?.name || otherDecks.find(deck => deck.id === selectedDeck)?.name}
                                    </span>
                                </p>
                                <p className='flex flex-row gap-1 items-center justify-around w-[90%] p-1 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-400'>
                                    <span className='font-bold flex flex-row items-center gap-1'>
                                        Cartões para revisar: {cards.length}
                                    </span>
                                    <button onClick={setDeckNull}><IoClose className='w-6 h-6' /></button>
                                </p>
                                {(cards.length > 0 && cards[currentCard]) && ( // --- MODIFIED --- Ensure card exists
                                    <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)} style={{ backgroundColor: isFlipped ? '#65C6E0' : '#65C6E0' }}>
                                        <div className={`flashcard__front font-bold px-4 text-center ${isFlipped ? 'flipped' : ''}`}>
                                            {cards[currentCard].front}
                                        </div>
                                        <div className={`flashcard__back font-bold px-4 text-center ${isFlipped ? 'flipped' : 'hidden'}`}>
                                            {cards[currentCard].back}
                                        </div>
                                    </div>
                                )}
                                {cards.length === 0 && !globalDecksPractice && (
                                     <p className="text-gray-500 mt-4">Nenhum cartão para revisar neste deck no momento!</p>
                                )}
                            </div>
                            {cards.length > 0 && ( // --- MODIFIED --- Show buttons only if there are cards
                            <div className='flex flex-row gap-3 w-full justify-center mt-4'>
                                {!isFlipped ? (
                                     <button className='bg-fluency-blue-500 p-2 px-6 rounded-md font-bold text-white text-lg'
                                         onClick={() => setIsFlipped(true)}>
                                         Mostrar Resposta
                                     </button>
                                ) : (
                                    <>
                                        <button
                                            className='bg-fluency-red-500 p-2 px-4 rounded-md font-bold text-white'
                                            onClick={() => reviewCard(cards[currentCard].id, 'hard')}
                                        >
                                            Difícil
                                        </button>
                                        <button
                                            className='bg-fluency-orange-500 p-2 px-4 rounded-md font-bold text-white'
                                            onClick={() => reviewCard(cards[currentCard].id, 'medium')}
                                        >
                                            Médio
                                        </button>
                                        <button
                                            className='bg-fluency-green-500 p-2 px-4 rounded-md font-bold text-white'
                                            onClick={() => reviewCard(cards[currentCard].id, 'easy')}
                                        >
                                            Fácil
                                        </button>
                                    </>
                                )}
                            </div>
                            )}
                        </div>)}
                        </div>
                    </Tab>

                    <Tab key="disponiveis" title="Decks">
                        <div className="flex flex-col items-center">
                            <h2 className="font-bold text-xl mb-2">Decks Globais</h2>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Procurar por nome ou tags..."
                                className="w-full dark:bg-fluency-pages-dark border border-gray-300 focus:outline-none rounded-md px-3 py-2 mb-2"
                            />
                             {filteredDecks.length === 0 && <p className="text-gray-500 mt-4">Nenhum deck global encontrado ou correspondente à busca.</p>}
                            <ul className="flex flex-col items-start p-4 gap-2 w-full"> {/* --- MODIFIED --- Added w-full */}
                                {filteredDecks.length > 0 &&
                                    filteredDecks.map((deck) => (
                                        <li
                                            key={deck.id}
                                            className="flex flex-col sm:flex-row items-center gap-6 p-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark w-full justify-between"
                                        >
                                        <div className="flex flex-col">
                                            <p className="font-bold">{deck.name}</p>
                                            {deck.tags && deck.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {deck.tags.map(tag => (
                                                        <span key={tag} className="text-xs bg-fluency-blue-200 dark:bg-fluency-blue-800 px-2 py-0.5 rounded-full">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                            <div className="flex flex-row gap-2 items-center">
                                                <button
                                                    className="bg-fluency-orange-500 hover:bg-fluency-orange-600 dark:bg-fluency-orange-700 hoverdark:bg-fluency-orange-800 text-white font-semibold text-sm p-2 rounded-md duration-300 transition-all ease-in-out"
                                                    value={deck.name}
                                                    onClick={() => openOtherConfirmModal(deck.id)}
                                                >
                                                    Adicionar aos Meus Decks
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </Tab>

                    {session?.user.role === 'teacher' && (
                    <Tab key="criar" title="Criar/Editar Decks Globais">
                        <div>
                            <div className='flex flex-col items-center gap-2 p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark'>
                                <div className='flex flex-row justify-center items-center gap-1 w-full px-4'>
                                    <FluencyButton className='w-full' variant='confirm' onClick={openModal}>Criar ou Editar Deck Manualmente</FluencyButton>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 my-2">Ou atribua um deck global existente para um aluno:</p>
                                <FluencyInput
                                        type="text"
                                        value={searchTerm} // Reusing search term for this list too
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Procurar deck global por nome ou tag"
                                        className="w-full px-4"
                                />
                                <div className='flex flex-col items-center gap-1 h-fit max-h-[55vh] overflow-y-auto w-full px-4'> {/* --- MODIFIED --- Added w-full px-4 */}
                                    {filteredDecks.length === 0 && <p className="text-gray-500 mt-4">Nenhum deck global para atribuir.</p>}
                                    <ul className='flex flex-col items-start py-2 gap-2 w-full'>
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
                    <div className="fixed inset-0 transition-opacity" onClick={closeModal}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-[95vh] p-3 m-5">
                        <div className="flex flex-col items-center h-full"> {/* --- MODIFIED --- h-full */}
                            <FluencyCloseButton onClick={closeModal}/>
                            <h3 className="text-xl leading-6 font-bold mb-2">
                                Criar ou Editar Deck Global e Cartões
                            </h3>

                            {/* --- NEW --- CSV Upload Section in Modal */}
                            <div className='w-full p-4 border-b border-gray-300 dark:border-gray-700 mb-4'>
                                <h4 className="text-lg leading-6 font-medium mb-2">Importar Deck de CSV</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">O arquivo CSV deve ter colunas "Front" e "Back". O nome do arquivo (sem extensão) será usado como nome do deck.</p>
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-slate-500 dark:text-slate-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-fluency-blue-50 file:text-fluency-blue-700 dark:file:bg-fluency-blue-900 dark:file:text-fluency-blue-300
                                            hover:file:bg-fluency-blue-100 dark:hover:file:bg-fluency-blue-800
                                            cursor-pointer"
                                    />
                                    <FluencyButton
                                        onClick={handleImportFromCSV}
                                        disabled={!selectedFile || isUploading}
                                        className="w-full sm:w-auto whitespace-nowrap"
                                    >
                                        {isUploading ? 'Importando...' : 'Importar CSV'}
                                    </FluencyButton>
                                </div>
                                {selectedFile && <p className="text-xs mt-1">Arquivo selecionado: {selectedFile.name}</p>}
                            </div>


                            <div className='flex flex-col lg:flex-row items-start w-full justify-around gap-4 overflow-y-auto flex-grow'> {/* --- MODIFIED --- flex-grow */}
                                <div className='flex flex-col gap-3 items-center w-full lg:w-1/2 h-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md overflow-y-auto'>
                                <h4 className="text-lg leading-6 font-medium">Criar Deck Manualmente ou Editar Tags</h4>
                                    <div className='flex flex-col gap-2 w-full items-start'>
                                        <select
                                            className="ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            value={selectedDeck}
                                            onChange={(e) => handleDeckSelection(e.target.value)}
                                            >
                                            <option value="">Selecione um deck para editar tags ou adicionar cartões abaixo</option>
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
                                            <FluencyButton className='w-min whitespace-nowrap' onClick={createDeck}>Criar Deck</FluencyButton>
                                        </div>
                                        {selectedDeck && ( // Only show tag management if a deck is selected
                                        <div className='flex flex-col items-start justify-center gap-2 w-full border-t pt-2 mt-2'>
                                            <h5 className="font-medium">Tags para '{selectedDeck}'</h5>
                                            <div className="flex gap-2 items-center w-full">
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
                                                        className="text-xs font-bold flex items-center bg-fluency-blue-200 dark:bg-fluency-blue-800 text-fluency-text-dark dark:text-fluency-text-light px-2 py-1 rounded-full"
                                                    >
                                                        <span>{tag}</span>
                                                        <button
                                                            className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                            onClick={() => removeTag(index)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                {tags.length === 0 && <p className="text-xs text-gray-500">Nenhuma tag adicionada.</p>}
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    {selectedDeck && ( // Only show manual card add if a deck is selected
                                    <div className="w-full mt-4 border-t pt-4">
                                        <h4 className="text-md leading-6 font-medium mb-2">Adicionar Cartão Manualmente ao Deck '{selectedDeck}'</h4>
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
                                        <FluencyButton onClick={addCard} className="mt-2 w-full">Adicionar Cartão Manualmente</FluencyButton>
                                    </div>
                                    )}
                                </div>

                                <div className='flex flex-col items-center w-full lg:w-1/2 h-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-2'>
                                    <h4 className="text-lg leading-6 font-medium">Cartões no deck '{selectedDeck || "Nenhum selecionado"}'</h4>
                                    {!selectedDeck && <p className="text-sm text-gray-500 mt-4">Selecione um deck à esquerda para ver seus cartões.</p>}
                                    {selectedDeck && editedCardId && (
                                    <div className="flex flex-row gap-3 items-center w-full my-2 p-2 border rounded-md dark:border-gray-700">
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
                                        <FluencyButton variant="danger" onClick={() => {setEditedCardId(''); setEditedCardFront(''); setEditedCardBack('');}}>Cancelar</FluencyButton>
                                    </div>)}
                                    <ul className='w-full h-full overflow-y-scroll p-1 flex flex-col gap-2'>
                                        {selectedDeck && otherCards.length === 0 && <p className="text-sm text-gray-500 mt-4">Este deck ainda não possui cartões.</p>}
                                        {otherCards.map(card => (
                                            <li key={card.id} className="flex flex-col lg:flex-row items-start lg:items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                                                <div className='flex flex-col w-full bg-fluency-blue-100 dark:bg-fluency-blue-1000/50 p-2 rounded-md'>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-semibold text-sm">Frente:</p>
                                                        {editedCardId !== card.id &&
                                                        <div className="flex gap-1">
                                                            <Tooltip className='bg-fluency-blue-500 font-bold text-sm text-white p-1 rounded-md' content="Editar cartão">
                                                            <button className='bg-fluency-blue-600 hover:bg-fluency-blue-700 p-1.5 text-white rounded-md' onClick={() => handleEditInputChange(card)}>
                                                                <FiEdit3 size={14}/>
                                                            </button>
                                                            </Tooltip>
                                                            <Tooltip className='bg-fluency-red-500 font-bold text-sm text-white p-1 rounded-md' content="Deletar cartão">
                                                            <button className='bg-fluency-red-600 hover:bg-fluency-red-700 p-1.5 text-white rounded-md' onClick={() => deleteCard(card.id)}>
                                                                <MdDeleteOutline size={14}/>
                                                            </button>
                                                            </Tooltip>
                                                        </div>
                                                        }
                                                    </div>
                                                    <p className="text-sm ml-2">{card.front}</p>
                                                    <p className="font-semibold text-sm mt-1">Fundo:</p>
                                                    <p className="text-sm ml-2">{card.back}</p>
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
                        <div className="fixed inset-0 transition-opacity" onClick={closeOtherConfirmModal}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-fit p-5"> {/* --- MODIFIED --- h-fit */}
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeOtherConfirmModal} />
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Deseja adicionar o deck '{otherDecks.find(d => d.id === selectedDeck)?.name || selectedDeck}' aos seus decks pessoais para estudo?
                                    </h3>
                                    <div className="flex justify-center gap-2"> {/* --- MODIFIED --- gap-2 */}
                                        <FluencyButton variant='confirm' onClick={confirmOtherDeckAddition} >Sim, quero aprender.</FluencyButton>
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
                         <div className="fixed inset-0 transition-opacity" onClick={closeConfirmModal}><div className="absolute inset-0 bg-gray-500 opacity-75"></div></div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-fit p-5"> {/* --- MODIFIED --- h-fit */}
                            <div className="flex flex-col">
                                <FluencyCloseButton onClick={closeConfirmModal} />
                                <div className="mt-3 flex flex-col gap-3 p-4">
                                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                        Enviar deck '{otherDecks.find(d => d.id === selectedDeck)?.name || selectedDeck}' para aluno praticar:
                                    </h3>
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className='p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark px-4'
                                        >
                                        <option value="">Selecione o Aluno</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>{student.name} ({student.email || student.id})</option>
                                        ))}
                                    </select>
                                    <div className="flex justify-center gap-2"> {/* --- MODIFIED --- gap-2 */}
                                        <FluencyButton variant='confirm' onClick={confirmDeckAddition}>Sim, quero enviar.</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeConfirmModal}>Não, cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>)}
         <Toaster position="bottom-right" /> {/* --- MODIFIED --- Changed position */}
      </div>
    );
};
export default FlashCard;