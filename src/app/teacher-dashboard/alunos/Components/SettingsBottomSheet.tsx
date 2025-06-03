import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import FluencyButton from "@/app/ui/Components/Button/button";
// toast notifications are now handled by the useProfessorData hook

import { FiSettings } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { PiExam } from "react-icons/pi";
import { LuBadgeCheck, LuCalendarClock } from "react-icons/lu";
import { useProfessorData } from "@/app/hooks/useProfessorData";
import { daysOfWeek } from "@/app/types";

// Import the hook


interface SettingBottomSheetProps {
  studentId: string;
  studentName: string;
}

const SettingBottomSheet: React.FC<SettingBottomSheetProps> = ({ studentId, studentName }) => {
  // Use the hook to get student data and save schedule functions
  const { students, saveStudentSchedule, saving: isSavingSchedule } = useProfessorData();

  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for selected days
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  // State for the horario input field (comma-separated times)
  const [horariosInput, setHorariosInput] = useState<string>("");
  
  // State to control visibility of the schedule editing section
  const [isEditingSchedule, setIsEditingSchedule] = useState<boolean>(false);
  const openMainModal = () => {
    setIsModalOpen(true);
  };

  // useCallback to prevent unnecessary re-creation of the function
  const closeMainModal = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsAnimating(false);
      setIsEditingSchedule(false); // Also close the editing section when the main modal closes
    }, 200);
  }, []);

  // useCallback for opening the edit schedule section
  const handleOpenEditSchedule = useCallback(() => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedDays(student.diaAula || []);
      setHorariosInput((student.horario || []).join(", ")); // Populate input from student's current schedule
    } else {
      // Fallback if student data isn't found (e.g., initial load or error)
      setSelectedDays([]);
      setHorariosInput("");
      // console.warn(`Student with ID ${studentId} not found in students list.`);
    }
    setIsEditingSchedule(true);
  }, [students, studentId]); // Dependencies: re-create if students list or studentId changes

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

    // Parse the comma-separated horarios string into an array of trimmed strings
    const parsedHorarios = horariosInput.split(',').map(h => h.trim()).filter(h => h !== "");
    
    // Call the save function from the hook
    // The hook will handle API calls, toast notifications, and updating its internal 'students' state
    await saveStudentSchedule(studentId, selectedDays, parsedHorarios);
    
    setIsEditingSchedule(false); // Close the editing section after attempting to save
  };

  return (
    <div>
      <FluencyButton variant='gray' className='!px-2.5 !mr-0' onClick={openMainModal}>
        <FiSettings className='w-5 h-auto' />
      </FluencyButton>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
          <div
            id="modalNotification"
            className={`bg-white dark:bg-gray-800 w-full md:w-fit md:max-w-[80vw] min-h-[70vh] max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out ${
              isAnimating ? 'animate-slideDown' : 'animate-slideUp'
            }`}
          >
            <div className="flex justify-center items-center relative mb-4">
              <h1 className="text-xl font-bold text-center p-4">Opções para {studentName}</h1>
              <IoClose
                onClick={closeMainModal}
                className="cursor-pointer absolute top-2 right-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
              />
            </div>
            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-stretch gap-4 lg:px-4 md:px-4 px-8">
              {/* CHANGE DAY AND TIME SECTION */}
              <div className="flex flex-col items-center justify-start gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md min-w-[250px] md:min-w-[300px]">
                <button 
                  className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-green-500 duration-300 ease-in-out transition-all w-full disabled:opacity-50" 
                  onClick={handleOpenEditSchedule}
                  disabled={isEditingSchedule || isSavingSchedule} // Disable if already editing or saving
                >
                  Alterar Dia/Horário da Aula <LuCalendarClock className="text-fluency-green-500 w-5 h-auto" />
                </button>
                
                {isEditingSchedule && (
                  <div className='flex flex-col gap-4 justify-center items-stretch w-full p-2'> {/* items-stretch */}
                    <div>
                      <h3 className="font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Dias da Semana:</h3>
                      {daysOfWeek.map(day => (
                        <div className='flex flex-row gap-2 items-center my-1' key={day}>
                          <input
                            type="checkbox"
                            id={`day-${day}-${studentId}`} // Unique ID for label association
                            value={day}
                            checked={selectedDays.includes(day)}
                            onChange={() => handleCheckboxChange(day)}
                            className='w-4 h-4 text-fluency-green-600 bg-gray-100 border-gray-300 rounded focus:ring-fluency-green-500 dark:focus:ring-fluency-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer'
                          />
                          <label htmlFor={`day-${day}-${studentId}`} className="cursor-pointer text-gray-700 dark:text-gray-300">{day}</label>
                        </div>
                      ))}
                    </div>

                    <div className="w-full mt-2">
                      <h3 className="font-semibold mb-1 text-center text-gray-800 dark:text-gray-200">Horários:</h3>
                      <label htmlFor={`horarios-${studentId}`} className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                        Separados por vírgula (ex: 09:00, 14:30)
                      </label>
                      <input
                        type="text"
                        id={`horarios-${studentId}`}
                        value={horariosInput}
                        onChange={handleHorariosInputChange}
                        placeholder="HH:MM, HH:MM"
                        className="w-full p-2 border border-gray-400 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-fluency-blue-500 focus:border-fluency-blue-500"
                        disabled={isSavingSchedule}
                      />
                    </div>
                    
                    <div className="flex flex-row items-center justify-center gap-2 mt-4 w-full">
                      <FluencyButton variant="confirm" onClick={handleSaveSchedule} disabled={isSavingSchedule}>
                        {isSavingSchedule ? 'Salvando...' : 'Salvar Alterações'}
                      </FluencyButton>
                      <FluencyButton variant='gray' onClick={() => setIsEditingSchedule(false)} disabled={isSavingSchedule}>
                        Cancelar
                      </FluencyButton>
                    </div>
                  </div>
                )}
              </div>

              {/* BADGE - hidden as per original */}
              <div className="hidden flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md ">
                <button className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-blue-500 duration-300 ease-in-out transition-all">Bagde <LuBadgeCheck className="text-fluency-blue-500 w-5 h-auto"/></button>
              </div>

              {/* REPORT */}
              <div className="flex flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md">
                <Link href={{ pathname: `alunos/relatorio/${encodeURIComponent(studentName)}`, query: { id: studentId } }} passHref>
                  <span className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-400 duration-300 ease-in-out transition-all cursor-pointer text-gray-800 dark:text-gray-200">
                    Relatório <TbReport className="text-indigo-700 dark:text-indigo-400 w-5 h-auto" />
                  </span>
                </Link>
              </div>

              {/* PLACEMENT */}
              <div className="flex flex-col items-center justify-center gap-4 bg-gray-300 dark:bg-gray-900 p-2 rounded-md">
                <Link href={{ pathname: `alunos/nivelamento/${encodeURIComponent(studentName)}`, query: { id: studentId } }} passHref>
                  <span className="bg-gray-300 dark:bg-gray-900 p-2 px-3 rounded-md font-bold flex flex-row items-center justify-center gap-1 hover:text-fluency-orange-600 dark:hover:text-fluency-orange-400 duration-300 ease-in-out transition-all cursor-pointer text-gray-800 dark:text-gray-200">
                    Nivelamento <PiExam className="text-fluency-orange-500 dark:text-fluency-orange-400 w-5 h-auto" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingBottomSheet;