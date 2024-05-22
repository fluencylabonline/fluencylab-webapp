'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';

// Next Imports
import { useSession } from 'next-auth/react';

// Firebase
import { doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { MdDone } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa6';

const CursoDetails = () => {
    const { data: session } = useSession();
    const userId = session?.user.id
    const [lessonFinished, setLessonFinished] = useState<{ [key: string]: boolean }>({});
    const [scrollProgress, setScrollProgress] = useState(0);
    const courseName = 'primeirospassos'; // Define the course name

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            setScrollProgress(scrollPercent);
    
          
        };
    
        window.addEventListener('scroll', handleScroll);
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [session]);
    

    useEffect(() => {
        const fetchUserLessonStatus = async () => {
            if (userId) {
                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setLessonFinished(userData.courses || {});
                }
            }
        };
        fetchUserLessonStatus();
    }, [userId]);

    const handleFinishLesson = async () => {
        const updatedLessonStatus = { ...lessonFinished };

        if (userId) {
            // Toggle lesson status
            updatedLessonStatus[courseName] = !updatedLessonStatus[courseName];

            // Update Firestore document
            await updateDoc(doc(db, 'users', userId), { courses: updatedLessonStatus });

            // Set state to reflect changes
            setLessonFinished(updatedLessonStatus);

            toast.success(`Você marcou a lição de ${courseName} como ${updatedLessonStatus[courseName] ? 'concluída' : 'não concluída'}`, {
                position: 'top-center',
                duration: 2000,
            });
        }
    };
    return (
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md mt-2 flex flex-col items-center h-full text-lg mx-4'>
            <div className="progress-container sticky z-[9999] top-0 h-2 w-full bg-fluency-gray-300 rounded-tl-md rounded-tr-md">
                <div className="progress-bar rounded-tl-md rounded-tr-md h-full bg-fluency-green-500" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className='p-6 px-32 mt-4 text-justify'>

                <p className='text-3xl font-bold py-2'>Primeiros Passos</p>

                <div className='flex flex-col gap-4'>
                    <p className='text-2xl font-bold py-2'>Introdução</p>
                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material de apoio</Link></strong> extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>Ah! E fique à vontade para dar sugestões sobre o que seria interessante ter por aqui.</p>
                    <p>Vamos lá! É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>
                    <p>Nossa ideia é fazer com que os alunos aproveitem bem cada aula e sintam que tem suporte para continuar estudando durante a semana. Nossos alunos são muito variados e tem necessidades muito diferentes. Por isso, é muito importante sempre manter uma boa conversa sobre o que eles acham do curso, o que eles aproveitam e o que não aproveitam.</p>

                    <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                        <p className='w-fit p-6'>Para não te entediar muito, preparamos um vídeo curto com informações importantes. Fique a vontade para tirar suas dúvidas.</p>
                        <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <p>Agora você tem uma ideia boa do que nós tentamos realizar na FluencyLab. Sinta-se sempre a vontade para tirar suas dúvidas e pedir ajuda. Queremos que os professores sintam nosso apoio tanto quanto os alunos!</p>                

                    <div className="flex flex-row gap-2 justify-around mt-4">
                        <FluencyButton variant="confirm" onClick={handleFinishLesson}>
                            {lessonFinished['dinamicaaulas'] ? 'Lição finalizada' : 'Finalizar lição'}
                            <MdDone className="w-4 h-auto ml-2" />
                        </FluencyButton>
                        <Link href={'dinamicaaulas'}>
                            <FluencyButton>
                                Próxima <FaArrowRight className="w-4 h-auto ml-2" />
                            </FluencyButton>
                        </Link>
                    </div>
                </div>
                
            </div>

            <Toaster />
        </div>
    );
};

export default CursoDetails;