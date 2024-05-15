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
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md mt-2 flex flex-col items-center h-full text-lg'>
            <div className="progress-container sticky z-[9999] top-0 h-2 w-full bg-fluency-gray-300 rounded-tl-md rounded-tr-md">
                <div className="progress-bar rounded-tl-md rounded-tr-md h-full bg-fluency-green-500" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className='p-6 px-32 mt-4 text-justify'>

                <p className='text-3xl font-bold py-2'>Primeiros Passos</p>

                <div className='flex flex-col gap-4'>
                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>

                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>


                    <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md dark:bg-fluency-blue-950'>
                        <p className='w-fit p-6'>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                        <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>
                
                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>

                    <div className='relative lg:left-[42%] md:left-0 left-0 mt-4'>
                        <FluencyButton variant='confirm' onClick={handleFinishLesson}>
                            {lessonFinished['primeirospassos'] ? 'Lição finalizada' : 'Finalizar lição'}
                        </FluencyButton>
                    </div>
                </div>
                
            </div>

            <Toaster />
        </div>
    );
};

export default CursoDetails;