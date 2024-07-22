'use client'
import { ChangeEvent, useState } from 'react';
import GuesslyEn from './en/page';
import GuesslyPt from './pt/page';
import GuesslySp from './sp/page';
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';

export default function Guessly(){
    const [selectedLanguage, setSelectedLanguage] = useState('english');

    const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLanguage(event.target.value);
    };

    return(
        <div className='flex flex-col items-center justify-center bg-fluency-bg-light dark:bg-fluency-bg-dark'>

            <div className='w-full h-screen overflow-hidden text-black'>
                <div className='flex flex-row gap-2 items-center justify-between w-full px-4 mt-3'> 
                    <Link href="/games">
                        <button className="text-fluency-red-500 hover:text-fluency-red-700 ease-in-out duration-300 flex justify-center">
                        <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9' />
                        </button>
                    </Link>

                    <div className='flex flex-row gap-2 items-center'>
                        <p className='text-fluency-red-500 font-bold text-2xl'>Guessly</p>
                       {/*
                        <select className='outline-none pl-5 max-w-48 max-h-10 flex flex-row justify-center items-center bg-fluency-pages-light dark:bg-fluency-pages-dark dark:text-fluency-gray-100 p-2 rounded-md px-3' value={selectedLanguage} onChange={handleLanguageChange}>
                            <option className='bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3 ' key={"english"} value={"english"}>English</option>
                            <option className='bg-fluency-pages-light  dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"portugues"} value={"portugues"}>Português</option>
                            <option className='bg-fluency-pages-light  dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"espanol"} value={"espanol"}>Español</option>
                        </select> */}
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <ToggleDarkMode />  
                    </div>
                </div>

                {selectedLanguage === "english" && <GuesslyEn />}
                {selectedLanguage === "portugues" && <GuesslyPt />}
                {selectedLanguage === "espanol" && <GuesslySp />}
            </div>

        </div>
    )
}
