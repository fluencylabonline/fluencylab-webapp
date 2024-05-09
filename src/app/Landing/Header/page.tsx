'use client';

import './Header.css';
import { Toaster } from 'react-hot-toast';

//React Imports
import React, { useState, useEffect  } from 'react'

//Next Imports
import Link from 'next/link'
import Image from 'next/image';

//Images Imports
import Logo from '../../../../public/images/brand/logo.png';
import IconLogoDark from '../../../../public/images/brand/icon-logodark.png';
import LandingHeaderImage from '../../../../public/images/landing/landing-header-image.png';

//Components Imports
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import { WhatsAppButton } from '@/app/ui/Components/Buttons/WhatsAppButton';
import { Dialog, DialogPanel } from '@headlessui/react'
import GoogleCalendarButton from '@/app/ui/Components/Buttons/GoogleCalendarButton';

const navigation = [
    { name: 'Sobre Nós', href: '#aboutus' },
    { name: 'Professores', href: '#ourteam' },
    { name: 'Perguntas Frequentes', href: '#faq' },
    { name: 'Games', href: '/games' },
  ]


export default function Header(){
    //Sidebar functions
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        const updateIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
        };
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        
        return () => {
        window.removeEventListener('resize', updateIsMobile);
        };
    }, []);

    //DarkMode functions
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

return(
    <div className="text-fluency-text-light mt-2 mr-3 ml-3 rounded-xl overflow-hidden">
        {/*Navbar*/}
            <div className="absolute inset-x-0 top-0 z-10">
            <Toaster />
                {/*Desktop*/}
                <div className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">FluencyLab</span>
                            <Image
                            className="lg:block md:flex hidden h-10 w-auto hover:contrast-150 ease-in-out duration-300"
                            src={IconLogoDark}
                            alt="FluencyLab"/>
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
                                <div className='flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center'>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-8 rounded transform origin-left transition-all duration-300 delay-150'></div>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-8 rounded transform transition-all duration-300'></div>
                                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-8 rounded transform origin-left transition-all duration-300 delay-150'></div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                        <a id='navbarheader' key={item.name} href={item.href} className="font-semibold border-b-4 border-transparent text-fluency-text-light dark:text-fluency-text-dark mx-1 sm:mx-1">
                            {item.name}
                        </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end lg: items-center lg: gap-4">
                        <ToggleDarkMode />
                        <a href="/signin" className="gap-1 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-fluency-text-dark text-md rounded-md">
                        Entrar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
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
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1.5 rounded transform origin-left rotate-[42deg] w-6 -translate-y-4 transition-all duration-300 delay-150'></div>
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                                <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1.5 rounded transform origin-left -rotate-[42deg] w-6 transition-all duration-300 delay-150'></div>
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
                                className="-mx-3 block rounded-lg px-3 py-2 text-lg font-semibold leading-7 text-fluency-text-light dark:text-fluency-text-dark ease-in-out duration-300"
                                >
                                {item.name}
                                </a>
                            ))}
                            </div>

                            <div className='flex flex-col items-center gap-3'>
                                <div className="flex flex-row gap-2">
                                    <Link href="/googlecalendarpage" className="gap-2 leading-6 inline-flex items-center px-4 py-3 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark ease-in-out duration-30 text-sm rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                                        Agende uma aula grátis!
                                    </Link>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <a href="/signin" className="gap-1 pl-5 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark ease-in-out duration-300 text-sm rounded-md">
                                        Entrar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
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
          <div className="flex flex-col items-center lg:items-start text-center p-6 sm:text-center sm:content-center lg:text-left lg:text-nowrap">
          
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

          {isMobile ? (
              <div className="container md:flex md:gap-2 md:flex-row md:content-center flex flex-col gap-2 items-center">
                <button>
                  <Link href="/googlecalendarpage" className="w-max cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-500 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                    Agende uma aula grátis!
                  </Link>
                </button>
                  <WhatsAppButton buttonText="Ou, manda mensagem aqui"/>
              </div>
              
            ) : (
              <div className='container md:flex md:gap-2 md:flex-row md:justify-center flex flex-col gap-2 items-center lg:content-center lg:flex lg:flex-row lg:justify-start'>
                <div>
                  <GoogleCalendarButton />
                </div>
                <WhatsAppButton buttonText="Ou, manda mensagem aqui"/>
            </div>
            )}
            </div>

          <div className="flex items-center justify-center p-1 lg:mt-0 md:h-100">
                <Image
                className="object-contain h-72 sm:h-80 lg:h-96 xl:h-112 2xl:h-128"
                src={LandingHeaderImage}
                alt="FluencyLab"
                priority
              />
          </div>
        </div>
      </div>
    </div>
);
}