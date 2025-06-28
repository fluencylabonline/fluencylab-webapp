'use client';
import React, { useState, useEffect, FC, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  doc as firestoreDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import "./flashcards.css";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Papa from "papaparse";
import FlashcardPractice from "@/app/SharedPages/Flashcard/components/FlashcardPractice";

// Importa os componentes
import DeckList from "./components/DeckList";
import DeckCreationModal from "./components/DeckCreationModal";
import CardManagement from "./components/CardManagement";
import GlobalDecksModal from "./components/GlobalDecksModal";

// Interfaces
interface Deck {
  id: string;
  name: string;
  tags: string[];
  cardsToReviewCount?: number;
}

interface Card {
  id: string;
  front: string;
  back: string;
  interval?: number;
  dueDate?: string;
  easeFactor?: number;
  reviewCount?: number;
}

interface Student {
  id: string;
  [key: string]: any;
}

interface CsvCardRow {
  Front: string;
  Back: string;
  [key: string]: string;
}

const FlashCard: FC = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user.id;

  // States
  const [decks, setDecks] = useState<any[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGlobalDecksModalOpen, setIsGlobalDecksModalOpen] = useState<boolean>(false);
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [newDeckName, setNewDeckName] = useState<string>("");
  const [newCardFront, setNewCardFront] = useState<string>("");
  const [newCardBack, setNewCardBack] = useState<string>("");
  const [editedCardId, setEditedCardId] = useState<string>("");
  const [editedCardFront, setEditedCardFront] = useState<string>("");
  const [editedCardBack, setEditedCardBack] = useState<string>("");
  const [globalDecksPractice, setGlobalDecksPractice] = useState<boolean>(false);
  const [otherDecks, setOtherDecks] = useState<Deck[]>([]);
  const [otherCards, setOtherCards] = useState<Card[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Functions and Hooks
  const fetchAndSetOtherDecks = useCallback(async () => {
    try {
      const decksQuery = query(collection(db, "Flashcards"));
      const decksSnapshot = await getDocs(decksQuery);
      const decksData = decksSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.id,
        tags: doc.data().tags || [],
      }));
      setOtherDecks(decksData);
    } catch (error) {
      console.error("Error fetching decks:", error);
      toast.error("Falha ao buscar decks globais.");
    }
  }, []);

  const fetchOtherCards = async (deckId: string) => {
    try {
      const cardsQuery = query(collection(db, "Flashcards", deckId, "cards"));
      const cardsSnapshot = await getDocs(cardsQuery);
      const otherCardsData = cardsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Card)
      );
      setOtherCards(otherCardsData);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const fetchDecksWithReviewCount = async (userId: string) => {
    const decksQuery = query(collection(db, "users", userId, "Decks"));
    const decksSnapshot = await getDocs(decksQuery);
    const decksData = [];
    for (const deckDoc of decksSnapshot.docs) {
      const deckId = deckDoc.id;
      const cardsQuery = query(
        collection(db, "users", userId, "Decks", deckId, "cards"),
        where("dueDate", "<=", new Date().toISOString())
      );
      const cardsSnapshot = await getDocs(cardsQuery);
      const cardsToReviewCount = cardsSnapshot.docs.length;
      decksData.push({ id: deckId, name: deckDoc.id, cardsToReviewCount });
    }
    return decksData;
  };

  const fetchCardsForPractice = async (deckId: string) => {
    if (currentUserId) {
      try {
        const cardsQuery = query(
          collection(db, "users", currentUserId, "Decks", deckId, "cards"),
          where("dueDate", "<=", new Date().toISOString())
        );
        const cardsSnapshot = await getDocs(cardsQuery);
        const cardsData = cardsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Card)
        );
        setCards(cardsData);
      } catch (error) {
        console.error("Error fetching practice cards:", error);
      }
    }
  };

  const addSelectDeck = async (deckId: string) => {
  const targetUserId = currentUserId;
  try {
    if (!targetUserId) {
      toast.error("Usuário não encontrado ou deck não selecionado.");
      return;
    }

    const globalDeckRef = doc(db, "Flashcards", deckId);
    const globalDeckSnapshot = await getDoc(globalDeckRef);
     
    if (globalDeckSnapshot.exists()) {
      const globalDeckData = globalDeckSnapshot.data();
       
      // Check if user already has this deck
      const userDeckRef = doc(db, "users", targetUserId, "Decks", deckId);
      const userDeckSnap = await getDoc(userDeckRef);
      if (userDeckSnap.exists()) {
        toast.error("Você já possui este deck em sua coleção pessoal.");
        return;
      }
       
      // Use the deckId as the name since that's how you're structuring it
      await setDoc(userDeckRef, {
        name: deckId, // Use deckId instead of globalDeckData.name
        tags: globalDeckData.tags || [],
      });
       
      const globalCardsQuery = query(
        collection(db, "Flashcards", deckId, "cards")
      );
      const globalCardsSnapshot = await getDocs(globalCardsQuery);
      const globalCardsData = globalCardsSnapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Card)
      );
       
      const userCardsCollectionRef = collection(
        db,
        "users",
        targetUserId,
        "Decks",
        deckId,
        "cards"
      );
      for (const card of globalCardsData) {
        await addDoc(userCardsCollectionRef, {
          front: card.front,
          back: card.back,
          interval: 1,
          dueDate: new Date().toISOString(),
          easeFactor: 2.5,
          reviewCount: 0,
        });
      }
      toast.success(
        `Deck '${deckId}' adicionado! Recarregue a página para praticar ou ver na sua lista.`
      );
      
      // Update user's decks list
      const updatedUserDecks = await fetchDecksWithReviewCount(targetUserId);
      setDecks(updatedUserDecks);
    } else {
      console.error("Deck global não encontrado.");
      toast.error("Deck global não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao adicionar deck e cartões para o usuário:", error);
    toast.error("Erro ao adicionar deck e cartões para o usuário.");
  }
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDeck("");
    setNewDeckName("");
    setNewCardFront("");
    setNewCardBack("");
    setEditedCardId("");
    setEditedCardFront("");
    setEditedCardBack("");
    setSelectedFile(null);
    setIsUploading(false);
  };

  const openGlobalDecksModal = () => {
    setIsGlobalDecksModalOpen(true);
  };

  const closeGlobalDecksModal = () => {
    setIsGlobalDecksModalOpen(false);
  };

  const selectDeck = (deckId: string) => {
    setCurrentCard(0);
    setIsFlipped(false);
    setSelectedDeck(deckId);
    setGlobalDecksPractice(true);
  };

  const setDeckNull = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setSelectedDeck("");
    setGlobalDecksPractice(false);
  };

  const handleDeckSelection = async (deckId: string) => {
    setSelectedDeck(deckId);
    if (deckId) {
      try {
        const deckRef = firestoreDoc(db, "Flashcards", deckId);
        const deckDoc = await getDoc(deckRef);

        if (deckDoc.exists()) {
          const { tags: fetchedTags = [] } = deckDoc.data();
          setTags(fetchedTags);
        } else {
          setTags([]);
        }
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
        toast.error("Erro ao carregar tags do deck.");
      }
    } else {
      setTags([]);
    }
  };

  const handleGlobalDeckSelection = (deckId: string) => {
    selectDeck(deckId);
  };

  const handleGlobalDeckManagement = (deckId: string) => {
    handleDeckSelection(deckId);
    openModal();
  };

  const createDeck = async () => {
    if (newDeckName) {
      try {
        const deckRef = firestoreDoc(db, "Flashcards", newDeckName);
        const deckDoc = await getDoc(deckRef);
        if (!deckDoc.exists()) {
          await setDoc(deckRef, { tags });
          const newDeckData = { id: newDeckName, name: newDeckName, tags };
          setOtherDecks((prevDecks) => [...prevDecks, newDeckData]);
          setSelectedDeck(newDeckName);
          setNewDeckName("");
          toast.success("Deck criado com tags!");
        } else {
          toast.error("Deck já existe!");
        }
      } catch (error) {
        console.error("Erro ao criar deck:", error);
        toast.error("Erro ao criar deck!");
      }
    }
  };

  const addTag = async () => {
    if (newTag && !tags.includes(newTag) && selectedDeck) {
      const updatedTags = [...tags, newTag];
      try {
        const deckRef = firestoreDoc(db, "Flashcards", selectedDeck);
        await updateDoc(deckRef, { tags: updatedTags });
        setTags(updatedTags);
        setOtherDecks((prevDecks) =>
          prevDecks.map((deck) =>
            deck.id === selectedDeck ? { ...deck, tags: updatedTags } : deck
          )
        );
        setNewTag("");
        toast.success("Tag adicionada!");
      } catch (error) {
        console.error("Erro ao adicionar tag:", error);
        toast.error("Erro ao adicionar tag!");
      }
    }
  };

  const removeTag = async (index: number) => {
    if (selectedDeck) {
      const updatedTags = tags.filter((_, i) => i !== index);
      try {
        const deckRef = firestoreDoc(db, "Flashcards", selectedDeck);
        await updateDoc(deckRef, { tags: updatedTags });
        setTags(updatedTags);
        setOtherDecks((prevDecks) =>
          prevDecks.map((deck) =>
            deck.id === selectedDeck ? { ...deck, tags: updatedTags } : deck
          )
        );
        toast.success("Tag removida!");
      } catch (error) {
        console.error("Erro ao remover tag:", error);
        toast.error("Erro ao remover tag!");
      }
    }
  };

  const addCard = async () => {
    if (selectedDeck && newCardFront && newCardBack) {
      try {
        const newCardData = {
          front: newCardFront,
          back: newCardBack,
        };
        const docRef = await addDoc(
          collection(db, "Flashcards", selectedDeck, "cards"),
          newCardData
        );
        setOtherCards((prev) => [...prev, { id: docRef.id, ...newCardData }]);
        setNewCardFront("");
        setNewCardBack("");
        toast.success("Cartão adicionado!");
      } catch (error) {
        console.error("Error adding card:", error);
        toast.error("Erro ao adicionar cartão");
      }
    }
  };

  const updateCard = async () => {
    if (selectedDeck && editedCardId && (editedCardFront || editedCardBack)) {
      try {
        const cardRef = firestoreDoc(
          db,
          "Flashcards",
          selectedDeck,
          "cards",
          editedCardId
        );
        await updateDoc(cardRef, {
          front: editedCardFront,
          back: editedCardBack,
        });
        setOtherCards((prev) =>
          prev.map((c) =>
            c.id === editedCardId
              ? { ...c, front: editedCardFront, back: editedCardBack }
              : c
        ));
        setEditedCardId("");
        setEditedCardFront("");
        setEditedCardBack("");
        toast.success("Cartão atualizado!");
      } catch (error) {
        console.error("Error updating card:", error);
        toast.error("Erro ao atualizar cartão.");
      }
    }
  };

  const deleteCard = async (cardId: string) => {
    if (selectedDeck) {
      try {
        const cardRef = firestoreDoc(
          db,
          "Flashcards",
          selectedDeck,
          "cards",
          cardId
        );
        await deleteDoc(cardRef);
        setOtherCards((prev) => prev.filter((c) => c.id !== cardId));
        toast.error("Cartão deletado!");
      } catch (error) {
        console.error("Error deleting card:", error);
        toast.error("Erro ao deletar cartão.");
      }
    }
  };

  const handleEditInputChange = (card: Card) => {
    setEditedCardId(card.id);
    setEditedCardFront(card.front);
    setEditedCardBack(card.back);
  };

  const reviewCard = async (
    cardId: string,
    rating: "easy" | "medium" | "hard"
  ) => {
    const cardToReview = cards.find((c) => c.id === cardId);
    if (!cardToReview || !currentUserId) return;

    let { interval = 1, easeFactor = 2.5, reviewCount = 0 } = cardToReview;
    const now = new Date();

    switch (rating) {
      case "easy":
        easeFactor += 0.1;
        interval = reviewCount === 0 ? interval * 4 : interval * easeFactor;
        break;
      case "medium":
        interval =
          reviewCount === 0
            ? interval * 2.5
            : interval * (easeFactor - 0.1 < 1.3 ? 1.3 : easeFactor - 0.1);
        break;
      case "hard":
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        interval = reviewCount === 0 ? 1 : Math.max(1, interval * 0.5);
        break;
    }
    interval = Math.round(interval * 10) / 10;
    reviewCount += 1;
    const newDueDate = new Date(
      now.setDate(now.getDate() + Math.max(1, interval))
    ).toISOString();

    try {
      const cardRef = doc(
        db,
        "users",
        currentUserId,
        "Decks",
        selectedDeck,
        "cards",
        cardId
      );
      await updateDoc(cardRef, {
        interval,
        easeFactor,
        reviewCount,
        dueDate: newDueDate,
      });

      const logRef = collection(db, "users", currentUserId, "reviewLogs");
      await addDoc(logRef, {
        deckId: selectedDeck,
        cardId: cardId,
        rating: rating,
        timestamp: new Date().toISOString(),
      });

      setCards((prevCards) => prevCards.filter((c) => c.id !== cardId));
      setDecks((prevDecks) =>
        prevDecks.map((d) =>
          d.id === selectedDeck
            ? {
                ...d,
                cardsToReviewCount: Math.max(0, d.cardsToReviewCount - 1),
              }
            : d
        )
      );
      if (cards.length - 1 === 0) {
        toast.success("Deck concluído por agora!");
        setDeckNull();
      } else {
        toast.success("Cartão revisado!");
      }
      setIsFlipped(false);
      if (currentCard >= cards.length - 1 && cards.length - 1 > 0) {
        setCurrentCard(0);
      }
    } catch (error) {
      console.error("Error reviewing card:", error);
      toast.error("Erro ao revisar cartão.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadCSV = async () => {
    if (!selectedFile || !selectedDeck) {
      toast.error("Selecione um arquivo CSV e um deck.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      Papa.parse<CsvCardRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const cardsToUpload = results.data.filter(
            (row) => row.Front && row.Back
          );
          if (cardsToUpload.length === 0) {
            toast.error("Nenhum cartão válido encontrado no CSV.");
            setIsUploading(false);
            return;
          }

          try {
            const batch = [];
            for (const cardData of cardsToUpload) {
              batch.push(
                addDoc(collection(db, "Flashcards", selectedDeck, "cards"), {
                  front: cardData.Front,
                  back: cardData.Back,
                })
              );
            }
            await Promise.all(batch);
            toast.success(
              ` ${cardsToUpload.length} cartões adicionados com sucesso!`
            );
            fetchOtherCards(selectedDeck); // Refresh the card list
          } catch (error) {
            console.error("Erro ao fazer upload dos cartões:", error);
            toast.error("Erro ao fazer upload dos cartões.");
          } finally {
            setIsUploading(false);
            setSelectedFile(null);
          }
        },
        error: (err: any) => {
          console.error("Erro ao parsear CSV:", err);
          toast.error("Erro ao parsear o arquivo CSV.");
          setIsUploading(false);
        },
      });
    };
    reader.readAsText(selectedFile);
  };

  // Effects
  useEffect(() => {
    fetchAndSetOtherDecks();
  }, [fetchAndSetOtherDecks]);

  useEffect(() => {
    if (selectedDeck && isModalOpen) {
      fetchOtherCards(selectedDeck);
    } else {
      setOtherCards([]);
    }
  }, [selectedDeck, isModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUserId) {
        try {
          const fetchedDecks = await fetchDecksWithReviewCount(currentUserId);
          setDecks(fetchedDecks);
        } catch (error) {
          console.error("Error fetching decks:", error);
        }
      }
    };
    fetchData();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedDeck && globalDecksPractice && currentUserId) {
      fetchCardsForPractice(selectedDeck);
    } else {
      setCards([]);
    }
  }, [selectedDeck, globalDecksPractice, currentUserId]);

  return (
    <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 shadow-xl border border-fluency-gray-200 dark:border-fluency-gray-500 h-full w-full">
      {!selectedDeck || !globalDecksPractice ? (
        <DeckList
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          selectDeck={selectDeck}
          openModal={openModal}
          decks={decks}
          openGlobalDecksModal={openGlobalDecksModal}
        />
      ) : (
        <FlashcardPractice
          cards={cards}
          currentCard={currentCard}
          setCurrentCard={setCurrentCard}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          reviewCard={reviewCard}
          setDeckNull={setDeckNull} 
          deckName={decks.find(deck => deck.id === selectedDeck)?.name || ""}        
        />
      )}

      <GlobalDecksModal
        isOpen={isGlobalDecksModalOpen}
        onClose={closeGlobalDecksModal}
        globalDecks={otherDecks}
        onSelectDeck={handleGlobalDeckSelection}
        onManageDeck={handleGlobalDeckManagement}
        onConfirmAddDeck={addSelectDeck}
      />

      <DeckCreationModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        newDeckName={newDeckName}
        setNewDeckName={setNewDeckName}
        createDeck={createDeck}
        tags={tags}
        newTag={newTag}
        setNewTag={setNewTag}
        addTag={addTag}
        removeTag={removeTag}
        selectedDeck={selectedDeck}
        handleDeckSelection={handleDeckSelection}
        otherDecks={otherDecks}
      >
        <CardManagement
          selectedDeck={selectedDeck}
          otherCards={otherCards}
          newCardFront={newCardFront}
          setNewCardFront={setNewCardFront}
          newCardBack={newCardBack}
          setNewCardBack={setNewCardBack}
          addCard={addCard}
          editedCardId={editedCardId}
          editedCardFront={editedCardFront}
          setEditedCardFront={setEditedCardFront}
          editedCardBack={editedCardBack}
          setEditedCardBack={setEditedCardBack}
          updateCard={updateCard}
          deleteCard={deleteCard}
          handleEditInputChange={handleEditInputChange}
          handleFileChange={handleFileChange}
          handleUploadCSV={handleUploadCSV}
          isUploading={isUploading}
        />
      </DeckCreationModal>
    </div>
  );
};

export default FlashCard;