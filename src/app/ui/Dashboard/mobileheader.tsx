'use client';
import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import { ToggleDarkMode } from '../Components/Buttons/ToggleDarkMode';
import { CgMenuLeft } from 'react-icons/cg';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi';

type MobileHeaderProps = {
  isCollapsed: boolean;
  toggleMenu: () => void;
  isMobile: boolean;
};

export default function MobileHeader({ toggleMenu }: MobileHeaderProps) {
    const pathname = usePathname();
    const nameId = useParams<{ alunopainel: string }>();
    
    
    // Split pathname into segments
    const baseDashboardPath = pathname.split('/')[1];
    const cleanedPathname = pathname.replace(`/${baseDashboardPath}`, 'Home');
    const segments = cleanedPathname.split('/').filter(segment => segment !== '');

    // Function to capitalize the first letter of a string
    const capitalizeFirstLetter = (str: string) => {
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Function to construct the full path for a given segment
    const constructPath = (index: number) => {
        const pathSegments = segments.slice(0, index + 1);
        if (pathSegments[0] === 'Home') {
            pathSegments[0] = baseDashboardPath;
        }
        const constructedPath = pathSegments.join('/');
        return `/${constructedPath}`;
    };

    return(
        <div>
            
            <header className="w-full">
                      <nav className="flex flex-row justify-between items-center w-full">
                            <div onClick={toggleMenu} className='lg:hidden md:hidden flex'>
                                <CgMenuLeft className='w-5 h-5' />
                            </div>

                            <div>
                            <ol className="inline-flex items-center space-x-1">
                            {segments.map((segment, index) => (
                                <li key={index} className="inline-flex items-center">
                                    {index !== 0 && (
                                        <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                        </svg>
                                    )}
                                    <Link href={constructPath(index)}>
                                        <span className="cursor-pointer text-sm font-bold text-fluency-blue-700 dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500">
                                            {segment === 'Home' ? <HiHome /> : capitalizeFirstLetter(decodeURIComponent(segment))}
                                        </span>
                                    </Link>
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