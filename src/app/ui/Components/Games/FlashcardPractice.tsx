"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaRegLightbulb, FaCheck, FaTimes, FaQuestion } from "react-icons/fa";

interface FlashcardPracticeProps {
  deckName: string;
  cards: any[];
  currentCard: number;
  isFlipped: boolean;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentCard: React.Dispatch<React.SetStateAction<number>>;
  reviewCard: (cardId: string, rating: "easy" | "medium" | "hard") => void;
  setDeckNull: () => void;
}

const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({
  deckName,
  cards,
  currentCard,
  isFlipped,
  setIsFlipped,
  setCurrentCard,
  reviewCard,
  setDeckNull,
}) => {
  const [dragOffset, setDragOffset] = useState(0);

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handleDrag = (event: any, info: any) => {
    setDragOffset(info.point.x);
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handlePrevCard();
    } else if (info.offset.x < -100) {
      handleNextCard();
    }
    setDragOffset(0);
  };

  // Calculate progress percentage
  const progress = ((currentCard + 1) / cards.length) * 100;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 h-full">
      {/* Header with integrated progress bar */}
      <div className="w-full mb-6 relative">
        <div className="relative overflow-hidden rounded-xl border border-gray-700 shadow-lg">
          {/* Progress bar background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Header content */}
          <div className="relative flex justify-between items-center w-full p-4 z-10">
            <div className="flex items-center gap-3">
              <FaRegLightbulb className="text-white text-xl" />
              <h1 className="text-xl font-bold text-white">
                {deckName}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-white text-sm">
                {currentCard + 1}/{cards.length}
              </div>
              <button
                onClick={setDeckNull}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {cards.length > 0 && cards[currentCard] && (
            <motion.div
              key={currentCard}
              className="relative w-full max-w-md h-96 perspective-1000"
              initial={{ opacity: 0, x: currentCard > 0 ? -50 : 50 }}
              animate={{ 
                opacity: 1, 
                x: 0,
              }}
              exit={{ 
                opacity: 0, 
                x: currentCard > 0 ? 50 : -50 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.02 }}
            >
              {/* Card Container */}
              <div 
                className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front Side */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl backface-hidden flex flex-col items-center justify-center p-8">
                  <span className="text-sm text-cyan-400 mb-2">Frente</span>
                  <p className="text-2xl font-bold text-center text-white">
                    {cards[currentCard].front}
                  </p>
                  <div className="absolute bottom-4 text-xs text-gray-500">
                    Clique ou arraste para virar
                  </div>
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">F</span>
                  </div>
                </div>
                
                {/* Back Side */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8">
                  <span className="text-sm text-cyan-400 mb-2">Verso</span>
                  <p className="text-2xl font-bold text-center text-white">
                    {cards[currentCard].back}
                  </p>
                  <div className="absolute bottom-4 text-xs text-gray-500">
                    Clique ou arraste para virar
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">V</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between w-full max-w-md mt-6">
        <motion.button
          onClick={handlePrevCard}
          disabled={currentCard === 0}
          className={`p-3 rounded-xl flex items-center gap-2 ${
            currentCard === 0
              ? "text-gray-500 cursor-not-allowed"
              : "text-white bg-gray-800 hover:bg-gray-700"
          }`}
          whileHover={{ scale: currentCard === 0 ? 1 : 1.05 }}
        >
          <IoChevronBack />
          <span className="hidden sm:inline">Anterior</span>
        </motion.button>

        <motion.button
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Virar Cartão
        </motion.button>

        <motion.button
          onClick={handleNextCard}
          disabled={currentCard === cards.length - 1}
          className={`p-3 rounded-xl flex items-center gap-2 ${
            currentCard === cards.length - 1
              ? "text-gray-500 cursor-not-allowed"
              : "text-white bg-gray-800 hover:bg-gray-700"
          }`}
          whileHover={{ scale: currentCard === cards.length - 1 ? 1 : 1.05 }}
        >
          <span className="hidden sm:inline">Próximo</span>
          <IoChevronForward />
        </motion.button>
      </div>

      {/* Review Buttons */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center mt-6"
          >
            <motion.button
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 py-3 px-6 rounded-xl font-bold text-white shadow-lg flex-1"
              onClick={() => reviewCard(cards[currentCard].id, "hard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTimes className="text-xl" />
              Difícil
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 py-3 px-6 rounded-xl font-bold text-white shadow-lg flex-1"
              onClick={() => reviewCard(cards[currentCard].id, "medium")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaQuestion className="text-xl" />
              Médio
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 py-3 px-6 rounded-xl font-bold text-white shadow-lg flex-1"
              onClick={() => reviewCard(cards[currentCard].id, "easy")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCheck className="text-xl" />
              Fácil
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 rounded-xl bg-gray-800/50 border border-gray-700 mt-8 text-center"
          >
            <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FaRegLightbulb className="text-3xl text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">
              Parabéns! Você completou este deck!
            </h3>
            <p className="text-gray-400">
              Todos os cartões foram revisados. Volte mais tarde para revisar novamente.
            </p>
            <motion.button
              onClick={setDeckNull}
              className="mt-6 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-medium"
              whileHover={{ scale: 1.05 }}
            >
              Voltar para meus decks
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flip Animation Styles */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .backface-hidden {
          backface-visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashcardPractice;