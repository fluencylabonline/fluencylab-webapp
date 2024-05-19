'use client';
import { useEffect, useState } from 'react';

//Next Imports
import Image from "next/image"
import Link from 'next/link';

//Image
import Logo from '../../../../public/images/brand/logo.png';

//Icons
import { BsArrowLeft } from "react-icons/bs";
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';

export default function Privacy() {
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
  
    return (
        <div className="p-2 overflow-y-auto flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
            
            <div className='flex flex-row w-full justify-between items-center px-2'>
            <Link href="/">
              <button className="text-fluency-text-light dark:text-fluency-text-dark hover:dark:text-fluency-blue-500 hover:text-fluency-blue-500 ease-in-out duration-300 flex justify-center">
                <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9' />
              </button>
            </Link>

                <div>
                  <ToggleDarkMode />
                </div>
            </div>
            
          <Image
            className="h-auto lg:w-[30%] w-64 hover:contrast-150 ease-in-out duration-300"
            src={Logo}
            alt="FluencyLab"/>

          <h1 className="text-xl font-semibold">Política de Privacidade</h1>
            <div className='lg:w-[75%] w-full px-6 text-justify gap-3 flex flex-col'>
              <p>
              Bem-vindo ao FluencyLab! Estamos felizes por você ter escolhido nossa plataforma para aprender e aprimorar seus conhecimentos em idiomas. Antes de prosseguir, por favor, leia atentamente nossa Política de Privacidade e Termos de Uso. Ao acessar ou utilizar nosso site, você concorda com os termos e condições aqui descritos.
              </p>
              <p>
              Respeitamos sua privacidade e estamos comprometidos em proteger todas as informações pessoais que você compartilha conosco. Nossa Política de Privacidade explica como coletamos, usamos e protegemos suas informações. Garantimos que seus dados serão tratados com segurança e confidencialidade.
              </p>
              <p>
              Ao utilizar nosso site, podemos coletar informações pessoais, como nome, endereço de e-mail, idade, país de origem e outras informações relevantes para melhorar sua experiência de aprendizado. Essas informações são utilizadas para personalizar seu uso do site, oferecer conteúdo relevante e fornecer suporte adequado.
              </p>
              <p>
              Utilizamos cookies para melhorar a funcionalidade do site e personalizar sua experiência de navegação. Os cookies são pequenos arquivos de texto armazenados em seu dispositivo que nos ajudam a entender como você utiliza nosso site. Você pode controlar o uso de cookies nas configurações do seu navegador.
              </p>
              <p>
              Implementamos medidas de segurança físicas, técnicas e administrativas para proteger suas informações contra acesso não autorizado, divulgação, alteração ou destruição. No entanto, lembre-se de que nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro.
              </p>
            </div>
        </div>
    );
  }