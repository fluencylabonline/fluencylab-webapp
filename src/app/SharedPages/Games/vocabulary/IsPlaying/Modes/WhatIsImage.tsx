'use client';
import { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import FluencyButton from '@/app/ui/Components/Button/button';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function WhatIsImage({ gameID }: { gameID: string }) {
  const [vocabularyData, setVocabularyData] = useState<any[]>([]);
  const [currentImageData, setCurrentImageData] = useState<any>(null);
  const [gridSquares, setGridSquares] = useState<boolean[]>(Array(256).fill(false));
  const [revealedSquares, setRevealedSquares] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [guessedCorrectly, setGuessedCorrectly] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isSingleplayer, setIsSingleplayer] = useState(false);

  // Handle SinglePlayer
  const params = new URLSearchParams(window.location.search);
  const singleplayer = params.get('aloneGameID');

  useEffect(() => {
    setIsSingleplayer(!!singleplayer);
  }, [singleplayer]);

  // Singleplayer mode setup
  useEffect(() => {
    if (isSingleplayer && singleplayer) {
      const fetchVocabulary = async () => {
        const vocabRef = doc(db, 'VocabularyGame', singleplayer);
        const docSnap = await getDoc(vocabRef);
        if (docSnap.exists()) {
          const vocabData = docSnap.data()?.vocabularies || [];
          const allVocabs = vocabData.map((v: any) => v.vocab);
          const transformedData = vocabData.map((item: any) => ({
            ...item,
            options: generateOptions(item.vocab, allVocabs),
            clickedOption: null,
            isCorrect: null,
            isGuess: null,
          }));
          initializeGridWithDelay(transformedData[0].imageURL);
          setVocabularyData(transformedData);
          setCurrentIndex(0);
          setCurrentImageData(transformedData[0]);
          setScore(0);
        }
      };
      fetchVocabulary();
    }
  }, [isSingleplayer, singleplayer]);

  const initializeGridWithDelay = (imageURL: string) => {
    setGridSquares(Array(256).fill(true));
    initializeGrid(imageURL);
  };

  // Multiplayer realtime setup
  const gameRef = doc(db, 'games', gameID, 'modes', 'whatisimage');

  useEffect(() => {
    if (!isSingleplayer) {
      const unsubscribe = onSnapshot(gameRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const firebaseVocabulary = data?.vocabularydata || [];
          const savedCurrentIndex = data?.currentIndex || 0;
          const savedScore = data?.score || 0;
  
          setVocabularyData(firebaseVocabulary);
          setCurrentIndex(savedCurrentIndex);
          setScore(savedScore);
  
          const currentItem = firebaseVocabulary[savedCurrentIndex];
          setCurrentImageData(currentItem);
          
          // Ensure revealing starts for the first image
          const shouldReveal = savedCurrentIndex === 0 && !data?.isGameOver;
          setIsRevealing(shouldReveal || data?.isRevealing || false);
          
          setShowOptions(data?.showOptions || false);
          setIsGameOver(data?.isGameOver || false);
          setGuessedCorrectly(data?.guessedCorrectly || null);
  
          if (data?.isGameOver) {
            initializeCompletedGrid();
          } else {
            initializeGrid(currentItem?.imageURL);
          }
        }
      });
  
      return () => unsubscribe();
    }
  }, [isSingleplayer]);
  

  const generateOptions = (correctVocab: string, allVocabs?: string[]): string[] => {
    if (allVocabs) {
      const incorrectOptions = allVocabs.filter(v => v !== correctVocab);
      const shuffledIncorrect = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
      return [correctVocab, ...shuffledIncorrect].sort(() => 0.5 - Math.random());
    }
    const incorrectOptions = ['cat', 'dog', 'car', 'banana', 'table', 'pen']
      .filter(option => option !== correctVocab);
    return [correctVocab, ...incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 2)]
      .sort(() => 0.5 - Math.random());
  };

  // Common game functions
  const initializeGrid = (imageURL: string) => {
    setGridSquares(Array(256).fill(false));
    setRevealedSquares(new Set());
  };

  const initializeCompletedGrid = () => {
    setGridSquares(Array(256).fill(true));
    setRevealedSquares(new Set(Array.from({ length: 256 }, (_, i) => i)));
  };

  const revealSquare = () => {
    if (!isRevealing) return;
    const hiddenSquares = gridSquares
      .map((v, idx) => (!v ? idx : null))
      .filter(v => v !== null);

    if (hiddenSquares.length === 0) {
      setIsRevealing(false);
      return;
    }

    const randomIndex = hiddenSquares[Math.floor(Math.random() * hiddenSquares.length)] as number;
    setRevealedSquares(prev => new Set(prev.add(randomIndex)));
    setGridSquares(prev => prev.map((v, i) => i === randomIndex ? true : v));
  };

  useEffect(() => {
    if (isRevealing && !showOptions) { // Ensure revealing does NOT continue after 'Chutar'
      const intervalId = setInterval(revealSquare, 300);
      return () => clearInterval(intervalId);
    }
  }, [isRevealing, showOptions, gridSquares]);
  
  // Game interaction handlers
  const handleGuess = async () => {
    if (isSingleplayer) {
      setIsRevealing(false);
      setShowOptions(true);
    } else {
      try {
        await updateDoc(gameRef, {
          showOptions: true,
          isRevealing: false
        });
      } catch (error) {
        toast.error('Error updating game state');
      }
    }
  };

  const handleOptionSelect = async (selectedOption: string) => {
    const correctAnswer = currentImageData.vocab;
    const isCorrect = selectedOption === correctAnswer;
    const hiddenSquaresAtGuess = 256 - revealedSquares.size;
    const newScore = isCorrect ? score + hiddenSquaresAtGuess : score;

    const updatedVocabulary = vocabularyData.map((item, index) => 
      index === currentIndex ? {
        ...item,
        clickedOption: selectedOption,
        isCorrect: isCorrect,
        isGuess: true
      } : item
    );

    if (isSingleplayer) {
      setVocabularyData(updatedVocabulary);
      setScore(newScore);
      setGuessedCorrectly(isCorrect);
      setGridSquares(Array(256).fill(true));
      setRevealedSquares(new Set(Array.from({ length: 256 }, (_, i) => i)));
      setIsGameOver(true);
      setShowOptions(false);
    } else {
      try {
        await updateDoc(gameRef, {
          vocabularydata: updatedVocabulary,
          score: newScore,
          isGameOver: true,
          showOptions: false,
          guessedCorrectly: isCorrect,
          isRevealing: false
        });
      } catch (error) {
        toast.error('Error saving progress');
      }
    }
  };

  const handleNextImage = async () => {
    const nextIndex = currentIndex + 1;
  
    // Step 1: Reset the grid first
    setGridSquares(Array(256).fill(false));
    setRevealedSquares(new Set());
    setIsRevealing(false);
    setShowOptions(false);
    setIsGameOver(false);
    setGuessedCorrectly(null);
  
    setTimeout(async () => {
      if (isSingleplayer) {
        // Step 2: Update local state after grid is hidden
        setCurrentIndex(nextIndex);
        setCurrentImageData(vocabularyData[nextIndex]);
        setIsRevealing(true);
      } else {
        try {
          // Step 2: Only update Firebase after a delay, ensuring grid is hidden first
          await updateDoc(gameRef, {
            currentIndex: nextIndex,
            isRevealing: true,
            showOptions: false,
            isGameOver: false,
            guessedCorrectly: null
          });
        } catch (error) {
          toast.error('Error saving progress');
        }
      }
    }, 300); // Ensure black cover appears first
  };
  
  const handlePlayAgain = async () => {
    const resetVocabulary = vocabularyData.map(item => ({
      ...item,
      clickedOption: null,
      isCorrect: null,
      isGuess: false
    }));

    if (isSingleplayer) {
      setVocabularyData(resetVocabulary);
      setCurrentIndex(0);
      setCurrentImageData(resetVocabulary[0]);
      setScore(0);
      initializeGridWithDelay(resetVocabulary[0].imageURL);
      setGuessedCorrectly(null);
      setIsGameOver(false);
      setShowOptions(false);
    } else {
      try {
        await updateDoc(gameRef, {
          currentIndex: 0,
          score: 0,
          vocabularydata: resetVocabulary,
          isRevealing: true,
          showOptions: false,
          isGameOver: false,
          guessedCorrectly: null
        });
      } catch (error) {
        toast.error('Error resetting game');
      }
    }
  };

  const handleGameModeChange = async () => {
    try {
      if (gameID) {
        const gameRef = doc(db, 'games', gameID);
        await updateDoc(gameRef, { gameMode: "" });
      }
    } catch (error) {
      toast.error('Erro ao mudar o modo de jogo');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-black dark:text-white">
      <div className='flex flex-row items-center p-1 justify-around w-full'>
        <p className="text-lg font-bold text-fluency-orange-500 p-3">Imagem {currentIndex + 1} de {vocabularyData.length}</p>
        <p className="hidden text-lg"><span className='font-bold'>Pontuação:</span> {score}</p>
      </div>
      <div className="relative w-[19rem] h-[19rem] mb-4 rounded-lg overflow-hidden">
        <Image
          src={currentImageData?.imageURL || ''}
          alt="Image"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
        <div className="grid grid-cols-16 grid-rows-16 absolute inset-0 z-10">
          {gridSquares.map((revealed, index) => (
            <div
              key={index}
              className={`w-full h-full ${revealed ? 'bg-transparent' : 'bg-black'}`}
              style={{ transition: 'background 0.3s' }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        {!isGameOver && !showOptions && !currentImageData?.isGuess && (
          <FluencyButton variant='gray' onClick={handleGuess}>Chutar</FluencyButton>
        )}

        {showOptions && (
          <div className="flex flex-wrap gap-2 justify-center">
            {currentImageData?.options?.map((option: string, index: number) => (
              <FluencyButton variant='orange' key={index} onClick={() => handleOptionSelect(option)}>
                {option}
              </FluencyButton>
            ))}
          </div>
        )}

        {guessedCorrectly !== null && (
          <p className={`text-xl font-bold ${guessedCorrectly ? 'text-green-500' : 'text-red-500'}`}>
            {guessedCorrectly ? '👏 Isso aí!' : '✖ Ops!'}
          </p>
        )}

        {isGameOver && (
          <div className="flex flex-col items-center">
            {currentIndex + 1 < vocabularyData.length ? (
              <FluencyButton className='mt-2' variant={guessedCorrectly ? 'confirm' : 'danger'} onClick={handleNextImage}>
                Próxima Imagem
              </FluencyButton>
            ) : (
              <div className='flex flex-row items-center justify-center gap-2'>
                <FluencyButton className='mt-2' variant='gray' onClick={handleGameModeChange}>
                  Finalizar
                </FluencyButton>
                <FluencyButton className='mt-2' variant='purple' onClick={handlePlayAgain}>
                  Jogar Novamente
                </FluencyButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}