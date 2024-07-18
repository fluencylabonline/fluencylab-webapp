'use client'
import { ChangeEvent, useState } from 'react';
import WordleEn from './en/page';
import WordlePt from './pt/page';
import WordleSp from './sp/page';
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';

export default function Wordle(){
    const [selectedLanguage, setSelectedLanguage] = useState('english');

    const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedLanguage(event.target.value);
    };

    const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
    const openInstrucoes = () => {
        setIsInstrucoesOpen(true);
    };

    const closeInstrucoes = () => {
        setIsInstrucoesOpen(false);
    };  

    return(
    <div className='flex flex-col items-center justify-center bg-fluency-bg-light dark:bg-fluency-bg-dark'>
        <div className='w-full h-screen overflow-hidden text-black'>
            <div className='flex flex-row gap-2 items-center justify-between w-full px-4 mt-3'> 
                <Link href="/games">
                    <button className="text-fluency-yellow-500 hover:text-fluency-yellow-700 ease-in-out duration-300 flex justify-center">
                    <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9' />
                    </button>
                </Link>

                <div className='flex flex-row gap-2 items-center'>
                <p className='text-fluency-yellow-500 font-bold text-2xl'>Wordle</p>
                <select className='outline-none pl-5 max-w-48 max-h-10 flex flex-row justify-center items-center bg-fluency-pages-light dark:bg-fluency-pages-dark dark:text-fluency-gray-100 p-2 rounded-md px-3' value={selectedLanguage} onChange={handleLanguageChange}>
                    <option className='bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3 ' key={"english"} value={"english"}>English</option>
                    <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"portugues"} value={"portugues"}>Português</option>
                    <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"espanol"} value={"espanol"}>Español</option>
                </select>
                </div>

                <div className='flex flex-row gap-2 items-center'>
                    <ToggleDarkMode />  
                </div>
            </div>

            {selectedLanguage === "english" && <WordleEn />}
            {selectedLanguage === "portugues" && <WordlePt />}
            {selectedLanguage === "espanol" && <WordleSp />}
        </div>


        {isInstrucoesOpen && 
            <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none transition-opacity duration-300 ${isInstrucoesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`relative w-auto max-w-md mx-auto my-6 p-6 bg-white dark:bg-fluency-dark-bg shadow-md rounded-xl text-black dark:text-white instructions-enter`}>                <div className="p-6 bg-white dark:bg-fluency-dark-bg shadow-md rounded-xl text-black dark:text-white">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold">Instruções</h1>
                <button
                  className="p-1 transition-colors duration-200 transform rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeInstrucoes}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 text-sm">
                <strong>Descubra a PALAVRA do dia em 6 tentativas.</strong>
                <br />
                Cada tentativa deve ser uma palavra de 5 letras. Use o botão Enter para enviar. Após cada tentativa, a cor dos quadrados mudará de acordo com os seguintes exemplos:
                <ul className="list-disc list-inside">
                  <li><strong className='text-green-700'>Quando a letra estiver em verde</strong>, a letra está correta e na posição correta.</li>
                  <li><strong className='text-yellow-700'>Quando a letra estiver em amarelo</strong>, a letra está correta, mas na posição errada.</li>
                  <li><strong className='text-stone-700'>Quando a letra estiver em cinza escuro</strong>, a letra está incorreta.</li>
                </ul>
                Todo dia há uma nova PALAVRA!
              </div>
            </div>
          </div>
        </div>}
    </div>
    )
}
