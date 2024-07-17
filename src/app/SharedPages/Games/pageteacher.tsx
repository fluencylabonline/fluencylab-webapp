'use client'

//Next Imports
import Image from "next/image";
import Link from "next/link";

//Images
import Flashcards from '../../../../public/images/games/flashcards.svg';
import QuizzImage from '../../../../public/images/games/quizz.svg';
import Listening from '../../../../public/images/games/listening.png';

export default function GamesProTeacher(){
    return(
        <div className="flex flex-wrap justify-center gap-3 p-10">

            <Link href={"pratica/flashcards"}>
            <div className="w-auto h-[14.5rem] rounded-md p-7 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={Flashcards} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Flashcards</span></p>
            </div>
            </Link>

            <Link href={"pratica/listening"}>
            <div className="w-auto h-[14.5rem] rounded-md p-7 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={Listening} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Listening</span></p>
            </div>
             </Link>

            <Link href={"pratica/quizz"}>
            <div className="w-auto h-[14.5rem] rounded-md p-7 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-32 h-auto mt-4"src={QuizzImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Quizz</span></p>
            </div>
            </Link>
        </div>
    )
}