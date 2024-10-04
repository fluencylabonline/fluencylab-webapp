'use client'
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';
import FluencyButton from '@/app/ui/Components/Button/button';
import '../Style/framevideo.css';
import { BsFilePdf, BsPersonVideo } from 'react-icons/bs';
import { PiBooksLight } from 'react-icons/pi';
import { IoIosLink } from 'react-icons/io';
import { CiSquareQuestion } from 'react-icons/ci';
import ListeningComponent from '@/app/SharedPages/Games/listening/component/listeningcomponent';
import { GiSchoolBag } from 'react-icons/gi';
import QuizComponent from '@/app/SharedPages/Games/quizz/component/quizzComponent';
import { RiMenuUnfold2Line, RiMenuUnfoldLine } from 'react-icons/ri';
import { FaHeadphones } from 'react-icons/fa6';
import { SiGoogleclassroom } from "react-icons/si";
import { TbCards } from 'react-icons/tb';
import Exercicio from './Exercicio/page';

interface ClassData {
    deckNAME: string;
    className: string;
    classNumber: number;
    videoLink: string;
    pdfLink: string;
    videoID: string;
    pdfID: string;
    ankiLink: string;
    externalLinks: string;
    audioID: string;
    content?: any;  // Adjust the type based on the structure of your content
}

