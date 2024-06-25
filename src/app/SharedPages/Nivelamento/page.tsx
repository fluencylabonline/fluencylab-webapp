'use client';
import React, { useEffect, useState } from 'react';

//Next Imports
import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { VscDebugStart } from 'react-icons/vsc';

import './nivelamento.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { PiExam } from 'react-icons/pi';

export default function CursoParaProfessores() {
    const router = useRouter();
    const { data: session } = useSession();
    const handleCardClick = () => {
        router.push(`nivelamento/nivel-1/vocabulario`);
    };

    const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                    } else {
                      console.log("No such document!");
                  }
              } catch (error) {
                  console.error("Error fetching document: ", error);
              }
          }
      };

      fetchUserInfo()
  }, [session]);

    return (

    <div className='min-h-[90vh] w-full flex flex-col justify-center items-center px-12 p-8'>

        {nivelamentoPermitido === true ? 
          (
          <div className='w-max h-full rounded-md bg-fluency-green-700 text-white font-bold p-6'>
              <div className='flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
          </div>
          ):(
        <div id='background-body' className="w-[90vh] h-[70vh] py-4 flex flex-col gap-4 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-white rounded-md">
            <div className="flex flex-col items-center justify-center my-4">
                <p className="font-bold text-[2rem] p-6">Bem vindo, {session?.user.name}!</p>
                <p className="px-4 text-center font-semibold text-lg">Vamos fazer um nivelamento e entender melhor como podemos melhorar seu inglês!</p>
                <p className="w-[90%] text-center text-md p-2 mt-4">Temos 3 habilidades para testar: <br></br> 1 - Vocabulário e Leitura <br></br> 2 - Escrita <br></br> 3 - Audição</p>
            </div>
            <button className='flex flex-row items-center gap-2 border-2 p-2 px-4 rounded-md border-white hover:bg-white hover:text-black duration-300 hover:font-bold ease-in-out' onClick={handleCardClick}>
                Começar <VscDebugStart className="w-4 h-auto" />
            </button>
        </div>)}
        </div>

    );
}
