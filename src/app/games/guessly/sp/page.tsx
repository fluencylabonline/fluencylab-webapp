"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef, SetStateAction } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import { FaCheck } from 'react-icons/fa6';
import { TbPlayerTrackNext } from 'react-icons/tb';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import '../../games.css';
import allWordsDataSpanish from './wordsDataSpanish.json';
import Keyboard from '../keyboard-guessly';

const Guessly = () =>{
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
  
  const wordsData = allWordsDataSpanish[currentSetIndex];
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * allWordsDataSpanish.length);
    setCurrentSetIndex(randomIndex);
  }, []);

  useEffect(() => {
    setCurrentWord(wordsData[currentWordIndex].starter);
    setHint(wordsData[currentWordIndex].hint);
    setTempUserInput(Array(wordsData[currentWordIndex].starter.length).fill(''));
    setUserInput(Array(wordsData[currentWordIndex].starter.length).fill(''));
  }, [currentWordIndex, currentSetIndex, wordsData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 0.1);
      } else {
        setGameOver(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [timeLeft]);

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
    } else {
      setFeedbackMessage('No more attempts to skip.');
      setFeedbackMessageType('error');
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
  
  if (gameOver) {
    return (
      <div className='flex flex-col gap-10 min-h-screen w-[70] justify-center items-center bg-blue-different dark:bg-fluency-dark-bg'>
              <div className='w-full flex flex-row gap-3 justify-between px-4 py-2 items-center absolute top-0'>
                <Link href="/games">
                  <button className=" text-yellow-500 dark:text-yellow-600 hover:text-yellow-600 dark:hover:yellow-700 ease-in-out duration-300">
                    <BsArrowLeft className='w-9 h-9' />
                  </button>
                </Link>

                <h1 className="text-yellow-500 dark:yellow-600 text-xl font-bold">GUESSLY</h1>

                <div className=''>
                  <ToggleDarkMode />
                </div>
              </div>
        <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md" onClick={restartGame}>Jogar novamente</button>
        <div className="text-lg text-black-different dark:text-white font-semibold">Pontuação: {score}</div>
      </div>
    );
  }

  return (

  <div className='bg-white dark:bg-fluency-dark-bg h-[100vh] overflow-y-hidden'>
    
              <div className='w-full flex flex-row gap-3 justify-between px-4 py-3 items-center absolute top-0'>
                <Link href="/games">
                  <button className=" text-yellow-500 dark:text-yellow-600 hover:text-yellow-600 dark:hover:yellow-700 ease-in-out duration-300">
                  <BsArrowLeft className='lg:w-9 lg:h-9 w-5 h-5' />
                  </button>
                </Link>

                <h1 className="text-yellow-500 dark:yellow-600 text-xl font-bold">GUESSLY</h1>

                <div className=''>
                  <ToggleDarkMode />
                </div>
              </div>
  
    <div className="flex flex-col min-h-screen w-full justify-center items-center bg-blue-different dark:bg-fluency-dark-bg overflow-y-hidden">
      
      <div className="progressBar bg-[#f1f1f1] dark:bg-black">
        <div className="timeLeft bg-yellow-500" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
      </div>
      
      <div className='lg:w-[35%] w-[85%] h-[60vh] justify-center p-7 bg-slate-300 dark:bg-black-different rounded-xl flex flex-col items-center absolute top-[15%] overflow-y-hidden'>
        <div className="flex items-center space-x-2">
          {currentWord.split('').map((letter, index) => (
            <div key={index} className="bg-gray-200 lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded font-extrabold border-black-different border-2 dark:bg-black-different text-black-different dark:text-white dark:border-white">
              {userInput[index] !== '' ? userInput[index] : letter}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center space-x-2">
          {tempUserInput.map((letter, index) => (
            <input
              key={index}
              type="text"
              value={letter}
              maxLength={1}
              className="text-center bg-gray-200 lg:w-16 lg:h-16 w-[3rem] h-[3rem] text-3xl flex items-center justify-center rounded font-extrabold border-black-different border-2 dark:bg-black-different text-black-different dark:text-white dark:border-white"
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)} // Bind handleKeyDown function here
              ref={index === tempUserInput.length - 1 ? lastInputRef : null}
              
            />
          ))}
        </div>

        <div className='mt-4 p-2 rounded-md font-semibold text-black-different dark:text-white'>{hint}</div>
        <div className='flex flex-row gap-3 mt-2'>
          <button className="flex-row gap-1 items-center px-3 mt-4 bg-zinc-700 hover:bg-zinc-800 ease-in-out duration-300 rounded-md p-2 font-semibold text-white hidden" onClick={checkAnswer}><FaCheck /> Check</button>
          <button className="flex flex-row gap-2 items-center px-5 mt-4 bg-red-700 hover:bg-red-600 ease-in-out duration-300 rounded-md p-2 font-semibold text-white" onClick={skipWord}><TbPlayerTrackNext /> Skip <span>({remainingAttempts})</span></button>
        </div>

        {feedbackMessage && (
          <div className={`feedback-message text-center ${feedbackMessageType}`}>
            {feedbackMessage}
          </div>
        )}
      </div>

          <Keyboard onKeyPress={handleKeyPress} />
     
    </div>
    </div>
  );
};

export default Guessly;