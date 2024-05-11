'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import { CiCircleQuestion } from "react-icons/ci";
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { WhatsAppButton } from '@/app/ui/Components/Buttons/WhatsAppButton';
import { toast, Toaster } from 'react-hot-toast';
import '../wordle.css';
import Keyboard from '../keyboard';
import WORDS from './palavras.json';

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
  const [lastPlayedDate, setLastPlayedDate] = useState<string | null>(null);
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

    
  useEffect(() => {
    // Deserialize stored guesses from local storage
    const storedGuesses = localStorage.getItem('portuguese_wordle_guesses');
    if (storedGuesses) {
      const parsedGuesses = JSON.parse(storedGuesses);
      console.log('Stored Guesses:', parsedGuesses);
      setGuesses(parsedGuesses);
    } else {
      // Initialize guesses if no stored data is found
      setGuesses(Array.from({ length: 6 }, () => Array(word.length).fill("")));
    }
    
    // Retrieve last played date from local storage
    const storedDate = localStorage.getItem('portuguese_wordle_last_played_date');
    setLastPlayedDate(storedDate);
  }, [word.length]);
  

  useEffect(() => {
    // Serialize guesses and store them in local storage
    localStorage.setItem('portuguese_wordle_guesses', JSON.stringify(guesses));
  }, [guesses]);


  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  useEffect(() => {
    const storedDate = localStorage.getItem('portuguese_wordle_last_played_date');
    setLastPlayedDate(storedDate);
  }, []);

  useEffect(() => {
    const playOncePerDay = () => {
      const currentDate = new Date().toLocaleDateString();
      if (lastPlayedDate === currentDate) {
        setGameOver(true); // Prevent further gameplay
      } else {
        // Allow the user to play and update the last played date in localStorage
        // Only update the last played date if the user actually plays the game
        if ((isGuessed || currentRow === 5)) {
          localStorage.setItem('portuguese_wordle_last_played_date', currentDate);
        }
      }
    };
  
    playOncePerDay();
  }, [lastPlayedDate, isGuessed, currentRow]);  

  useEffect(() => {
    const storedportuguese_wordAndDate = localStorage.getItem('portuguese_wordAndDate');
    if (storedportuguese_wordAndDate) {
      const { word, date } = JSON.parse(storedportuguese_wordAndDate);
      const today = new Date().toLocaleDateString();
      if (today === date) {
        // If the word was chosen today, use it
        setWord(word);
        setGuesses(Array.from({ length: 6 }, () => Array(word.length).fill("")));
      } else {
        // If it's a new day, choose a new word
        chooseWordOfTheDay();
      }
    } else {
        // If no word is stored, choose a new one
        chooseWordOfTheDay();
    }
  }, []);

  const chooseWordOfTheDay = () => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    const randomWord = WORDS[randomIndex].toUpperCase();
    setWord(randomWord);
    setGuesses(Array.from({ length: 6 }, () => Array(randomWord.length).fill("")));

    // Store the chosen word and the date in local storage
    const today = new Date().toLocaleDateString();
    localStorage.setItem('portuguese_wordAndDate', JSON.stringify({ word: randomWord, date: today }));
  };

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
      toast.error('Palavra não encontrada!');
      return; // Don't proceed further if the word is invalid
    }
  
    if (guessedWord === word) {
      setIsGuessed(true);
      setGameOver(true);
      setResultMessage('Parabéns, você acertou a palavra!.');
    } else if (currentRow === 5) {
      setResultMessage("Que pena, na próxima você acerta");
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

  const [timeRemaining, setTimeRemaining] = useState('');
  
      useEffect(() => {
        // Calculate time remaining until midnight
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Set to midnight of the current day
  
        const timeUntilMidnight = midnight.getTime() - now.getTime();
  
        // Format time remaining as hours, minutes, and seconds
        const hours = Math.floor((timeUntilMidnight / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeUntilMidnight / (1000 * 60)) % 60);
        const seconds = Math.floor((timeUntilMidnight / 1000) % 60);
  
        setTimeRemaining(`${hours}h:${minutes}m:${seconds}s`);
  
        // Update time remaining every second
        const timer = setInterval(() => {
          const now = new Date();
          const timeUntilMidnight = midnight.getTime() - now.getTime();
          const hours = Math.floor((timeUntilMidnight / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeUntilMidnight / (1000 * 60)) % 60);
          const seconds = Math.floor((timeUntilMidnight / 1000) % 60);
          setTimeRemaining(`${hours}h:${minutes}m:${seconds}s`);
        }, 1000); // Update every second
  
        // Clean up interval on component unmount
        return () => clearInterval(timer);
      }, []);

  const renderWordDisplay = () => {
    const tileColor = isGuessed ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500';
    
    if (gameOver) {
      if (lastPlayedDate === new Date().toLocaleDateString()) {
        return (
          <div className='lg:mt-4 md:mt-1 gap-4 flex flex-col items-center bg-blue-different dark:bg-black-different'>

            <div className='flex flex-col items-center p-6 gap-4 bg-slate-300 dark:bg-fluency-dark-bg rounded-md'>
              <h1 className='text-2xl font-bold text-black dark:text-white'>A PALAVRA ERA:</h1>
              <div className="grid grid-cols-5 gap-1 lg:w-[19rem] w-[17rem]">
                {Array.from(word).map((letter, index) => (
                  <input
                    key={index}
                    type="text"
                    value={letter}
                    readOnly
                    className={`caret-transparent bg-stone-400 border-stone-400 flex lg:h-14 lg:w-14 h-12 w-12 rounded-md text-center items-center justify-center lg:border-2 border text-white font-bold uppercase lg:text-4xl text-xl`}
                  />
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-2 items-center'>
            <h1 className='text-2xl font-bold text-black dark:text-white'>Você já jogou hoje!</h1>
            <p className="text-center w-[75%] text-black dark:text-white">Se quiser jogar mais vezes, pense sobre fazer um de nossos cursos <br />Você vai ter mais outros jogos e ter ainda mais ajuda para aprender um idioma novo.</p>

              <div className='flex flex-col items-center gap-2 text-black dark:text-white'>
                <div className='lg:flex lg:flex-row flex flex-col gap-2 items-center'>
                  <Link href="/googlecalendarpage" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-light-blue hover:bg-fluency-dark-blue ease-in-out duration-300 text-white text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                  Marca uma aula teste!
                  </Link>
                  <WhatsAppButton buttonText="Ou manda mensagem aqui"/>
                </div>

                <p>mas, se já for um de nossos alunos:</p>
                <div>
                    <a href="/login" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md">
                      Entrar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
                    </a>
                </div>
              </div>

              <div className='text-black dark:text-white font-semibold mt-4 text-center'>
                  <p>Tempo até próximo jogo:</p>
                  <p>{timeRemaining}</p>
              </div>  
            </div>
     
          </div>
        );
      } else {
        return (
          <div className='mt-20 flex flex-col items-center gap-8 bg-blue-different dark:bg-fluency-dark-bg p-5 rounded-md'>
            <h1 className='text-2xl font-bold text-black dark:text-white'>A PALAVRA ERA:</h1>
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
            <div className="font-bold text-center text-black dark:text-white">{resultMessage}</div>        
          </div>
        );
      }
    } else { 
      return guesses.map((guessRow, row) => (
        <div key={row} className={`mb-1 grid grid-cols-5 gap-1 lg:w-[21rem] w-[17rem] ${row < currentRow ? 'pointer-events-none' : ''}`}>
          {Array.from(word).map((letter, index) => {
            let bgColor = 'bg-gray-200 dark:bg-black';
            if (isGuessed && guessRow.join("").toUpperCase() === word) {
              bgColor = 'bg-green-500 border-green-500'; // Entire row is green if the word is guessed correctly
           
            } else if (showColors[row] && index < guessRow.length) {
              if (guessRow[index] === letter) {
                bgColor = 'bg-green-500 border-green-500'; // Correct position and correct letter (green)
              } else if (word.includes(guessRow[index])) {
                bgColor = 'bg-yellow-400 border-yellow-400'; // Correct letter but wrong position (yellow)
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
                className={`caret-transparent flex lg:h-16 lg:w-16 h-12 w-12 rounded-md text-center items-center justify-center lg:border-2 border border-stone-600 font-bold uppercase text-black dark:text-white lg:text-4xl text-xl ${bgColor}`}
              />
            );
          })}
        </div>
         ));
        }
      };
  
  
  
  return (
    <div className='h-[100vh] bg-blue-different dark:bg-black-different'>

      <div className='header'>
        <div className='w-full flex flex-row gap-3 justify-between px-4 py-3 items-center absolute top-0'>
          <Link href="/games">
            <button className="text-yellow-500 dark:text-yellow-600 hover:text-yellow-600 dark:hover:yellow-700 ease-in-out duration-300">
              <BsArrowLeft className='lg:w-9 lg:h-9 w-5 h-5' />
            </button>
          </Link>

          <div className='flex flex-row items-center justify-around gap-4'>
            <CiCircleQuestion className='lg:w-7 lg:h-7 w-5 h-5 text-transparent' />
            <h1 className="text-yellow-500 dark:yellow-600 text-xl font-bold">WORDLY</h1>
            <CiCircleQuestion className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer' onClick={toggleInstructions} />
          </div>

          <div>
            <ToggleDarkMode />
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center gap-4'>
        <div className='mt-20'>{renderWordDisplay()}</div>
        {!gameOver && <div className='absolute bottom-0'><Keyboard onKeyPress={handleKeyboardKeyPress} /></div>}
      </div>


          {/* Instructions Dialog */}
          {showInstructions && (
            <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none transition-opacity duration-300 ${showInstructions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`relative w-auto max-w-md mx-auto my-6 p-6 bg-white dark:bg-fluency-dark-bg shadow-md rounded-xl text-black dark:text-white instructions-enter`}>                <div className="p-6 bg-white dark:bg-fluency-dark-bg shadow-md rounded-xl text-black dark:text-white">
                  <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold">Instruções</h1>
                    <button
                      className="p-1 transition-colors duration-200 transform rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={toggleInstructions}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 text-sm">
                    <strong>Descubra a PALAVRA do dia em 6 tentativas.</strong>
                    <br />
                    Cada tentativa deve ser uma palavra de 5 letras. Use o botão Enter para enviar. Após cada tentativa, a cor dos quadrados mudará de acordo com os seguintes exemplos:
                    <ul className="list-disc list-inside">
                      <li><strong className='text-green-700'>Quando a letra estiver em verde</strong>, a letra está correta e na posição correta.</li>
                      <li><strong className='text-yellow-700'>Quando a letra estiver em amarelo</strong>, a letra está correta, mas na posição errada.</li>
                      <li><strong className='text-stone-700'>Quando a letra estiver em cinza escuro</strong>, a letra está incorreta.</li>
                    </ul>
                    Todo dia há uma nova PALAVRA!
                  </div>
                </div>
              </div>
            </div>
          )}


      <Toaster />
    </div>
  );
};

export default Wordle;