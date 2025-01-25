'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { BsArrowsAngleExpand } from 'react-icons/bs';
import { MdAdd, MdDelete } from 'react-icons/md';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { IoClose } from 'react-icons/io5';

interface AddForecastModalProps {
  selectedPeriod: string;
}

interface ForecastExpense {
  id: string;
  type: 'variable' | 'non-variable';
  amount: number;
  description: string;
}

export default function AddForecastModal({ selectedPeriod }: AddForecastModalProps) {
  const [expenseType, setExpenseType] = useState<'variable' | 'non-variable'>('variable');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [variableExpenses, setVariableExpenses] = useState<ForecastExpense[]>([]);
  const [nonVariableExpenses, setNonVariableExpenses] = useState<ForecastExpense[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchForecastedExpenses = async () => {
    const db = getFirestore();
    const forecastingRef = collection(db, 'transactions', 'forecasting', 'expenses');
    const expensesQuery = query(forecastingRef, where('period', '==', selectedPeriod));

    try {
      const expensesSnapshot = await getDocs(expensesQuery);
      const variable: ForecastExpense[] = [];
      const nonVariable: ForecastExpense[] = [];

      expensesSnapshot.forEach((doc) => {
        const data = doc.data();
        const expense: ForecastExpense = {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          description: data.description,
        };

        if (data.type === 'variable') {
          variable.push(expense);
        } else if (data.type === 'non-variable') {
          nonVariable.push(expense);
        }
      });

      setVariableExpenses(variable);
      setNonVariableExpenses(nonVariable);
    } catch (error) {
      console.error('Error fetching forecasted expenses:', error);
    }
  };

  const handleSave = async () => {
    if (!amount || !description) {
      alert('Please fill out all fields.');
      return;
    }

    const db = getFirestore();
    const forecastingRef = collection(db, 'transactions', 'forecasting', 'expenses');

    try {
      await addDoc(forecastingRef, {
        period: selectedPeriod,
        type: expenseType,
        amount,
        description,
        createdAt: new Date().toISOString(),
      });
      alert('Forecast added successfully!');
      fetchForecastedExpenses();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving forecast:', error);
      alert('Error saving forecast.');
    }
  };

  const handleDelete = async (id: string) => {
    const db = getFirestore();
    const expenseDocRef = doc(db, 'transactions', 'forecasting', 'expenses', id);

    try {
      await deleteDoc(expenseDocRef);
      alert('Expense deleted successfully!');
      fetchForecastedExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense.');
    } finally {
      setIsDeleting(null); // Reset deleting state
    }
  };

  const cancelDelete = () => {
    setIsDeleting(null);
  };

  useEffect(() => {
    if (showModal) {
      fetchForecastedExpenses();
    }
  }, [showModal]);

  const formatPeriod = (period: string) => {
    const [month, year] = period.split('/');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} de ${year}`;
  };

  const formattedPeriod = formatPeriod(selectedPeriod);

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="text-white font-bold">
        <MdAdd className="w-6 h-6 hover:bg-red-700 duration-300 ease-in-out transition-all rounded-full" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-gray-600 bg-opacity-50 dark:bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-6 w-full h-[95vh] overflow-hidden m-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Previsão de Gastos</h2>
            <IoClose
                onClick={() => setShowModal(false)}
                className="icon cursor-pointer absolute top-5 right-16 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300"
              />
            <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col-reverse overflow-y-auto max-h-[80vh] items-start justify-between w-full gap-4'>
            {/* Display Existing Forecasted Expenses */}
            <div className="mb-4 w-full p-3 bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-md">
              <h3 className="text-lg font-bold">Despesas variáveis</h3>
              {variableExpenses.length > 0 ? (
                <ul className="space-y-2 mt-3">
                  {variableExpenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="p-2 px-4 bg-fluency-gray-200 dark:bg-fluency-gray-700 rounded-md flex justify-between items-center"
                    >
                        {isDeleting === expense.id ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <span>Tem certeza que quer excluir?</span>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-md"
                            >
                              Sim
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="bg-gray-500 text-white px-3 py-1 rounded-md"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <div className='flex flex-row w-full justify-between items-center'>
                            <p>
                              <strong>Descrição:</strong> {expense.description}
                            </p>
                            <p>
                              <strong>Valor:</strong> R$ {expense.amount.toFixed(2).replace('.', ',')}
                            </p>
                            <button
                              onClick={() => setIsDeleting(expense.id)}
                              className="bg-red-500 text-white p-2 rounded-md"
                            >
                              <MdDelete className='w-4 h-4' />
                            </button>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-4'>Sem despesas variáveis para esse período.</p>
              )}
            </div>

            <div className="mb-4 w-full p-3 bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-md">
              <h3 className="text-lg font-bold">Despesas fixas</h3>
              {nonVariableExpenses.length > 0 ? (
                <ul className="space-y-2">
                  {nonVariableExpenses.map((expense) => (
                    <li
                    key={expense.id}
                    className="p-2 px-4 bg-fluency-gray-200 dark:bg-fluency-gray-700 rounded-md flex justify-between items-center"
                  >
                      {isDeleting === expense.id ? (
                        <div className="flex flex-row w-full justify-between items-center">
                          <span>Tem certeza que quer excluir?</span>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md"
                          >
                            Sim
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="bg-gray-500 text-white px-3 py-1 rounded-md"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <div className='flex flex-row w-full justify-between items-center'>
                          <p>
                            <strong>Descrição:</strong> {expense.description}
                          </p>
                          <p>
                            <strong>Valor:</strong> R$ {expense.amount.toFixed(2).replace('.', ',')}
                          </p>
                          <button
                            onClick={() => setIsDeleting(expense.id)}
                            className="bg-red-500 text-white p-2 rounded-md"
                          >
                            <MdDelete className='w-4 h-4' />
                          </button>
                        </div>
                      )}
                  </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-4'>Sem despesas fixas para esse período.</p>
              )}
            </div>

              <div className='flex flex-col items-stretch gap-2 mb-4 w-full p-3 bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-md'>
                <h3 className="text-lg font-bold">Adicionar despesa para {formattedPeriod}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tipo de gasto</label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value as 'variable' | 'non-variable')}
                    className="border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800 ease-in-out duration-300 w-full pl-3 py-2 rounded-lg border-2 font-medium transition-all"
                    >
                    <option value="variable">Variável</option>
                    <option value="non-variable">Fixa</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Valor</label>
                  <FluencyInput
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    placeholder="R$"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <FluencyInput
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição"
                  />
                </div>
                <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col lg:justify-end md:justify-center justify-center gap-2 mt-4">
                  <FluencyButton
                    onClick={() => setShowModal(false)}
                    variant='gray'
                  >
                    Cancelar
                  </FluencyButton>
                  <FluencyButton
                    onClick={handleSave}
                    variant='confirm'
                  >
                    Salvar
                  </FluencyButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
