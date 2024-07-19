'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { FaArrowRight } from 'react-icons/fa6';

import Modal from './Modal';

import Image1 from '../../../../../../public/images/teacherCourse/1.png';
import Image2 from '../../../../../../public/images/teacherCourse/2.png';
import Image3 from '../../../../../../public/images/teacherCourse/3.png';

const Nivelamento = () => {
    const { data: session } = useSession();
    const userId = session?.user.id;
    const [lessonFinished, setLessonFinished] = useState<{ [key: string]: boolean }>({});
    const [scrollProgress, setScrollProgress] = useState(0);
    const courseName = 'nivelamento-1';
    const correctAnswer = 'Ajudar o aluno a continuar progredindo';
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<typeof Image1 | null>(null);

    useEffect(() => {
        const storedAnswer = localStorage.getItem('selectedAnswer');
        if (storedAnswer) {
            setSelectedAnswer(storedAnswer);
            setIsAnswerCorrect(storedAnswer === correctAnswer);
        }
    }, []);

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
            updatedLessonStatus[courseName] = !updatedLessonStatus[courseName];
            await updateDoc(doc(db, 'users', userId), { courses: updatedLessonStatus });
            setLessonFinished(updatedLessonStatus);
            toast.success(`Você marcou a lição de ${courseName} como ${updatedLessonStatus[courseName] ? 'concluída' : 'não concluída'}`, {
                position: 'top-center',
                duration: 2000,
            });
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
        setIsAnswerCorrect(answer === correctAnswer);
        localStorage.setItem('selectedAnswer', answer);
    };

    const handleImageClick = (image: typeof Image1) => {
        setSelectedImage(image);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md mt-2 flex flex-col items-center h-full text-lg mx-4'>
            <div className="progress-container sticky z-10 top-0 h-2 w-full bg-fluency-gray-300 rounded-tl-md rounded-tr-md">
                <div className="progress-bar rounded-tl-md rounded-tr-md h-full bg-fluency-green-500" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className='p-6 px-32 mt-4 text-justify'>
                <p className='text-3xl font-bold py-2'>Nivelamento</p>
                <div className='flex flex-col gap-4 items-center'>
                    <div>
                        <p className='text-2xl font-bold py-2'>Introdução</p>
                        <p>Para conseguir ajudar o aluno a continuar progredindo é importante saber o que ele já conhece e domina do idioma, qual o vocabulário médio dele, o que ele sabe das estruturas gramaticais, o quanto ele entende ouvindo e lendo, e a escrita dele. Cada uma dessas habilidades precisa ser avaliada. O nivelamento vai te informar a ideia básica de qual a capacidade do aluno nessas habilidades.</p>
                        <div className='flex flex-col gap-1 items-start bg-fluency-pages-light dark:bg-fluency-bg-dark p-4 rounded-md my-2'>
                            <p>1. Para que serve o nivelamento para o professor?</p>
                            <div className='flex flex-col gap-1 items-start p-1 w-full'>
                                {['Ajudar o aluno a continuar progredindo', 'Conhecer e dominar o idioma', 'O que o aluno sabe das estruturas gramaticais'].map((option) => (
                                    <button
                                        key={option}
                                        className={`flex flex-row gap-2 items-center p-1 px-4 rounded-full w-full text-sm font-bold ${
                                            selectedAnswer
                                                ? option === correctAnswer
                                                    ? 'bg-green-500 text-white'
                                                    : option === selectedAnswer
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-fluency-gray-300 dark:bg-fluency-gray-700 text-white'
                                                : 'bg-fluency-gray-300 dark:bg-fluency-gray-700 hover:bg-fluency-gray-400 hover:dark:bg-fluency-gray-800 duration-300 ease-in-out transition-all text-white'
                                        }`}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={!!selectedAnswer}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='mx-2'>
                        <p className='text-2xl font-bold py-2'>Como o nivelamento funciona</p>
                        <p>O nivelamento é uma avaliação inicial que tem como objetivo determinar o nível de proficiência do aluno no idioma. Ele abrange várias habilidades, como leitura, escrita, compreensão auditiva e expressão oral. Com base nos resultados do nivelamento, é possível planejar aulas personalizadas que atendam às necessidades específicas do aluno.</p>
                        <p>Durante o processo de nivelamento, o professor pode utilizar diferentes tipos de materiais e atividades, como testes escritos, conversas informais, exercícios de leitura e compreensão auditiva. É importante que o professor observe e anote os pontos fortes e fracos do aluno em cada habilidade.</p>
                        <p>Além de avaliar o conhecimento gramatical e vocabular do aluno, o nivelamento também deve considerar outros fatores, como a confiança ao falar, a pronúncia, e a capacidade de entender diferentes sotaques e registros do idioma.</p>
                        <p>Com as informações obtidas no nivelamento, o professor pode criar um plano de aulas que se concentre nas áreas que o aluno precisa melhorar, ao mesmo tempo em que reforça suas habilidades já dominadas. Isso ajuda a manter o aluno motivado e permite um progresso mais eficiente no aprendizado do idioma.</p>
                        <p>O nivelamento não é um processo único; ele pode ser revisitado periodicamente para ajustar o plano de ensino conforme o aluno avança. O feedback contínuo é essencial para garantir que o aluno esteja sempre ciente de seu progresso e das áreas que precisam de mais atenção.</p>
                    
                        <p className='mt-3'>Para te ajudar nesse processo. Separamos materiais que podem ser usados para que você faça o nivelamento do aluno de tempos em tempos. Além disso, a própria plataforma conta com esse recurso, onde o aluno faz um teste que dura alguns minutos e você pode ter uma ideia geral da pontuação dele em algumas habilidades.</p>
                    </div>

                    <div className='flex flex-col gap-1 justify-center items-center my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                        <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center'>
                            <p className='w-fit p-6'>Para acessar a área clique no botão Nivelamento.</p>
                            <Image
                                className='w-[50%] h-auto p-6 rounded-md cursor-pointer'
                                src={Image2}
                                alt='Imagem'
                                onClick={() => handleImageClick(Image2)}
                            />
                        </div>

                        <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center'>
                            <p className='w-fit p-6'>Você vai ver pontuações para três habilidades: Conhecimentos básicos, Escrita e Audição. O teste de Fala precisa ser feito com o professor por equanto, logo explicaremos como.</p>
                            <Image
                                className='w-[50%] h-auto p-6 rounded-md cursor-pointer'
                                src={Image3}
                                alt='Imagem'
                                onClick={() => handleImageClick(Image3)}
                            />
                        </div>

                        <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center'>
                            <p className='w-fit p-6'>Você vai decidir quando o aluno precisa fazer o teste. Quando quiser que isso aconteça, clique no botão Refazer Nivelamento do Aluno. Uma notificação vai aparecer para ele, mas seria interessante avisar também.</p>
                            <Image
                                className='w-[50%] h-auto p-6 rounded-md cursor-pointer'
                                src={Image1}
                                alt='Imagem'
                                onClick={() => handleImageClick(Image1)}
                            />
                        </div>
                    </div>

                    {isModalOpen && selectedImage && (
                    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                        <Image
                            className='w-full h-auto rounded-md'
                            src={selectedImage}
                            alt='Imagem Expandida'
                        />
                    </Modal>)}


                    <div className='mx-2'>
                        <p className='text-xl font-bold py-2 mt-2'>Como as pontuações funcionam:</p>
                        <p className='py-2'>
                            É claro que para entender bem o nível de alguém no idioma precisamos de mais do que algumas perguntas durante uma aula. Aproveite o primeiro mês de aula para testar a extensão do vocabulário, conhecimento gramatical, compreensão/expressão oral e escrita. Assim suas aulas vão ser melhor planejadas.
                        </p>
                        <p className='py-2'>
                            Vamos testar o aluno nas seguintes habilidades: 1) vocabulário e leitura, 2) escrita, 3) audição, 4) compreensão e fala.
                        </p>

                        <p className='text-lg font-semibold py-2'>Teste de vocabulário e leitura leva em conta:</p>
                        <ul className='list-disc pl-5'>
                            <li><strong>20 de vocabulário aleatório:</strong> significado. (5 pontos)</li>
                            <li><strong>10 de uso em frase:</strong> fazendo a tradução. (5 pontos)</li>
                            <li><strong>10 de uso da mais provável:</strong> com lacunas. (5 pontos)</li>
                            <li><strong>True/False Questions:</strong> frases simples que ele precisa classificar. (5 pontos)</li>
                        </ul>

                        <p className='text-lg font-semibold py-2'>Teste de escrita leva em conta:</p>
                        <p className='py-2'>
                            Ordem das palavras, escrever sobre a ideia, gramática e uso natural do idioma. O aluno recebe um prompt para escrever sobre. A pontuação máxima é 5.
                        </p>

                        <p className='text-lg font-semibold py-2'>Teste de audição leva em conta:</p>
                        <p className='py-2'>
                            A compreensão do aluno do que foi dito. Vamos usar 1 áudio com espaços onde o aluno pode escrever o que foi dito.
                        </p>

                        <p className='text-lg font-semibold py-2'>Teste de compreensão e fala:</p>
                        <p className='py-2'>
                            Esse o professor vai fazer e analisar de acordo com os critérios de cada pergunta.
                        </p>

                        <p className='text-lg font-semibold py-2'>Como pontuar:</p>
                        <div className='p-2'>
                            <p className='text-lg font-semibold py-2'>Teste de vocabulário e leitura leva em conta:</p>
                            <ul className='list-disc pl-5'>
                                <li><strong>0-7 pontos (A1/A2):</strong> O aluno tem dificuldades com vocabulário e leitura básicos.</li>
                                <li><strong>8-14 pontos (B1/B2):</strong> O aluno tem uma compreensão intermediária e uso do vocabulário e leitura.</li>
                                <li><strong>15-20 pontos (C1/C2):</strong> O aluno tem um domínio avançado de vocabulário e leitura.</li>
                            </ul>

                            <p className='text-lg font-semibold py-2'>Teste de escrita leva em conta:</p>
                            <ul className='list-disc pl-5'>
                                <li><strong>0-1 ponto (A1/A2):</strong> O aluno tem dificuldades significativas em escrever frases simples.</li>
                                <li><strong>2-3 pontos (B1/B2):</strong> O aluno consegue escrever textos claros e coerentes sobre tópicos familiares.</li>
                                <li><strong>4-5 pontos (C1/C2):</strong> O aluno escreve textos bem estruturados e argumentativos com vocabulário avançado.</li>
                            </ul>

                            <p className='text-lg font-semibold py-2'>Teste de audição leva em conta:</p>
                            <ul className='list-disc pl-5'>
                                <li><strong>0-3 pontos (A1/A2):</strong> O aluno tem dificuldades em entender frases e informações simples.</li>
                                <li><strong>4-7 pontos (B1/B2):</strong> O aluno consegue entender conversas simples e seguir tópicos familiares.</li>
                                <li><strong>8-10 pontos (C1/C2):</strong> O aluno entende discursos longos e complexos, mesmo em contextos desconhecidos.</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <p className='text-xl font-bold py-2 mt-2'>Teste de conversação</p>
                        <p>Arquivos para fazer o teste de fala <strong className='hover:text-fluency-blue-500'><a href={'https://drive.google.com/drive/folders/1UPxK3h4mNu11bHyGopzrpHOTvf9Cup8W?usp=drive_link'} target='_blank' rel='noopener noreferrer'>estão aqui.</a></strong> Pode escolher um dos dois para fazer. Em breve disponibilizaremos mais material.</p>
                    </div>
                   
                    <div className='flex flex-row gap-2 mt-4'>
                        <FluencyButton variant='confirm' onClick={handleFinishLesson}>
                            {lessonFinished['nivelamento-1'] ? 'Lição Nivelamento finalizada' : 'Finalizar lição'}
                        </FluencyButton>

                        {lessonFinished['nivelamento-1'] === true &&
                            <Link href={'ferramentas'}>
                                <FluencyButton variant='warning'>
                                    Próxima lição <FaArrowRight className="w-4 h-auto ml-2" />
                                </FluencyButton>
                            </Link>}
                    </div>
                </div>
            </div>

            <Toaster />
        </div>
    );
};

export default Nivelamento;
