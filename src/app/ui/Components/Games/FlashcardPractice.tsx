"use client";
import React, { useState } from "react";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useSwipeable } from "react-swipeable";

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
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevCard = () => {
    if (currentCard > 0) {
      setSwipeDirection("right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCard(currentCard - 1);
        setIsFlipped(false);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleNextCard = () => {
    if (currentCard < cards.length - 1) {
      setSwipeDirection("left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCard(currentCard + 1);
        setIsFlipped(false);
        setIsAnimating(false);
      }, 300);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextCard(),
    onSwipedRight: () => handlePrevCard(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Calculate which cards to show behind the current card
  const showPrevCard = currentCard > 0;
  const showNextCard = currentCard < cards.length - 1;
  const showPrevPrevCard = currentCard > 1;
  const showNextNextCard = currentCard < cards.length - 2;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-row justify-between items-center w-full p-3 rounded-md bg-fluency-gray-100 dark:bg-fluency-gray-400">
          <span className="font-bold">Deck: {deckName}</span>
          <button
            onClick={setDeckNull}
            className="p-1 rounded-full hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-500 transition-colors"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {cards.length > 0 && cards[currentCard] && (
          <div className="flex flex-row items-center w-full max-w-2xl gap-2">
            {/* Left Arrow (Desktop) */}
            <button
              onClick={handlePrevCard}
              disabled={currentCard === 0}
              className={`p-2 rounded-full ${
                currentCard === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-500 text-gray-700 dark:text-gray-200 transition-colors"
              }`}
            >
              <IoChevronBack className="w-6 h-6" />
            </button>

            {/* Card Stack Container */}
            <div className="relative w-full max-w-md h-64">
              {/* Previous Previous Card (2 cards behind) */}
              {showPrevPrevCard && (
                <div className="absolute w-full h-full top-0 left-0 z-0">
                  <div className="w-full h-full transform translate-x-[-14px] scale-[0.85] opacity-40 transition-all">
                    <div className="w-full h-full bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-2xl shadow-sm border border-fluency-gray-300 dark:border-fluency-gray-500" />
                  </div>
                </div>
              )}

              {/* Previous Card (1 card behind) */}
              {showPrevCard && (
                <div className="absolute w-full h-full top-0 left-0 z-10">
                  <div className="w-full h-full transform translate-x-[-8px] scale-[0.9] opacity-60 transition-all">
                    <div className="w-full h-full bg-fluency-gray-100 dark:bg-fluency-gray-500 rounded-2xl shadow-md border border-fluency-gray-200 dark:border-fluency-gray-400" />
                  </div>
                </div>
              )}

              {/* Next Next Card (2 cards behind) */}
              {showNextNextCard && (
                <div className="absolute w-full h-full top-0 left-0 z-0">
                  <div className="w-full h-full transform translate-x-[14px] scale-[0.85] opacity-40 transition-all">
                    <div className="w-full h-full bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-2xl shadow-sm border border-fluency-gray-300 dark:border-fluency-gray-500" />
                  </div>
                </div>
              )}

              {/* Next Card (1 card behind) */}
              {showNextCard && (
                <div className="absolute w-full h-full top-0 left-0 z-10">
                  <div className="w-full h-full transform translate-x-[8px] scale-[0.9] opacity-60 transition-all">
                    <div className="w-full h-full bg-fluency-gray-100 dark:bg-fluency-gray-500 rounded-2xl shadow-md border border-fluency-gray-200 dark:border-fluency-gray-400" />
                  </div>
                </div>
              )}

              {/* Main Flashcard */}
              <div
                className={`absolute w-full h-full top-0 left-0 z-20 rounded-2xl perspective-1000 transition-transform duration-300 cursor-pointer ${
                  isAnimating
                    ? swipeDirection === "left"
                      ? "animate-swipe-left"
                      : "animate-swipe-right"
                    : ""
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
                {...swipeHandlers}
              >
                <div
                  className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  {/* Front */}
                  <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl flex items-center justify-center p-6 border dark:bg-fluency-gray-700 dark:border-fluency-gray-500">
                    <p className="font-bold text-xl text-center text-gray-800 dark:text-gray-200">
                      {cards[currentCard].front}
                    </p>
                  </div>
                  {/* Back */}
                  <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl flex items-center justify-center p-6 rotate-y-180 border dark:bg-fluency-gray-700 dark:border-fluency-gray-500">
                    <p className="font-bold text-xl text-center text-gray-800 dark:text-gray-200">
                      {cards[currentCard].back}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Arrow (Desktop) */}
            <button
              onClick={handleNextCard}
              disabled={currentCard === cards.length - 1}
              className={`p-2 rounded-full ${
                currentCard === cards.length - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-500 text-gray-700 dark:text-gray-200 transition-colors"
              }`}
            >
              <IoChevronForward className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* No cards */}
        {cards.length === 0 && (
          <p className="text-gray-500 mt-4 text-center p-4 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-400 dark:text-gray-300">
            Nenhum cartão para revisar neste deck no momento!
          </p>
        )}

        {/* Progress */}
        {cards.length > 0 && (
          <div className="flex flex-col items-center gap-2 w-full mt-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currentCard + 1} de {cards.length}
            </p>
          </div>
        )}
      </div>

      {/* Review Buttons */}
      {cards.length > 0 && isFlipped && (
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center mt-6">
          <button
            className="bg-fluency-red-500 hover:bg-fluency-red-600 transition-colors py-3 px-4 rounded-lg font-bold text-white shadow-md flex-1"
            onClick={() => reviewCard(cards[currentCard].id, "hard")}
          >
            Difícil
          </button>
          <button
            className="bg-fluency-orange-500 hover:bg-fluency-orange-600 transition-colors py-3 px-4 rounded-lg font-bold text-white shadow-md flex-1"
            onClick={() => reviewCard(cards[currentCard].id, "medium")}
          >
            Médio
          </button>
          <button
            className="bg-fluency-green-500 hover:bg-fluency-green-600 transition-colors py-3 px-4 rounded-lg font-bold text-white shadow-md flex-1"
            onClick={() => reviewCard(cards[currentCard].id, "easy")}
          >
            Fácil
          </button>
        </div>
      )}

      {/* Animation + Flip Styles */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
          position: relative;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .animate-swipe-left {
          animation: swipeLeft 0.3s ease-in-out forwards;
        }
        .animate-swipe-right {
          animation: swipeRight 0.3s ease-in-out forwards;
        }

        @keyframes swipeLeft {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
            z-index: 20;
          }
          50% {
            transform: translateX(-50%) scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-100%) scale(0.9);
            opacity: 0;
            z-index: 10;
          }
        }

        @keyframes swipeRight {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
            z-index: 20;
          }
          50% {
            transform: translateX(50%) scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: translateX(100%) scale(0.9);
            opacity: 0;
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
};

export default FlashcardPractice;