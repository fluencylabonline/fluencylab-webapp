'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/app/firebase';

import { toast, Toaster } from 'react-hot-toast';

import { FaRegCalendarCheck, FaRegCalendarTimes, FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { CiCircleQuestion } from 'react-icons/ci';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { Tooltip } from '@nextui-org/react';

interface Aluno {
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
    chooseProfessor: string;
    professorId: string;
    diaAula?: string;
    profilePicUrl?: string;
    frequencia: number;
    classDatesWithStatus: { date: Date; status: string }[]; // Add this property
}


interface ClassData {
    date: Date;
    status: string;
}

// Modal Component
function OverdueClassesModal({ overdueClasses, onClose }: { overdueClasses: ClassData[], onClose: () => void }) {
    const getDayOfWeekInPortuguese = (dayIndex: number) => {
        const weekdaysPT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return weekdaysPT[dayIndex];
    };
    
    return (
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">
                    <button onClick={onClose} className="absolute top-0 left-0 mt-2 ml-2 ">
                        <span className="sr-only">Fechar</span>
                        <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-red-600 ease-in-out duration-300" />
                    </button>
                    <h3 className="text-xl font-bold text-center leading-6 mb-4 text-fluency-red-600">
                        Aulas em Atraso
                    </h3>
                    <div className='flex flex-col font-semibold gap-2 text-left'>
                        {overdueClasses.map((classData, index) => (
                            <p key={index}>
                                {getDayOfWeekInPortuguese(classData.date.getDay())}, {classData.date.toLocaleDateString('pt-BR')}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


function Alunos(){
    const { data: session } = useSession();
    const [sessionIdFetched, setSessionIdFetched] = useState(false);
   
    const [students, setStudents] = useState<Aluno[]>([]);
    const currentDate = new Date();
    const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const months = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
    const currentMonthIndex = currentDate.getMonth();
    const [currentMonth, setCurrentMonth] = useState<string>(months[new Date().getMonth()]);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

    const [filteredStudents, setFilteredStudents] = useState<Aluno[]>([]);
    useEffect(() => {
        const filteredStudentsData = students.map((student) => {
            const classDatesWithStatus = student.classDatesWithStatus.filter((classDate) => {
                const classMonth = classDate.date.getMonth();
                const classYear = classDate.date.getFullYear();
                return classMonth === months.indexOf(currentMonth) && classYear === currentYear;
            });
        
            const doneClassesCount = classDatesWithStatus.filter((classDate) => classDate.status === 'Feita').length;
        
            return {
                ...student,
                doneClassesCount: doneClassesCount,
                classDatesWithStatus: classDatesWithStatus,
            };
        });
       
        // Update the filtered students state
        setFilteredStudents(filteredStudentsData);
    }, [currentMonth, currentYear, students, months]);
      
      const years: number[] = [];
      const startYear = 2024; // Change this if needed
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
    
      const getClassDatesForCurrentMonth = useCallback((diaAula: string, frequencia: number) => {
        const daysOfWeek = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
        const targetDayIndex = daysOfWeek.indexOf(diaAula);
    
        const classDates = [];
        let currentDatePointer = new Date(currentYear, currentMonthIndex, 1);
    
        // Iterate over all days of the month
        while (currentDatePointer.getMonth() === currentMonthIndex) {
            if (currentDatePointer.getDay() === targetDayIndex) {
                classDates.push(new Date(currentDatePointer));
            }
            currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        }
    
        const weeks = [];
        let week: Date[] = [];
        classDates.forEach(date => {
            const weekNumber = Math.ceil((date.getDate() + ((date.getDay() + 1) % 7)) / 7);
            if (weekNumber > weeks.length) {
                weeks.push([...week]);
                week = [];
            }
            week.push(date);
        });
    
        if (week.length > 0) {
            weeks.push([...week]);
        }
    
        return weeks;
    }, [currentMonthIndex, currentYear]); 
    
      const fetchData = useCallback(async (teacherId: string) => {
        let studentList: any[] = [];
        try {                

            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'student'),where('professorId', '==', teacherId));
            const querySnapshot = await getDocs(q);
    
            // Retrieve user profile picture URLs and count of 'Feita' classes
            const studentDataPromises = querySnapshot.docs.map(async (doc) => {
                const studentId = doc.id;
                const storage = getStorage();
                const userProfilePicRef = ref(storage, `profilePictures/${studentId}`);

                let url: string | null = null; // Initialize with default URL

                try {
                    // Attempt to fetch the profile picture URL
                    url = await getDownloadURL(userProfilePicRef);
                } catch (error) {
                    // Handle the error if profile picture fetching fails
                    console.error('Error fetching profile picture for student:', error);
                }
    
                try {
                    // Get count of 'Feita' classes
                    const userDoc = await getDoc(doc.ref);
                    const userData = userDoc.data() as Aluno;
                    const classesData = userData.Classes || {};
                    let doneClassesCount = 0;
                    // Calculate the number of overdue classes
                    let overdueClassesCount = 0;
                    // Array to store class dates with status
                    const classDatesWithStatus: { date: Date; status: string }[] = [];
    
                    // Loop through the class data
                    for (const yearKey of Object.keys(classesData)) {
                        const year = parseInt(yearKey); // Convert yearKey to number
                        for (const monthKey of Object.keys(classesData[yearKey])) {
                            for (const dayKey of Object.keys(classesData[yearKey][monthKey])) {
                                const classStatus = classesData[yearKey][monthKey][dayKey];
                                const classDate = new Date(year, months.indexOf(monthKey), parseInt(dayKey));
    
                                const currentDate = new Date();
                                if (classStatus === 'Feita') {
                                    doneClassesCount++;
                                }
                                // Check if the class is marked as 'Feita' or 'Cancelada'
                                if (classStatus !== 'Feita' && classStatus !== 'Cancelada') {
                                    // Check if the class date is in the past
                                    if (classDate < currentDate) {
                                        overdueClassesCount++;
                                    }
                                }
                                // Push class date and status to classDatesWithStatus array
                                classDatesWithStatus.push({ date: classDate, status: classStatus });
                            }
                        }
                    }
    
                    if (userData.diaAula) {
                        const weeks = getClassDatesForCurrentMonth(userData.diaAula, userData.frequencia);
                        insertUndoneDates(studentId, weeks);
                    }
    
                    return {
                        id: studentId,
                        name: userData.name,
                        email: userData.email,
                        number: userData.number,
                        userName: userData.userName,
                        mensalidade: userData.mensalidade,
                        idioma: [],
                        teacherEmails: [],
                        diaAula: userData.diaAula,
                        chooseProfessor: userData.chooseProfessor,
                        frequencia: userData.frequencia,
                        doneClassesCount: doneClassesCount,
                        overdueClassesCount: overdueClassesCount,
                        classDatesWithStatus: classDatesWithStatus,
                        profilePicUrl: url,
                    };
                } catch (error) {
                    console.error('Error fetching profile picture for student:', error);
                    return null;
                }
            });
    
            const studentData = await Promise.all(studentDataPromises);
            studentList = studentData.filter((data) => data !== null);
    
            // Set studentList state
            setStudents(studentList);

        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }, [setStudents, months, getClassDatesForCurrentMonth]);
    
    useEffect(() => {
        if (session && !sessionIdFetched) {
            fetchData(session.user.id);
            setSessionIdFetched(true);
        }
    }, [session, sessionIdFetched, fetchData]);

    // Function to generate class dates for the current month
    
    
    const handleClassStatus = async (studentId: string, date: Date, action: string) => {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const currentYear = date.getFullYear();
            const currentMonth = months[date.getMonth()];

            // Construct the path to the classes for the current year and month
            const classesRef = doc(db, `users/${studentId}`);
            const userDoc = await getDoc(classesRef);
            
            if (userDoc.exists()) {
                const userData = userDoc.data() as Aluno;
                let classes = userData.Classes || {};

                // Ensure the structure for current year exists
                classes[currentYear] = classes[currentYear] || {};

                // Ensure the structure for current month exists
                classes[currentYear][currentMonth] = classes[currentYear][currentMonth] || {};

                // Update the class status for the given date
                const dayOfMonth = date.getDate().toString();
                classes[currentYear][currentMonth][dayOfMonth] = action;

                // Save the updated classes data
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

    const handleDone = async (studentId: string, date: Date) => {
        try {
            // Update class status in Firestore
            await handleClassStatus(studentId, date, 'Feita');
            // Update local state to reflect the change immediately
            setStudents(prevStudents => {
                const updatedStudents = prevStudents.map(student => {
                    if (student.id === studentId) {
                        // Update classDatesWithStatus for the specific class date
                        const updatedClassDatesWithStatus = student.classDatesWithStatus.map(classDate => {
                            if (classDate.date === date) {
                                return { ...classDate, status: 'Feita' }; // Update status to 'Feita'
                            } else {
                                return classDate;
                            }
                        });
                        // Return the updated student object
                        return { ...student, classDatesWithStatus: updatedClassDatesWithStatus };
                    } else {
                        return student;
                    }
                });
                return updatedStudents;
            });
            // Show success toast
            toast.success('Parabéns! Aula registrada.', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error updating class status:', error);
        }
    };
    
    const handleCanceled = async (studentId: string, date: Date) => {
        try {
            // Update class status in Firestore
            await handleClassStatus(studentId, date, 'Cancelada');
            // Update local state to reflect the change immediately
            setStudents(prevStudents => {
                const updatedStudents = prevStudents.map(student => {
                    if (student.id === studentId) {
                        // Update classDatesWithStatus for the specific class date
                        const updatedClassDatesWithStatus = student.classDatesWithStatus.map(classDate => {
                            if (classDate.date === date) {
                                return { ...classDate, status: 'Cancelada' }; // Update status to 'Cancelada'
                            } else {
                                return classDate;
                            }
                        });
                        // Return the updated student object
                        return { ...student, classDatesWithStatus: updatedClassDatesWithStatus };
                    } else {
                        return student;
                    }
                });
                return updatedStudents;
            });
            // Show success toast
            toast.error('Cancelamento registrado.', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error updating class status:', error);
        }
    };

    const insertUndoneDates = async (studentId: string, weeks: any[]) => {
        try {
            console.log("Estrutura do status das aulas atualizado");
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
        
            // Construct the path to the classes for the current year and month
            const classesRef = doc(db, `users/${studentId}`);
            const userDoc = await getDoc(classesRef);
        
            if (userDoc.exists()) {
                const userData = userDoc.data() as Aluno;
                let classes = userData.Classes || {};
        
                // Ensure the structure for current year exists
                classes[currentYear] = classes[currentYear] || {};
        
                // Ensure the structure for current month exists
                classes[currentYear][months[currentMonth]] = classes[currentYear][months[currentMonth]] || {};
        
                // Iterate through weeks and dates to add new dates if they don't exist
                weeks.forEach((week: any[]) => {
                    week.forEach((date: Date) => {
                        const dayOfMonth = date.getDate().toString();
        
                        // Check if the date already exists, if not, add it
                        if (!classes[currentYear][months[currentMonth]][dayOfMonth]) {
                            const currentDate = new Date();
                            if (date < currentDate) {
                                classes[currentYear][months[currentMonth]][dayOfMonth] = 'Atrasada';
                            } else {
                                classes[currentYear][months[currentMonth]][dayOfMonth] = 'À Fazer';
                            }
                        }
                    });
                });
        
                // Save the updated classes data
                await updateDoc(classesRef, {
                    Classes: classes
                });
            } else {
                console.error('User not found');
            }
        } catch (error) {
            console.error('Error inserting undone dates:', error);
        }
    };

    const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
        const openInstrucoes = () => {
            setIsInstrucoesOpen(true);
        };
    
        const closeInstrucoes = () => {
            setIsInstrucoesOpen(false);
        };  
        
        
    const [overdueClasses, setOverdueClasses] = useState<ClassData[]>([]); // State to track overdue classes
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to open modal and pass overdue classes
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    
    // Function to retrieve all overdue classes
    const retrieveOverdueClasses = () => {
        const allOverdueClasses = students.flatMap(student => student.classDatesWithStatus.filter(classData => classData.status === 'Atrasada'));
        setOverdueClasses(allOverdueClasses);
        openModal(); // Open modal when classes are retrieved
    };
    
      
    return(
        <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     
                {isModalOpen && <OverdueClassesModal overdueClasses={overdueClasses} onClose={closeModal} />}   
                <div className=" text-fluency-text-light dark:text-fluency-text-dark mt-4 fade-in fade-out w-full h-[95vh] p-4 overflow-y-auto">

                <div className='flex flex-col gap-3 lg:items-start md:items-start items-center'>
                    {filteredStudents.map((student) => (
                        <div className="bg-fluency-blue-200 dark:bg-fluency-pages-dark lg:flex lg:flex-row md:flex md:flex-row flex flex-col p-3 items-strecht justify-between rounded-lg gap-3" key={student.id}>
                            <div className='bg-fluency-pages-light dark:bg-fluency-gray-500 p-2 px-4 flex flex-col items-start justify-between rounded-lg gap-2'>
                                    <div className='flex flex-row items-start gap-4'>
                                        <div key={student.id}>
                                            {student.profilePicUrl ? (
                                                <img src={student.profilePicUrl} alt="Profile"  className='w-[4rem] h-[4rem] object-cover rounded-full'/>
                                            ) : (
                                                <div className="cursor-pointer relative inline-block">
                                                    <FaUserCircle className='text-[4rem] object-cover rounded-full' />
                                                    <Tooltip className='bg-fluency-yellow-500 text-white dark:text-black text-xs font-bold p-1 rounded-md' content="Sem foto de perfil">
                                                        <span className="absolute top-0 right-0 w-4 h-4 bg-fluency-yellow-500 border-2 border-white rounded-full animate-pulse"></span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-lg'>{student.name}</p>
                                            <p className='font-medium text-xs'>{student.number}</p>
                                            <p className='font-medium text-xs'>Dia da aula: <span>{student.diaAula}</span></p>                                        
                                        </div>
                                    </div>
                                    <div className='flex font-medium flex-col items-center w-full'>
                                        <p className='text-md font-semibold'>Aulas feitas: <span>{student.doneClassesCount}</span></p>
                                        <p className='text-md cursor-pointer font-semibold p-1 rounded-md hover:text-fluency-blue-600 hover:dark:bg-fluency-gray-600 hover:dark:text-fluency-blue-300 hover:bg-fluency-blue-100 transition-all duration-300 ease-in-out' onClick={retrieveOverdueClasses}>Aulas em atraso: <span>{student.overdueClassesCount}</span></p>
                                    </div>  
                                    <div className="flex flex-row items-center justify-around w-full gap-2 mt-2">
                                        <Link href={{ pathname: `alunos/caderno/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                            <button className="font-medium px-3 py-2 text-center text-sm rounded-lg border border-fluency-yellow-500 hover:border-fluency-yellow-600 bg-fluency-yellow-500 text-fluency-text-dark hover:bg-fluency-yellow-600 focus:bg-fluency-yellow-700 transition-all ease-in-out duration-100 dark:bg-transparent dark:text-fluency-yellow-500 dark:hover:text-white dark:hover:bg-fluency-yellow-500 hover:dark:border-fluency-yellow-500">
                                                Caderno 
                                            </button>
                                        </Link>
                                        <Link href={{ pathname: `alunos/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                            <button className="font-medium px-3 py-2 text-center text-sm rounded-lg border border-fluency-yellow-500 hover:border-fluency-yellow-600 bg-fluency-yellow-500 text-fluency-text-dark hover:bg-fluency-yellow-600 focus:bg-fluency-yellow-700 transition-all ease-in-out duration-100 dark:bg-transparent dark:text-fluency-yellow-500 dark:hover:text-white dark:hover:bg-fluency-yellow-500 hover:dark:border-fluency-yellow-500">
                                                Painel do Aluno 
                                            </button>
                                        </Link>
                                    </div>
                            </div>

                            <div className="bg-fluency-pages-light dark:bg-fluency-gray-500 p-2 px-4 flex flex-col items-center rounded-lg gap-2">
                                <div className='flex flex-row justify-around w-full items-center gap-3'>
                                    
                                    <CiCircleQuestion className='text-transparent'/>
                                    
                                    <div className="flex flex-row items-center justify-center gap-3">
                                        <select
                                            className="ease-in-out duration-300 px-2 py-1 rounded-lg border-2 border-fluency-pages-light outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                                            value={currentMonth}
                                            onChange={(e) => setCurrentMonth(e.target.value)}
                                        >
                                            {monthsPT.map((month, index) => (
                                                <option key={index} value={months[index]}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                        className="ease-in-out duration-300 px-2 py-1 rounded-lg border-2 border-fluency-pages-light outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                                        value={currentYear}
                                            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                        >
                                            {years.map((year, index) => (
                                                <option key={index} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <CiCircleQuestion className='text-lg cursor-pointer' onClick={openInstrucoes}/>

                                </div>
                                {student.classDatesWithStatus.map((classDate, index) => (
                                    <div key={index} className="flex flex-row gap-2 items-center justify-center">
                                        <div className="group cursor-pointer relative inline-block text-center">
                                            <p className={`flex flex-row font-semibold gap-1 p-1 px-2 text-sm rounded-lg ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-600' : classDate.status === 'Atrasada' ? 'text-fluency-red-600' : '' }`}>
                                                {`${classDate.date.getDate()} de ${monthsPT[classDate.date.getMonth()]} de ${classDate.date.getFullYear()}`}
                                            </p>

                                            <div className={`opacity-0 transition-all duration-500 ease-in-out w-28 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none  ${classDate.status === 'Feita' ? 'text-fluency-text-dark bg-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-text-dark bg-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-text-dark bg-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-text-dark bg-fluency-red-500' : '' }`}>
                                                {classDate.status}                        
                                                <svg className={`absolute h-2 w-full left-0 top-full ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-red-500' : '' }`} x="0px" y="0px" viewBox="0 0 255 255" ><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                            </div>
                                        </div>                                        
                                        
                                        <button
                                            className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-blue-200 hover:bg-fluency-blue-300 transition-all duration-300 ease-in-out hover:dark:bg-fluency-blue-700 dark:bg-fluency-blue-800"
                                            onClick={() => handleDone(student.id, classDate.date)}
                                        >
                                            Feita
                                            <FaRegCalendarCheck className='icon' />
                                        </button>
                                        <button
                                            className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-yellow-300 hover:bg-fluency-yellow-400 transition-all duration-300 ease-in-out hover:dark:bg-fluency-yellow-500 dark:bg-fluency-yellow-600"
                                            onClick={() => handleCanceled(student.id, classDate.date)}
                                        >
                                            Cancelar
                                            <FaRegCalendarTimes className='icon' />
                                        </button>      
                                    </div>
                                ))}
                            </div>
                        </div>))}       

                </div>
            </div>

            <Toaster />

            {isInstrucoesOpen && 
                <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
                <div className="flex items-center justify-center min-h-screen">

                        <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                    <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                                
                            <button onClick={closeInstrucoes} className="absolute top-0 left-0 mt-2 ml-2 ">
                                <span className="sr-only">Fechar</span>
                                <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-blue-600 ease-in-out duration-300" />
                            </button>
                    
                            <h3 className="text-xl font-bold text-center leading-6 mb-4">
                                Instruções
                            </h3>   

                        <div className='text-justify flex gap-1 flex-col'>
                            <span>1. Se não conseguir fazer uma aula, simplesmente não marque como feita até fazer a reposição.</span>
                            <span>2. Se não for fazer a reposição marque como cancelada.</span>
                            <span>3. Clique ou passe o mouse em cima de cada data para saber o status de cada uma.</span>
                            <p className='mt-2 font-semibold'>Cores:</p>
                            <span className='ml-2 font-medium'><span className='font-semibold text-fluency-red-600'>Vermelho</span> são aulas atrasadas que não foram nem canceladas nem feitas</span>
                            <span className='ml-2 font-medium'><span className='font-semibold text-fluency-green-600'>Verde</span> são as aulas feitas.</span>
                            <span className='ml-2 font-medium'><span className='font-semibold text-fluency-yellow-600'>Amarelo</span> são as aulas canceladas.</span>
                            <span className='ml-2 font-medium'><span className='font-semibold text-fluency-blue-600'>Azul</span> são as aulas ainda por fazer.</span>  
                        </div>                                                      
                    </div>
                </div>
            </div>}
        </div>
    );
}

export default Alunos;