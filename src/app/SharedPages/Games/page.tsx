'use client'

//Next Imports
import Image from "next/image";
import Link from "next/link";

//Images
import WordleImage from '../../../../public/images/games/wordlebg.png';
import GuesslyImage from '../../../../public/images/games/guessly.svg';
import LangJamImage from '../../../../public/images/games/langjam.png';
import FlagImage from '../../../../public/images/games/flashcards.svg';
import TicTacToeImage from '../../../../public/images/games/tictactoe.svg';
import RollAndTellImage from '../../../../public/images/games/rollandtell.svg';
import WhatAmIImage from '../../../../public/images/games/whatami.svg';
import QuizzImage from '../../../../public/images/games/quizz.svg';

//Icons
import { CiCircleQuestion } from "react-icons/ci";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

export default function GamesPro(){
    return(
        <div className="flex flex-wrap justify-center gap-3 p-10">

            <Link href={"pratica/wordle"}>
                <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                    <Image alt="Wordle" className="w-36 h-auto mt-2"src={WordleImage} />
                    <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Wordle</span></p>
                </div>
            </Link>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" src={GuesslyImage} className="w-36 h-auto mt-6" />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Guessly</span></p>
            </div>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image priority alt="Wordle" className="w-38 h-auto mt-3"  src={LangJamImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">LangJam</span></p>
            </div>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-32 h-auto mt-2" src={FlagImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">FlashCards</span></p>
            </div>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-28 h-auto mt-4" src={TicTacToeImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">TicTacToe</span></p>
            </div>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-32 h-auto mt-2" src={WhatAmIImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">What Am I?</span></p>
            </div>

            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={RollAndTellImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Roll and Tell</span></p>
            </div>

            <Link href={"pratica/quizz"}>
            <div className="w-52 h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-2"src={QuizzImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Quizz</span>0</p>
            </div>
            </Link>
        </div>
    )
}