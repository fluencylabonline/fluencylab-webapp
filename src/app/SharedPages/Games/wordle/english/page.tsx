'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Keyboard from '@/app/ui/Components/Keyboard/keyboard';
import '@/app/games/wordle/wordle.css';
import WORDS from '@/app/games/wordle/en/words.json';

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
                  Jogar Novamente
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


  return (
    <div className='h-[90vh] bg-blue-different dark:bg-fluency-dark-bg p-8'>

      <div className='flex flex-col items-center'>
          <div className='mt-5'>{renderWordDisplay()}</div>
          {!gameOver && <div className='absolute bottom-0'><Keyboard onKeyPress={handleKeyboardKeyPress} /></div>}
      </div>   

      <Toaster />

    </div>
  );
};

export default Wordle;