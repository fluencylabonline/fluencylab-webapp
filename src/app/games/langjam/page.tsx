"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BsArrowLeft } from "react-icons/bs";
import Confetti from 'react-dom-confetti';
import './langjamstyle.css';
import languagesData from './languages.json';
import { Language } from './languages';
import Image from 'next/image';
import Logo from '../../../../public/images/brand/logo.png';
import Flag from 'react-world-flags';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import FluencyButton from '@/app/ui/Components/Button/button';
import '../../Landing/Header/Header.css'

const LangJam = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLanguageInfo, setSelectedLanguageInfo] = useState<Language | null>(null);
    const [isLanguageChosen, setIsLanguageChosen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    useEffect(() => {
        if (showConfetti) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showConfetti]);

    const getRandomLanguage = () => {
        const randomIndex = Math.floor(Math.random() * languagesData.length);
        const randomLanguage = languagesData[randomIndex];
        setSelectedLanguage(randomLanguage.name);
        setSelectedLanguageInfo(randomLanguage);
        setIsLanguageChosen(true);
        setShowConfetti(true);
    };

    return (
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark h-screen overflow-hidden overflow-y-auto">
            <div className='flex flex-row gap-3 justify-between px-4 py-2 items-center'>
                <Link href="/games">
                  <button className=" text-gray-800 dark:text-white hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500 ease-in-out duration-300">
                  <BsArrowLeft className='lg:w-9 lg:h-9 w-5 h-5' />
                  </button>
                </Link>

                <div className='flex flex-row gap-5'>
                    <button id='navbarheader' className='font-semibold border-b-2 border-transparent text-zinc-900 dark:text-gray-100 hover:border-fluency-light-yellow ease-in-out duration-300 mx-1 sm:mx-1'>Material</button>                    
                    <button id='navbarheader' className='font-semibold border-b-2 border-transparent text-zinc-900 dark:text-gray-100 hover:border-fluency-light-yellow ease-in-out duration-300 mx-1 sm:mx-1'>Métodos</button>
                </div>

                <div className=''>
                  <ToggleDarkMode />
                </div>
            </div>

                <div className='m-5 flex items-center overflow-hidden'>
                    <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark text-zinc-900 dark:text-gray-100 rounded-xl lg:p-0 p-10 flex flex-col justify-center items-center gap-5 w-screen h-max'>
                        <Image
                            className="h-32 w-auto p-4"
                            src={Logo}
                            alt="FluencyLab"
                            priority
                        />
                        <FluencyButton
                            className={`leading-6 inline-flex items-center px-5 py-3 ease-in-out duration-300 text-xl font-medium ${
                                isLanguageChosen && 'cursor-not-allowed opacity-50'
                            }`}
                            onClick={getRandomLanguage}
                            disabled={isLanguageChosen}
                        >
                            <span>Escolher Idioma!</span>
                        </FluencyButton>
                        <Confetti
                            active={showConfetti}
                            config={{
                                angle: 90,
                                spread: 360,
                                startVelocity: 40,
                                elementCount: 50,
                                dragFriction: 0.1,
                                duration: 3000,
                                stagger: 3,
                                width: '10px',
                                height: '10px',
                                colors: ['#ff0000', '#00ff00', '#0000ff']
                            }}
                        />
                        {selectedLanguageInfo && (
                            <div className="fade-in mt-8 text-2xl duration-3000 flex flex-col items-center">
                                <div className='lg:flex lg:flex-row lg:gap-8 lg:justify-center lg:text-start flex flex-col gap-8 text-center p-5 items-center'>
                                    <Flag className='flag-wrapper lg:w-[45%] sm:w-[40%]' code={selectedLanguageInfo.flagCode} />
                                    <div className='lg:w-[80%] w-[110%] font-xl'>                        
                                        <p>Seu idioma é: <span className="text-blue-500 font-semibold">{selectedLanguage}!</span></p>
                                        <p>País de origem: {selectedLanguageInfo.countryOfOrigin}</p>
                                        <p>População: {selectedLanguageInfo.population}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

        </div>
    );
};

export default LangJam;
