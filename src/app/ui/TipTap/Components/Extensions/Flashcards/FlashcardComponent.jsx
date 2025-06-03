import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { motion } from 'framer-motion';
import './style.css';
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import { FaRegCheckCircle } from "react-icons/fa";

const FlashcardComponent = ({ node }) => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal', 'type', 'srs'
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [srsData, setSrsData] = useState({});

  useEffect(() => {
    const loadCards = async () => {
      if (node?.attrs?.deckId) {
        const cardsQuery = collection(db, 'Flashcards', node.attrs.deckId, 'cards');
        const cardsSnapshot = await getDocs(cardsQuery);
        const cardsData = cardsSnapshot.docs.map(doc => ({
          ...doc.data(),
          repeatsLeft: 0,
          cooldown: 0,
        }));
        setCards(cardsData);
        setFilteredCards(cardsData);
        setCurrentIndex(0);
        setIsFlipped(false);
        setUserInput('');
        setFeedback(null);
      }
    };
    loadCards();
  }, [node?.attrs?.deckId]);

  // Navigate cards normally (prev/next) for 'normal' and 'type' modes
  const handleNavigation = (direction) => {
    if (filteredCards.length === 0) return;
    setFeedback(null);
    setUserInput('');
    setIsFlipped(false);
    setCurrentIndex((prevIndex) =>
      direction === 'next'
        ? (prevIndex + 1) % filteredCards.length
        : (prevIndex - 1 + filteredCards.length) % filteredCards.length
    );
  };

  // Improved SRS navigation with cooldown decrement and skip cooldown cards
  const goToNextCard = (cardsList = filteredCards) => {
    // Decrement cooldown for all cards
    const nextCards = cardsList.map(card => ({
      ...card,
      cooldown: Math.max(0, card.cooldown - 1),
    }));

    // Filter cards ready to show (cooldown === 0)
    const availableCards = nextCards.filter(card => card.cooldown === 0);

    if (availableCards.length === 0) {
      // If none available, just update cooldowns and wait
      setFilteredCards(nextCards);
      setUserInput('');
      setFeedback(null);
      setIsFlipped(false);
      return;
    }

    // Find first card with cooldown 0 to show
    const nextIndex = nextCards.findIndex(card => card.cooldown === 0);

    setFilteredCards(nextCards);
    setCurrentIndex(nextIndex);
    setUserInput('');
    setFeedback(null);
    setIsFlipped(false);
  };

  // Check user input answer in 'type' mode
  const checkAnswer = () => {
    const correct = userInput.trim().toLowerCase() === filteredCards[currentIndex]?.back?.trim().toLowerCase();
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct) {
      setTimeout(() => setIsFlipped(true), 300);
    }
  };

  // Improved SRS difficulty selection handler
  const handleSrsSelection = (difficulty) => {
    if (!filteredCards[currentIndex]) return;

    const updatedCards = [...filteredCards];
    const currentCard = updatedCards[currentIndex];

    if (difficulty === 'easy') {
      // Remove card from this round entirely
      updatedCards.splice(currentIndex, 1);
    } else {
      // Set repeatsLeft and cooldown based on difficulty
      currentCard.repeatsLeft = difficulty === 'medium' ? 1 : 2;
      currentCard.cooldown = difficulty === 'medium' ? 2 : 3;
    }

    setFilteredCards(updatedCards);
    setSrsData((prev) => ({
      ...prev,
      [currentCard.front]: difficulty,
    }));

    goToNextCard(updatedCards);
  };

  if (filteredCards.length === 0) {
    return (
      <NodeViewWrapper className="flashcard-loading flex flex-col items-center justify-center">
        Sem flashcards.
        <button
          onClick={() => {
            // Reset all cards with initial values
            const resetCards = cards.map(card => ({
              ...card,
              repeatsLeft: 0,
              cooldown: 0,
            }));
            setFilteredCards(resetCards);
            setCurrentIndex(0);
            setIsFlipped(false);
            setUserInput('');
            setFeedback(null);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Recomeçar
        </button>
      </NodeViewWrapper>
    );
  }

  const currentCard = filteredCards[currentIndex] || {};

  return (
    <NodeViewWrapper className="flashcard-container">
      <div className="flex flex-row items-center justify-center gap-4 bg-gray-700 text-white p-2 px-4 rounded-md mb-4">
        <button
          className={`font-bold duration-300 ease-in-out transition-all px-2 py-1 rounded-md ${
            mode === 'normal' ? 'bg-blue-500 text-white' : 'hover:text-fluency-blue-500'
          }`}
          onClick={() => setMode('normal')}
        >
          Normal
        </button>
        <button
          className={`font-bold duration-300 ease-in-out transition-all px-2 py-1 rounded-md ${
            mode === 'type' ? 'bg-blue-500 text-white' : 'hover:text-fluency-blue-500'
          }`}
          onClick={() => setMode('type')}
        >
          Digite
        </button>
        <button
          className={`font-bold duration-300 ease-in-out transition-all px-2 py-1 rounded-md ${
            mode === 'srs' ? 'bg-blue-500 text-white' : 'hover:text-fluency-blue-500'
          }`}
          onClick={() => setMode('srs')}
        >
          Repetição
        </button>
      </div>

      {/* Progress bar */}
      {mode === 'srs' && (
        <div className="hidden w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${((filteredCards.length / cards.length) * 100).toFixed(1)}%` }}
          />
        </div>
      )}

      <div className="flex flex-row items-center justify-center w-full gap-2 mb-4">
        <button onClick={() => (mode === 'srs' ? goToNextCard() : handleNavigation('prev'))}>
          <GrFormPrevious className="w-6 h-6 hover:text-blue-600 duration-300 ease-in-out transition-all" />
        </button>

        <div className="flashcard-wrapper cursor-pointer" onClick={() => mode !== 'type' && setIsFlipped(!isFlipped)}>
          <motion.div
            className={`flashcard ${feedback}`}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
          >
            <div
              className="card-front px-6 py-4"
              style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%' }}
            >
              {currentCard?.front}
            </div>
            <div
              className="card-back px-6 py-4"
              style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%', transform: 'rotateY(180deg)' }}
            >
              {currentCard?.back}
            </div>
          </motion.div>
        </div>

        <button onClick={() => (mode === 'srs' ? goToNextCard() : handleNavigation('next'))}>
          <GrFormNext className="w-6 h-6 hover:text-blue-600 duration-300 ease-in-out transition-all" />
        </button>
      </div>

      {/* Type mode input */}
      {mode === 'type' && (
        <div className="flex flex-row items-center justify-center gap-2">
          <input
            className={`px-2 py-1 outline-none rounded-md font-semibold w-64
              ${
                feedback === 'correct'
                  ? 'bg-green-600 text-white'
                  : feedback === 'incorrect'
                  ? 'bg-red-600 text-white'
                  : 'bg-fluency-gray-300 dark:bg-fluency-gray-700 text-white dark:text-white'
              }`}
            type="text"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              setFeedback(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') checkAnswer();
            }}
          />
          <button onClick={checkAnswer} title="Check answer">
            <FaRegCheckCircle className="w-6 h-6 text-fluency-gray-500 hover:text-green-600 duration-300 ease-in-out transition-all" />
          </button>
        </div>
      )}

      {/* SRS difficulty buttons */}
      {mode === 'srs' && (
        <div className="flex flex-row items-center justify-center gap-1 mt-4">
          <button
            className="bg-fluency-orange-600 hover:bg-fluency-orange-700 duration-300 ease-in-out transition-all p-1 px-4 rounded-l-lg font-bold text-white"
            onClick={() => handleSrsSelection('easy')}
          >
            Fácil
          </button>
          <button
            className="bg-fluency-orange-600 hover:bg-fluency-orange-700 duration-300 ease-in-out transition-all p-1 px-8 font-bold text-white"
            onClick={() => handleSrsSelection('medium')}
          >
            Médio
          </button>
          <button
            className="bg-fluency-red-600 hover:bg-fluency-red-700 duration-300 ease-in-out transition-all p-1 px-4 rounded-r-lg font-bold text-white"
            onClick={() => handleSrsSelection('hard')}
          >
            Difícil
          </button>
        </div>
      )}

      {/* Progress text and cooldown info */}
      {mode === 'srs' && (
        <div className="text-sm text-center mt-2 text-gray-400">
          {filteredCards.length} carta(s) restante(s).{' '}
          {filteredCards.some(c => c.cooldown > 0) && (
            <span className="text-yellow-400">
              Aguardando {filteredCards.filter(c => c.cooldown > 0).length} carta(s) em cooldown...
            </span>
          )}
        </div>
      )}

      {/* Navigation index */}
      <div className="card-navigation mt-4 text-center text-white">
        <span>
          {filteredCards.length === 0 ? 0 : currentIndex + 1}/{filteredCards.length}
        </span>
      </div>
    </NodeViewWrapper>
  );
};

export default FlashcardComponent;
