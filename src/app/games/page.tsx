'use client';
import { SetStateAction, useState, useEffect } from 'react';
import Link from 'next/link';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { BsArrowLeft } from "react-icons/bs";
import './games.css';
import Image from 'next/image';
import WordleImage from '../../../public/images/games/wordlebg.png';
import GuesslyImage from '../../../public/images/games/guessly.svg';
import LangJamImage from '../../../public/images/games/langjam.png';
import FlagImage from '../../../public/images/games/flashcards.svg';
import TicTacToeImage from '../../../public/images/games/tictactoe.svg';
import RollAndTellImage from '../../../public/images/games/rollandtell.svg';
import WhatAmIImage from '../../../public/images/games/whatami.svg';
import { CiCircleQuestion } from 'react-icons/ci';

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

  return (
    <div className="p-2 overflow-y-auto flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">    
        <div className='flex flex-row w-full justify-between items-center px-2'>
            <Link href="/">
              <button className="flex justify-center">
                <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9 hover:text-fluency-blue-500 ease-in-out duration-300' />
              </button>
            </Link>

            <div className='flex flex-row w-full items-center justify-around'>
              <h1 className="text-fluency-text-light dark:text-fluency-text-dark lg:text-xl text-sm font-bold">GAMES</h1>
            </div>
                
          <div>
            <ToggleDarkMode />
          </div>
      </div>

    <div className='lg:mt-12 mt-2 p-1 flex flex-wrap items-center justify-center lg:h-min h-[90vh] overflow-y-auto gap-3'>
        
            <Link href={"games/wordle"}>
              <div className="w-52 h-60 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                  <Image alt="Wordle" className="w-36 h-auto mt-2"src={WordleImage} />
                  <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Wordle</span> </p>
              </div>
            </Link>

            <Link href={"games/guessly"}>
            <div className="w-52 h-60 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" src={GuesslyImage} className="w-36 h-auto mt-6" />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Guessly</span> </p>
            </div>
            </Link>

            <Link href={"games/langjam"}>
            <div className="w-52 h-60 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image priority alt="Wordle" className="w-38 h-auto mt-3"  src={LangJamImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">LangJam</span> </p>
            </div>
            </Link>

            <div className="w-52 h-60 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-32 h-auto mt-2" src={FlagImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">FlashCards</span> </p>
            </div>

            <div className="w-52 h-60 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-28 h-auto mt-4" src={TicTacToeImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">TicTacToe</span> </p>
            </div>

         </div>
      </div>      
  );
}
