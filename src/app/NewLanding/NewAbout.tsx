'use client';
import React, { useEffect, useState } from 'react';

import Image from 'next/image'
import './Component/NewLanding.css'

import About1 from '../../../public/images/landing/about1.png'
import About2 from '../../../public/images/landing/about2.png'
import About3 from '../../../public/images/landing/about3.png'

import Revisao from '../../../public/images/landing/revisao.png'
import TaskComponent from './Component/TaskComponent';

import WordleImage from '../../../public/images/games/wordlebg.png';
import GuesslyImage from '../../../public/images/games/guessly.svg';
import Listening from '../../../public/images/games/listening.png';
import { VscDebugStart } from 'react-icons/vsc';
import GoogleCalendarButton from '../ui/Components/Buttons/GoogleCalendarButton';
import { WhatsAppButton } from '../ui/Components/Buttons/WhatsAppButton';
import Link from 'next/link';


export default function NewAbout(){
    const [showMore, setShowMore] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleShowMore = () => {
      setShowMore(!showMore);
    };
    
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
    
    return(
        <div id="aboutus" className="flex flex-col items-center bg-transparent dark:bg-transparent px-4 py-6 mx-auto w-full md:px-20 lg:px-8 lg:py-6">
        <div className="text-center max-w-xl mb-2 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
            <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-bold text-fluency-text-dark bg-amber-500 dark:bg-amber-500 uppercase rounded-full">VAMOS COMEÇAR!</p>
            </div>
            <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">Por que fazer aula com a gente?</h2>
            <p className="text-base text-fluency-text-light dark:text-fluency-text-dark md:text-lg">Vamos te mostrar apenas alguns dos motivos que você tem de pelo menos marcar umas aula teste com a gente! </p>
        </div>

        <div className="flex items-center sm:items-start flex-col-reverse sm:flex-row gap-1 w-[90%] p-4 mb-4">
            <div className='w-full'>
                <TaskComponent />
            </div>
            <div className='w-full p-6 flex flex-col items-start gap-2'>
                <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">Sempre saiba <strong className='text-fluency-green-600'>o que</strong> estudar e <strong className='text-fluency-green-600'>como</strong> estudar</h6>
                <p className="text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">Você deve saber que precisa estudar todos os dias. Mas provavelmente se sente perdido sem saber o que e nem como... Aqui você não vai ter esse problema. Oferecemos programações personalizadas e específicas que ficam de fácil acesso na nossa plataforma!</p>
            </div>
        </div>

        <div className="flex items-center sm:items-start flex-col sm:flex-row gap-2 w-[90%] p-4 text-black dark:text-white">
            <div className='w-full p-6 flex flex-col items-start gap-2'>
                <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">Estude de maneira <strong className='text-fluency-blue-500'>divertida</strong></h6>
                <p className="text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">Mas e se você não for muito fã de estudos e materias tradicionais? Fica tranquilo, também não somos. Aqui você aprende, pratica o idioma e até se diverte enquanto estuda.</p>
            </div>
            <div className="w-full flex flex-col items-center gap-2 sm:flex-row ">
                <div className="relative group w-52 h-60 rounded-md p-5 bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                    <Image alt="Wordle" className="w-36 h-auto mt-2" src={WordleImage} />
                        <p className="flex flex-row gap-2 items-center justify-center">
                        <span className="text-xl font-bold">Wordle</span>
                        </p>
                    <div className="absolute inset-0 flex items-start justify-center p-4 opacity-0 group-hover:opacity-100 bg-fluency-blue-500 dark:bg-fluency-gray-900 text-white dark:text-fluency-blue-500 font-bold rounded-md transition-opacity duration-200">
                        Pratique aqui seu vocabulário sob pressão!
                    </div>
                </div>

                {(showMore || window.innerWidth >= 640) && (
                    <>
                    <div className="relative group w-52 h-60 rounded-md p-5 bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Guessly" src={GuesslyImage} className="w-36 h-auto mt-6" />
                        <p className="flex flex-row gap-2 items-center justify-center">
                        <span className="text-xl font-bold">Guessly</span>
                        </p>
                        <div className="absolute inset-0 flex items-start justify-center p-4 opacity-0 group-hover:opacity-100 bg-fluency-blue-500 dark:bg-fluency-gray-900 text-white dark:text-fluency-blue-500 font-bold rounded-md transition-opacity duration-200">
                        Um jeito diferente de aprender palavras novas.
                        </div>
                    </div>

                    <div className="relative group w-52 h-60 rounded-md p-5 bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 flex flex-col gap-2 items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
                        <Image alt="Listening" src={Listening} className="w-36 h-auto mt-6" />
                        <p className="flex flex-row gap-2 items-center justify-center">
                        <span className="text-xl font-bold">Listening</span>
                        </p>
                        <div className="absolute inset-0 flex items-start justify-center p-4 opacity-0 group-hover:opacity-100 bg-fluency-blue-500 dark:bg-fluency-gray-900 text-white dark:text-fluency-blue-500 font-bold rounded-md transition-opacity duration-200">
                        Nesse jogo você pode praticar o seu ouvido e melhorar mais ainda seu entendimento.
                        </div>
                    </div>
                    </>
                )}

                {/* Show More / Show Less Button */}
                {window.innerWidth < 640 && (
                    <button
                    className="mt-4 px-4 py-2 bg-fluency-blue-600 text-white font-bold rounded"
                    onClick={toggleShowMore}
                    >
                    {showMore ? 'Ver menos' : 'Ver mais'}
                    </button>
                )}
            </div>
        </div>

        <div className="flex items-center justify-center flex-col-reverse sm:flex-row w-full gap-2 sm:w-[90%] p-8 mb-4">
            <div className='w-[80%]'>
                <Image alt="Wordle" className="w-full h-auto mt-2" src={Revisao} />
            </div>
            <div className='w-[95%] p-6 flex flex-col items-center sm:items-start gap-2'>
                <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">Um <strong className='text-fluency-orange-500'>sistema de revisão</strong> que te ajuda a lembrar tudo!</h6>
                <p className="w-[95%] text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">Você também vai contar com um sistema de revisão que te diz exatamente o que precisa estudar e quando fazer isso.</p>
            </div>
        </div>

        <div className="flex items-center justify-center flex-col sm:flex-row gap-1 w-full sm:w-[80%] p-4 mb-4">
            <div className='w-[95%] p-6 flex flex-col items-start gap-2'>
                <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark"><strong className='font-bold' id='gradient-text'>Entenda e acompanhe</strong> seu nível no idioma</h6>
                <p className="sm:w-[95%] w-full text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">Ainda não sabe bem como está seu inglês? Não se preocupa, nosso teste vai te dar uma ideia excelente do que precisa fazer para alavancar seu inglês! E ele também marca seu progresso de tempos em tempos.</p>
            </div>
            <div className='w-[80%] sm:w-[55%] flex items-center text-center'>
                <div id='background-body-new' className="w-[70vh] h-min flex flex-col gap-2 pb-4 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-white rounded-md">
                    <div className="flex flex-col items-center justify-center">
                        <p className="font-bold text-[2rem] p-6">Bem vindo, Marcos!</p>
                        <p className="px-4 text-center font-semibold text-lg">Vamos fazer um nivelamento e entender melhor como podemos melhorar seu inglês!</p>
                        <p className="w-[90%] text-center text-md p-2">Temos 3 habilidades para testar: <br></br> 1 - Vocabulário e Leitura <br></br> 2 - Escrita <br></br> 3 - Audição</p>
                    </div>
                    <button className='flex flex-row items-center gap-2 border-2 p-2 px-4 rounded-md border-white hover:bg-white hover:text-black duration-300 hover:font-bold ease-in-out'>
                        Começar <VscDebugStart className="w-4 h-auto" />
                    </button>
                </div>
            </div>
        </div>

        <div className='flex flex-col items-center'>
            <h2 className="text-center max-w-lg mt-2 mb-6 font-sans text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">Achou legal? Tem isso e um pouco mais</h2>

            <div className="grid gap-8 row-gap-10 lg:grid-cols-3 text-center">
                {/* ABOUT 1 */}
                <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                    <div className="flex items-center justify-center w-40 h-40">
                        <Image className="h-auto w-full" src={About1} alt="FluencyLab" />
                    </div>
                    <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Sem demora para conversar</h6>
                    <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Quando começa a fazer aula com a gente nossos professores vão te preparar para conseguir se comunicar dos níveis mais básicos até onde você quiser chegar logo nas primeiras semanas. </p>
                </div>

                {/* ABOUT 2 */}
                <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                    <div className="flex items-center justify-center w-40 h-40">
                        <Image className="h-auto w-full" src={About2} alt="FluencyLab" />
                    </div>
                    <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Material didático</h6>
                    <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Nosso material é feito pensando nas suas necessidades específicas. Ele é sempre testado antes de ser usado em aula. E além disso, foi planejado com muito cuidado para que a sua aula seja o mais dinâmica possível. </p>
                </div>

                {/* ABOUT 3 */}
                <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                    <div className="flex items-center justify-center w-40 h-40">
                        <Image className="h-auto w-full" src={About3} alt="FluencyLab" />
                    </div>
                    <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Aulas personalizadas</h6>
                    <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Cada aluno tem um tipo de aula diferente com a gente. Se necessário preparamos até material novo se isso for o que você precisa. Então não se preocupa. Aqui é o seu lugar! </p>
                </div>
            </div>
        </div>

        <div className='mt-4 flex flex-col items-center'>
            <h6 className="mb-4 text-2xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Agora é só falar com a gente</h6>
            {isMobile && (
            <div className='flex flex-col items-center gap-2'>
                <button>
                    <Link href="/u/googlecalendarpage" className="w-max cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-500 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                    Agende uma aula grátis!
                    </Link>
                </button>
                <WhatsAppButton buttonText="Ou, manda mensagem aqui"/>
            </div>
            )}

            {!isMobile && (
            <div className='flex flex-row items-center gap-2'>
                <GoogleCalendarButton />
                <WhatsAppButton buttonText="Ou, manda mensagem aqui"/>
            </div>
            )}
        </div>
        
    </div>
    );
}