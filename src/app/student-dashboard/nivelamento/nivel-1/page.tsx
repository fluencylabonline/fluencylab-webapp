'use client';
import Link from "next/link";
import Image from "next/image";
import { useSession } from 'next-auth/react';

import Vocabulario from '../../../../../public/images/nivelamento/vocabulario.png';
import Frases from '../../../../../public/images/nivelamento/frases.png';
import TrueOrFalse from '../../../../../public/images/nivelamento/trueorfalse.png';
import Compreensao from '../../../../../public/images/nivelamento/compreensao.png';

export default function One(){
    const { data: session } = useSession();
    return(
        <div>
            {session?.user.role === 'teacher' && (
                <div>
                    Teacher show all teachers students and their scores
                </div>
            )}

            {session?.user.role === 'student' && (
                <div className="flex flex-wrap justify-center gap-3 p-10">
                    <Link href={"nivel-1/vocabulario"}>
                    <div className="w-max h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Wordle" priority className="w-auto h-[12rem] mt-2"src={Vocabulario} />
                        <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">1 - Vocabulário</span> </p>
                    </div>
                    </Link>

                    <Link href={"pratica/wordle"}>
                    <div className="w-max h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Wordle" className="w-auto h-[12rem] mt-2"src={Frases} />
                        <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">2 - Frases</span> </p>
                    </div>
                    </Link>

                    <Link href={"pratica/wordle"}>
                    <div className="w-max h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Wordle" className="w-auto h-[12rem] mt-2"src={TrueOrFalse} />
                        <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">3 - Verdadeiro ou Falso</span> </p>
                    </div>
                    </Link>

                    <Link href={"pratica/wordle"}>
                    <div className="w-max h-auto rounded-md p-5 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Wordle" className="w-auto h-[12rem] mt-2"src={Compreensao} />
                        <p className="flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">4 - Compreensão</span> </p>
                    </div>
                    </Link>
                </div>
            )}

            {session?.user.role === 'admin' && (
                <div>
                    Admin show all students and their scores
                </div>
            )}
        </div>
    )
}