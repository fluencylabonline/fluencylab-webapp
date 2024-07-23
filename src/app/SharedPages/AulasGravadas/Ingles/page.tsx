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

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10">
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
                    <p>Aqui sao seus primeiros passos com o idioma. Vai aprender tudo sobre o basico e o necessario para ter suas primeiras conversas.</p>
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <div className="text-fluency-blue-600 text-3xl font-bold transition-all duration-300 group-hover:text-white">Ingles - Modulo 1</div>
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

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10">
            <Link href="aulas-gravadas/modulo-2">
                <div>
                <span className="absolute top-10 z-10 h-20 w-20 rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:bg-fluency-green-400">
                        <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	                    width="30px" height="30px" viewBox="0 0 512 512"  xmlSpace="preserve">
                        <g>
                            <path className="st0" d="M460.031,129.031h-19.266v93.047h19.266c10.656,0,19.313-8.641,19.313-19.297v-54.438
                                C479.344,137.688,470.688,129.031,460.031,129.031z"/>
                            <path className="st0" d="M460.031,352.328h-19.266v93.047h19.266c10.656,0,19.313-8.656,19.313-19.313v-54.438
                                C479.344,360.969,470.688,352.328,460.031,352.328z"/>
                            <path className="st0" d="M460.031,240.688h-19.266v93.031h19.266c10.656,0,19.313-8.641,19.313-19.297v-54.438
                                C479.344,249.344,470.688,240.688,460.031,240.688z"/>
                            <path className="st0" d="M367.594,92.844h-28.813v157.063c0,5.031-2.844,9.594-7.344,11.828c-4.5,2.203-9.875,1.672-13.844-1.391
                                l-39.188-30.141l-39.188,30.141c-3.969,3.063-9.328,3.594-13.828,1.391c-4.5-2.234-7.359-6.797-7.359-11.828V92.844H95.781
                                c-8.25,0-15.578-3.313-21-8.703c-5.406-5.453-8.703-12.766-8.703-21.016s3.297-15.578,8.703-21.016
                                c5.422-5.391,12.75-8.703,21-8.703h266.031c9.219,0,16.688-7.469,16.688-16.703S371.031,0,361.813,0H95.781
                                c-17.375,0-33.25,7.094-44.625,18.5c-11.406,11.359-18.5,27.25-18.5,44.625V470.75c0,22.781,18.469,41.25,41.25,41.25h293.688
                                c31.406,0,56.844-25.438,56.844-56.813V149.656C424.438,118.281,399,92.844,367.594,92.844z"/>
                        </g>
                        </svg>
                    </span>
                    <div className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-100 transition-all duration-300 group-hover:text-white/90">
                    <p>Vamos rever alguns conceitos e tentar aprofundar mais ainda neles, para que a sua base fique no idioma fique forte.</p>
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <div className="text-fluency-green-600 text-3xl font-bold transition-all duration-300 group-hover:text-white">Ingles - Modulo 2</div>
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

            <div className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10">
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
                    </div>
                    <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <div className="text-fluency-yellow-500 text-3xl font-bold transition-all duration-300 group-hover:text-white">Ingles - Modulo 3</div>
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