import { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase'; // Adjust according to your project structure
import { toast } from 'react-hot-toast';
import { BiCheck } from 'react-icons/bi';
import { CgClose } from 'react-icons/cg';
import FluencyButton from '@/app/ui/Components/Button/button';
import { PiPlus } from 'react-icons/pi';
import { BsPlus } from 'react-icons/bs';

const AddClass = ({ studentId }: { studentId: string }) => {
  const [showDateInput, setShowDateInput] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleAdd = async (studentId: string, date: Date) => {
    try {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      const classesRef = doc(db, `users/${studentId}`);
      const userDoc = await getDoc(classesRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        let classes = userData?.Classes || {};

        classes[currentYear] = classes[currentYear] || {};
        classes[currentYear][months[currentMonth]] =
          classes[currentYear][months[currentMonth]] || {};

        const dayOfMonth = date.getUTCDate().toString();

        if (!classes[currentYear][months[currentMonth]][dayOfMonth]) {
          const currentDate = new Date();
          classes[currentYear][months[currentMonth]][dayOfMonth] =
            date < currentDate ? 'Atrasada' : 'À Fazer';
        }

        await updateDoc(classesRef, { Classes: classes });
        toast.success('Nova aula adicionada com sucesso!', {
          position: 'top-center',
        });
      } else {
        console.error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao adicionar a nova data:', error);
    }
  };

  const handleAddDate = () => {
    if (selectedDate) {
      handleAdd(studentId, selectedDate);
      setShowDateInput(false);
    }
  };

  return (
    <div className="relative">
      <FluencyButton
        className='!px-2.5 !py-2'
        variant='gray'
        onClick={() => setShowDateInput(true)}
      >
        <BsPlus className='w-4 h-auto' />
      </FluencyButton>

      {showDateInput && (
        <div
          className="z-20 absolute top-full lg:right-2 md:right-1 -right-[50px] mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        >
          <p className='text-center font-bold text-md mb-2'>Adicionar aula</p>
          <input
            type="date"
            onChange={handleDateChange}
            className="p-2 rounded-lg bg-gray-300 dark:bg-gray-900 w-full mb-4"
          />
          <div className="flex flex-row items-center justify-center">
            <FluencyButton
              onClick={handleAddDate}
              variant='confirm'
              className='!px-2.5'
            >
              <BiCheck className="w-4 h-4 text-md" />
            </FluencyButton>
            <FluencyButton
              onClick={() => setShowDateInput(false)}
              variant='gray'
              className='!px-2.5'
            >
              <CgClose className="w-4 h-4" />
            </FluencyButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddClass;
