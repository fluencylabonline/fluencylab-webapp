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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal', 'type', 'srs'
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [srsData, setSrsData] = useState({});
  const [filteredCards, setFilteredCards] = useState([]);

  useEffect(() => {
    const loadCards = async () => {
      if (node?.attrs?.deckId) {
        const cardsQuery = collection(db, 'Flashcards', node.attrs.deckId, 'cards');
        const cardsSnapshot = await getDocs(cardsQuery);
        const cardsData = cardsSnapshot.docs.map(doc => ({ ...doc.data(), repeats: 0 }));
        setCards(cardsData);
        setFilteredCards(cardsData);
      }
    };
    loadCards();
  }, [node?.attrs?.deckId]);

  const handleNavigation = (direction) => {
    if (filteredCards.length === 0) return;
    setFeedback(null);
    setUserInput('');
    setIsFlipped(false);
    setCurrentIndex((prevIndex) =>
      direction === 'next' ? (prevIndex + 1) % filteredCards.length : (prevIndex - 1 + filteredCards.length) % filteredCards.length
    );
  };

  const checkAnswer = () => {
    const correct = userInput.trim().toLowerCase() === filteredCards[currentIndex]?.back?.trim().toLowerCase();
    setFeedback(correct ? 'correct' : 'incorrect');
    setIsFlipped(true);
  };

  const handleSrsSelection = (difficulty) => {
    if (!filteredCards[currentIndex]) return;
    
    const updatedCards = [...filteredCards];
    const currentCard = updatedCards[currentIndex];
    
    if (difficulty === 'easy') {
      updatedCards.splice(currentIndex, 1);
    } else {
      currentCard.repeats = difficulty === 'medium' ? 2 : 4;
    }
    
    setFilteredCards(updatedCards);
    setSrsData((prev) => ({
      ...prev,
      [currentCard?.front]: difficulty,
    }));
    
    handleNavigation('next');
  };

  if (!filteredCards.length) {
    return (
      <NodeViewWrapper className="flashcard-loading">
        No more flashcards.
        <button onClick={() => {
          setFilteredCards(cards);
          setCurrentIndex(0);
        }}>Reset</button>
      </NodeViewWrapper>
    );
  }

  const currentCard = filteredCards[currentIndex] || {};
  
  return (
    <NodeViewWrapper className="flashcard-container">
      <div className="flex flex-row items-center justify-center gap-4 bg-gray-700 text-white p-2 px-4 rounded-md">
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
      
      <div className='flex flex-row items-center justify-center w-full gap-2'>
        <button onClick={() => handleNavigation('prev')}><GrFormPrevious className='w-6 h-6 hover:text-blue-600 duration-300 ease-in-out transition-all' /></button>
          <div className="flashcard-wrapper">
            <motion.div 
              className={`flashcard ${feedback}`} 
              onClick={() => setIsFlipped(!isFlipped)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d', position: 'relative' }}
            >
              <div className="card-front px-6" style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%' }}>
                {currentCard?.front}
              </div>
              <div className="card-back px-6" style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%', transform: 'rotateY(180deg)' }}>
                {currentCard?.back}
              </div>
            </motion.div>
          </div>
        <button onClick={() => handleNavigation('next')}><GrFormNext className='w-6 h-6 hover:text-blue-600 duration-300 ease-in-out transition-all' /></button>
      </div>

      {mode === 'type' && (
        <div className="flex flex-row items-center justify-center gap-2">
          <input className='px-2 py-1 outline-none focus:border-0 bg-fluency-gray-300 dark:bg-fluency-gray-700 font-semibold text-white dark:text-white rounded-md' type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} />
          <button onClick={checkAnswer}><FaRegCheckCircle  className='w-6 h-6 text-fluency-gray-500 hover:text-green-600 duration-300 ease-in-out transition-all' /></button>
        </div>
      )}
      
      {mode === 'srs' && (
        <div className="flex flex-row items-center justify-center gap-1">
          <button className='bg-fluency-yellow-600 hover:bg-fluency-yellow-700 duration-300 ease-in-out transition-all p-1 px-4 rounded-l-lg font-bold text-white' onClick={() => handleSrsSelection('easy')}>Fácil</button>
          <button className='bg-fluency-orange-600 hover:bg-fluency-orange-700 duration-300 ease-in-out transition-all p-1 px-8 font-bold text-white' onClick={() => handleSrsSelection('medium')}>Médio</button>
          <button className='bg-fluency-red-600 hover:bg-fluency-red-700 duration-300 ease-in-out transition-all p-1 px-4 rounded-r-lg font-bold text-white' onClick={() => handleSrsSelection('hard')}>Difícil</button>
        </div>
      )}
      
      <div className="card-navigation">
        <span>{currentIndex + 1}/{filteredCards.length}</span>
      </div>
    </NodeViewWrapper>
  );
};

export default FlashcardComponent;
