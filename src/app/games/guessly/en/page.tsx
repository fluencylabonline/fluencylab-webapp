"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import { TbPlayerTrackNext } from 'react-icons/tb';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import '../../games.css';
import allWordsDataEnglish from './wordsDataEnglish.json';
import Keyboard from '../../gamescomponents';
import { CiCircleQuestion } from "react-icons/ci";

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
  const [timerStarted, setTimerStarted] = useState(false); // New state variable for controlling timer start

  
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

  const restartGame = () => {
    setCurrentWordIndex(0);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setRemainingAttempts(2);
    setTempUserInput(Array(wordsData[0].starter.length).fill(''));
    setUserInput(Array(wordsData[0].starter.length).fill(''));
    setFeedbackMessage('');
    setFeedbackMessageType('');
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
  
  return (
    <div className='bg-white dark:bg-fluency-dark-bg h-[100vh] overflow-y-hidden'>

        <div className='w-full flex flex-row gap-3 justify-between px-4 py-1 items-center absolute top-0'>
          <Link href="/games">
            <button className="text-red-500 dark:text-red-600 hover:text-red-600 dark:hover:red-700 ease-in-out duration-300">
              <BsArrowLeft className='lg:w-9 lg:h-9 w-5 h-5' />
            </button>
          </Link>

          <div className='flex flex-row items-center justify-around gap-4'>
            <CiCircleQuestion className='lg:w-7 lg:h-7 w-5 h-5 text-transparent'/>
            <h1 className="text-red-500 dark:red-600 text-xl font-bold">GUESSLY</h1>
            <CiCircleQuestion className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer' onClick={toggleInstructions} />
          </div>

          <div>
            <ToggleDarkMode />
          </div>
        </div>

      <div className="components">
        {gameOver && (
          <div className='flex flex-col min-h-screen w-full justify-center items-center bg-blue-different dark:bg-black-different overflow-y-hidden'>
            <div className="congratulations-message">
              {score === wordsData.length ? (
                <>
                  <div>Congratulations! You have completed the game.</div>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md" onClick={restartGame}>Play Again</button>
                </>
              ) : (
                <>
                  <div>Sorry, you lost the game. Better luck next time!</div>
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md" onClick={restartGame}>Try Again</button>
                </>
              )}
            </div>
          </div>
        )}

        {!gameOver && (
          <div className='flex flex-col min-h-screen w-full justify-center items-center bg-blue-different dark:bg-black-different overflow-y-hidden'>
              
          <div className='lg:w-[45%] w-[85%] lg:h-[65vh] h-[50vh] justify-center p-7 bg-blue-different-darker dark:bg-fluency-dark-bg rounded-xl flex flex-col items-center absolute top-[15%] overflow-y-hidden'>
          
              <div className="progressBar bg-[#f1f1f1] dark:bg-black">
                <div className="timeLeft bg-red-600" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
              </div>

              <div className="flex items-center space-x-2">
              {currentWord.split('').map((letter, index) => (
                <div key={index} className="lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded-md font-extrabold bg-gray-200  border-black-different border-2 dark:bg-black-different text-black-different dark:text-white dark:border-white">
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
                className="caret-transparent text-center bg-gray-200 lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded-md font-extrabold border-black-different border-2 dark:bg-black-different text-black-different dark:text-white dark:border-white"
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)} // Bind handleKeyDown function here
                ref={index === tempUserInput.length - 1 ? lastInputRef : null}
                
              />
            ))}
          </div>

          <div className='mt-4 p-2 rounded-md font-bold dark:font-semibold text-black-different dark:text-white text-center'>{hint}</div>
        
          <div className='flex flex-row gap-3 mt-2'>
            <button className="flex flex-row gap-2 items-center px-5 mt-4 bg-red-700 hover:bg-red-600 ease-in-out duration-300 rounded-md p-2 font-semibold text-white" onClick={skipWord}><TbPlayerTrackNext /> Pular palavra <span>({remainingAttempts})</span></button>
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

        <div>
          Component that appears when the user already played the game
        </div>

       {/* Instructions Dialog */}
       {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-auto max-w-md mx-auto my-6">
              <div className="p-6 bg-blue-different dark:bg-black-different shadow-md rounded-xl text-black dark:text-white">
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-bold">Instructions</h1>
                  <button
                    className="p-1 transition-colors duration-200 transform rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleStartGame}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  </div>
                  <div className="mt-4 text-sm">
                    <strong>Discover the WORD of the day in 6 attempts.</strong>
                    <br />
                    <p>Each attempt must be a 5-letter word. Use the Enter button to submit. After each attempt, the color of the squares will change according to the following examples:</p>
                    <ul className="list-disc list-inside">
                      <li><strong className='text-green-700'>When the letter is green</strong> the letter is correct and in the correct position.</li>
                      <li><strong className='text-yellow-700'>When the letter is yellow</strong> the letter is correct and in the incorrect position.</li>
                      <li><strong className='text-stone-700'>When the letter is dark gray</strong> the letter is incorrect.</li>
                    </ul>
                    Every day there is a new WORD!
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Guessly;