export default function Aula() {
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to track sidebar open/close
    const [activePanel, setActivePanel] = useState<string | null>('video');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const moduleID = params.get('moduleID');
        const languageareaName = params.get('languageareaName');

        const fetchClassData = async () => {
            if (id && languageareaName && moduleID) {
                try {
                    const classDocRef = doc(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes', id); // Adjust path based on your Firestore structure
                    const classDocSnapshot = await getDoc(classDocRef);

                    if (classDocSnapshot.exists()) {
                        setClassData(classDocSnapshot.data() as ClassData);
                    } else {
                        console.log('Class not found');
                    }
                } catch (error) {
                    console.error('Error fetching class data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchClassData();
    }, []);

    if (!classData && loading) {
        return <DocumentAnimation />; // Display loading indicator while fetching data
    }

    if (!classData) {
        return <div>Aula não encontrada.</div>; // Handle case where class data is not found
    }

    const handlePanelClick = (panelKey: string) => {
        setActivePanel(panelKey === activePanel ? null : panelKey);
        setSidebarOpen(!sidebarOpen);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className='flex flex-row w-full overflow-hidden overflow-y-scroll'>

            <div className='flex flex-col items-center justify-center w-full p-4 h-[90vh]'>
                <button
                    className='fixed z-50 right-4 bottom-8 bg-fluency-bg-dark dark:bg-fluency-bg-light text-white dark:text-black p-4 rounded-full shadow-md'
                    onClick={toggleSidebar}
                > {sidebarOpen ? <RiMenuUnfoldLine className='w-7 h-auto' /> : <RiMenuUnfold2Line className='w-7 h-auto' />}
                </button>

                {/* Render content based on active panel */}
                {activePanel === 'video' && (
                   <iframe 
                        src={`https://drive.google.com/file/d/${classData.videoID}/preview`} 
                        frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                        id="frame-video">
                    </iframe>
                )}

                {activePanel === 'exercicio' && (
                   <Exercicio 
                        content={classData.content} 
                        languageareaName={new URLSearchParams(window.location.search).get('languageareaName')}
                        moduleID={new URLSearchParams(window.location.search).get('moduleID')}
                        id={new URLSearchParams(window.location.search).get('id')} 
                    />
                )}
                {activePanel === 'pdf' && (
                    <iframe 
                        src={`https://drive.google.com/file/d/${classData.pdfID}/preview`} 
                        allow="autoplay"
                        id="frame-pdf">
                    </iframe>
                )}

                {activePanel === 'videopdf' && (
                    <div className='flex flex-col sm:flex-row gap-4 items-center sm:items-start justify-center w-full h-full'>
                        <iframe 
                            src={`https://drive.google.com/file/d/${classData.videoID}/preview`} 
                            className='w-full h-max'
                            id="frame-video" frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                        </iframe>
                        <iframe 
                            src={`https://drive.google.com/file/d/${classData.pdfID}/preview`} 
                            frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                            id="frame-pdf">
                        </iframe>
                    </div>
                )}

                {activePanel === 'links' && (
                    <div className='flex flex-col items-center justify-center w-[80%] h-full p-4'>
                        <iframe src={`https://drive.google.com/embeddedfolderview?id=${classData.externalLinks}#grid`} width="100%" height="100%" frameBorder={0}></iframe>
                    </div>
                )}
                {activePanel === 'requirements' && (
                    <FluencyButton><a target="_blank" rel="noopener noreferrer" href='https://drive.google.com/file/d/1qBq1cJRjkV0krIrZqV9j4qOJPhOwg_VJ/view?usp=drive_link'>Como usar Flashcards</a></FluencyButton>
                )}
                {activePanel === 'quiz' && (
                    <>{classData.deckNAME === '' ? "Esta licao nao contem deck para pratica" : <QuizComponent deckName={classData.deckNAME} />}</>
                )}
                {activePanel === 'listening' && (
                    <>{classData.audioID === '' ? "Esta licao nao contem audio para pratica" : <ListeningComponent audioId={classData.audioID} />}</>
                )}
            </div>

            {/* Sidebar */}
            <div className={`z-10 fixed right-0 top-0 h-full flex flex-col items-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 px-8 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='text-xl font-bold mb-8'>Lista de Assuntos</div>
                <div className='flex flex-col items-center gap-2'>
                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'video' ? 'text-fluency-blue-600 dark:text-fluency-blue-600' : 'hover:text-fluency-blue-600 hover:dark:text-fluency-blue-600'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('video')}
                    >
                        <BsPersonVideo className='w-6 h-auto'/> Video Aula
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'exercicio' ? 'text-fluency-blue-600 dark:text-fluency-blue-600' : 'hover:text-fluency-blue-600 hover:dark:text-fluency-blue-600'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('exercicio')}
                    >
                        <BsPersonVideo className='w-6 h-auto'/> Exercícios
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'pdf' ? 'text-fluency-red-600 dark:text-fluency-red-600' : 'hover:text-fluency-red-600 hover:dark:text-fluency-red-600'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('pdf')}
                    >
                        <PiBooksLight className='w-6 h-auto'/> PDF da Aula 
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'videopdf' ? 'text-amber-600 dark:text-amber-600' : 'hover:text-amber-700 hover:dark:text-amber-700'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('videopdf')}
                    >
                        <SiGoogleclassroom  className='w-6 h-auto'/> Aula e PDF 
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'links' ? 'text-purple-700 dark:text-purple-800' : 'hover:text-purple-700 hover:dark:text-purple-800'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('links')}
                    >
                        <IoIosLink className='w-6 h-auto'/> Material Adicional
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'requirements' ? 'text-fluency-green-600 dark:text-fluency-green-600' : 'hover:text-fluency-green-700 hover:dark:text-fluency-green-700'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('requirements')}
                    >
                        <CiSquareQuestion className='w-6 h-auto'/> Requisitos da Aula
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'quiz' ? 'text-fluency-yellow-600 dark:text-fluency-yellow-600' : 'hover:text-fluency-yellow-700 hover:dark:text-fluency-yellow-700'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('quiz')}
                    >
                        <GiSchoolBag className='w-6 h-auto'/> Quiz
                    </button>

                    <button 
                        className={`p-2 flex flex-row items-center gap-3 font-bold text-black dark:text-white 
                                    ${activePanel === 'listening' ? 'text-fluency-orange-600 dark:text-fluency-orange-600' : 'hover:text-fluency-orange-700 hover:dark:text-fluency-orange-700'} 
                                    duration-300 ease-in-out transition-all`}
                        onClick={() => handlePanelClick('listening')}
                    >
                        <FaHeadphones className='w-6 h-auto'/> Pratica de ouvido
                    </button>

                    <div className='flex flex-col items-center mt-6'>
                        <button 
                            className={`p-2 flex flex-row items-center gap-3 font-bold text-orange-500 dark:text-orange-600 `}
                        >
                            <a className='flex flex-row items-center gap-3' target="_blank" rel="noopener noreferrer" href={classData.ankiLink}>
                                <TbCards  className='w-6 h-auto'/>Baixar deck Anki</a>
                        </button>

                        <button 
                            className={`p-2 flex flex-row items-center gap-3 font-bold text-red-500 dark:text-red-600 `}
                        >
                            <a className='flex flex-row items-center gap-3' target="_blank" rel="noopener noreferrer" href={classData.pdfLink}>
                                <BsFilePdf   className='w-6 h-auto'/>Baixar PDF</a>
                        </button>
                    
                    </div>

                </div>
            </div>
        </div>
    );
}
