'use client'
import React from "react";

import Image from 'next/image';
import Link from "next/link";

import Suporte1 from '../../../../../public/images/course/1.jpg';
import Suporte2 from '../../../../../public/images/course/2.jpg';
import Suporte3 from '../../../../../public/images/course/3.jpg';

export default function AulasGravadas(){
    return(
        <div className="lg:flex lg:flex-row md:flex md:flex-grid sm:flex sm:flex-grid justify-center mt-6 gap-2 p-4">

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <Link href="aulas-gravadas/modulo-1">
                <div>
                <span className="absolute top-10 z-10 h-20 w-20 rounded-full bg-fluency-blue-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-blue-500 transition-all duration-300 group-hover:bg-fluency-blue-400">
                    <svg viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                        <path d="M136,48V176H88V80H40V48a7.99993,7.99993,0,0,1,8-8H80a7.99993,7.99993,0,0,1,8,8,7.99993,7.99993,0,0,1,8-8h32A7.99993,7.99993,0,0,1,136,48Zm89.8877,149.64526-8.28223-30.90966-46.36426,12.42334,8.28223,30.90966a7.99989,7.99989,0,0,0,9.79785,5.65674l30.90967-8.28222A7.9999,7.9999,0,0,0,225.8877,197.64526ZM184.47656,43.09717a7.99994,7.99994,0,0,0-9.79785-5.657L143.769,45.72241a8.00015,8.00015,0,0,0-5.65674,9.7981l8.28223,30.90954,46.36426-12.42334Z" opacity="0.2"/>
                        <path d="M233.61523,195.5752,192.2041,41.02637a16.0157,16.0157,0,0,0-19.5957-11.31348l-30.91016,8.28223c-.33935.09094-.66357.20923-.99219.32043A15.96591,15.96591,0,0,0,128,32H96a15.8799,15.8799,0,0,0-8,2.16492A15.8799,15.8799,0,0,0,80,32H48A16.01833,16.01833,0,0,0,32,48V208a16.01833,16.01833,0,0,0,16,16H80a15.8799,15.8799,0,0,0,8-2.16492A15.8799,15.8799,0,0,0,96,224h32a16.01833,16.01833,0,0,0,16-16V108.40283l27.7959,103.73584a15.992,15.992,0,0,0,19.5957,11.31445l30.91016-8.28222A16.01822,16.01822,0,0,0,233.61523,195.5752ZM156.19238,92.08679l30.91211-8.28259,20.71045,77.27234-30.917,8.28454ZM176.749,45.167l6.21338,23.18238-30.91113,8.28247L145.83984,53.4502ZM128,48l.00732,120H96V48ZM80,48V72H48V48ZM48,208V88H80V208Zm80,0H96V184h32.0083l.00147,24Zm90.16016-8.28418-30.90967,8.28223-6.21143-23.18189,30.918-8.28491,6.21289,23.18164Z"/>
                    </svg>
                    </span>
                    <div className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-100 transition-all duration-300 group-hover:text-white/90">
                    <p>Aqui são seus primeiros passos com o idioma. Vai aprender tudo sobre o básico e o necessário para ter suas primeiras conversas.</p>
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="aulas-gravadas/modulo-1" className="text-fluency-blue-600 text-3xl font-bold transition-all duration-300 group-hover:text-white">Inglês - Módulo 1 &rarr;</a>
                    </p>
                    </div>
                </div>
                </div>
            </Link>
            <Image 
                src={Suporte2}
                alt="Background" 
                layout="fill" 
                objectFit="cover" 
                quality={100} 
                className="z-0 blur-xs brightness-50"
                priority
            />
            </div>

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <Link href="">
                <div>
                <span className="absolute top-10 z-10 h-20 w-20 rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:bg-fluency-green-400">
                    <svg viewBox="0 0 1920 1920" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                        <path d="M960.057 0 112 363.42v715.76c0 390.672 512 670.417 730.572 789.824 27.477 15.038 49.753 27.137 65.018 36.296v.113c16.17 9.725 34.262 14.587 52.467 14.587 18.091 0 36.296-4.862 52.466-14.7 15.265-9.159 37.54-21.258 65.018-36.296 218.572-119.407 730.572-399.152 730.572-789.824V363.42L960.057 0ZM846.982 1272.198 524.27 949.484l80.056-79.943 242.657 242.77 525.343-525.456 80.057 79.944-605.4 605.399Z" fillRule="evenodd"/>
                    </svg>
                    </span>
                    <div className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-100 transition-all duration-300 group-hover:text-white/90">
                    <p>Em breve...</p>
                    {/*<p>Esse módulo vai aprofundar ainda mais o que você já sabe e te ajudar a manter conversas mais longas e mais variadas.</p>*/}
                    
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="" className="text-fluency-green-600 text-3xl font-bold transition-all duration-300 group-hover:text-white">Inglês - Módulo 2 &rarr;</a>
                    </p>
                    </div>
                </div>
                </div>
            </Link>
            <Image 
                src={Suporte1}
                alt="Background" 
                layout="fill" 
                objectFit="cover" 
                quality={100} 
                className="z-0 blur-xs brightness-50"
                priority
            />
            </div>

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <Link href="">
                <div>
                <span className="absolute top-10 z-10 h-20 w-20 rounded-full bg-fluency-yellow-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-yellow-500 transition-all duration-300 group-hover:bg-fluency-yellow-400">
                    <svg viewBox="-4 0 19 19" id="idea" xmlns="http://www.w3.org/2000/svg" strokeWidth="1" className="h-10 w-10 text-white transition-all">                 
                        <path d="M10.328 6.83a5.903 5.903 0 0 1-1.439 3.64 2.874 2.874 0 0 0-.584 1v1.037a.95.95 0 0 1-.95.95h-3.71a.95.95 0 0 1-.95-.95V11.47a2.876 2.876 0 0 0-.584-1A5.903 5.903 0 0 1 .67 6.83a4.83 4.83 0 0 1 9.28-1.878 4.796 4.796 0 0 1 .38 1.88zm-.95 0a3.878 3.878 0 0 0-7.756 0c0 2.363 2.023 3.409 2.023 4.64v1.037h3.71V11.47c0-1.231 2.023-2.277 2.023-4.64zM7.83 14.572a.475.475 0 0 1-.475.476h-3.71a.475.475 0 0 1 0-.95h3.71a.475.475 0 0 1 .475.474zm-.64 1.262a.238.238 0 0 1-.078.265 2.669 2.669 0 0 1-3.274 0 .237.237 0 0 1 .145-.425h2.983a.238.238 0 0 1 .225.16z"/>                        
                    </svg>
                    </span>
                    <div className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-100 transition-all duration-300 group-hover:text-white/90">
                    <p>Em breve...</p>
                    {/*<p>Esse último módulo é praticamente inteiro em inglês e vai aprender tudo que falta para finalmente se sentir fluente no idioma.</p>*/}
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="" className="text-fluency-yellow-500 text-3xl font-bold transition-all duration-300 group-hover:text-white">Inglês - Módulo 3 &rarr;</a>
                    </p>
                    </div>
                </div>
                </div>
            </Link>
            <Image 
                src={Suporte3}
                alt="Background" 
                layout="fill" 
                objectFit="cover" 
                quality={100} 
                className="z-0 blur-xs brightness-50"
                priority
            />
            </div>
        </div>
    )
}