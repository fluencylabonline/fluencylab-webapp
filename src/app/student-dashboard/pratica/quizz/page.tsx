'use client'
import { ChangeEvent, useState } from 'react';
import GuesslyEn from './en/page';
import GuesslyPt from './pt/page';
import GuesslySp from './sp/page';

export default function Guessly(){
    const [selectedLanguage, setSelectedLanguage] = useState('english');

    const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLanguage(event.target.value);
    };

    return(
    <div className='flex flex-col items-center justify-center'>

        <div className='flex flex-row gap-2 items-center justify-center w-full mt-3'>   
            <select className='outline-none pl-5 max-w-48 max-h-10 flex flex-row justify-center items-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md px-3' value={selectedLanguage} onChange={handleLanguageChange}>
                <option className='bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"english"} value={"english"}>English</option>
                <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"portugues"} value={"portugues"}>Português</option>
                <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"espanol"} value={"espanol"}>Español</option>
            </select>
        </div>

        <div>
            {selectedLanguage === "english" && <GuesslyEn />}
            {selectedLanguage === "portugues" && <GuesslyPt />}
            {selectedLanguage === "espanol" && <GuesslySp />}
        </div>  

    </div>
  )
}
