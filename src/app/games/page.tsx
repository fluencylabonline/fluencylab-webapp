'use client';
import { SetStateAction, useState, useEffect } from 'react';
import Link from 'next/link';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { BsArrowLeft } from "react-icons/bs";
import './games.css';

export default function Games() {

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

  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const handleLanguageChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedLanguage(e.target.value);
  };

  // Define the type for game paths
type GamePaths = {
  [key: string]: {
    guessly: string;
    wordle: string;
  };
};

// Define the URL paths for each game and language
const gamePaths: GamePaths = {
  english: {
    guessly: 'en',
    wordle: 'en'
  },
  spanish: {
    guessly: 'sp',
    wordle: 'sp'
  },
  portuguese: {
    guessly: 'pt',
    wordle: 'pt'
  }
};
  // Dynamically generate the URL path based on the selected language and game
  const guesslyPath = gamePaths[selectedLanguage].guessly;
  const wordlePath = gamePaths[selectedLanguage].wordle;

  // Dynamically generate the button label based on the selected language
  const jogarButtonLabel = {
    english: 'START',
    spanish: 'COMENZAR',
    portuguese: 'COMEÇAR'
  }[selectedLanguage];


  return (
    <div className="p-2 overflow-y-auto flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">    
        <div className='flex flex-row w-full justify-between items-center px-2'>
            <Link href="/">
              <button className="text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 ease-in-out duration-300 flex justify-center">
                <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9' />
              </button>
            </Link>

            <div className='flex flex-row w-full items-center justify-around'>
              <h1 className="text-transparent dark:text-transparent lg:text-xl text-sm font-bold">GAMES</h1>
              <h1 className="text-fluency-text-light dark:text-fluency-text-dark lg:text-xl text-sm font-bold">GAMES</h1>
            <div className="z-50">
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="hover:bg-gray-300 dark:hover:bg-neutral-900 cursor-pointer before:inline-flex justify-center w-min px-0 py-1 lg:text-xl text-sm font-small font-semibold text-black-different dark:text-white transition duration-150 ease-in-out bg-transparent border-0 rounded-md focus:outline-none"
                >
                  <option value="english">Inglês</option>
                  <option value="spanish">Espanhol</option>
                  <option value="portuguese">Portugûes</option>
                </select>
            </div>
          </div>
                
          <div>
            <ToggleDarkMode />
          </div>
      </div>

    <div className='lg:mt-12 mt-2 p-1 flex flex-wrap items-center justify-center lg:h-min h-[90vh] overflow-y-auto gap-3'>
        
                  <div className='wordle overflow-hidden justify-between w-64 h-64 bg-gray-100 dark:bg-stone-900 rounded-lg flex flex-col items-center text-center'>
                      <div className='flex flex-row items-center pb-6 mt-2'>
                        <h1 className='text-3xl font-semibold text-yellow-500 dark:text-amber-600'>Wordle</h1>
                      </div>

                      <div className="bg-yellow-500 hover:bg-yellow-400 dark:bg-amber-600 dark:hover:bg-amber-700 ease-in-out duration-300 w-full p-1 cursor-pointer text-center">                 
                        <Link href={`/games/wordle/${wordlePath}`}>
                          <button className="text-md font-bold px-3 py-2 text-white hover:text-gray-100">{jogarButtonLabel}</button>
                        </Link>
                    </div>
                  </div>
                


                {/*GUESLLY*/}
                  <div className='guessly overflow-hidden justify-between w-64 h-64 bg-gray-100 dark:bg-stone-900 rounded-lg flex flex-col items-center text-center'>
                      <div className='flex flex-row items-center pb-6 mt-2'>
                        <h1 className='text-3xl font-semibold text-red-500'>Gueslly</h1>
                      </div>

                      <div className="bg-red-500 hover:bg-red-600 ease-in-out duration-300 w-full p-1 cursor-pointer text-center">                 
                        <Link href={`/games/guessly/${wordlePath}`}>
                          <button className="text-md font-bold px-3 py-2 text-white hover:text-gray-100">{jogarButtonLabel}</button>
                        </Link>
                    </div>
                  </div>



                  {/*CARDS*/}
                  <div className='cardsbg overflow-hidden justify-between w-64 h-64 bg-gray-100 dark:bg-stone-900 rounded-lg flex flex-col items-center text-center'>
                      <div className='flex flex-row items-center pb-6 mt-2'>
                        <h1 className='text-3xl font-semibold text-emerald-500'>Cards</h1>
                      </div>

                      <div className="bg-emerald-700 hover:bg-emerald-600 ease-in-out duration-300 w-full p-1 cursor-pointer text-center">                 
                        <Link href={`/games/flashcards`}>
                          <button className="text-md font-bold px-3 py-2 text-white hover:text-gray-100">{jogarButtonLabel}</button>
                        </Link>
                    </div>
                  </div>



                  
                  {/*FLUENCYJAM*/}
                  <div className='fluencyjam overflow-hidden justify-between w-64 h-64 bg-langjam-blue  rounded-lg flex flex-col items-center text-center'>
                      <div className='flex flex-row items-center pb-6 mt-2'>
                        <h1 className='text-3xl font-semibold text-white dark:text-langjam-darker-blue'>FluencyJam</h1>
                      </div>

                      <div className="bg-langjam-dark-blue hover:bg-langjam-darker-blueease-in-out duration-300 w-full p-1 cursor-pointer text-center">                 
                        <Link href={`/games/langjam`}>
                          <button className="text-md font-bold px-3 py-2 text-white hover:text-gray-100">{jogarButtonLabel}</button>
                        </Link>
                    </div>
                  </div>


         </div>
      </div>      
  );
}
