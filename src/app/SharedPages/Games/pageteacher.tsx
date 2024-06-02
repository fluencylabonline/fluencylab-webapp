'use client'

//Next Imports
import Image from "next/image";
import Link from "next/link";

//Images
import RollAndTellImage from '../../../../public/images/games/rollandtell.svg';
import WhatAmIImage from '../../../../public/images/games/whatami.svg';
import QuizzImage from '../../../../public/images/games/quizz.svg';

export default function GamesProTeacher(){
    return(
        <div className="flex flex-wrap justify-center gap-3 p-10">

            <div className="w-auto h-68 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={WhatAmIImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">What Am I?</span></p>
            </div>

            <div className="w-auto h-68 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4" src={RollAndTellImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Roll and Tell</span></p>
            </div>

            <Link href={"pratica/quizz"}>
            <div className="w-auto h-68 rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                <Image alt="Wordle" className="w-36 h-auto mt-4"src={QuizzImage} />
                <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Quizz</span></p>
            </div>
            </Link>
        </div>
    )
}