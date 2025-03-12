import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import Link from "next/link";

import FluencyButton from "@/app/ui/Components/Button/button";

import toast from "react-hot-toast";

import { FiSettings } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { LuBadgeCheck, LuCalendarClock } from "react-icons/lu";

interface SettingBottomSheetProps {
  studentId: any;
  studentName: string;
}

const SettingBottomSheet: React.FC<SettingBottomSheetProps> = ({ studentId, studentName }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const closeModal = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setIsAnimating(false);
        }, 200);
        };


    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [editingDay, setEditingDay] = useState<{ studentId: string } | null>(null);
    const openEditingDayModal = (studentId: string) => {
        setEditingDay({ studentId });
    };
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

    const handleCheckboxChange = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
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

    return(
    <div>
        <FluencyButton variant='gray' className='!px-2.5 !mr-0' onClick={() => setIsModalOpen(true)}>
            <FiSettings className='w-5 h-auto' />
        </FluencyButton>

        {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
            <div
            id="modalNotification"
            className={`bg-white dark:bg-gray-800 w-fit max-w-[80vw] min-h-[70vh] max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out ${
                isAnimating ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            >
                <div className="flex justify-center items-center mb-4">
                    <h1 className="text-xl font-bold text-center p-4">Opções para {studentName}</h1>
                    <IoClose
                        onClick={closeModal}
                        className="cursor-pointer absolute top-2 right-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
                    />
                </div>
                <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-stretch gap-4 lg:px-4 md:px-4 px-8">
                    {/*CHANGE DAY*/}
                    <div className="flex flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md">
                        <button className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-green-500 duration-300 ease-in-out transition-all" onClick={() => openEditingDayModal(studentId)} >Mudar dia da aula <LuCalendarClock className="text-fluency-green-500 w-5 h-auto" /></button>
                        {editingDay &&(
                            <div className='flex flex-col gap-2 justify-center items-center'>
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
                                                    className='w-4 h-4 before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:bg-fluency-blue-200 checked:border-fluency-green-600 checked:bg-fluency-green-500 hover:checked:bg-fluency-green-600 duration-300 ease-in-out transition-all cursor-pointer appearance-none rounded-[3px] border border-gray-500 dark:border-gray-500'
                                                />
                                                <label htmlFor={day}>{day}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-row items-center justify-center">
                                        <FluencyButton variant="confirm" onClick={handleDayChange}>Salvar</FluencyButton>
                                        <FluencyButton variant='gray' onClick={() => setEditingDay(null)} >Cancelar</FluencyButton>   
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/*BADGE*/}
                    <div className="hidden flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md ">
                        <button className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-blue-500 duration-300 ease-in-out transition-all">Bagde <LuBadgeCheck  className="text-fluency-blue-500 w-5 h-auto"/></button>
                    </div>

                    {/*REPORT*/}
                    <div className="flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md">
                        <Link href={{ pathname: `alunos/relatorio/${encodeURIComponent(studentName)}`, query: { id: studentId } }} passHref className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-indigo-700 duration-300 ease-in-out transition-all">Relatório <TbReport className="text-indigo-700 w-5 h-auto" /></Link>
                    </div>

                    {/*PLACEMENT*/}
                    <div className="flex flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md">
                        <Link href={{ pathname: `alunos/nivelamento/${encodeURIComponent(studentName)}`, query: { id: studentId } }} passHref className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-orange-600 duration-300 ease-in-out transition-all">Nivelamento <PiExam className="text-fluency-orange-500 w-5 h-auto" /></Link>                      
                    </div>

                </div>
            </div>
        </div>
        )}
    </div>
    )
}

export default SettingBottomSheet;