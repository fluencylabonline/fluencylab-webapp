'use client';
import React, { useEffect, useState } from 'react';

//Next Imports
import { useSession } from 'next-auth/react';

import { IoIosArrowBack, IoMdTime } from "react-icons/io";
import CourseInfo from './courseinfo.json';
import { useRouter } from 'next/navigation';

// Firebase
import { DocumentData, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';

export default function CursoParaProfessores() {
    const router = useRouter();
    const { data: session } = useSession();
    const [courseCompletion, setCourseCompletion] = useState<{ [key: string]: number }>({});

    const handleCardClick = (link: any) => {
        router.push(`curso/${link}`);
    };

    useEffect(() => {
        const fetchUserLessonStatus = async () => {
            if (session?.user.id) {
                const userRef = doc(db, 'users', session.user.id);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const courses = userData.courses || {};
                    const completionStatus: { [key: string]: number } = {};

                    CourseInfo.forEach((course) => {
                        const totalSteps = course.totalSteps;
                        let completedSteps = 0;

                        for (let i = 1; i <= totalSteps; i++) {
                            if (courses[`${course.page}-${i}`]) {
                                completedSteps++;
                            }
                        }

                        completionStatus[course.page] = (completedSteps / totalSteps) * 100;
                    });

                    setCourseCompletion(completionStatus);
                }
            }
        };

        fetchUserLessonStatus();
    }, [session]);

    return (
        <div className="mt-4 h-[90vh] overflow-hidden overflow-y-scroll p-4 rounded-md flex flex-col gap-4 items-center">
            <p className='text-2xl font-bold'>Bem-vindo, {session?.user.name}</p>
            <div className='mt-3 flex flex-row gap-2'>
                {CourseInfo.map((course, index) => (
                    <div key={index} onClick={() => handleCardClick(course.link)} className="flex flex-col justify-between gap-2 bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all cursor-pointer shadow-md rounded-lg p-6 w-full h-54">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{course.Name}</h2>
                            <IoIosArrowBack />
                        </div>
                        <div>
                            <p className="p-1 my-1">{course.Description}</p>
                            <div className="flex justify-between mt-4">
                                <p className='flex flex-row gap-1 items-center'><IoMdTime /> {course.Duration}</p>
                                <button>{courseCompletion[course.page] === 100 ? 'Concluído' : 'Não concluído'}</button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-fluency-green-600 h-2.5 rounded-full" style={{ width: `${courseCompletion[course.page] || 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
