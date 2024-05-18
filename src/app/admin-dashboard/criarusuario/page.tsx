'use client';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import CreateProfessor from './professor';
import CreateAluno from './aluno';
import CreateGerencia from './gerencia';

  
export default function CriarUsuario(){

    const [professor, setProfessor] = useState(false);
    const [coordenador, setCoordenador] = useState(false);
    const [aluno, setAluno] = useState(true);

            return(
            <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     

                <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-8 md:p-8 p-2 overflow-y-auto rounded-xl mt-2">
                        <div className="lg:flex lg:flex-row lg:items-center lg:justify-center md:flex md:flex-row md:items-center md:justify-center flex flex-col items-center justify-center p-1 border border-fluency-blue-600 dark:border-fluency-blue-900 rounded-xl">
                            <button onClick={() => {
                                    setProfessor(true);
                                    setAluno(false);
                                    setCoordenador(false);
                                    }} 
                                    className="px-4 py-2 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:px-12">Professor</button>
                            
                            <button onClick={() => {
                                    setProfessor(false);
                                    setAluno(true);
                                    setCoordenador(false);
                                    }} 
                                    className="px-4 py-2 mx-4 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:mx-8 md:px-12">Aluno</button>
                            <button onClick={() => {
                                    setProfessor(false);
                                    setAluno(false);
                                    setCoordenador(true);
                                    }} 
                                    className="px-4 py-2 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:px-12">Coordenador</button>
                    </div>

                    {aluno && 
                    <div className={aluno ? 'fade-in w-full flex flex-col mt-4' : 'fade-out'}>
                        <CreateAluno />
                    </div>}

                    {coordenador && 
                    <div className={coordenador ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                        <CreateGerencia />
                    </div>}

                    {professor && 
                    <div className={professor ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                      <CreateProfessor />
                    </div>}

                </div>
                <Toaster />
        </div>
    
    );
}
