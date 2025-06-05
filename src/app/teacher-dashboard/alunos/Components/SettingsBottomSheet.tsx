import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FluencyButton from "@/app/ui/Components/Button/button";
import { FiSettings } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { LuBadgeCheck, LuCalendarClock } from "react-icons/lu";
import { useProfessorData } from "@/app/hooks/useProfessorData";
import { daysOfWeek } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";

interface SettingBottomSheetProps {
  studentId: string;
  studentName: string;
}

const SettingBottomSheet: React.FC<SettingBottomSheetProps> = ({ studentId, studentName }) => {
  const { students, saveStudentSchedule, saving: isSavingSchedule } = useProfessorData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [horariosInput, setHorariosInput] = useState<string>("");
  const [isEditingSchedule, setIsEditingSchedule] = useState<boolean>(false);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300 
      }
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const formVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const openMainModal = () => {
    setIsModalOpen(true);
  };

  const closeMainModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEditingSchedule(false);
  }, []);

  const handleOpenEditSchedule = useCallback(() => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedDays(student.diaAula || []);
      setHorariosInput((student.horario || []).join(", "));
    } else {
      setSelectedDays([]);
      setHorariosInput("");
    }
    setIsEditingSchedule(true);
  }, [students, studentId]);

  const handleCheckboxChange = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleHorariosInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHorariosInput(e.target.value);
  };

  const handleSaveSchedule = async () => {
    if (!studentId) return;
    const parsedHorarios = horariosInput.split(',').map(h => h.trim()).filter(h => h !== "");
    await saveStudentSchedule(studentId, selectedDays, parsedHorarios);
    setIsEditingSchedule(false);
  };

  return (
    <div>
      <FluencyButton 
        variant='gray' 
        className='!px-2.5 !mr-0 hover:scale-105 transition-transform duration-200' 
        onClick={openMainModal}
      >
        <FiSettings className='w-5 h-auto' />
      </FluencyButton>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-gray-900/70 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeMainModal}
            />
            
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-t-2xl p-4 shadow-xl">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Opções para {studentName}
                  </h1>
                  <button 
                    onClick={closeMainModal}
                    className="text-gray-500 hover:text-fluency-blue-600 dark:hover:text-fluency-blue-400 transition-colors"
                  >
                    <IoClose className="w-7 h-7" />
                  </button>
                </div>
                
                <div className="flex flex-row items-center justify-center gap-4 px-2">
                  {/* CHANGE DAY AND TIME SECTION */}
                  <div className="bg-fluency-blue-50 dark:bg-gray-900 w-full p-4 rounded-xl shadow-sm transition-all hover:shadow-md">
                    <button 
                      className="w-full text-left flex items-center justify-between"
                      onClick={handleOpenEditSchedule}
                      disabled={isEditingSchedule || isSavingSchedule}
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Alterar Dia/Horário
                      </span>
                      <LuCalendarClock className="text-fluency-green-500 w-6 h-6" />
                    </button>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Mude os horários e dias de aula aqui.
                      </p>
                    
                    <AnimatePresence>
                      {isEditingSchedule && (
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          variants={formVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Dias da Semana:
                              </h3>
                              <div className="grid grid-cols-2 gap-2">
                                {daysOfWeek.map(day => (
                                  <div className='flex items-center' key={day}>
                                    <input
                                      type="checkbox"
                                      id={`day-${day}-${studentId}`}
                                      value={day}
                                      checked={selectedDays.includes(day)}
                                      onChange={() => handleCheckboxChange(day)}
                                      className='w-4 h-4 text-fluency-green-600 bg-gray-100 border-gray-300 rounded focus:ring-fluency-green-500 dark:focus:ring-fluency-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer'
                                    />
                                    <label 
                                      htmlFor={`day-${day}-${studentId}`} 
                                      className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                      {day}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Horários:
                              </h3>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Separados por vírgula (ex: 09:00, 14:30)
                              </div>
                              <input
                                type="text"
                                id={`horarios-${studentId}`}
                                value={horariosInput}
                                onChange={handleHorariosInputChange}
                                placeholder="HH:MM, HH:MM"
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-fluency-blue-500 focus:border-fluency-blue-500"
                                disabled={isSavingSchedule}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <FluencyButton 
                                variant="confirm" 
                                className="!py-1.5 !text-sm flex-1"
                                onClick={handleSaveSchedule} 
                                disabled={isSavingSchedule}
                              >
                                {isSavingSchedule ? 'Salvando...' : 'Salvar'}
                              </FluencyButton>
                              <FluencyButton 
                                variant='gray' 
                                className="!py-1.5 !text-sm flex-1"
                                onClick={() => setIsEditingSchedule(false)} 
                                disabled={isSavingSchedule}
                              >
                                Cancelar
                              </FluencyButton>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* REPORT */}
                  <Link 
                    href={{ 
                      pathname: `alunos/relatorio/${encodeURIComponent(studentName)}`, 
                      query: { id: studentId } 
                    }}
                    passHref
                  >
                    <div className="bg-fluency-purple-50 dark:bg-gray-900 min-w-max p-4 rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          Relatório
                        </span>
                        <TbReport className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                      </div>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Acessar relatório da aula teste.
                      </p>
                    </div>
                  </Link>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingBottomSheet;