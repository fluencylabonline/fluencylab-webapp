'use client'
import { useState, useRef, createRef, useEffect } from 'react';
import { Game, GameLevel } from '../types';
import { WordBank } from './WordBank';
import { DropZone } from './DropZone';
import { ConfirmationModal } from './ConfirmationModal';
import { DraggableWord } from './DraggableWord';
import { AttemptsTracker } from './AttemptsTracker';
import type { DraggableData } from 'react-draggable';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCw } from 'lucide-react';
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import AudioPlayer from '../../listening/player';

interface GameContainerProps {
  game: Game;
}

const levelConfig: Record<GameLevel, number> = {
  easy: 4,
  medium: 7,
  hard: 10,
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const checkIntersection = (wordNode: HTMLElement, dropZoneNode: HTMLElement): boolean => {
  const wordRect = wordNode.getBoundingClientRect();
  const dropZoneRect = dropZoneNode.getBoundingClientRect();
  
  return !(
    wordRect.right < dropZoneRect.left ||
    wordRect.left > dropZoneRect.right ||
    wordRect.bottom < dropZoneRect.top ||
    wordRect.top > dropZoneRect.bottom
  );
};

export default function GameContainer({ game }: GameContainerProps) {
  const { data: session } = useSession();
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [bankWords, setBankWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<Record<number, string | null>>({});
  const [attempts, setAttempts] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkedStatus, setCheckedStatus] = useState<Record<number, 'correct' | 'incorrect'>>({});

  const dropZoneRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    resetGame(true);
  }, [game]);

  const setupGameForLevel = (level: GameLevel) => {
    setSelectedLevel(level);
    const wordsForLevel = game.words.slice(0, levelConfig[level]);
    
    setActiveWords(wordsForLevel);
    setBankWords(shuffleArray(wordsForLevel));
    
    dropZoneRefs.current = Array.from({ length: wordsForLevel.length }, () => createRef<HTMLDivElement>());
    setPlacedWords(Object.fromEntries(Array.from({ length: wordsForLevel.length }, (_, i) => [i, null])));
  };
  
  const resetGame = (fullReset = false) => {
    if (fullReset) {
      setSelectedLevel(null);
      setActiveWords([]);
      setBankWords([]);
    }
    setPlacedWords(Object.fromEntries(Array.from({ length: activeWords.length }, (_, i) => [i, null])));
    setAttempts(3);
    setFeedback('');
    setIsGameFinished(false);
    setShowAnswers(false);
    setCheckedStatus({});
  };

  const handleWordDrop = (word: string, data: DraggableData, sourceIndex: number | null) => {
    setCheckedStatus({});
    setFeedback('');
    const wordNode = data.node;
    let targetIndex: number | null = null;

    for (let i = 0; i < dropZoneRefs.current.length; i++) {
      const dropZoneRef = dropZoneRefs.current[i];
      if (dropZoneRef.current && checkIntersection(wordNode, dropZoneRef.current)) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === null) return;
    
    setPlacedWords(currentPlacedWords => {
      const newPlacedWords = { ...currentPlacedWords };
      const wordAtTarget = newPlacedWords[targetIndex!];
      newPlacedWords[targetIndex!] = word;
      if (sourceIndex !== null) {
        newPlacedWords[sourceIndex] = wordAtTarget;
      }
      return newPlacedWords;
    });
  };

  const handleCheck = () => {
    const newCheckedStatus: Record<number, 'correct' | 'incorrect'> = {};
    let correctCount = 0;
    
    activeWords.forEach((word, index) => {
      if (placedWords[index] === word) {
        newCheckedStatus[index] = 'correct';
        correctCount++;
      } else {
        newCheckedStatus[index] = 'incorrect';
      }
    });

    setCheckedStatus(newCheckedStatus);

    if (correctCount === activeWords.length) {
      setFeedback('🎉 Parabéns! Você acertou tudo!');
      setIsGameFinished(true);
      toast.success("Você completou o jogo com sucesso!");
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      if (newAttempts > 0) {
        setFeedback(`Você acertou ${correctCount} de ${activeWords.length}. Tente de novo!`);
        toast.error(`Você tem ${newAttempts} tentativas restantes.`);
      } else {
        setFeedback('Fim de jogo! Mais sorte na próxima vez.');
        setIsGameFinished(true);
        toast.error("Fim de jogo! Tente novamente.");
      }
    }
  };

  const handleShowAnswers = () => {
    setShowAnswers(true);
    setIsModalOpen(false);
    setIsGameFinished(true);
    toast("Respostas reveladas", { icon: "ℹ️" });
  };
  
  const availableWords = bankWords.filter(word => !Object.values(placedWords).includes(word));

  return (
    <div className="w-full h-[90vh] rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark overflow-y-auto">
      <div className="flex flex-col items-center justify-center p-2 gap-4">
        <motion.div 
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 sm:p-8 rounded-lg shadow-md w-full max-w-4xl"
        >
          <h2 className="text-2xl font-bold">{game.title}</h2>
          <p className="text-slate-600 mb-1">Selecione um áudio da lista e coloque as palavras na ordem que escuta.</p>

          {!selectedLevel ? (
            <div className="text-center p-8 mt-2">
              <h3 className="text-lg font-semibold mb-4">Escolha um nível de dificuldade</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {(Object.keys(levelConfig) as GameLevel[]).map(level => (
                  <motion.button 
                    key={level} 
                    onClick={() => setupGameForLevel(level)} 
                    className="px-6 py-3 bg-fluency-blue-500 text-white font-bold rounded-lg shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)} ({levelConfig[level]} palavras)
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
             {game.audioUrl && <AudioPlayer src={game.audioUrl} />}
              
              {!isGameFinished && <AttemptsTracker attemptsLeft={attempts} maxAttempts={3} />}

              <div className="mb-6 space-y-3 mt-4">
                {activeWords.map((_, index) => {
                  const wordInSlot = showAnswers ? activeWords[index] : placedWords[index];
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="font-mono text-sm text-fluency-gray-500 dark:text-fluency-gray-300 w-6 text-right">({index + 1})</span>
                      <DropZone
                        ref={dropZoneRefs.current[index]}
                        isAnswer={showAnswers}
                        status={checkedStatus[index]}
                      >
                        {wordInSlot ? (
                          <DraggableWord
                            word={wordInSlot}
                            onStop={(word, data) => handleWordDrop(word, data, index)}
                          />
                        ) : (
                          !showAnswers && <span className="text-fluency-gray-400 dark:text-fluency-gray-500 text-sm font-normal">Arraste aqui</span>
                        )}
                      </DropZone>
                    </div>
                  );
                })}
              </div>

              <WordBank 
                words={availableWords} 
                disabled={isGameFinished || showAnswers}
                onWordDrop={(word, data) => handleWordDrop(word, data, null)}
              />

              <AnimatePresence>
                {feedback && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-center font-semibold text-lg"
                  >
                    {feedback}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                {!isGameFinished ? (
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={handleCheck} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-fluency-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-fluency-green-700 transition-colors"
                  >
                    <CheckCircle size={20} /> Verificar
                  </motion.button>
                ) : (
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => resetGame(true)} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-fluency-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-fluency-blue-700 transition-colors"
                  >
                    <RotateCw size={20} /> Jogar Novamente
                  </motion.button>
                )}
              
                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setIsModalOpen(true)} 
                  disabled={showAnswers} 
                  className="w-full sm:w-auto px-6 py-2 bg-fluency-gray-200 dark:bg-fluency-gray-700 text-fluency-gray-800 dark:text-fluency-gray-100 font-semibold rounded-md hover:bg-fluency-gray-300 dark:hover:bg-fluency-gray-600 disabled:bg-fluency-gray-300 dark:disabled:bg-fluency-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  Mostrar Respostas
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
        
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleShowAnswers}
          title="Mostrar Respostas?"
          message="Você tem certeza que quer revelar as respostas? Isso encerrará o jogo atual."
        />
      </div>
    </div>
  );
}