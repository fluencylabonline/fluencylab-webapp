'use client'
import React from "react";
import './material.css';

import Link from "next/link";

export default function Suporte(){
    return(
    <div className="lg:flex lg:flex-row md:flex md:flex-grid sm:flex sm:flex-grid justify-center mt-2 gap-2 p-4">

        <div id="apostilas" className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-fluency-blue-500 transition-all duration-300 group-hover:scale-[10]"></span>
            <div className="relative z-10 mx-auto max-w-md">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-blue-500 transition-all duration-300 group-hover:bg-fluency-blue-400">
                    <svg viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                        <path d="M136,48V176H88V80H40V48a7.99993,7.99993,0,0,1,8-8H80a7.99993,7.99993,0,0,1,8,8,7.99993,7.99993,0,0,1,8-8h32A7.99993,7.99993,0,0,1,136,48Zm89.8877,149.64526-8.28223-30.90966-46.36426,12.42334,8.28223,30.90966a7.99989,7.99989,0,0,0,9.79785,5.65674l30.90967-8.28222A7.9999,7.9999,0,0,0,225.8877,197.64526ZM184.47656,43.09717a7.99994,7.99994,0,0,0-9.79785-5.657L143.769,45.72241a8.00015,8.00015,0,0,0-5.65674,9.7981l8.28223,30.90954,46.36426-12.42334Z" opacity="0.2"/>
                        <path d="M233.61523,195.5752,192.2041,41.02637a16.0157,16.0157,0,0,0-19.5957-11.31348l-30.91016,8.28223c-.33935.09094-.66357.20923-.99219.32043A15.96591,15.96591,0,0,0,128,32H96a15.8799,15.8799,0,0,0-8,2.16492A15.8799,15.8799,0,0,0,80,32H48A16.01833,16.01833,0,0,0,32,48V208a16.01833,16.01833,0,0,0,16,16H80a15.8799,15.8799,0,0,0,8-2.16492A15.8799,15.8799,0,0,0,96,224h32a16.01833,16.01833,0,0,0,16-16V108.40283l27.7959,103.73584a15.992,15.992,0,0,0,19.5957,11.31445l30.91016-8.28222A16.01822,16.01822,0,0,0,233.61523,195.5752ZM156.19238,92.08679l30.91211-8.28259,20.71045,77.27234-30.917,8.28454ZM176.749,45.167l6.21338,23.18238-30.91113,8.28247L145.83984,53.4502ZM128,48l.00732,120H96V48ZM80,48V72H48V48ZM48,208V88H80V208Zm80,0H96V184h32.0083l.00147,24Zm90.16016-8.28418-30.90967,8.28223-6.21143-23.18189,30.918-8.28491,6.21289,23.18164Z"/>
                    </svg>
                </span>
                <div
                    className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-500 transition-all duration-300 group-hover:text-white/90">
                    <p>Aqui você vai encontrar todas as apostilas da FluencyLab, inclusive algumas que ainda estão em construção! Fique semprea tento à atualizações.</p>
                </div>
                <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="suporte/apostilas" className="text-fluency-blue-700 text-3xl font-bold transition-all duration-300 group-hover:text-white">Apostilas
                            &rarr;
                        </a>
                    </p>
                </div>
            </div>
        </div>

        <div id="apoio" className="hidden mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-fluency-orange-500 transition-all duration-300 group-hover:scale-[10]"></span>
            <div className="relative z-10 mx-auto max-w-md">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-orange-500 transition-all duration-300 group-hover:bg-fluency-orange-400">
                    <svg viewBox="0 0 512 512" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                        <path d="M463.313,346.29c-0.758-2.274-2.224-4.747-4.085-6.608l-83.683-83.682l131.503-131.502c6.603-6.603,6.603-17.307,0-23.909
                        L411.411,4.952C408.241,1.782,403.941,0,399.456,0s-8.785,1.782-11.954,4.952c-4.677,4.677-123.793,123.793-131.502,131.502
                        l-71.724-71.725c-0.001-0.001-0.002-0.002-0.003-0.005c-0.001-0.002-0.002-0.002-0.005-0.003l-47.815-47.815
                        c-19.819-19.821-51.904-19.826-71.727,0L16.908,64.726c-19.776,19.775-19.776,51.952,0,71.727l119.547,119.547
                        C134.263,258.19,16.761,375.691,4.952,387.5c-6.603,6.603-6.603,17.307,0,23.909l95.637,95.639
                        c3.171,3.17,7.47,4.952,11.954,4.952s8.785-1.782,11.954-4.952l131.502-131.502l83.682,83.682
                        c1.853,1.853,4.317,3.322,6.608,4.085l143.456,47.818c6.058,2.02,12.762,0.455,17.301-4.085c4.529-4.528,6.11-11.226,4.085-17.301
                        L463.313,346.29z M303.82,136.453l23.909,23.91c3.301,3.301,7.628,4.952,11.954,4.952s8.654-1.651,11.954-4.952
                        c6.603-6.601,6.603-17.307,0-23.909l-23.909-23.909l23.909-23.909l23.91,23.909c3.301,3.301,7.628,4.952,11.954,4.952
                        c4.326,0,8.654-1.65,11.954-4.952c6.603-6.603,6.603-17.307,0-23.909l-23.909-23.909l23.909-23.909l71.728,71.728L351.638,232.09
                        l-71.728-71.728L303.82,136.453z M423.366,351.637l-23.91,23.91L148.408,124.499l23.909-23.909L423.366,351.637z M76.681,148.408
                        l-35.864-35.864c-6.591-6.592-6.591-17.318,0-23.909l47.819-47.819c6.607-6.606,17.301-6.609,23.909,0l35.864,35.864
                        C145.133,79.956,79.944,145.145,76.681,148.408z M112.545,471.183l-71.728-71.728l23.91-23.909l23.909,23.91
                        c3.301,3.301,7.628,4.952,11.954,4.952c4.326,0,8.654-1.651,11.954-4.952c6.603-6.601,6.603-17.307,0-23.909l-23.908-23.91
                        l23.909-23.909l23.91,23.909c3.301,3.301,7.628,4.952,11.954,4.952c4.326,0,8.654-1.65,11.954-4.952
                        c6.603-6.603,6.603-17.307,0-23.909l-23.91-23.909l23.909-23.909l71.728,71.728L112.545,471.183z M351.637,423.366L100.59,172.317
                        l23.909-23.909l251.048,251.048L351.637,423.366z M382.935,439.886l56.952-56.952l28.475,85.427L382.935,439.886z"/>
                        </svg>
                </span>
                <div
                    className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-500 transition-all duration-300 group-hover:text-white/90">
                    <p>Aqui você vai encontrar todas as apostilas da FluencyLab, inclusive algumas que ainda estão em construção! Fique semprea tento à atualizações.</p>
                </div>
                <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="#" className="text-fluency-orange-700 text-3xl font-bold transition-all duration-300 group-hover:text-white">Material de Apoio
                            &rarr;
                        </a>
                    </p>
                </div>
            </div>
        </div>

        <div id="guidelines" className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:scale-[10]"></span>
            <div className="relative z-10 mx-auto max-w-md">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-green-500 transition-all duration-300 group-hover:bg-fluency-green-400">
                    <svg viewBox="0 0 1920 1920" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                        <path d="M960.057 0 112 363.42v715.76c0 390.672 512 670.417 730.572 789.824 27.477 15.038 49.753 27.137 65.018 36.296v.113c16.17 9.725 34.262 14.587 52.467 14.587 18.091 0 36.296-4.862 52.466-14.7 15.265-9.159 37.54-21.258 65.018-36.296 218.572-119.407 730.572-399.152 730.572-789.824V363.42L960.057 0ZM846.982 1272.198 524.27 949.484l80.056-79.943 242.657 242.77 525.343-525.456 80.057 79.944-605.4 605.399Z" fillRule="evenodd"/>
                    </svg>
                </span>
                <div
                    className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-500 transition-all duration-300 group-hover:text-white/90">
                    <p>Aqui você vai encontrar todas as apostilas da FluencyLab, inclusive algumas que ainda estão em construção! Fique semprea tento à atualizações.</p>
                </div>
                <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="suporte/guidelines" className="text-fluency-green-700 text-3xl font-bold transition-all duration-300 group-hover:text-white">Guidelines
                            &rarr;
                        </a>
                    </p>
                </div>
            </div>
        </div>


        <div id="dicas" className="mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
            <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-fluency-yellow-500 transition-all duration-300 group-hover:scale-[10]"></span>
            <div className="relative z-10 mx-auto max-w-md">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-fluency-yellow-500 transition-all duration-300 group-hover:bg-fluency-yellow-400">
                    <svg viewBox="-4 0 19 19" id="idea" xmlns="http://www.w3.org/2000/svg" stroke-width="1" className="h-10 w-10 text-white transition-all">                 
                        <path d="M10.328 6.83a5.903 5.903 0 0 1-1.439 3.64 2.874 2.874 0 0 0-.584 1v1.037a.95.95 0 0 1-.95.95h-3.71a.95.95 0 0 1-.95-.95V11.47a2.876 2.876 0 0 0-.584-1A5.903 5.903 0 0 1 .67 6.83a4.83 4.83 0 0 1 9.28-1.878 4.796 4.796 0 0 1 .38 1.88zm-.95 0a3.878 3.878 0 0 0-7.756 0c0 2.363 2.023 3.409 2.023 4.64v1.037h3.71V11.47c0-1.231 2.023-2.277 2.023-4.64zM7.83 14.572a.475.475 0 0 1-.475.476h-3.71a.475.475 0 0 1 0-.95h3.71a.475.475 0 0 1 .475.474zm-.64 1.262a.238.238 0 0 1-.078.265 2.669 2.669 0 0 1-3.274 0 .237.237 0 0 1 .145-.425h2.983a.238.238 0 0 1 .225.16z"/>                        
                    </svg>
                </span>
                <div
                    className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-500 transition-all duration-300 group-hover:text-white/90">
                    <p>Queremos que nossos professores consigam ensinar de uma forma que demonstre sempre qualidade e dedicação da nossa parte. Esse mini-curso foi preapardo para te ajudar!.</p>
                </div>
                <div className="pt-5 text-base font-semibold leading-7">
                    <p>
                        <a href="suporte/curso" className="text-fluency-yellow-500 text-3xl font-bold transition-all duration-300 group-hover:text-white">Curso para Professores
                            &rarr;
                        </a>
                    </p>
                </div>
            </div>
        </div>

    </div>
    );
}