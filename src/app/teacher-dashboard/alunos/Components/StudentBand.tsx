'use client';
import React, { useEffect, useState, useCallback, useMemo, FC } from 'react';
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { db } from '@/app/firebase';

import { toast, Toaster } from 'react-hot-toast';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { PiNotebook } from 'react-icons/pi';

import FluencyButton from '@/app/ui/Components/Button/button';
import ProfilePicture from './ProfilePicture';
import AddClass from './AddClass';
import OverDue from './OverDueClasses';
import SettingBottomSheet from './SettingsBottomSheet';
import { TbBook2 } from 'react-icons/tb';
import ClassDateItem from './ClassesItem';
import LoadingAnimation from '@/app/ui/Animations/LoadingAnimation';
import FluencyInput from '@/app/ui/Components/Input/input';

    interface Aluno {
        showAllDates: any;
        selectedMonth: string;
        selectedYear: number;
        overdueClassesCount: number;
        doneClassesCount: number;
        Classes: any;
        id: string;
        name: string;
        email: string;
        number: string;
        userName: string;
        mensalidade: string;
        idioma: string[];
        teacherEmails: string[];
        professor: string;
        professorId: string;
        diaAula?: string[];
        profilePicUrl?: string;
        frequencia: number;
        classDatesWithStatus: { date: Date; status: string }[];
        status: string;
    }   

    interface ActionButtonProps {
        label: string;
        onClick: () => void;
        bgColor: string;
        icon: JSX.Element;
    }

function Paineis(){
    const { data: session } = useSession();
    const [teacherId, setTeacherId] = useState(false);
    const [students, setStudents] = useState<Aluno[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(''); 
    const currentDate = new Date();
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const months = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
    const currentMonthIndex = currentDate.getMonth();
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const years: number[] = [];
    const startYear = 2024;
        for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
    }

    const getClassDatesForCurrentMonth = useCallback((diasAula: string[]) => {
        const classDates: Date[] = [];
        const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate(); 
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(currentYear, currentMonthIndex, day);
            const dayOfWeek = currentDate.getDay(); 
            if (diasAula.includes(daysOfWeek[dayOfWeek])) {
                classDates.push(currentDate);
            }}
        return classDates;
    }, [currentMonthIndex, currentYear]);
    
    const insertUndoneDates = async (studentId: string, classDates: Date[]) => {
        try {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
    
            const classesRef = doc(db, `users/${studentId}`);
            const userDoc = await getDoc(classesRef);
    
            if (userDoc.exists()) {
                const userData = userDoc.data() as Aluno;
                let classes = userData.Classes || {};
    
                classes[currentYear] = classes[currentYear] || {};
                classes[currentYear][months[currentMonth]] = classes[currentYear][months[currentMonth]] || {};
    
                classDates.forEach((date) => {
                    const dayOfMonth = date.getDate().toString();
                    if (!classes[currentYear][months[currentMonth]][dayOfMonth]) {
                        const currentDate = new Date();
                        if (date < currentDate) {
                            classes[currentYear][months[currentMonth]][dayOfMonth] = 'Atrasada';
                        } else {
                            classes[currentYear][months[currentMonth]][dayOfMonth] = 'À Fazer';
                        }
                    }
                });
    
                await updateDoc(classesRef, { Classes: classes });
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error inserting undone dates:', error);
        }
    };

    const fetchData = useCallback((teacherId: string) => {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('role', '==', 'student'),
            where('professorId', '==', teacherId)
        );
    
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            let studentList: any[] = [];
            
            const studentDataPromises = querySnapshot.docs.map(async (doc) => {
                const studentId = doc.id;
                const storage = getStorage();
                const userProfilePicRef = ref(storage, `profilePictures/${studentId}`);
                let url: string | null = null;
                try {
                    url = await getDownloadURL(userProfilePicRef);
                } catch (error) {
                    console.log('Sem foto de perfil');
                }
                try {
                    const userDoc = await getDoc(doc.ref);
                    const userData = userDoc.data() as Aluno;
                    const classesData = userData.Classes || {};
                    let doneClassesCount = 0;
                    let overdueClassesCount = 0;
                    const classDatesWithStatus: { date: Date; status: string }[] = [];
                    for (const yearKey of Object.keys(classesData)) {
                        const year = parseInt(yearKey);
                        for (const monthKey of Object.keys(classesData[yearKey])) {
                            for (const dayKey of Object.keys(classesData[yearKey][monthKey])) {
                                const classStatus = classesData[yearKey][monthKey][dayKey];
                                const classDate = new Date(year, months.indexOf(monthKey), parseInt(dayKey));
                                const currentDate = new Date();
    
                                if (classStatus === 'Feita') {
                                    doneClassesCount++;
                                }
                                if (classStatus !== 'Feita' && classStatus !== 'Cancelada' && classDate < currentDate) {
                                    overdueClassesCount++;
                                }
                                if (classStatus !== 'Modificada') {
                                    classDatesWithStatus.push({ date: classDate, status: classStatus });
                                }
                            }
                        }
                    }
    
                    if (userData.diaAula) {
                        const classDates = getClassDatesForCurrentMonth(userData.diaAula);
                        await insertUndoneDates(studentId, classDates);
                    }
    
                    return {
                        id: studentId,
                        name: userData.name,
                        email: userData.email,
                        number: userData.number,
                        userName: userData.userName,
                        mensalidade: userData.mensalidade,
                        idioma: userData.idioma,
                        teacherEmails: userData.teacherEmails,
                        diaAula: userData.diaAula,
                        professor: userData.professor,
                        frequencia: userData.frequencia,
                        doneClassesCount: doneClassesCount,
                        overdueClassesCount: overdueClassesCount,
                        classDatesWithStatus: classDatesWithStatus,
                        profilePicUrl: url,
                        status: userData.status,
                        selectedMonth: months[currentMonthIndex],
                        selectedYear: currentYear,
                        showAllDates: false
                    };
                } catch (error) {
                    console.error('Error fetching profile picture for student:', error);
                    return null;
                }
            });
            const studentData = await Promise.all(studentDataPromises);
            studentList = studentData.filter((data) => data !== null);
            setStudents(studentList);
        });
    
        return () => unsubscribe();
    }, [setStudents, months, getClassDatesForCurrentMonth, currentMonthIndex, currentYear]);
    
    useEffect(() => {
        if (session && !teacherId) {
            fetchData(session.user.id);
            setTeacherId(true);
        }
    }, [session, teacherId, fetchData]);

    const handleClassStatus = async (studentId: string, date: Date, action: string) => {
        try {
            const currentYear = date.getFullYear();
            const currentMonth = months[date.getMonth()];
            const classesRef = doc(db, `users/${studentId}`);
            const userDoc = await getDoc(classesRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data() as Aluno;
                let classes = userData.Classes || {};
                classes[currentYear] = classes[currentYear] || {};
                classes[currentYear][currentMonth] = classes[currentYear][currentMonth] || {};
                const dayOfMonth = date.getDate().toString();
                classes[currentYear][currentMonth][dayOfMonth] = action;
                await updateDoc(classesRef, {
                    Classes: classes
                });
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error updating class status:', error);
        }
    };
    
    const updateStudentStatus = (studentId: string, date: Date, status: string) => {
        setStudents(prevStudents => {
            return prevStudents.map(student => {
                if (student.id === studentId) {
                    const updatedClassDatesWithStatus = student.classDatesWithStatus.map(classDate => {
                        return classDate.date === date
                            ? { ...classDate, status }
                            : classDate;
                    });
                    return { ...student, classDatesWithStatus: updatedClassDatesWithStatus };
                }
                return student;
            });
        });
    };
    
    const handleStatusChange = async (studentId: string, date: Date, status: string, toastMessage: string, toastType: 'success' | 'error') => {
        try {
            await handleClassStatus(studentId, date, status);
            updateStudentStatus(studentId, date, status);
            toast[toastType](toastMessage, { position: "top-center" });
        } catch (error) {
            console.error('Error updating class status:', error);
        }
    };
    
    const handleDone = (studentId: string, date: Date) => {
        handleStatusChange(studentId, date, 'Feita', 'Parabéns! Aula registrada.', 'success');
    };
    
    const handleCanceled = (studentId: string, date: Date) => {
        handleStatusChange(studentId, date, 'Cancelada', 'Cancelamento registrado.', 'error');
    };
    
    const handleDelete = (studentId: string, date: Date) => {
        handleStatusChange(studentId, date, 'Modificada', 'Aula deletada.', 'success');
    };
    
    // Filter students based on search query
    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

return(
    <div className='flex flex-col gap-3 lg:items-start md:items-start items-center'>
        <Toaster />
        <FluencyInput
            type="text"
            placeholder="Buscar aluno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100"
        />
        {filteredStudents.length === 0 && 
            <div className="flex items-center justify-center h-[70vh] min-w-full z-30">
                <LoadingAnimation />
            </div>
        }
        {filteredStudents.map((student) => (
        <div className="bg-fluency-gray-200 dark:bg-fluency-gray-900 w-full lg:flex lg:flex-row md:flex md:flex-row flex flex-col p-3 items-strecht justify-between rounded-lg gap-3" key={student.id}>
            <div className='bg-fluency-gray-100 dark:bg-fluency-gray-800 w-full p-3 px-1 flex flex-col lg:items-start md:items-start items-center justify-around rounded-lg gap-1'>
                <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col lg:items-start md:items-start items-center lg:gap-3 md:gap-2 gap-0'>
                    <div className='ml-2 sm:ml-4' key={student.id}>
                        <ProfilePicture profilePicUrl={student.profilePicUrl} status={student.status} />
                    </div>

                    <div className='flex flex-col lg:items-start md:items-start items-center lg:mb-0 md:mb-0 mb-2'>
                        <p className='font-semibold text-lg lg:text-start md:text-start text-center'>{student.name}</p>
                        <div className='flex flex-col gap-1 items-start'>
                            <p className="font-bold text-xs bg-fluency-blue-400 dark:bg-fluency-blue-900 px-2 py-[2px] rounded-md text-white">Dias de aula:
                                {student.diaAula?.map((dia) => (
                                    <span className='ml-1' key={dia}>{dia} </span>
                                ))}
                            </p>    
                        </div>                      
                    </div>
                </div>
                <div className='flex flex-col gap-2 items-center w-full mb-8 font-medium'>
                    <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-center gap-1'>
                        <Link href={{ pathname: `alunos/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                            <FluencyButton variant='gray' className='!px-3 !mr-0'>
                                Painel <PiNotebook className='w-5 h-auto'/>
                            </FluencyButton>
                        </Link>
                        <div className='flex flex-row items-center justify-center gap-1'>
                            <Link href={{ pathname: `alunos/caderno/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                <FluencyButton variant='solid' className='!px-2.5 !mr-0'><TbBook2 className='w-5 h-auto' /></FluencyButton>
                            </Link>
                            <SettingBottomSheet studentId={student.id} studentName={student.name} />
                        </div>
                    </div>
                    <OverDue studentId={student.id} />
                </div> 
            </div>

            <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 p-2 px-4 flex flex-col items-center rounded-lg gap-2 w-full">
                <div className='flex flex-row justify-around w-full items-center gap-3'>
                    <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-center gap-3">
                        <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-2'>
                            <select
                                className="ease-in-out duration-300 px-2 py-1 rounded-lg border-2 border-fluency-pages-light outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                value={student.selectedMonth}
                                onChange={(e) => {
                                    const updatedStudents = students.map((s) =>
                                        s.id === student.id ? { ...s, selectedMonth: e.target.value } : s
                                    );
                                    setStudents(updatedStudents);
                                }}
                            >
                                {monthsPT.map((month, index) => (
                                    <option key={index} value={months[index]}>{month}</option>
                                ))}
                            </select>

                            <select
                                className="ease-in-out duration-300 px-2 py-1 rounded-lg border-2 border-fluency-pages-light outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                value={student.selectedYear}
                                onChange={(e) => {
                                    const updatedStudents = students.map((s) =>
                                        s.id === student.id ? { ...s, selectedYear: parseInt(e.target.value) } : s
                                    );
                                    setStudents(updatedStudents);
                                }}
                            >
                                {years.map((year, index) => (
                                    <option key={index} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <AddClass studentId={student.id} />
                    </div>
                </div>

                {student.classDatesWithStatus
                    .filter((classDate) => {
                        const dateMonth = months[classDate.date.getMonth()];
                        const dateYear = classDate.date.getFullYear();
                        return dateMonth === student.selectedMonth && dateYear === student.selectedYear;
                    })
                    .slice(0, student.showAllDates ? student.classDatesWithStatus.length : 4)
                    .map((classDate, index) => (
                        <ClassDateItem
                            key={index}
                            date={classDate.date}
                            status={classDate.status}
                            onDone={() => handleDone(student.id, classDate.date)}
                            onCancel={() => handleCanceled(student.id, classDate.date)}
                            onDelete={() => handleDelete(student.id, classDate.date)}
                        />
                    ))}

                {student.classDatesWithStatus.length > 4 && (
                    <button
                        onClick={() => {
                            const updatedStudents = students.map((s) =>
                                s.id === student.id ? { ...s, showAllDates: !s.showAllDates } : s
                            );
                            setStudents(updatedStudents);
                        }}
                        className="p-2 font-semibold text-fluency-gray-500 hover:text-fluency-gray-700 dark:text-fluency-gray-100 dark:hover:text-fluency-gray-200 duration-300 ease-in-out transition-all hover:font-bold"
                    >
                        {student.showAllDates ? 'Mostrar menos aulas' : 'Mostrar todas aulas'}
                    </button>
                )}
            </div>
        </div>
        ))}       
    </div>
    );
}

export default Paineis;