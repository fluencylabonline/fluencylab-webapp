'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { db } from '@/app/firebase';

import { toast, Toaster } from 'react-hot-toast';

import { FaRegCalendarAlt, FaRegCalendarCheck, FaRegCalendarTimes, FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { CiCircleQuestion } from 'react-icons/ci';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Tooltip } from '@nextui-org/react';

import FluencyInput from '@/app/ui/Components/Input/input';
import { TbBook2 } from 'react-icons/tb';
import { PiExam } from 'react-icons/pi';
import { LuLayoutPanelTop } from 'react-icons/lu';

import LoadingAnimation from '@/app/ui/Animations/LoadingAnimation';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

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
    diaAula?: string[];
    profilePicUrl?: string;
    frequencia: number;
    classDatesWithStatus: { date: Date; status: string }[];
    status: string;
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
                        <IoClose className="w-10 h-10 text-fluency-gray-500 dark:text-fluency-gray-100 hover:text-fluency-red-600 hover:dark:text-fluency-red-600 ease-in-out duration-300" />
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
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const currentMonthIndex = currentDate.getMonth();
    const [currentMonth, setCurrentMonth] = useState<string>(months[new Date().getMonth()]);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStudents, setFilteredStudents] = useState<Aluno[]>([]);
    
    const [editingDate, setEditingDate] = useState<{ studentId: string, date: Date } | null>(null);
    const [newDate, setNewDate] = useState<Date | null>(null);

    // Function to filter students based on search query
    const filterStudents = useCallback(() => {
        if (!searchQuery) {
            setFilteredStudents(students); // Show all students if search query is empty
            return;
        }

        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    // Update filtered students when search query changes
    useEffect(() => {
        filterStudents();
    }, [filterStudents]);

    // Event handler to update search query
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

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

    const getClassDatesForCurrentMonth = useCallback((diasAula: string[], frequencia: number) => {
        const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        const targetDayIndexes = diasAula.map(dia => daysOfWeek.indexOf(dia));
        const classDates: Date[] = [];

        const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate(); // Get total days in the month

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(currentYear, currentMonthIndex, day);
            const dayOfWeek = currentDate.getDay(); // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)

            // Check if the day matches any of the specified class days
            if (diasAula.includes(daysOfWeek[dayOfWeek])) {
                classDates.push(currentDate); // Add the date to the list of class dates
            }
        }
        
        return classDates;
    }, [currentMonthIndex, currentYear]);
    
    const fetchData = useCallback(async (teacherId: string) => {
        let studentList: any[] = [];
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', teacherId));
            const querySnapshot = await getDocs(q);
    
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
                                if (classStatus !== 'Modificada') { // Exclude "Modificada" status
                                    classDatesWithStatus.push({ date: classDate, status: classStatus });
                                }
                            }
                        }
                    }
    
                    if (userData.diaAula) {
                        const classDates = getClassDatesForCurrentMonth(userData.diaAula, userData.frequencia);
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
                        chooseProfessor: userData.chooseProfessor,
                        frequencia: userData.frequencia,
                        doneClassesCount: doneClassesCount,
                        overdueClassesCount: overdueClassesCount,
                        classDatesWithStatus: classDatesWithStatus,
                        profilePicUrl: url,
                        status: userData.status,
                    };
                } catch (error) {
                    console.error('Error fetching profile picture for student:', error);
                    return null;
                }
            });
    
            const studentData = await Promise.all(studentDataPromises);
            studentList = studentData.filter((data) => data !== null);
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

    const insertUndoneDates = async (studentId: string, classDates: Date[]) => {
        try {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    
    const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
        const openInstrucoes = () => {
            setIsInstrucoesOpen(true);
        };

        const closeInstrucoes = () => {
            setIsInstrucoesOpen(false);
        };  
        
    const [overdueClasses, setOverdueClasses] = useState<ClassData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
        const openModal = () => {
            setIsModalOpen(true);
        };

        const closeModal = () => {
            setIsModalOpen(false);
        };

    const retrieveOverdueClasses = (studentId: string) => {
        const clickedStudent = students.find(student => student.id === studentId);
        if (clickedStudent) {
            const overdueClassesForStudent = clickedStudent.classDatesWithStatus.filter(classData => classData.status === 'Atrasada');
            setOverdueClasses(overdueClassesForStudent);
            openModal();
        }
    };

    const openEditingModal = (studentId: string, date: Date) => {
        setEditingDate({ studentId, date });
        setNewDate(date);
    };

    const handleSaveNewDate = async () => {
        if (editingDate && newDate) {
            try {
                // Adjust the newDate by adding one day to account for the discrepancy
                const adjustedDate = new Date(newDate);
                adjustedDate.setDate(adjustedDate.getDate() + 1);
    
                const { studentId, date } = editingDate;
                
                // First, remove the old date entry
                await handleClassStatus(studentId, date, 'Modificada'); // Mark the old date as 'Modificada'
    
                // Then, set the new date
                await handleClassStatus(studentId, adjustedDate, 'Feita'); // Update the status to 'Feita'
    
                // Update the local state
                setStudents(prevStudents => {
                    const updatedStudents = prevStudents.map(student => {
                        if (student.id === studentId) {
                            // Update classDatesWithStatus to reflect the changes
                            const updatedClassDatesWithStatus = student.classDatesWithStatus.map(classDate => {
                                if (classDate.date.getTime() === date.getTime()) {
                                    return { ...classDate, status: 'Modificada' }; // Update the old date status
                                } else if (classDate.date.getTime() === adjustedDate.getTime()) {
                                    return { ...classDate, status: 'À Fazer' }; // Update the new date status
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
    
                toast.success('Data da aula atualizada com sucesso!');
                setEditingDate(null);
                setNewDate(null);
                
                if(session){
                    fetchData(session.user.id);
                }
    
            } catch (error) {
                toast.error('Erro ao atualizar a data da aula.');
                console.error('Error updating class date:', error);
            }
        }
    };

    const [editingDay, setEditingDay] = useState<{ studentId: string } | null>(null);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    useEffect(() => {
        if (editingDay) {
            const fetchDays = async () => {
                const classRef = doc(db, `users/${editingDay.studentId}`);
                const docSnap = await getDoc(classRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedDays(data.diaAula || []);
                }
            };
            fetchDays();
        }
    }, [editingDay]);

    const openEditingDayModal = (studentId: string) => {
        setEditingDay({ studentId });
    };

    const handleDayChange = async () => {
        if (!editingDay) return;

        try {
            const classRef = doc(db, `users/${editingDay.studentId}`);
            await updateDoc(classRef, {
                diaAula: selectedDays,
            });
            toast.success('Dia de aula atualizado para o mês seguinte!');
            setEditingDay(null);
           
        } catch (error) {
            console.error('Error updating class days:', error);
        }
    };

    const handleCheckboxChange = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const [showAllDates, setShowAllDates] = useState(false);

    const toggleShowAllDates = () => {
        setShowAllDates((prev) => !prev);
    };

return(
    <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     
        <Toaster />
        {isModalOpen && <OverdueClassesModal overdueClasses={overdueClasses} onClose={closeModal} />}   
    
        <FluencyInput
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar aluno..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100"
        />

        <div className=" text-fluency-text-light dark:text-fluency-text-dark mt-4 fade-in fade-out w-full h-[95vh] overflow-y-auto">
            <div className='flex flex-col gap-3 lg:items-start md:items-start items-center'>
                {filteredStudents.length === 0 && 
                <div className="flex items-center justify-center h-[70vh] min-w-full z-30">
                    <LoadingAnimation />
                </div>}
                {filteredStudents.map((student) => (
                    <div className="bg-fluency-gray-200 dark:bg-fluency-pages-dark w-full lg:flex lg:flex-row md:flex md:flex-row flex flex-col p-3 items-strecht justify-between rounded-lg gap-3" key={student.id}>
                        <div className='bg-fluency-gray-100 dark:bg-fluency-gray-500 w-full p-3 px-1 flex flex-col items-start justify-between rounded-lg gap-1'>
                            <div className='flex flex-row items-start gap-3'>
                                <div className='ml-2 sm:ml-4' key={student.id}>
                                    {student.profilePicUrl ? (
                                        <div className="cursor-pointer relative inline-block">
                                        {student.status === 'online' ? (
                                            <>
                                            <img src={student.profilePicUrl} alt="Profile" className='w-[6rem] h-[6rem] object-cover rounded-full'/>
                                            <Tooltip className='bg-fluency-green-500 text-white dark:text-black text-xs font-bold p-1 rounded-md' content="Online">
                                                <span className="absolute top-0 right-2 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                                            </Tooltip>
                                            </>
                                        ):(
                                            <>
                                            <img src={student.profilePicUrl} alt="Profile" className='w-[6rem] h-[6rem] object-cover rounded-full'/>
                                            <Tooltip className='bg-fluency-red-500 text-white dark:text-black text-xs font-bold p-1 rounded-md' content="Offline">
                                                <span className="absolute top-0 right-2 w-4 h-4 bg-fluency-red-700 border-2 border-white rounded-full"></span>
                                            </Tooltip>
                                            </>
                                        )}  
                                        </div>
                                    ) : (
                                    <div className="cursor-pointer relative inline-block">
                                        {student.status === 'online' ? (
                                            <>
                                            <FaUserCircle className='text-[5rem] text-fluency-gray-200 dark:text-fluency-pages-dark object-cover rounded-full' />
                                            <Tooltip className='bg-fluency-green-500 text-white dark:text-black text-xs font-bold p-1 rounded-md' content="Online">
                                                <span className="absolute top-0 right-2 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                                            </Tooltip>
                                            </>
                                        ):(
                                            <>
                                            <FaUserCircle className='text-[5rem] text-fluency-gray-200 dark:text-fluency-pages-dark object-cover rounded-full' />
                                            <Tooltip className='bg-fluency-red-500 text-white dark:text-black text-xs font-bold p-1 rounded-md' content="Offline">
                                                <span className="absolute top-0 right-2 w-4 h-4 bg-fluency-red-700 border-2 border-white rounded-full"></span>
                                            </Tooltip>
                                            </>
                                        )}  
                                    </div>
                                    )}
                                </div>
                                <div>
                                    <p className='font-semibold text-lg'>{student.name}</p>
                                    <p className='font-medium text-xs'>{student.number}</p>
                                    <p className="font-bold text-xs bg-fluency-blue-400 dark:bg-fluency-blue-900 px-2 py-[2px] rounded-md text-white">Dias de aula:
                                        {student.diaAula?.map((dia) => (
                                        <span className='ml-1' key={dia}>{dia}, </span>
                                        ))}
                                    </p>    
                                    <button 
                                        onClick={() => openEditingDayModal(student.id)}
                                        className='px-2 p-1 text-xs mt-1 rounded-md font-bold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white duration-300 ease-in-out transition-all'
                                        >Mudar dia de aula
                                    </button>                                    
                                </div>
                            </div>
                            <div className='flex font-medium flex-col items-center w-full'>
                                <p className='text-lg font-semibold'>Aulas feitas: <span>{student.doneClassesCount}</span></p>
                                <p className='text-lg cursor-pointer font-semibold p-1 rounded-md hover:text-fluency-blue-600 hover:dark:bg-fluency-gray-600 hover:dark:text-fluency-blue-300 hover:bg-fluency-blue-100 transition-all duration-300 ease-in-out' onClick={() => retrieveOverdueClasses(student.id)}>Aulas em atraso: <span>{student.overdueClassesCount}</span></p>
                            </div>  
                            <div className="lg:flex lg:flex-row md:flex md:flex-col sm:gap-0 gap-1 flex flex-col items-center justify-center w-full mt-3 mb-2">
                                <Link href={{ pathname: `alunos/caderno/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                    <FluencyButton>
                                        Caderno <TbBook2 className='w-5 h-auto' />
                                    </FluencyButton>
                                </Link>
                                <Link href={{ pathname: `alunos/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                    <FluencyButton variant='confirm'>
                                        Painel <LuLayoutPanelTop className='w-5 h-auto'/>
                                    </FluencyButton>
                                </Link>
                                <Link href={{ pathname: `alunos/nivelamento/${encodeURIComponent(student.name)}`, query: { id: student.id } }} passHref>
                                    <FluencyButton variant='gray'>
                                        Nivelamento <PiExam className='w-5 h-auto'/>
                                    </FluencyButton>
                                </Link>
                            </div>
                    </div>

                    <div className="bg-fluency-gray-100 dark:bg-fluency-gray-500 p-2 px-4 flex flex-col items-center rounded-lg gap-2 w-full">
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
                        {student.classDatesWithStatus.slice(0, showAllDates ? student.classDatesWithStatus.length : 4).map((classDate, index) => (
                            <div key={index} className="flex flex-row gap-2 items-center justify-center">
                                <div className="group cursor-pointer relative inline-block text-center">
                                    <p className={`flex flex-row font-semibold gap-1 p-1 px-2 rounded-lg text-sm ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-600' : classDate.status === 'Atrasada' ? 'text-fluency-red-600' : ''}`}>
                                        <span className="md:hidden lg:hidden ">{`${classDate.date.getDate()}/${monthsPT[classDate.date.getMonth()]}`}</span>
                                        <span className="hidden sm:inline">{`${classDate.date.getDate()} de ${monthsPT[classDate.date.getMonth()]} de ${classDate.date.getFullYear()}`}</span>
                                    </p>

                                    <div className={`opacity-0 transition-all duration-500 ease-in-out w-28 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none ${classDate.status === 'Feita' ? 'text-fluency-text-dark bg-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-text-dark bg-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-text-dark bg-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-text-dark bg-fluency-red-500' : ''}`}>
                                        {classDate.status}
                                        <svg className={`absolute h-2 w-full left-0 top-full ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-red-500' : ''}`} x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                                    </div>
                                </div>

                                <Tooltip content="Marcar aula como feita" className='bg-fluency-blue-400 px-2 rounded-md font-bold text-white'>
                                    <button
                                        className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-blue-200 hover:bg-fluency-blue-300 transition-all duration-300 ease-in-out hover:dark:bg-fluency-blue-700 dark:bg-fluency-blue-800"
                                        onClick={() => handleDone(student.id, classDate.date)}
                                    >
                                        Feita
                                        <FaRegCalendarCheck className='icon' />
                                    </button>
                                </Tooltip>

                                <Tooltip content="Marcar aula como cancelada" className='bg-fluency-yellow-400 px-2 rounded-md font-bold text-white'>
                                    <button
                                        className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-yellow-300 hover:bg-fluency-yellow-400 transition-all duration-300 ease-in-out hover:dark:bg-fluency-yellow-500 dark:bg-fluency-yellow-600"
                                        onClick={() => handleCanceled(student.id, classDate.date)}
                                    >
                                        Cancelar
                                        <FaRegCalendarTimes className='icon' />
                                    </button>
                                </Tooltip>

                                <Tooltip content="Editar data de aula" className='bg-fluency-gray-400 px-2 rounded-md font-bold text-white'>
                                    <button
                                        className="flex flex-row gap-1 text-xs items-center py-1 px-2 text-white rounded-lg font-bold bg-fluency-gray-300 hover:bg-fluency-gray-400 transition-all duration-300 ease-in-out hover:dark:bg-fluency-gray-500 dark:bg-fluency-gray-600"
                                        onClick={() => openEditingModal(student.id, classDate.date)}
                                    >
                                        Editar
                                        <FaRegCalendarAlt className='icon' />
                                    </button>
                                </Tooltip>
                            </div>
                                ))}
                                {student.classDatesWithStatus.length > 4 && (
                                    <button onClick={toggleShowAllDates} className="p-2 font-semibold text-fluency-gray-500 hover:text-fluency-gray-700 dark:text-fluency-gray-100 dark:hover:text-fluency-gray-200 duration-300 ease-in-out transition-all hover:font-bold">
                                        {showAllDates ? 'Mostrar menos aulas' : 'Mostrar todas aulas'}
                                    </button>
                                )}
                            </div>
                        </div>))}       
                    </div>
                </div>

    {editingDate && 
    <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">

                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8 mx-4">                        
                        
                <FluencyCloseButton onClick={() => setEditingDate(null)} />
        
                <h3 className="text-xl font-bold text-center leading-6 mb-4">
                    Mude o dia dessa aula
                </h3>   

                <div className='flex flex-row gap-2 justify-center items-center'>
                    <input
                    type="date"
                    value={newDate ? newDate.toISOString().slice(0, 10) : ''}
                    onChange={(e) => setNewDate(new Date(e.target.value))}
                    className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 px-3 rounded-md"
                    />

                    <FluencyButton variant='confirm' onClick={handleSaveNewDate} >Salvar</FluencyButton>   
                </div>

            </div>
        </div>
    </div>}

    {isInstrucoesOpen && 
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">

            <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                        
                <FluencyCloseButton onClick={closeInstrucoes} />
        
                <h3 className="text-xl font-bold text-center leading-6 mb-4">
                    Instruções
                </h3>   

                <div className='text-justify flex gap-1 flex-col'>
                    <span>1. Se não conseguir fazer uma aula, simplesmente não a marque como feita até fazer a reposição ou edite o dia.</span>
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

    {editingDay && 
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">
                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                          
                <FluencyCloseButton onClick={() => setEditingDay(null)} />
                <h3 className="text-xl font-bold text-center leading-6 mb-4">
                    Mude o dia de aula do aluno
                </h3>  
                <div className='flex flex-col gap-4 justify-center items-center'>
                    <div>
                        {daysOfWeek.map(day => (
                            <div className='flex flex-row gap-1 items-center' key={day}>
                                <input
                                    type="checkbox"
                                    id={day}
                                    value={day}
                                    checked={selectedDays.includes(day)}
                                    onChange={() => handleCheckboxChange(day)}
                                    className='w-4 h-4 before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:bg-fluency-blue-200 checked:border-fluency-blue-600 checked:bg-fluency-blue-500 hover:checked:bg-fluency-blue-600 duration-300 ease-in-out transition-all cursor-pointer appearance-none rounded-[3px] border border-gray-500 dark:border-gray-500'
                                />
                                <label htmlFor={day}>{day}</label>
                            </div>
                        ))}
                    </div>
                    <FluencyButton onClick={handleDayChange}>Salvar</FluencyButton>
                </div>
            </div>
        </div>
    </div>}

    </div>
    );
}

export default Alunos;