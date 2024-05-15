'use client';
import React, { useEffect, useState } from 'react';

//Next Imports
import { useSession } from 'next-auth/react';

import { IoIosArrowBack, IoMdTime } from "react-icons/io";
import CourseInfo from './courseinfo.json';
import { useRouter } from 'next/navigation';

// Firebase
import { DocumentData, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';

export default function CursoParaProfessores(){
     const router = useRouter();
     const { data: session } = useSession();
    
     const handleCardClick = (page: any) => {
        router.push(`curso/${page}`);
    };

    const [finished, setFinished] = useState(false)

    return(
        <div className="mt-4 h-[90vh] overflow-hidden overflow-y-scroll bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-md flex flex-col gap-4 items-center">
            <p className='text-2xl font-bold'>Bem-vindo, {session?.user.name}</p>

            <div className='mt-3 flex flex-row gap-2'>
               {CourseInfo.map((course, index) => (
                         <div key={index} onClick={() => handleCardClick(course.page)} className="flex flex-col justify-between gap-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 w-54 h-max">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{course.Name}</h2>
                                <IoIosArrowBack />
                            </div>
                            <div>
                                <p className="p-1 my-1">{course.Description}</p>
                                <div className="flex justify-between mt-2">
                                    <p className='flex flex-row gap-1 items-center'><IoMdTime /> {course.Duration}</p>
                                    <button>{finished ? 'Concluído' : 'Não concluído'}</button>
                                </div>
                                <button>{/* open or continue depending on percentage */}</button>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-blue-600 h-2.5 rounded-full w-[20%]"></div>
                            </div>
                        </div>
               ))}
            </div>
        </div>
    );
}



{/* <div>
Name, and short description duration, done or not, how much done
open them in modals to make it easier and faster
</div>

<div>
 Primeiros Passos
 Falar da plataforma, onde encontrar material e material de apoio, inclusive aulas gravadas
</div>

<div>
 Nossa dinamica de aulas
 O que se espera do professor relacionamento com Aluno
 Fazer amizade, ser simpatico, 
 Marcar aulas feitas
 passar atividades para todo dia da semana usando a apostila nova
</div>

<div>
 Nivelamento
 PDF's para nivelamento, testes, aplicativos como English Score
 exemplo de nivelamento e considerações
</div>

<div>
 Ferramentas e métodos
 OBS, Google Meet link e salvar no desktop, Fonética, Anki, TipTap, Tarefas, Material para Aluno,
 remarcação gerar link
 Shadowing, falar a palavra de trás para frente e dividir ela, pedir que o aluno estude todo dia 15min
</div> */}