'use client';

import '@/app/Landing/Header/Header.css';
import { Toaster } from 'react-hot-toast';

//React Imports
import React, { useState, useEffect  } from 'react'

//Next Imports
import Link from 'next/link'
import Image from 'next/image';

//Images Imports
import Logo from '../../../public/images/brand/logo.png';
import LandingHeaderImage from '../../../public/images/landing/new-landing-header-image.png';
import SemiCircle from '../../../public/images/landing/semi-circle.png';

//Components Imports
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { Dialog, DialogPanel } from '@headlessui/react'
import { TbLogin2 } from 'react-icons/tb';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const navigation = [
    { name: 'Sobre Nós', href: '#aboutus' },
    { name: 'Nosso Time', href: '#ourteam' },
    { name: 'Perguntas Frequentes', href: '#faq' },
    { name: 'Games', href: '/games' },
  ]

    export default function NewHeader(){
        //Sidebar functions
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
        const [isMobile, setIsMobile] = useState(false);
        const [collapsed, setCollapsed] = useState(false);
        const [isScrolled, setIsScrolled] = useState(false);
      
        useEffect(() => {
          // Execute this code only on the client
          const updateIsMobile = () => {
            if (typeof window !== 'undefined') {
              setIsMobile(window.innerWidth <= 768);
            }
          };
          
          updateIsMobile();
          window.addEventListener('resize', updateIsMobile);
      
          return () => {
            window.removeEventListener('resize', updateIsMobile);
          };
        }, []);
      
        // DarkMode functions
        const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
      
        const [isChecked, setIsChecked] = useState(() => {
          if (isLocalStorageAvailable) {
            const storedDarkMode = localStorage.getItem('isDarkMode');
            return storedDarkMode ? storedDarkMode === 'true' : true;
          }
          return true; // Default to true if localStorage is not available
        });
      
        useEffect(() => {
          if (isLocalStorageAvailable) {
            localStorage.setItem('isDarkMode', isChecked.toString());
            document.body.classList.toggle('dark', isChecked);
          }
        }, [isChecked, isLocalStorageAvailable]);
      
        useEffect(() => {
          const handleScroll = () => {
            if (typeof window !== 'undefined') {
              setIsScrolled(window.scrollY > 100);
            }
          };
      
          window.addEventListener('scroll', handleScroll);
      
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);
      
        const scrollToTop = () => {
          if (typeof window !== 'undefined') {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }
        };
    return(
        <div className="text-fluency-text-light mt-2 mr-3 ml-3 rounded-xl overflow-hidden h-[95vh]">
        {/*Navbar*/}
            <div className="absolute inset-x-0 top-0 z-10">
            <Toaster />
                {/*Desktop*/}
                <div className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.2">
                            <span className="sr-only">FluencyLab</span>
                          
                            <video className='lg:block md:flex hidden h-[60px] w-auto hover:contrast-150' controls={false} loop autoPlay>
                              <source src="https://firebasestorage.googleapis.com/v0/b/fluencylab-webapp.appspot.com/o/anima%C3%A7%C3%B5es%2Fbrand-looping-only.webm?alt=media&token=040f0a1f-e733-4cd7-9062-e904c577d2c1" type="video/webm" />
                            </video>

                        </a>
                    </div>
                    <div className="flex lg:hidden">
                        <button
                        type="button"
                        className=" inline-flex items-center justify-center rounded-md p-2.5 text-fluency-text-light dark:text-fluency-text-dark"
                        onClick={() => setMobileMenuOpen(true)}
                        >
                        <span className="sr-only">Open main menu</span>
                            <div className="relative cursor-pointer group focus:outline-none">
                                <div className='flex flex-col justify-between w-6 h-6 transform transition-all duration-300 origin-center'>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-blue-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150'></div>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-red-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150'></div>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-yellow-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150'></div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">          
                        {navigation.map((item) => (
                        <a id='navbarheader' key={item.name} href={item.href} className="font-bold border-b-4 border-transparent text-fluency-text-light dark:text-fluency-text-dark mx-1 sm:mx-1">
                            {item.name}
                        </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg: items-center lg: gap-4">
                        <ToggleDarkMode />
                        <a href="/signin" className="gap-1 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-fluency-text-dark text-md rounded-md">
                        Entrar <TbLogin2 className="w-6 h-auto" />
                        </a>
                    </div>
                </div>

                {/*Mobile*/}
                <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                    <div className="fixed inset-0 z-50" />
                    <DialogPanel className={`fixed inset-y-0 right-0 z-50 w-full bg-fluency-bg-light dark:bg-fluency-bg-dark px-6 py-6 sm:max-w-sm ${mobileMenuOpen ? 'animate-menu-open' : 'animate-menu-close'}`}>
                        <div className="flex items-center justify-between">
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">FluencyLab</span>
                            <Image
                                className="h-10 w-auto"
                                src={Logo}
                                alt="FluencyLab"
                            />
                        </a>
                        <button
                            type="button"
                            className="rounded-md mt-4 text-gray-900 "
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <div className="relative cursor-pointer group focus:outline-none">
                                <div className='flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center translate-x-0'>
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[45deg] w-6 -translate-y-4 transition-all duration-300 delay-150'></div>
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[45deg] w-6 transition-all duration-300 delay-150'></div>
                                </div>
                            </div>
                        </button>
                        </div>
                        <div className="mt-12 flex flex-col items-center">
                        <div className="-my-6 divide-y divide-gray-500/10 flex flex-col items-center">
                            <div className="space-y-2 py-6 flex flex-col items-center gap-5">
                            {navigation.map((item) => (
                                <a
                                key={item.name}
                                href={item.href}
                                className="-mx-3 block rounded-lg px-3 py-2 text-lg font-bold leading-7 text-fluency-text-light dark:text-fluency-text-dark ease-in-out duration-300"
                                >
                                {item.name}
                                </a>
                            ))}
                            </div>

                            <div className='flex flex-col items-center gap-3'>
                                <div className="flex flex-row gap-2">
                                    <Link href="/u/googlecalendarpage" className="gap-2 leading-6 inline-flex items-center px-4 py-3 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark ease-in-out duration-30 text-sm rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                                        Agende uma aula grátis!
                                    </Link>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <a href="/signin" className="gap-1 pl-5 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark ease-in-out duration-300 text-sm rounded-md">
                                        Entrar <TbLogin2 className="w-6 h-auto" />
                                    </a>
                                    <ToggleDarkMode />
                                </div>
                            </div>

                        </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </div>        

        {/*Landing*/}
        <div className="relative isolate px-6 lg:px-8 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
        <div className="container flex flex-col justify-center items-center p-6 mx-auto sm:py-12 lg:py-24 lg:flex-row lg:justify-between">
            <div className="flex flex-col items-center lg:items-start text-center p-6 sm:text-center sm:content-center lg:text-left lg:text-nowrap mt-4 sm:mt-0">
            
                {isMobile && <div className="flex items-center justify-center w-60">
                    <Image
                        className="h-auto w-auto hover:contrast-150 ease-in-out duration-300"
                        src={Logo}
                        alt="FluencyLab"
                    />
                </div>}
          
                <p className="mt-6 mb-8 font-500 text-3xl md:text-6xl">
                    Uma abordagem <span className="text-fluency-red-500 font-normal hover:text-fluency-red-600 ease-in-out duration-300">única</span><br /> 
                    para aprender <br />
                    um Idioma online
                </p>
                <p className='text-base mb-8 font-300'>
                    Aprenda no seu próprio ritmo,<br />
                    com o que gosta, e de onde preferir.
                </p>

            </div>

            <div className="flex items-center justify-center p-1 -mt-[60%] sm:mt-0 md:h-100">
                <Image
                    className="object-contain h-[26rem] sm:h-80 lg:h-[27.5rem] xl:h-112 2xl:h-128"
                    src={LandingHeaderImage}
                    alt="FluencyLab"
                    priority
                />
            </div>
        </div>

            <Image
                className="hidden sm:block w-[12rem] absolute bottom-6 left-[38rem]"
                src={SemiCircle}
                alt="FluencyLab"
                priority
            />
            
      </div>

        <div
            className={`fixed bottom-4 ${
                isScrolled ? 'right-4' : 'left-1/2 transform -translate-x-1/2'
            } cursor-pointer bouncing-arrow-container`}
            onClick={scrollToTop}
            >
            {isScrolled ? (
                <FaArrowUp id='bouncing-arrow' className="w-10 h-auto animate-bounce text-fluency-blue-500 hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
            ) : (
                <a href='#aboutus'><FaArrowDown id='bouncing-arrow' className="w-10 h-auto animate-bounce text-fluency-gray-500 hover:text-fluency-gray-700 duration-300 ease-in-out transition-all" /></a>
            )}
        </div>

    </div>
    )
}