'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import AddForecastModal from './AddForecastModal';
import { IoClose } from 'react-icons/io5';
import FluencyInput from '@/app/ui/Components/Input/input';
import ConfirmAndEmail from './ConfirmAndEmail';
import { LuExpand } from 'react-icons/lu';
import DetailedModal from './DetailedModal';

interface FinancialOverviewProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  selectedPeriod: string;
  itemsListId: any;
}

interface Student {
  id: string;
  name: string;
  mensalidade: string;
  comecouEm: string;
  encerrouEm?: string;
  studentMail?: string;
}

export default function FinancialOverview({
  totalIncome,
  totalExpense,
  balance,
  selectedPeriod,
  itemsListId,
}: FinancialOverviewProps) {
  const [totalReceivable, setTotalReceivable] = useState<number>(0);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [forecastExpenses, setForecastExpenses] = useState<number>(0); // For forecasted expenses
  const [showStudents, setShowStudents] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('não pago'); 
  const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search query

  // Fetch forecasted expenses for the selected period in real-time
  useEffect(() => {
    const db = getFirestore();
    const forecastingRef = collection(db, 'transactions', 'forecasting', 'expenses');
    const expensesQuery = query(forecastingRef, where('period', '==', selectedPeriod));

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      let totalForecast = 0;

      snapshot.forEach((doc) => {
        const expenseData = doc.data();
        totalForecast += expenseData.amount || 0;
      });

      setForecastExpenses(totalForecast); // Update state with real-time forecasted expenses
    });

    // Cleanup subscription on component unmount or when the period changes
    return () => unsubscribe();
  }, [selectedPeriod]);

  // Function to fetch and calculate total "mensalidade"
  const calculateReceivable = async () => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const studentsQuery = query(usersRef, where('role', '==', 'student'));

    const pastStudentsRef = collection(db, 'past_students');
    const pastStudentsQuery = query(pastStudentsRef, where('role', '==', 'student'));

    try {
      const [studentsSnapshot, pastStudentsSnapshot] = await Promise.all([
        getDocs(studentsQuery),
        getDocs(pastStudentsQuery),
      ]);

      let totalMensalidade = 0;
      const students: Student[] = [];

      const [month, year] = selectedPeriod.split('/');
      const selectedDate = new Date(`${year}-${month}-01`);

      // Process active students
      studentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        const name = userData.name;
        const id = doc.id;
        const studentMail = userData.email

        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);

          if (comecouEmDate <= selectedDate) {
            totalMensalidade += parseFloat(mensalidade);
            students.push({ name, mensalidade, comecouEm, id, studentMail });
          }
        }
      });

      // Process past students
      pastStudentsSnapshot.forEach((doc) => {
        const userData = doc.data();
        const mensalidade = userData.mensalidade;
        const comecouEm = userData.comecouEm;
        const encerrouEm = userData.encerrouEm;
        const name = userData.name;
        const id = doc.id;
        const studentMail = userData.email

        if (mensalidade && comecouEm) {
          const comecouEmDate = new Date(comecouEm);
          const encerrouEmDate = encerrouEm ? new Date(encerrouEm) : null;

          if (comecouEmDate <= selectedDate && (!encerrouEmDate || encerrouEmDate > selectedDate)) {
            totalMensalidade += parseFloat(mensalidade);
            students.push({ name, mensalidade, comecouEm, encerrouEm, id, studentMail });
          }
        }
      });

      setTotalReceivable(totalMensalidade - totalIncome);
      setStudentsList(students);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    calculateReceivable();
  }, [totalIncome, selectedPeriod]);

  const formatPeriod = (period: string) => {
    const [month, year] = period.split('/');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `Visão de ${monthName} de ${year}`;
  };

  const formattedPeriod = formatPeriod(selectedPeriod);

  const getStudentBackgroundColor = (studentId: string) => {
    const matchedTransaction = itemsListId.find(
      (transaction: any) => transaction.studentId === studentId
    );
  
    if (matchedTransaction) {
      if (matchedTransaction.category === 'mensalidade') {
        return 'bg-green-300 dark:bg-green-600';
      } else if (matchedTransaction.category === 'cancelamento') {
        return 'bg-yellow-300 dark:bg-yellow-600';
      }
    }
    return 'bg-white dark:bg-fluency-pages-dark';
  };

 // Filter students based on search query and tab selection
 const filteredStudents = studentsList
 .filter((student) => {
   // Filter by search query
   const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
   if (!matchesSearch) return false;

   // Find if there are any transactions for this student
   const matchedTransaction = itemsListId?.find(
     (transaction: any) => transaction.studentId === student.id
   );

   // Show students with no transaction when the tab is 'não pago'
   if (selectedTab === 'não pago' && !matchedTransaction) {
     return true;  // This student has no transaction
   }

   // Show students who match the selected tab and have a relevant transaction category
   if (selectedTab === 'cancelado' && matchedTransaction?.category === 'cancelamento') {
     return true;
   }

   if (selectedTab === 'pago (mensalidade)' && matchedTransaction?.category === 'mensalidade') {
     return true;
   }

   return false;  // If no matching condition, don't show the student
 });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-4">
      <div className='flex flex-row items-center justify-between w-full gap-2'>
        <div></div>
        <p className="font-bold text-2xl">{formattedPeriod}</p>
        <DetailedModal />
      </div>
      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-4 w-full">
        <div className="w-full min-h-36 max-h-full flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-emerald-600">
          <p className="font-bold text-xl text-white">Entradas</p>
          <p className="font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
          </p>
        </div>
        <div
          className="w-full min-h-36 max-h-full flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-emerald-400 cursor-pointer"
          onClick={() => setShowStudents(!showStudents)}
        >
          <p className="font-bold text-xl text-white">À Receber</p>
          <p className="font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivable)}
          </p>
        </div>
      </div>

      {showStudents && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
          <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark w-full max-w-[80vw] min-h-[95vh] max-h-[95vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-center items-center mb-4">
              <h1 className="text-xl font-bold">À Receber</h1>
              <IoClose
                onClick={() => setShowStudents(!showStudents)}
                className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
              />
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 w-full justify-between">
              <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col lg:items-center md:items-center items-stretch gap-2'>
                {['cancelado', 'pago (mensalidade)', 'não pago'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-2 px-4 rounded-md font-bold ${selectedTab === tab ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-800'}`}
                  >
                    {tab === 'cancelado' ? 'Cancelados' : tab === 'pago (mensalidade)' ? 'Pagos' : 'À Receber'}
                  </button>
                ))}        
              </div>

              <FluencyInput
                type="text"
                placeholder="Buscar por nome do aluno"
                className='!w-[50%]'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />  
            </div>
            
            {/* Filtered Students */}
            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <p className="text-gray-500">Nenhum estudante encontrado.</p>
              ) : (
                filteredStudents.map((student, index) => (
                  <div
                    key={index}
                    className={`flex flex-row justify-between w-full p-4 rounded-md shadow-sm ${getStudentBackgroundColor(student.id)}`}
                  >
                    <div className='flex flex-col items-start gap-1'>
                      <p className="font-bold text-lg">{student.name}</p>
                      <p>
                        <strong>Começou em:</strong> {student.comecouEm}
                      </p>
                      {student.encerrouEm && <p><strong>Encerrado em:</strong> {student.encerrouEm}</p>}
                      <p>
                        <strong>Mensalidade:</strong> R$ {parseFloat(student.mensalidade).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    {(selectedTab === 'cancelado' || selectedTab === 'pago (mensalidade)') && (
                      <ConfirmAndEmail
                        studentMail={student.studentMail} // Assuming `student.id` is used as the email reference
                        selectedMonth={formatPeriod(selectedPeriod).split(' ')[2]}
                        studentName={student.name} // Student's name
                        mensalidade={parseFloat(student.mensalidade)} // Convert mensalidade to a number
                        selectedYear={parseInt(selectedPeriod.split('/')[1], 10)}
                        tab={selectedTab}
                        studentId={student.id}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-4 w-full">
        <div className="w-full min-h-36 max-h-full flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-red-600">
          <p className="font-bold text-xl text-white">Saídas</p>
          <p className="font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
          </p>
        </div>
        <div className="w-full min-h-36 max-h-full flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-red-400">
          <p className="font-bold text-xl text-white">Previsão de Gastos</p>
          <p className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 w-full justify-between font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(forecastExpenses)}
            <AddForecastModal selectedPeriod={selectedPeriod} />
          </p>
        </div>
      </div>
      <div className="w-full min-h-36 max-h-full flex flex-col items-start justify-start gap-2 px-8 py-6 rounded-md bg-gray-500">
        <p className="font-bold text-xl text-white">Balanço</p>
        <p className="font-bold text-white">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>
    </div>
  );
}
