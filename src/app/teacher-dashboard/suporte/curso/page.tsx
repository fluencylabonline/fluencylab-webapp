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
        <div className="mt-4 h-[90vh] overflow-hidden overflow-y-scroll p-4 rounded-md flex flex-col gap-4 items-center">
            <p className='text-2xl font-bold'>Bem-vindo, {session?.user.name}</p>
            <div className='mt-3 flex flex-row gap-2'>
               {CourseInfo.map((course, index) => (
                         <div key={index} onClick={() => handleCardClick(course.page)} className="flex flex-col justify-between gap-2 bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all cursor-pointer shadow-md rounded-lg p-6 w-full h-54">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{course.Name}</h2>
                                <IoIosArrowBack />
                            </div>
                            <div>
                                <p className="p-1 my-1">{course.Description}</p>
                                <div className="flex justify-between mt-4">
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