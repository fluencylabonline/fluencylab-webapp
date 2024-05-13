'use client'
import { ChangeEvent, useState } from 'react';
import WordleEn from './en/page';
import WordlePt from './pt/page';
import WordleSp from './sp/page';
import { CiCircleQuestion } from 'react-icons/ci';
import { IoClose } from 'react-icons/io5';

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
        <div className='flex flex-col items-center justify-center'>

        <div className='flex flex-row gap-2 items-center justify-center w-full mt-3'>   
            <select className='outline-none pl-5 max-w-48 max-h-10 flex flex-row justify-center items-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md px-3' value={selectedLanguage} onChange={handleLanguageChange}>
                <option className='bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"english"} value={"english"}>English</option>
                <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"portugues"} value={"portugues"}>Português</option>
                <option className='bg-fluency-pages-light mt-1 dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3' key={"espanol"} value={"espanol"}>Español</option>
            </select>
            <CiCircleQuestion onClick={openInstrucoes} className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer'/>
        </div>

            <div>
                {selectedLanguage === "english" && <WordleEn />}
                {selectedLanguage === "portugues" && <WordlePt />}
                {selectedLanguage === "espanol" && <WordleSp />}
            </div>


    {isInstrucoesOpen && 
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">

                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                        
                    <button onClick={closeInstrucoes} className="absolute top-0 left-0 mt-2 ml-2 ">
                        <span className="sr-only">Fechar</span>
                        <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-blue-600 ease-in-out duration-300" />
                    </button>
            
                    <h3 className="text-xl font-bold text-center leading-6 mb-4">
                        Instruções
                    </h3>   

                <div className='text-justify flex gap-1 flex-col'>
                    <span>1. Se não conseguir fazer uma aula, simplesmente não marque como feita até fazer a reposição.</span>
                    <span>2. Se não for fazer a reposição marque como cancelada.</span>
                    <span>3. Clique ou passe o mouse em cima de cada data para saber o status de cada uma.</span>
                    <p className='mt-2 font-semibold'>Cores:</p>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-red-600'>Vermelho</span> são aulas atrasadas que não foram nem canceladas nem feitas</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-green-600'>Verde</span> são as aulas feitas.</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-yellow-600'>Amarelo</span> são as aulas canceladas.</span>
                    <span className='ml-2 font-medium'><span className='font-semibold text-fluency-blue-600'>Azul</span> são as aulas ainda por fazer.</span>  
                </div>                                                      
            </div>
        </div>
    </div>}


        </div>
    )
}
