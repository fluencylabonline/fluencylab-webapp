'use client'

//Next Imports
import Image from "next/image";
import Link from "next/link";

//Images
import WordleImage from '../../../../public/images/games/wordlebg.png';
import GuesslyImage from '../../../../public/images/games/guessly.svg';
import FlagImage from '../../../../public/images/games/flashcards.svg';
import TicTacToeImage from '../../../../public/images/games/tictactoe.svg';
import RollAndTellImage from '../../../../public/images/games/rollandtell.svg';
import WhatAmIImage from '../../../../public/images/games/whatami.svg';
import QuizzImage from '../../../../public/images/games/quizz.svg';
import Listening from '../../../../public/images/games/listening.png';
import Speaking from '../../../../public/images/games/speaking.png';

import { Tooltip } from "@nextui-org/react";

export default function GamesPro(){
    return(
        <div className="flex flex-wrap justify-center gap-3 p-10">

            <Link href={"pratica/wordle"}>
                <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                    <Image alt="Wordle" className="w-36 h-auto mt-4"src={WordleImage} />
                    <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Wordle</span></p>
                </div>
            </Link>

            <Link href={"pratica/guessly"}>
                <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                    <Image alt="Wordle" src={GuesslyImage} className="w-36 h-auto mt-4" />
                    <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Guessly</span></p>
                </div>
            </Link>

            <Link href={"pratica/flashcards"}>
            <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={FlagImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">FlashCards</span></p>
            </div>
            </Link>

            <Link href={"pratica/listening"}>
            <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={Listening} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Listening</span></p>
            </div>
            </Link>
            
            <Link href={"pratica/tic-tac-toe"}>
            <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={TicTacToeImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">TicTacToe</span></p>
            </div>
            </Link>

            <Link href={"pratica/what-am-i"}>
            <div className="blur-[1.8px] w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={WhatAmIImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">What Am I?</span></p>
            </div>
            </Link>

            <Tooltip className="px-2 bg-fluency-bg-dark text-white rounded-md" content='Em progresso'>
            <div className="blur-[1.8px] w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={RollAndTellImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Roll and Tell</span></p>
            </div>
            </Tooltip>

            <Link href={"pratica/quizz"}>
            <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-2"src={QuizzImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Quizz</span></p>
            </div>
            </Link>

            <Link href={"pratica/speaking"}>
            <div className="w-auto h-[14.5rem] rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-2"src={Speaking} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Speaking</span></p>
            </div>
            </Link>

        </div>
    )
}