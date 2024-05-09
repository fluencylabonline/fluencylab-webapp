'use client';
import React, { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { ToggleDarkMode } from '../Components/Buttons/ToggleDarkMode';


type HeaderProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
};

export default function Header({ isCollapsed, toggleSidebar, isMobile }: HeaderProps) {
    const pathname = usePathname();
    const nameId = useParams<{ alunopainel: string }>();
    
    
    // Split pathname into segments
    const cleanedPathname = pathname.replace('/teacher-dashboard', "Home");
    const segments = cleanedPathname.split('/').filter(segment => segment !== '');

    // Function to capitalize the first letter of a string
    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return(
        <div>
            <header className="w-full mt-1 py-1 lg:pr-2 md:pr-2 pr-0">
                <nav className="flex flex-row justify-between w-full">
                    <div onClick={toggleSidebar} className='lg:hidden md:hidden flex flex-col justify-between w-6 h-6 transform transition-all duration-300 origin-center -translate-x-4'>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[42deg] w-4 transition-all duration-300 delay-150'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[42deg] w-4 transition-all duration-300 delay-150'></div>
                    </div>

                    <div>
                        <ol className="inline-flex items-center space-x-1">
                            {segments.map((segment, index) => (
                                <li key={index} className="inline-flex items-center">
                                    {index !== 0 && (
                                        <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                        </svg>
                                    )}
                                    <span className="cursor-pointer text-sm font-bold text-fluency-blue-700 dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500">
                                        {capitalizeFirstLetter(segment)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <h1 className="lg:text-xl md:text-lg font-semibold mr-36 -mt-1 lg:block md:block hidden">{capitalizeFirstLetter(segments[segments.length - 1])}</h1>
                  
                    <div>
                        <ToggleDarkMode />
                    </div>
                </nav>
            </header>
        </div>
    );
}
