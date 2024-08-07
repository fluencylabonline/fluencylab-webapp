"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import Link from 'next/link';
import { TbPlayerTrackNext } from 'react-icons/tb';
import '../../games.css';
import allWordsDataEnglish from './wordsDataEnglish.json';
import Keyboard from '../keyboard-guessly';
import { CiCircleQuestion } from "react-icons/ci";
import { IoClose } from 'react-icons/io5';
import { WhatsAppButton } from '@/app/ui/Components/Buttons/WhatsAppButton';

const Guessly = () =>{

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
  
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [hint, setHint] = useState('');
  const [userInput, setUserInput] = useState<string[]>([]);
  const [tempUserInput, setTempUserInput] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackMessageType, setFeedbackMessageType] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(2);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const [score, setScore] = useState(0); 
  const [showInstructions, setShowInstructions] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const [lastPlayedDate, setLastPlayedDate] = useState<string | null>(null);
  useEffect(() => {
    const storedDate = localStorage.getItem('english_guessly_last_played_date');
    setLastPlayedDate(storedDate);
  }, []);

  useEffect(() => {
    const playOncePerDay = () => {
      const currentDate = new Date().toLocaleDateString();
      if (lastPlayedDate === currentDate) {
        setGameOver(true);
      } else {
        if (lastPlayedDate !== currentDate) {
          setGameOver(false);
        }
      }
    };

    playOncePerDay();
  }, [lastPlayedDate]); 

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const wordsData = allWordsDataEnglish[currentSetIndex];
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * allWordsDataEnglish.length);
    setCurrentSetIndex(randomIndex);
  }, []);

  useEffect(() => {
    setCurrentWord(wordsData[currentWordIndex].starter);
    setHint(wordsData[currentWordIndex].hint);
    setTempUserInput(Array(wordsData[currentWordIndex].starter.length).fill(''));
    setUserInput(Array(wordsData[currentWordIndex].starter.length).fill(''));
  }, [currentWordIndex, currentSetIndex, wordsData]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    
    // Convert dates to milliseconds and calculate the difference
    const timeDiff = nextMidnight.getTime() - now.getTime();
  
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
    setTimeRemaining(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  };
  

  useEffect(() => {
    calculateTimeRemaining(); // Initial calculation
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!showInstructions && !gameOver && timerStarted) {
      timer = setTimeout(() => {
        if (timeLeft > 0) {
          setTimeLeft(timeLeft - 0.1);
        } else {
          setGameOver(true);
        }
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showInstructions, gameOver, timerStarted]);

  const handleStartGame = () => {
    setShowInstructions(false);
    setTimerStarted(true);
  
    // Focus on the first input element
    const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.toUpperCase();
    setTempUserInput(prevInput => {
      const updatedInput = [...prevInput];
      updatedInput[index] = newValue;
      return updatedInput;
    });

    if (newValue && index < tempUserInput.length - 1) {
      const nextInput = e.target.nextElementSibling as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBackspace = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && index > 0) {
      e.preventDefault();
      setTempUserInput(prevInput => {
        const updatedInput = [...prevInput];
        updatedInput[index] = '';
        return updatedInput;
      });
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      if (index === tempUserInput.length - 1) {
        e.preventDefault(); // Prevent default behavior of Enter key
        checkAnswer(); // Call checkAnswer function
      } else {
        const nextInput = e.currentTarget.nextSibling as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (e.key === 'Backspace' && index > 0) {
      handleBackspace(e, index);
    }
  };
  
  const checkAnswer = () => {
    const answer = wordsData[currentWordIndex].answer.toUpperCase();
    const userInputString = tempUserInput.join('').toUpperCase();
    if (userInputString === answer) {
      setUserInput(tempUserInput);
      if (currentWordIndex < wordsData.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setFeedbackMessage('Correct guess!');
        setFeedbackMessageType('correct');
        setTempUserInput(Array(wordsData[currentWordIndex + 1].starter.length).fill(''));
        setUserInput(Array(wordsData[currentWordIndex + 1].starter.length).fill(''));
        setScore(score + 1);
      } else {
        setGameOver(true);
      }
      
      // Focus on the first input element
      const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }

    } else {
      setFeedbackMessage('Incorrect guess. Please try again.');
      setFeedbackMessageType('incorrect');
    }
  };  

  const skipWord = () => {
    if (remainingAttempts > 0) {
      setCurrentWordIndex(currentWordIndex + 1);
      setRemainingAttempts(remainingAttempts - 1);
      setFeedbackMessage('Word skipped.');
      setFeedbackMessageType('skip');
      setTempUserInput(Array(wordsData[currentWordIndex + 1].starter.length).fill(''));
      setUserInput(Array(wordsData[currentWordIndex + 1].starter.length).fill(''));
      
        // Focus on the first input element
        const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }

    } else {
      setFeedbackMessage('No more attempts to skip.');
      setFeedbackMessageType('error');

        // Focus on the first input element
        const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
    }
  };

  const handleKeyPress = (key: string) => {
    const currentIndex = tempUserInput.findIndex((value) => value === '');
    if (currentIndex !== -1) {
      if (key === 'Enter') {
        checkAnswer();
      } else if (key === 'Backspace') {
        if (currentIndex > 0) {
          const updatedInput = [...tempUserInput];
          updatedInput[currentIndex - 1] = '';
          setTempUserInput(updatedInput);
          const prevInput = lastInputRef.current?.previousElementSibling as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
          }
        }
      } else {
        const updatedInput = [...tempUserInput];
        updatedInput[currentIndex] = key;
        setTempUserInput(updatedInput);
        const nextInput = lastInputRef.current?.nextElementSibling as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (key === 'Backspace') { // Handle Backspace when all inputs are filled
      const lastInput = lastInputRef.current;
      if (lastInput) {
        const index = tempUserInput.length - 1;
        setTempUserInput(prevInput => {
          const updatedInput = [...prevInput];
          updatedInput[index] = '';
          return updatedInput;
        });
        const prevInput = lastInput.previousElementSibling as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      }
    } else if (key === 'Enter') { // Handle Enter when all inputs are filled
      checkAnswer();
    }
  };

  const saveLastPlayedDate = () => {
    const currentDate = new Date().toLocaleDateString();
    localStorage.setItem('english_guessly_last_played_date', currentDate);
    setLastPlayedDate(currentDate);
  };

  useEffect(() => {
    if (gameOver && lastPlayedDate !== new Date().toLocaleDateString()) {
      saveLastPlayedDate();
    }
  }, [gameOver, lastPlayedDate]);

  const currentDate = new Date().toLocaleDateString();
  const alreadyPlayedToday = lastPlayedDate === currentDate;
  
  return (
    <div className='h-[100vh] overflow-y-hidden'>

      <div className="components">
        {alreadyPlayedToday  ? (
          
            <div className='flex flex-col gap-2 items-center justify-center h-[100vh]'>
              <h1 className='text-2xl font-bold text-black dark:text-white'>Você já jogou hoje!</h1>
              <p className="text-center w-[75%] text-black dark:text-white">Se quiser jogar mais vezes e em mais idiomas, pense sobre fazer um de nossos cursos <br />Você vai ter mais outros jogos e ter ainda mais ajuda para aprender um idioma novo.</p>

                <div className='flex flex-col items-center gap-2 text-black dark:text-white'>
                  <div className='lg:flex lg:flex-row flex flex-col gap-2 items-center'>
                    <Link href="/u/googlecalendarpage" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                    Marca uma aula teste!
                    </Link>
                    <WhatsAppButton buttonText="Ou manda mensagem aqui"/>
                  </div>

                  <p>mas, se já for um de nossos alunos:</p>
                  <div>
                      <a href="/signin" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md">
                        Entrar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
                      </a>
                  </div>
                </div>

                <div className='text-black dark:text-white font-semibold mt-4 text-center'>
                    <p>Tempo até próximo jogo:</p>
                    <p>{timeRemaining}</p>
                </div>  
            </div>
        ):(
          <div className='flex flex-col min-h-screen w-full justify-center items-center overflow-y-hidden'>
              
          <div className='lg:w-[45%] w-[85%] lg:h-[65vh] h-[50vh] justify-center p-7 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl flex flex-col items-center absolute top-[15%] overflow-y-hidden'>
          
              <div className="progressBar bg-[#f1f1f1] dark:bg-black">
                <div className="timeLeft bg-red-600" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
              </div>

              <div className="flex items-center space-x-2">
                {currentWord.split('').map((letter, index) => (
                  <div key={index} className="lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded-md font-extrabold bg-gray-200  border-black border-2 dark:bg-fluency-pages-dark text-black dark:text-white dark:border-white">
                    {userInput[index] !== '' ? userInput[index] : letter}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center space-x-2">
                {tempUserInput.map((letter, index) => (
                  <input
                    key={index}
                    type="text"
                    value={letter}
                    maxLength={1}
                    readOnly={window.innerWidth < 768}
                    className="caret-transparent text-center bg-gray-200 lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded-md font-extrabold border-black border-2 dark:bg-fluency-pages-dark text-black dark:text-white dark:border-white"
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)} // Bind handleKeyDown function here
                    ref={index === tempUserInput.length - 1 ? lastInputRef : null}
                    
                  />
                ))}
              </div>

          <div className='mt-4 p-2 rounded-md font-bold dark:font-semibold text-black-different dark:text-white text-center'>{hint}</div>
        
          <div className='flex flex-row items-center gap-3 mt-4'>
            <button className="flex flex-row gap-2 items-center px-5 bg-red-700 hover:bg-red-600 ease-in-out duration-300 rounded-md p-2 font-semibold text-white" onClick={skipWord}><TbPlayerTrackNext /> Pular palavra <span>({remainingAttempts})</span></button>
            <CiCircleQuestion onClick={toggleInstructions} className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer'/>
          </div>

          {feedbackMessage && (
            <div className={`feedback-message text-center ${feedbackMessageType}`}>
              {feedbackMessage}
            </div>
          )}
        </div>
        <Keyboard onKeyPress={handleKeyPress} />
     
        </div>
        )}

        {!alreadyPlayedToday && showInstructions &&(
          <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
          <div className="flex items-center justify-center min-h-screen">
  
                  <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
  
              <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                          
                      <button onClick={handleStartGame} className="absolute top-0 left-0 mt-2 ml-2 ">
                          <span className="sr-only">Fechar</span>
                          <IoClose className="w-10 h-10 text-black dark:text-white hover:text-fluency-red-600 hover:dark:text-fluency-red-600 ease-in-out duration-300" />
                      </button>
              
                      <h3 className="text-xl font-bold text-center leading-6 mb-4">
                          Instruções
                      </h3>   
  
                      <div className="mt-4 text-sm">
                      <strong>Descubra a palavra levando em conta a dica.</strong>
                      <br />
                      <p>Todas as dicas são em português, mas a palavra que você vai escrever deve ser no idioma selecionado, inglês.</p>
                      <ul className="list-disc list-inside">
                        <li>Você pode pular no máximo duas vezes quando não souber a palavra.</li>
                        <li>Não tem um limite de quantas vezes pode adivinhar.</li>
                        <li>O jogo acaba quando o tempo acabar ou quando acertar todas as palavras.</li>
                      </ul>
                    </div>                                                     
              </div>
          </div>
      </div>)}

      </div>
    </div>
  );
};

export default Guessly;