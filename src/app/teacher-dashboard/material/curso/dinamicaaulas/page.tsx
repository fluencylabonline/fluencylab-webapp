'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FluencyButton from '@/app/ui/Components/Button/button';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Dinamica1 from './dinamica1';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { MdDone } from 'react-icons/md';
import Dinamica2 from './dinamica2';
import Dinamica3 from './dinamica3';

const DinamicaAulas = () => {
    const { data: session } = useSession();
    const userId = session?.user.id;
    const [lessonFinished, setLessonFinished] = useState<{ [key: string]: boolean }>({});
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3; // Total number of steps
    const courseName = 'dinamicaaulas'; // Define the course name

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

            toast.success(
                `Você marcou a lição de ${courseName} como ${
                    updatedLessonStatus[courseName] ? 'concluída' : 'não concluída'
                }`,
                {
                    position: 'top-center',
                    duration: 2000,
                }
            );
        }
    };

    const handleNextStep = () => {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps));
    };

    const handlePreviousStep = () => {
        setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
    };

    return (
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md mt-2 flex flex-col items-center h-full text-lg mx-4">
            <div className="progress-container sticky z-[9999] top-0 h-2 w-full bg-fluency-gray-300 rounded-tl-md rounded-tr-md">
                <div className="progress-bar rounded-tl-md rounded-tr-md h-full bg-fluency-green-500" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className="p-6 px-32 mt-4 text-justify">
                <p className="text-3xl font-bold py-2">Dinâmica de Aulas</p>

                <div className="flex flex-col gap-4">
                    {currentStep === 1 && <Dinamica1 />}
                    {currentStep === 2 && <Dinamica2 />}
                    {currentStep === 3 && <Dinamica3 />}

                    <div className="flex flex-row gap-2 justify-around mt-4">
                        <FluencyButton variant="confirm" onClick={handleFinishLesson}>
                            {lessonFinished['dinamicaaulas'] ? 'Lição finalizada' : 'Finalizar lição'}
                            <MdDone className="w-4 h-auto ml-2" />
                        </FluencyButton>
                        <div className='flex flex-row gap-2'>
                            {currentStep > 1 && (
                            <FluencyButton onClick={handlePreviousStep}>
                                <FaArrowLeft className="w-4 h-auto mr-2" /> Anterior
                            </FluencyButton>
                            )}
                            {currentStep < totalSteps && (
                            <FluencyButton onClick={handleNextStep}>
                                Próxima <FaArrowRight className="w-4 h-auto ml-2" />
                            </FluencyButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Toaster />
        </div>
    );
};

export default DinamicaAulas;
