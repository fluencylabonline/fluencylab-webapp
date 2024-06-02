'use client';
import React, { useEffect, useState } from 'react';

//Next Imports
import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { VscDebugStart } from 'react-icons/vsc';

import './nivelamento.css';

export default function CursoParaProfessores() {
    const router = useRouter();
    const { data: session } = useSession();
    const handleCardClick = () => {
        router.push(`nivelamento/nivel-1/vocabulario`);
    };


    return (
        <div id='background-body' className="mt-12 w-[90vh] h-[70vh] py-4 flex flex-col gap-4 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-white rounded-md">
            <div className="flex flex-col items-center justify-center my-4">
                <p className="font-bold text-[2rem] p-6">Bem vindo, {session?.user.name}!</p>
                <p className="px-4 text-center font-semibold text-lg">Vamos fazer um nivelamento e entender melhor como podemos melhorar seu inglês!</p>
                <p className="w-[90%] text-center text-md p-2 mt-4">Temos 4 habilidades para testar: <br></br> 1 - Vocabulário e Leitura <br></br> 2 - Escrita <br></br> 3 - Audição <br></br> 4 - Compreensão e Fala.</p>
            </div>
            <button className='flex flex-row items-center gap-2 border-2 p-2 px-4 rounded-md border-white hover:bg-white hover:text-black duration-300 hover:font-bold ease-in-out' onClick={handleCardClick}>
                Começar <VscDebugStart className="w-4 h-auto" />
            </button>
        </div>
    );
}
