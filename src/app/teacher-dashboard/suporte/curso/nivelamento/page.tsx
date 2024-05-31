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

const Nivelamento = () => {
    const { data: session } = useSession();
    const userId = session?.user.id
    const [lessonFinished, setLessonFinished] = useState<{ [key: string]: boolean }>({});
    const [scrollProgress, setScrollProgress] = useState(0);
    const courseName = 'nivelamento';

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

                <p className='text-3xl font-bold py-2'>Nivelamento</p>

                <div className='flex flex-col gap-4'>
                    <div>
                        <p className='text-2xl font-bold py-2'>Introdução</p>
                        <p>Para conseguir ajudar o aluno a continuar progredindo é importante saber o que ele já conhece e domina do idioma, qual o vocabulário médio dele, o que ele sabe das estruturas gramaticais, o quanto ele entende ouvindo e lendo, e a escrita dele. Cada uma dessas habilidades precisa ser avaliada. O nivelamento vai te informar a ideia básica de qual a capacidade do aluno nessas habilidades.</p>
                    
                        <div className='flex flex-col gap-1 items-start bg-fluency-pages-light dark:bg-fluency-bg-dark p-4 rounded-md my-2'>
                            <p>1. Para que serve o nivelamento?</p>
                            <div className='flex flex-col gap-1 items-start p-1 w-full'>
                                <p className='flex flex-row gap-2 items-center p-1 px-4 bg-fluency-gray-700 rounded-full w-full text-sm'>Ajudar o aluno a continuar progredindo</p>
                                <p className='flex flex-row gap-2 items-center p-1 px-4 bg-fluency-gray-700 rounded-full w-full text-sm'>Conhece e domina do idioma</p>
                                <p className='flex flex-row gap-2 items-center p-1 px-4 bg-fluency-gray-700 rounded-full w-full text-sm'>O que ele sabe das estruturas gramaticais</p>
                            </div>
                        </div>
                    
                    </div>

                    <div className='mx-2'>
                        <p className='text-2xl font-bold py-2'>O que levar em conta nas aulas</p>
                        <p>É interessante que cada aula tenha materiais, métodos e ferramentas que o aluno goste e aproveite mais. Como músicas, trechos de séries ou filmes, livros, jogos ou dinânicas e assim por diante.</p>
                        <p>Sempre dê um feedback contínuo para seus alunos, mostre onde ele já melhorou e como, e o ajude a perceber o que ele ainda precisa melhorar. Mantenha um equilíbrio entre a cobrança e os elogios para que o aluno possa continuar motivado. </p>
                        <p>Crie metas realistas para o aluno, ajude ele a atingir cada uma delas progressivamente. Peça feedbacks do aluno para que você possa saber como suas próprias aulas estão, e sempre seja aberto a sugestões e até críticas do aluno. Elas podem tornar suas aulas mais úteis e interessantes. Incentive seu aluno a usar o idioma desde a primeira aula, o ajude a ver onde ele pode usar já no começo. Seja encorajador, e incentivando o aluno a se expressar e praticar o idioma.</p>
                        <p>Defina alguns dias que pode ficar disponível para tirar dúvidas rápidas do aluno por meio de mensagem, e se a dúvida for complexa anote para a aula seguinte.</p>
                        <p>Fique atento ao progresso do aluno e ajuste seus métodos, ferramentas e estratégias de necessário. As situações de cada aluno podem mudar, e mudamos junto com elas. </p>
                        <p>Mantenha uma boa comunicação com o aluno e responsável se ele tiver um para conseguir fornecer informações e atualizações sobre o progresso do aluno.</p>
                        <p>Tente criar um vínculo com seus alunos, pergunte sobre a semana ou o dia. Sobre o que gostam e o que acham interessante, isso pode motivar o aluno a estudar mais e ficar mais animado para cada aula. </p>
                    </div>
               
                    <div className='w-full lg:flex lg:flex-row-reverse md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                        <p className='w-fit p-6'>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                        <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <div className='mx-2'>
                        <p className='text-xl font-bold py-2 mt-2'>Sobre as remarcações</p>
                        <p>Considere os seguintes critérios ao decidir se deve remarcar/repor uma aula. O aluno teve problemas técnicos que impediram o começo da aula? Ou aconteceram mais pro final da aula?</p>
                        <p>Conflitos de horário da parte do aluno impossibilitaram que a aula acontecesse? Foi atraso ou o aluno esqueceu? Ele teve um imprevisto sério como doença ou algo familiar?</p>
                        <p>Se o aluno não apareceu e nem avisou antes, tem tempo na semana para repor a aula sem atrapalhar sua programação pessoal?</p>
                        <p>Avalie cada situação, se comunique bem com o aluno para encontrar a solução adequada. Lembre-se que é responsabilidade do aluno aparecer em cada aula, mas muitas semanas sem estudar podem o desmotivar. Sempre que possível reponha uma aula, ou mande algum tipo de exercício e material, o importante é que o aluno tenha consistencia nos estudos. Como dica, escolha dias específicos para reposição e deixe seus alunos sabendo deles. E sempre que precisar desmarcar uma aula tente avisar com antecedencia e de opções de remarcação quando possível.</p>
                    </div>

                    <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                        <p className='w-fit p-6'>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                        <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/1MCTUAXHM_I" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>
                
                    <p>Queremos que nossos alunos sempre sintam nossa dedicação. Por isso preparamos algumas informações que podem ser de ajuda. Essa plataforma foi e está sendo construída para facilitar seu trabalho. Nela você pode encontrar <strong className='hover:text-fluency-blue-500'><Link href={'/teacher-dashboard/material/apostilas'}>material para suas aulas</Link></strong> e o material de apoio extra com ideias, dicas, e conteúdo adicional, inclusive algumas aulas gravadas.</p>
                    <p>É importante se planejar para conseguir fazer uma aula que seja prática e específica para cada aluno, ajudando cada um a alcançar seus objetivos com o idioma. Como podemos nos planejar ao dar aulas e quais critérios podemos levar em conta? </p>

                    <div className='relative lg:left-[42%] md:left-0 left-0 mt-4'>
                        <FluencyButton variant='confirm' onClick={handleFinishLesson}>
                            {lessonFinished['nivelamento'] ? 'Lição Nivelamento finalizada' : 'Finalizar lição'}
                        </FluencyButton>
                    </div>
                </div>
                
            </div>

            <Toaster />
        </div>
    );
};

export default Nivelamento;