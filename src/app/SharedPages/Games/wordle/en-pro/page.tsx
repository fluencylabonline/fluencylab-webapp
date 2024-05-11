'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import { CiCircleQuestion } from "react-icons/ci";
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { toast, Toaster } from 'react-hot-toast';
import Keyboard from '@/app/games/wordle/keyboard';
import '@/app/games/wordle/wordle.css';
import WORDS from '@/app/games/wordle/en/words.json';
import { IoClose } from 'react-icons/io5';

const Wordle = () => {
    const [word, setWord] = useState("");
    const [guesses, setGuesses] = useState<Array<Array<string>>>(Array.from({ length: 6 }, () => Array(word.length).fill("")));
    const [isGuessed, setIsGuessed] = useState(false);
    const [showColors, setShowColors] = useState<Array<boolean>>(Array.from({ length: 6 }, () => false));
    const [currentRow, setCurrentRow] = useState(0);
    const [currentTileIndex, setCurrentTileIndex] = useState(0);
    const [resultMessage, setResultMessage] = useState<string>("");
    const [gameOver, setGameOver] = useState(false);
    const inputRefs = useRef<Array<Array<HTMLInputElement | null>>>(Array.from({ length: 6 }, () => Array.from({ length: word.length }, () => null)));
    const [showInstructions, setShowInstructions] = useState(false);

    {/*PERSIST DARK MODE*/}
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

    const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
        const storedDarkMode = localStorage.getItem('isDarkMode');
        return storedDarkMode ? storedDarkMode === 'true' : true;
    }
    return true; // Default to true if localStorage is not available
    });

    useEffect(() => {
    if (isLocalStorageAvailable) {
        localStorage.setItem('isDarkMode', isChecked.toString());
        document.body.classList.toggle('dark', isChecked);
    }
    }, [isChecked, isLocalStorageAvailable]);

    {/*MAIN FUNCTIONS HERE*/}
    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
      };

      useEffect(() => {
        // Pick a random word from the words.json file
        const randomIndex = Math.floor(Math.random() * WORDS.length);
        const randomWord = WORDS[randomIndex].toUpperCase();
        setWord(randomWord);
        
        // Initialize guesses based on the length of the random word
        setGuesses(Array.from({ length: 6 }, () => Array(randomWord.length).fill("")));
      }, []);
      
      useEffect(() => {
        inputRefs.current[0][0]?.focus();
      }, []);     



      const handleKeyboardKeyPress = (key: string) => {
        if (gameOver) return;
        if (key === 'Enter') {
          // Check if all tiles in the current row are filled, excluding empty tiles caused by erasing
          if (guesses[currentRow].filter(tile => tile !== "").length === word.length) {
            handleGuess();
          }
        } else if (key === 'Backspace') {
          // Clear the content of the current tile
          setGuesses(prevGuesses => {
            const newGuesses = [...prevGuesses];
            newGuesses[currentRow][currentTileIndex] = ""; // Clear the current tile
            return newGuesses;
          });
      
          // Move the cursor to the end of the previous tile or the beginning if it's the first tile
          const newCurrentTileIndex = Math.max(currentTileIndex - 1, 0);
          setCurrentTileIndex(newCurrentTileIndex);
          const previousInput = inputRefs.current[currentRow][newCurrentTileIndex];
          if (previousInput) {
            previousInput.focus();
            previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length);
          }
        } else {
          // Handle key press logic
          // Append the key to the current tile value
          if (currentTileIndex < word.length) {
            setGuesses(prevGuesses => {
              const newGuesses = [...prevGuesses];
              newGuesses[currentRow][currentTileIndex] = key; // Append the key to the current tile
              return newGuesses;
            });
      
            // Move the cursor to the next tile
            const newCurrentTileIndex = currentTileIndex + 1;
            setCurrentTileIndex(newCurrentTileIndex);
            const nextInput = inputRefs.current[currentRow][newCurrentTileIndex];
            if (nextInput) {
              nextInput.focus();
              nextInput.setSelectionRange(0, 0);
            }
          }
        }
      };



      const handleGuess = useCallback(() => {
        const guessedWord = guesses[currentRow].join("").toUpperCase();
        // Check if the guessed word is a valid word from the database
        const isValidWord = WORDS.includes(guessedWord.toLowerCase());
      
        if (!isValidWord) {
          toast.error('Word not found!');
          return; // Don't proceed further if the word is invalid
        }
      
        if (guessedWord === word) {
          setIsGuessed(true);
          setGameOver(true);
          setResultMessage('Congratulations! You guessed the word.');
        } else if (currentRow === 5) {
          setResultMessage("Too bad. Next time you'll get it!");
          setGameOver(true); // Set game over when all rows are used
        }
        setShowColors((prev) => [...prev.slice(0, currentRow), true]);
        if (currentRow < 5) {
          setCurrentRow((prev) => prev + 1);
          setCurrentTileIndex(0); // Reset the tile index when moving to the next row
          setTimeout(() => {
            inputRefs.current[currentRow + 1][0]?.focus();
          }, 0);
        }
      }, [currentRow, guesses, word]);



      const handlePlayAgain = () => {
        setGameOver(false);
        setIsGuessed(false);
        setShowColors(Array.from({ length: 6 }, () => false));
        setCurrentRow(0);
        setCurrentTileIndex(0);
        setResultMessage("");
        const randomIndex = Math.floor(Math.random() * WORDS.length);
        const randomWord = WORDS[randomIndex].toUpperCase();
        setWord(randomWord);
        setGuesses(Array.from({ length: 6 }, () => Array(randomWord.length).fill("")));
      };
      


        const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, index: number) => {
          const newGuesses = [...guesses];
          newGuesses[row][index] = e.target.value.toUpperCase();
          setGuesses(newGuesses);
          setShowColors((prev) => [...prev.slice(0, row), false]);
          if (newGuesses[row][index].length === 1 && index < word.length - 1 && inputRefs.current[row][index + 1]) {
            setCurrentTileIndex(index + 1); // Update the current tile index
            inputRefs.current[row][index + 1]?.focus();
          }
        };

        

      useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
          if (e.key === 'Enter' && guesses[currentRow].every(tile => tile !== "")) {
            handleGuess();
          } else if (e.key === 'Backspace') {
            // Get the current input element
            const currentInput = inputRefs.current[currentRow][currentTileIndex];
      
            // If the Backspace key is pressed and the cursor is at the beginning of the current tile
            if (currentInput && currentInput.selectionStart === 0 && currentTileIndex > 0) {
              // Clear the content of the current tile
              setGuesses(prevGuesses => {
                const newGuesses = [...prevGuesses];
                newGuesses[currentRow][currentTileIndex] = "";
                return newGuesses;
              });
      
              // Move the cursor to the end of the previous tile
              const newCurrentTileIndex = currentTileIndex - 1;
              setCurrentTileIndex(newCurrentTileIndex);
              const previousInput = inputRefs.current[currentRow][newCurrentTileIndex];
              if (previousInput) {
                previousInput.focus();
                previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length);
              }
            }
          }
        };
      
        window.addEventListener('keydown', handleKeyPress);
        return () => {
          window.removeEventListener('keydown', handleKeyPress);
        };
      }, [currentRow, currentTileIndex, guesses, handleGuess]);



      const renderWordDisplay = () => {
        if (gameOver) {
          const tileColor = isGuessed ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500';
          return (
            <div className='mt-20 flex flex-col items-center gap-8 bg-blue-different dark:bg-fluency-dark-bg'>
                
                <h1 className='text-2xl font-bold text-black dark:text-white'>THE WORD WAS:</h1>
                <div className="grid grid-cols-5 gap-1 lg:w-[21rem] w-[17rem]">
                  {Array.from(word).map((letter, index) => (
                    <input
                      key={index}
                      type="text"
                      value={letter}
                      readOnly
                      className={`caret-transparent flex lg:h-16 lg:w-16 h-12 w-12 rounded-md text-center items-center justify-center lg:border-2 border ${tileColor} text-white font-bold uppercase lg:text-4xl text-xl`}
                    />
                  ))}
                </div>
    
                <button onClick={handlePlayAgain} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                  Play Again
                </button>
    
              <div className="font-bold text-center text-black dark:text-white">{resultMessage}</div>        
            </div>
          );
        } else { 
        return guesses.map((guessRow, row) => (
          <div key={row} className={`mb-1 grid grid-cols-5 gap-1 lg:w-[21rem] w-[17rem] ${row < currentRow ? 'pointer-events-none' : ''}`}>
            {Array.from(word).map((letter, index) => {
              let bgColor = 'bg-gray-200 dark:bg-black border-stone-400 dark:border-black';
              if (isGuessed && guessRow.join("").toUpperCase() === word) {
                bgColor = 'bg-green-500 border-green-500'; // Entire row is green if the word is guessed correctly
             
              } else if (showColors[row] && index < guessRow.length) {
                if (guessRow[index] === letter) {
                  bgColor = 'bg-green-500 border-green-500'; // Correct position and correct letter (green)
                } else if (word.includes(guessRow[index])) {
                  bgColor = 'bg-amber-400 border-amber-400'; // Correct letter but wrong position (yellow)
                } else {
                  bgColor = 'bg-stone-400 border-stone-400'; // Wrong letter (red)
                }
              }
              return (
                <input
                  key={index}
                  ref={(e: HTMLInputElement | null) => {
                    if (e) inputRefs.current[row][index] = e;
                  }}
                  type="text"
                  maxLength={1}
                  value={guessRow[index] || ''}
                  onChange={(e) => handleChange(e, row, index)}
                  readOnly={window.innerWidth < 768}
                  className={`caret-transparent flex lg:h-16 lg:w-16 h-12 w-12 rounded-md text-center items-center justify-center lg:border-2 border  font-bold uppercase text-black dark:text-white lg:text-4xl text-xl ${bgColor}`}
                />
              );
            })}
          </div>
           ));
          }
        };

    const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
    const openInstrucoes = () => {
        setIsInstrucoesOpen(true);
    };

    const closeInstrucoes = () => {
        setIsInstrucoesOpen(false);
    };  

  return (
    <div className='h-[90vh] bg-blue-different dark:bg-fluency-dark-bg p-8'>

      <div className='flex flex-col items-center'>
          <div className='flex flex-row items-center justify-around gap-4'>
            <CiCircleQuestion className='lg:w-7 lg:h-7 w-5 h-5 text-transparent' />
            <h1 className="text-yellow-500 dark:yellow-600 text-xl font-bold">WORDLY</h1>
            <CiCircleQuestion onClick={openInstrucoes} className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer'/>
          </div>
          
          <div className='mt-10'>{renderWordDisplay()}</div>
          {!gameOver && <div className='absolute bottom-0'><Keyboard onKeyPress={handleKeyboardKeyPress} /></div>}
      </div>   

      <Toaster />

      {isInstrucoesOpen && 
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">

                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                        
                    <button onClick={closeInstrucoes} className="absolute top-0 left-0 mt-2 ml-2 ">
                        <span className="sr-only">Fechar</span>
                        <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-blue-600 ease-in-out duration-300" />
                    </button>
            
                    <h3 className="text-xl font-bold text-center leading-6 mb-4">
                        Instruções
                    </h3>   

                <div className='text-justify flex gap-1 flex-col'>
                    <span>1. Se não conseguir fazer uma aula, simplesmente não marque como feita até fazer a reposição.</span>
                    <span>2. Se não for fazer a reposição marque como cancelada.</span>
                    <span>3. Clique ou passe o mouse em cima de cada data para saber o status de cada uma.</span>
                    <p className='mt-2 font-semibold'>Cores:</p>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-red-600'>Vermelho</span> são aulas atrasadas que não foram nem canceladas nem feitas</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-green-600'>Verde</span> são as aulas feitas.</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-yellow-600'>Amarelo</span> são as aulas canceladas.</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-blue-600'>Azul</span> são as aulas ainda por fazer.</span>  
                </div>                                                      
            </div>
        </div>
    </div>}

    </div>
  );
};

export default Wordle;