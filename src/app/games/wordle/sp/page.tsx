'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import { CiCircleQuestion } from "react-icons/ci";
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { WhatsAppButton } from '@/app/ui/Components/Buttons/WhatsAppButton';
import { toast, Toaster } from 'react-hot-toast';
import '../wordle.css';
import Keyboard from '../../../ui/Components/Keyboard/keyboard';
import WORDS from './palabras.json';

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
    // Deserializar los intentos almacenados del almacenamiento local
    const storedGuesses = localStorage.getItem('spanish_wordle_guesses');
    if (storedGuesses) {
      const parsedGuesses = JSON.parse(storedGuesses);
      console.log('Intentos almacenados:', parsedGuesses);
      setGuesses(parsedGuesses);
    } else {
      // Inicializar los intentos si no se encuentra ningún dato almacenado
      setGuesses(Array.from({ length: 6 }, () => Array(word.length).fill("")));
    }
    
    // Recuperar la fecha del último juego jugado del almacenamiento local
    const storedDate = localStorage.getItem('spanish_wordle_last_played_date');
    setLastPlayedDate(storedDate);
  }, [word.length]);
  

  useEffect(() => {
    // Serializar los intentos y almacenarlos en el almacenamiento local
    localStorage.setItem('spanish_wordle_guesses', JSON.stringify(guesses));
  }, [guesses]);


  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  useEffect(() => {
    const storedDate = localStorage.getItem('spanish_wordle_last_played_date');
    setLastPlayedDate(storedDate);
  }, []);

  useEffect(() => {
    const playOncePerDay = () => {
      const currentDate = new Date().toLocaleDateString();
      if (lastPlayedDate === currentDate) {
        setGameOver(true); // Evitar más jugabilidad
      } else {
        // Permitir al usuario jugar y actualizar la fecha del último juego jugado en el almacenamiento local
        // Solo actualizar la fecha del último juego jugado si el usuario realmente juega el juego
        if ((isGuessed || currentRow === 5)) {
          localStorage.setItem('spanish_wordle_last_played_date', currentDate);
        }
      }
    };
  
    playOncePerDay();
  }, [lastPlayedDate, isGuessed, currentRow]);  

  useEffect(() => {
    const storedspanish_wordAndDate = localStorage.getItem('spanish_wordAndDate');
    if (storedspanish_wordAndDate) {
      const { word, date } = JSON.parse(storedspanish_wordAndDate);
      const today = new Date().toLocaleDateString();
      if (today === date) {
        // Si la palabra fue elegida hoy, úsala
        setWord(word);
        setGuesses(Array.from({ length: 6 }, () => Array(word.length).fill("")));
      } else {
        // Si es un nuevo día, elige una nueva palabra
        chooseWordOfTheDay();
      }
    } else {
        // Si no hay ninguna palabra almacenada, elige una nueva
        chooseWordOfTheDay();
    }
  }, []);

  const chooseWordOfTheDay = () => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    const randomWord = WORDS[randomIndex].toUpperCase();
    setWord(randomWord);
    setGuesses(Array.from({ length: 6 }, () => Array(randomWord.length).fill("")));

    // Almacena la palabra elegida y la fecha en el almacenamiento local
    const today = new Date().toLocaleDateString();
    localStorage.setItem('spanish_wordAndDate', JSON.stringify({ word: randomWord, date: today }));
  };

  const handleKeyboardKeyPress = (key: string) => {
    if (gameOver) return;
    if (key === 'Enter') {
      // Verifica si todos los cuadrados en la fila actual están llenos, excluyendo los cuadrados vacíos causados por el borrado
      if (guesses[currentRow].filter(tile => tile !== "").length === word.length) {
        handleGuess();
      }
    } else if (key === 'Backspace') {
      // Borra el contenido del cuadrado actual
      setGuesses(prevGuesses => {
        const newGuesses = [...prevGuesses];
        newGuesses[currentRow][currentTileIndex] = ""; // Borrar el cuadrado actual
        return newGuesses;
      });
  
      // Mueve el cursor al final del cuadrado anterior o al principio si es el primer cuadrado
      const newCurrentTileIndex = Math.max(currentTileIndex - 1, 0);
      setCurrentTileIndex(newCurrentTileIndex);
      const previousInput = inputRefs.current[currentRow][newCurrentTileIndex];
      if (previousInput) {
        previousInput.focus();
        previousInput.setSelectionRange(previousInput.value.length, previousInput.value.length);
      }
    } else {
      // Manejar lógica de la tecla presionada
      // Añade la tecla al valor actual del cuadrado
      if (currentTileIndex < word.length) {
        setGuesses(prevGuesses => {
          const newGuesses = [...prevGuesses];
          newGuesses[currentRow][currentTileIndex] = key; // Añadir la tecla al cuadrado actual
          return newGuesses;
        });
  
        // Mueve el cursor al siguiente cuadrado
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
    // Verifica si la palabra adivinada es una palabra válida de la base de datos
    const isValidWord = WORDS.includes(guessedWord.toLowerCase());
  
    if (!isValidWord) {
      toast.error('¡Palabra no encontrada!');
      return; // No proceder si la palabra no es válida
    }
  
    if (guessedWord === word) {
      setIsGuessed(true);
      setGameOver(true);
      setResultMessage('¡Felicidades, has acertado la palabra!');
    } else if (currentRow === 5) {
      setResultMessage("Qué lástima, la próxima vez lo lograrás");
      setGameOver(true); // Establece el juego terminado cuando se usan todas las filas
    }
  
    setShowColors((prev) => [...prev.slice(0, currentRow), true]);
    if (currentRow < 5) {
      setCurrentRow((prev) => prev + 1);
      setCurrentTileIndex(0); // Restablecer el índice del cuadrado al pasar a la siguiente fila
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
      setCurrentTileIndex(index + 1); // Actualizar el índice del cuadrado actual
      inputRefs.current[row][index + 1]?.focus();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && guesses[currentRow].every(tile => tile !== "")) {
        handleGuess();
      } else if (e.key === 'Backspace') {
        // Obtener el elemento de entrada actual
        const currentInput = inputRefs.current[currentRow][currentTileIndex];
  
        // Si se presiona la tecla de retroceso y el cursor está al principio del cuadrado actual
        if (currentInput && currentInput.selectionStart === 0 && currentTileIndex > 0) {
          // Borrar el contenido del cuadrado actual
          setGuesses(prevGuesses => {
            const newGuesses = [...prevGuesses];
            newGuesses[currentRow][currentTileIndex] = "";
            return newGuesses;
          });
  
          // Mueve el cursor al final del cuadrado anterior
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
        // Calcula el tiempo restante hasta la medianoche
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // Establece a la medianoche del día actual
  
        const timeUntilMidnight = midnight.getTime() - now.getTime();
  
        // Formatea el tiempo restante como horas, minutos y segundos
        const hours = Math.floor((timeUntilMidnight / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeUntilMidnight / (1000 * 60)) % 60);
        const seconds = Math.floor((timeUntilMidnight / 1000) % 60);
  
        setTimeRemaining(`${hours}h:${minutes}m:${seconds}s`);
  
        // Actualiza el tiempo restante cada segundo
        const timer = setInterval(() => {
          const now = new Date();
          const timeUntilMidnight = midnight.getTime() - now.getTime();
          const hours = Math.floor((timeUntilMidnight / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeUntilMidnight / (1000 * 60)) % 60);
          const seconds = Math.floor((timeUntilMidnight / 1000) % 60);
          setTimeRemaining(`${hours}h:${minutes}m:${seconds}s`);
        }, 1000); // Actualizar cada segundo
  
        // Limpiar intervalo al desmontar el componente
        return () => clearInterval(timer);
      }, []);

  const renderWordDisplay = () => {
    const tileColor = isGuessed ? 'bg-green-500 border-green-500' : 'bg-red-500 border-red-500';
    
    if (gameOver) {
      if (lastPlayedDate === new Date().toLocaleDateString()) {
        return (
          <div className='gap-4 flex flex-col items-center'>

            <div className='flex flex-col items-center p-6 gap-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md'>
              <h1 className='text-2xl font-bold text-black dark:text-white'>LA PALABRA ERA:</h1>
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
            <h1 className='text-2xl font-bold text-black dark:text-white'>¡Ya jugaste hoy!</h1>
            <p className="text-center w-[75%] text-black dark:text-white">Si deseas jugar más veces, considera tomar uno de nuestros cursos. <br /> Obtendrás más juegos y aún más ayuda para aprender un nuevo idioma.</p>

              <div className='flex flex-col items-center gap-2 text-black dark:text-white'>
                <div className='lg:flex lg:flex-row flex flex-col gap-2 items-center'>
                <Link href="/LandingPages/googlecalendarpage" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                  Programa una prueba gratuita!
                  </Link>
                  <WhatsAppButton buttonText="O envía un mensaje aquí"/>
                </div>

                <p>pero, si ya eres uno de nuestros estudiantes:</p>
                <div>
                    <a href="/signin" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md">
                      Iniciar sesión <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
                    </a>
                </div>
              </div>

              <div className='text-black dark:text-white font-semibold mt-4 text-center'>
                  <p>Tiempo hasta el próximo juego:</p>
                  <p>{timeRemaining}</p>
              </div>  
            </div>
     
          </div>
        );
      } else {
        return (
          <div className='mt-14 flex flex-col items-center gap-8 p-5 rounded-md'>
            <h1 className='text-2xl font-bold text-black dark:text-white'>LA PALABRA ERA:</h1>
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
            let bgColor = 'bg-fluency-pages-light dark:bg-fluency-pages-dark';
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
    <div className='h-[100vh]'>


      <div className='flex flex-col items-center gap-4'>
        <div className='mt-14'>{renderWordDisplay()}</div>
        {!gameOver && <div className='absolute bottom-0'><Keyboard onKeyPress={handleKeyboardKeyPress} /></div>}
      </div>

      <Toaster />
    </div>
  );
};

export default Wordle;