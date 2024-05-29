'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, updateDoc, } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { FaRegCalendarCheck, FaRegCalendarTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';


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
    diaAula?: string;
    profilePicUrl?: string;
    frequencia: number;
    classDatesWithStatus: { date: Date; status: string }[];
}

interface AlunosAulasProps {
  id: any;
}
const AlunosAulas: React.FC<AlunosAulasProps> = ({ id }) => {
   
    const [students, setStudents] = useState<Aluno[]>([]);
    const currentDate = useMemo(() => new Date(), []);
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const months = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
    const currentMonthIndex = currentDate.getMonth();
    const currentMonth = monthsPT[currentMonthIndex];
    const currentYear = new Date().getFullYear();

    const getClassDatesForCurrentMonth = useCallback((diaAula: string, frequencia: number) => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

    const fetchData = useCallback(async (alunopainel: string) => {
        try {
            const studentDoc = await getDoc(doc(db, `users/${alunopainel}`));
            if (studentDoc.exists()) {
                const userData = studentDoc.data() as Aluno;
                // Check if Classes property exists, if not, assign an empty object
                const classesData = userData.Classes || {}; // Provide a default value if Classes is undefined
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
                    insertUndoneDates(alunopainel, weeks);
                }
    
                // Return the fetched data
                return {
                    id: alunopainel,
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
                    // Add Classes property here with default value
                    Classes: classesData
                };
            } else {
                console.error('Student data not found.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            return null;
        }
    }, [currentDate, getClassDatesForCurrentMonth, months]);
    
    useEffect(() => {
        async function fetchDataForAluno() {
            const studentData = await fetchData(id);
            if (studentData !== null) {
                // Add the fetched student data to the state
                setStudents([studentData]);
            }
        }
    
        fetchDataForAluno();
    }, [id, fetchData]);


    
    
    
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

    
    return (
        <div className='w-max h-[30vh] overflow-y-auto'>
            {students.map((student) => (
                <div key={student.id}>
                    <p className='font-semibold text-xl pb-2 justify-center flex'>Aulas de {currentMonth}</p>
                    {student.classDatesWithStatus
                        .filter((classDate) => classDate.date.getMonth() === currentMonthIndex)
                        .map((classDate, index) => (
                            <div key={index} className="flex flex-row gap-2 items-center justify-end p-1">
                                <div className="group cursor-pointer relative inline-block text-center">
                                    <p className={`flex flex-row font-semibold gap-1 px-2 text-sm rounded-lg ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-600' : classDate.status === 'Atrasada' ? 'text-fluency-red-600' : '' }`}>
                                        {`${weekdays[classDate.date.getDay()]} - ${classDate.date.getDate()}`}
                                    </p>
                                    <div className={`opacity-0 transition-all duration-500 ease-in-out w-28 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none  ${classDate.status === 'Feita' ? 'text-fluency-text-dark bg-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-text-dark bg-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-text-dark bg-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-text-dark bg-fluency-red-500' : '' }`}>
                                        {classDate.status}
                                        <svg className={`absolute h-2 w-full left-0 top-full ${classDate.status === 'Feita' ? 'text-fluency-green-500' : classDate.status === 'Cancelada' ? 'text-fluency-yellow-500' : classDate.status === 'À Fazer' ? 'text-fluency-blue-500' : classDate.status === 'Atrasada' ? 'text-fluency-red-500' : '' }`} x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                                    </div>
                                </div>

                                <button
                                    className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-blue-200 hover:bg-fluency-blue-300 transition-all duration-300 ease-in-out hover:dark:bg-fluency-blue-700 dark:bg-fluency-blue-800"
                                    onClick={() => handleDone(student.id, classDate.date)} // Call handleDone function
                                > Feita <FaRegCalendarCheck className='icon' />
                                </button>
                                <button
                                    className="flex flex-row gap-1 text-xs items-center py-1 px-2 rounded-lg font-bold bg-fluency-yellow-300 hover:bg-fluency-yellow-400 transition-all duration-300 ease-in-out hover:dark:bg-fluency-yellow-500 dark:bg-fluency-yellow-600"
                                    onClick={() => handleCanceled(student.id, classDate.date)} // Call handleCanceled function
                                > Cancelar <FaRegCalendarTimes className='icon' />
                                </button>

                            </div>
                        ))}
                </div>
            ))}
            <Toaster />
        </div>
    );
};

export default AlunosAulas;