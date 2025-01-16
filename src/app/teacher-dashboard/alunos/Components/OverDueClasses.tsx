import React, { useState, useEffect, useMemo } from 'react';
import { FaRegCalendarCheck, FaRegCalendarTimes } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import { LuCalendarCheck, LuCalendarX } from 'react-icons/lu';

interface OverdueClassesProps {
  studentId: string;
}

interface ClassDateWithStatus {
  date: Date;
  status: string;
}

const OverdueClasses: React.FC<OverdueClassesProps> = ({ studentId }) => {
  const [overdueClasses, setOverdueClasses] = useState<ClassDateWithStatus[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const months = useMemo(() => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);
   
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsAnimating(false);
      }, 200);
    };

  useEffect(() => {
    const fetchOverdueClasses = async () => {
      try {
        const studentRef = doc(db, 'users', studentId);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const classesData = studentData?.Classes || {};

          let allOverdueClasses: ClassDateWithStatus[] = [];
          for (const yearKey of Object.keys(classesData)) {
            for (const monthKey of Object.keys(classesData[yearKey])) {
              const monthClasses = classesData[yearKey][monthKey];
              for (const dayKey of Object.keys(monthClasses)) {
                if (monthClasses[dayKey] === 'Atrasada') {
                  const classDate = new Date(parseInt(yearKey), months.indexOf(monthKey), parseInt(dayKey));
                  allOverdueClasses.push({ date: classDate, status: 'Atrasada' });
                }
              }
            }
          }

          allOverdueClasses.sort((a, b) => b.date.getTime() - a.date.getTime());
          setOverdueClasses(allOverdueClasses);
        }
      } catch (error) {
        console.error('Error fetching overdue classes:', error);
      }
    };

    fetchOverdueClasses();
  }, [studentId]);

  const updateClassStatus = async (date: Date, newStatus: string) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      const studentDoc = await getDoc(studentRef);

      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const classesData = studentData?.Classes || {};
        for (const yearKey of Object.keys(classesData)) {
          for (const monthKey of Object.keys(classesData[yearKey])) {
            const monthClasses = classesData[yearKey][monthKey];
            for (const dayKey of Object.keys(monthClasses)) {
              const classDate = new Date(parseInt(yearKey), months.indexOf(monthKey), parseInt(dayKey));
              if (classDate.getTime() === date.getTime()) {
                monthClasses[dayKey] = newStatus;
                const classRef = doc(db, 'users', studentId);
                await updateDoc(classRef, {
                  [`Classes.${yearKey}.${monthKey}.${dayKey}`]: newStatus,
                });
                toast.success("Atualizado!")
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating class status:', error);
    }
  };

  return (
    <div>
        <Toaster />
        <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg ${
            overdueClasses.length === 0 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            >
            {overdueClasses.length === 0 ? (
                <LuCalendarCheck className="w-5 h-5" />
            ) : (
                <LuCalendarX className="w-5 h-5" />
            )}
            <p className='lg:block md:block hidden'>Aulas Atrasadas:</p> {overdueClasses.length}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
            <div
            id="modalNotification"
            className={`bg-white dark:bg-gray-800 w-fit max-w-[80vw] min-h-[70vh] max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out ${
                isAnimating ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            >
                <div className="flex justify-center items-center mb-4">
                    <h1 className="text-xl font-bold">{overdueClasses.length === 0 ? 'Aulas em dia' : 'Aulas atrasadas'}</h1>
                    <IoClose
                    onClick={closeModal}
                    className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
                    />
                </div>
                <div className="space-y-2">
                    {overdueClasses.length === 0 ? (
                    <p className="text-center font-bold text-lg text-gray-600 dark:text-gray-300">
                        Não há aulas atrasadas! Mandou bem 😎
                    </p>
                    ) : (
                    overdueClasses.map((classDate, index) => {
                        const day = classDate.date.getDate();
                        const weekday = new Intl.DateTimeFormat('pt-PT', { weekday: 'long' }).format(classDate.date);
                        const month = monthsPT[classDate.date.getMonth()];
                        const year = classDate.date.getFullYear();
                        return (
                        <div key={index} className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-between gap-8 bg-gray-200 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="text-md font-semibold text-black dark:text-white text-center">
                            {`${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} de ${month} de ${year}`}
                            </p>
                            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2">
                            <button
                                onClick={() => {
                                updateClassStatus(classDate.date, 'Feita');
                                setOverdueClasses(prev => prev.filter(c => c.date.getTime() !== classDate.date.getTime()));
                                }}
                                className="font-bold flex flex-row gap-3 items-center justify-center bg-fluency-green-500 text-white py-1 px-3 rounded-md hover:bg-fluency-green-600 duration-300 ease-in-out transition-all"
                            >
                                Feita <FaRegCalendarCheck />
                            </button>
                            <button
                                onClick={() => {
                                updateClassStatus(classDate.date, 'Cancelada');
                                setOverdueClasses(prev => prev.filter(c => c.date.getTime() !== classDate.date.getTime()));
                                }}
                                className="font-bold flex flex-row gap-3 items-center justify-center bg-fluency-red-500 text-white py-1 px-3 rounded-md hover:bg-fluency-red-600 duration-300 ease-in-out transition-all"
                            >
                                Cancelada <FaRegCalendarTimes />
                            </button>
                            </div>
                        </div>
                        );
                    })
                    )}
                </div>
            </div>
        </div>
        )}

    </div>
  );
};

export default OverdueClasses;
