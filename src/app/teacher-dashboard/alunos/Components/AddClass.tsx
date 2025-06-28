import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { toast } from 'react-hot-toast';
import { BiCheck } from 'react-icons/bi';
import { CgClose } from 'react-icons/cg';
import FluencyButton from '@/app/ui/Components/Button/button';
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
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FluencyButton
          className='!px-2.5 !py-2'
          variant='gray'
          onClick={() => setShowDateInput(true)}
        >
          <BsPlus className='w-4 h-auto' />
        </FluencyButton>
      </motion.div>

      <AnimatePresence>
        {showDateInput && (
          <motion.div
            className="z-20 absolute top-full lg:right-2 md:right-1 -right-[50px] mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className='text-center font-bold text-md mb-2'>Adicionar aula</p>
            <motion.input
              type="date"
              onChange={handleDateChange}
              className="p-2 rounded-lg bg-gray-300 dark:bg-gray-900 w-full mb-4"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <div className="flex flex-row items-center justify-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FluencyButton
                  onClick={handleAddDate}
                  variant='confirm'
                  className='!px-2.5'
                >
                  <BiCheck className="w-4 h-4 text-md" />
                </FluencyButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FluencyButton
                  onClick={() => setShowDateInput(false)}
                  variant='gray'
                  className='!px-2.5'
                >
                  <CgClose className="w-4 h-4" />
                </FluencyButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddClass;