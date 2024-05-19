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

export default function TermsOfUse() {
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
      <div className="p-2 flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
            
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

          <h1 className="text-xl font-semibold">Termos de Uso</h1>
            <div className='lg:w-[75%] w-full px-6 text-justify gap-3 flex flex-col'>
              <p>
              Ao utilizar nosso site, você concorda em não utilizar o conteúdo de
            forma ilegal ou para atividades prejudiciais. Você também concorda em
            não violar os direitos de propriedade intelectual do site ou de outros
            usuários.
              </p>
              <p>
              Reservamo-nos o direito de atualizar ou modificar nossa Política de
            Privacidade e Termos de Uso a qualquer momento. Quaisquer alterações
            serão publicadas nesta página.
              </p>
              <p>
              Se você tiver dúvidas ou preocupações sobre nossa Política de
            Privacidade e Termos de Uso, entre em contato conosco através do:
            fluencylab.online@gmail.com ou (49) 9 3618-2622.
              </p>
              <p>
              Obrigado por confiar em nós como seu parceiro no aprendizado de
            idiomas!
              </p>
            </div>
        </div>
    );
  }