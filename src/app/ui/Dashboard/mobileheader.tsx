'use client';
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image"
import { ToggleDarkMode } from '../Components/Buttons/ToggleDarkMode';
import { CgMenuLeft } from 'react-icons/cg';

type MobileHeaderProps = {
  isCollapsed: boolean;
  toggleMenu: () => void;
  isMobile: boolean;
};

export default function MobileHeader({ toggleMenu }: MobileHeaderProps) {
    return(
        <div>
            
            <header className="w-full">
                      <nav className="flex flex-row justify-between items-center w-full">
                            <div onClick={toggleMenu} className='lg:hidden md:hidden flex'>
                                <CgMenuLeft className='w-5 h-5' />
                            </div>

                            <div>
                                <ol className="inline-flex items-center space-x-1">
                                    <li className="inline-flex items-center">
                                        <a href="/coordenador" className="inline-flex items-center text-sm font-bold text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500">
                                            <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                                            </svg>
                                            Início
                                        </a>
                                    </li>
                                    <li>
                                    <div className="flex items-center">
                                        <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                        </svg>
                                        <a href="#" className="ms-1 text-sm font-bold text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500 md:ms-2">Current page</a>
                                    </div>
                                </li>
                                </ol>
                            </div>

                            <h1 className="lg:text-xl md:text-lg font-semibold mr-36 -mt-1 lg:block md:block hidden">Os Alunos</h1>
                          
                            <div>
                                <ToggleDarkMode />
                            </div>
                            
                       </nav>
                  </header>

        </div>
    );
}