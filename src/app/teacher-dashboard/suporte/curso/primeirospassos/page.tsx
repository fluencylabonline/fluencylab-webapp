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
import PrimeirosPassos1 from './primeirospassos1';
const CursoDetails = () => {
    const { data: session } = useSession();
    const userId = session?.user.id
    const [lessonFinished, setLessonFinished] = useState<{ [key: string]: boolean }>({});
    const [scrollProgress, setScrollProgress] = useState(0);
    const courseName = 'primeirospassos'; // Define the course name
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 1; // Total number of steps

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
            // Toggle lesson status for the current step
            updatedLessonStatus[`${courseName}-${currentStep}`] = !updatedLessonStatus[`${courseName}-${currentStep}`];
    
            // Update Firestore document
            await updateDoc(doc(db, 'users', userId), { courses: updatedLessonStatus });
    
            // Set state to reflect changes
            setLessonFinished(updatedLessonStatus);
    
            toast.success(
                `Você marcou a lição de ${courseName} - ${currentStep} como ${
                    updatedLessonStatus[`${courseName}-${currentStep}`] ? 'concluída' : 'não concluída'
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
        <div className='bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md mt-2 flex flex-col items-center h-full text-lg mx-4'>
            <div className="progress-container sticky z-[9999] top-0 h-2 w-full bg-fluency-gray-300 rounded-tl-md rounded-tr-md">
                <div className="progress-bar rounded-tl-md rounded-tr-md h-full bg-fluency-green-500" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            <div className='p-6 px-32 mt-4 text-justify'>

                <p className='text-3xl font-bold py-2'>Primeiros Passos</p>

                <div className='flex flex-col gap-4'>
                    {currentStep === 1 && <PrimeirosPassos1 />}
                    
                    <div className="flex flex-row gap-2 justify-around mt-4">
                        <FluencyButton variant="confirm" onClick={handleFinishLesson}>
                            {lessonFinished[`${courseName}-${currentStep}`] ? 'Lição finalizada' : 'Finalizar lição'}
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