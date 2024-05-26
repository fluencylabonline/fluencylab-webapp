'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@nextui-org/react';
import Image from 'next/image';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, onSnapshot  } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { IoIosCheckbox } from 'react-icons/io';
import { MdFolderDelete, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { RiErrorWarningLine, RiMailSendFill } from 'react-icons/ri';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';

import { Toaster, toast } from 'react-hot-toast';
import FluencyInput from '@/app/ui/Components/Input/input';
import { FaUserCircle } from 'react-icons/fa';

interface ProfessorProps {
  id: string;
  name: string;
  professor: string;
  salario: number;
  payments: any;
  alunos: { [key: string]: AlunoProps };
}

interface AlunoProps {
  id: string;
  name: string;
  diaAula: string;
}

export default function Professors() {
  const [professores, setProfessores] = useState<ProfessorProps[]>([]);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, 'users'), where('role', '==', 'teacher')), (snapshot) => {
        const updatedProfessores: ProfessorProps[] = [];
        snapshot.forEach((doc) => {
          const professor: ProfessorProps = {
            id: doc.id,
            name: doc.data().name,
            professor: doc.data().professor,
            salario: doc.data().salario,
            payments: doc.data().payments,
            alunos: doc.data().alunos,
          };
          updatedProfessores.push(professor);
        });
        setProfessores(updatedProfessores);
      });
  
      return () => unsubscribe();
    }, []);
  

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
  };

  const renderPaymentStatus = (payments: any) => {
    if (!payments) return (
      <Tooltip
        className='text-xs font-bold bg-fluency-green-200 rounded-md p-1'
        content="Sem informações de pagamento para esse mês"
      >
        <span className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
          <RiErrorWarningLine className='text-fluency-yellow-500'/>
        </span>
      </Tooltip>
    );
  
    const yearPayments = payments[selectedYear] || {};
    const statusData = yearPayments[selectedMonth];
  
    if (!statusData) {
      // If status data is not found for the selected month and year, display 'Não Pago'
      return (
        <Tooltip
          className='text-xs font-bold bg-fluency-red-200 rounded-md p-1'
          content="Não Pago"
        >
          <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50">
            <MdOutlineIndeterminateCheckBox className='text-fluency-red-600'/>
          </span>
        </Tooltip>
      );
    } else {
      // Extract status, salary, and quantityOfStudents from statusData object
      const { status, salary, quantityOfStudents } = statusData;
  
      if (status === 'paid') {
        return (
          <Tooltip
            className='text-xs font-bold bg-fluency-green-200 rounded-md p-1'
            content={`Pago. Salário: ${salary}. Quantidade de Alunos: ${quantityOfStudents}`}
          >
            <span className="hover:text-fluency-green-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
              <IoIosCheckbox className='text-fluency-green-500'/>
            </span>
          </Tooltip>
        );
      } else {
        return (
          <Tooltip
            className='text-xs font-bold bg-fluency-red-200 rounded-md p-1'
            content="Não Pago"
          >
            <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50">
              <MdOutlineIndeterminateCheckBox className='text-fluency-red-600'/>
            </span>
          </Tooltip>
        );
      }
    }
  };
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const openModal = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const transferUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const pastUserRef = doc(db, 'past-teachers', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      await setDoc(pastUserRef, userData);
      await deleteDoc(userRef);
      toast.error('Aluno deletado!', {
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error transferring user to past-users:', error);
      toast.error('Erro ao deletar aluno!', {
        position: 'top-center',
      });
    }
  };

  
  const confirmPayment = async (userId: string, date: Date, selectedMonth: string) => {
    try {
      const year = date.getFullYear();
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (userData) {
        const currentPayments = userData.payments || {};
        const yearPayments = currentPayments[year] || {};
        const currentStatus = yearPayments[selectedMonth]?.status || 'notPaid'; // Default to 'notPaid' if status is not found
        const newStatus = currentStatus === 'paid' ? 'notPaid' : 'paid';
        
        // Retrieve the current salary and quantity of students
        const newSalary = userData.salario;
        const quantityOfStudents = Object.keys(userData.alunos).length;
  
        // Update the payment object to include status, salary, and quantity of students
        yearPayments[selectedMonth] = {
          status: newStatus,
          salary: newSalary,
          quantityOfStudents: quantityOfStudents
        };
  
        await setDoc(userRef, { 
          payments: { ...currentPayments, [year]: yearPayments }
        }, { merge: true });
  
        const toastMessage = newStatus === 'paid' ? 'Pagamento registrado!' : 'Pagamento retirado!';
        const toastType = newStatus === 'paid' ? 'success' : 'error';
        toast[toastType](toastMessage, {
          position: 'top-center',
        });
      } else {
        console.error('User data is undefined');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Erro ao adicionar pagamento!', {
        position: 'top-center',
      });
    }
  };
  
  const [alunos, setAlunos] = useState<AlunoProps[]>([]);
  const renderAlunos = (alunos: { [key: string]: AlunoProps } | null | undefined) => {
    // Check if alunos is undefined or null
    if (!alunos) return ''; // Or any default value you prefer when alunos is not available
  
    // Map over the values of alunos and join their names with a comma
    return Object.values(alunos).map((aluno) => aluno.name).join(', ');
  };

  // Fetch Alunos
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);
        const alunoList: AlunoProps[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          diaAula: doc.data().diaAula,
        }));
        setAlunos(alunoList);
      } catch (error) {
        console.error('Error fetching professors:', error);
      }
    };

    fetchAlunos();
  }, []);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState<string>('');
  const [newSalary, setNewSalary] = useState<number>(0);

  const openEditModal = (professorId: string) => {
    setSelectedProfessorId(professorId);
    const professor = professores.find(prof => prof.id === professorId);
    if (professor) {
      setSelectedStudents(Object.keys(professor.alunos));
      setNewSalary(professor.salario);
    }
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedStudents([]);
    setNewSalary(0);
  };

  const handleStudentSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!selectedStudents.includes(value)) {
      setSelectedStudents([...selectedStudents, value]);
    }
  };

  const handleSalaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewSalary(Number(event.target.value));
  };

  const saveChanges = async () => {
    if (selectedProfessorId) {
      const professorRef = doc(db, 'users', selectedProfessorId);
      const professorSnapshot = await getDoc(professorRef);
      const professorData = professorSnapshot.data();
      if (professorData) {
        const updatedAlunos: { [key: string]: AlunoProps } = {};
        selectedStudents.forEach(studentId => {
          const student = alunos.find(aluno => aluno.id === studentId);
          if (student) {
            updatedAlunos[studentId] = student;
          }
        });

        await setDoc(professorRef, {
          alunos: updatedAlunos,
          salario: newSalary,
        }, { merge: true });

        toast.success('Changes saved successfully!', {
          position: 'top-center',
        });
        closeEditModal();
      }
    }
  };

  const [isRemoveConfirmationOpen, setIsRemoveConfirmationOpen] = useState(false);
  const [selectedStudentIdToRemove, setSelectedStudentIdToRemove] = useState('');
  const removeStudent = (studentId: string) => {
    setSelectedStudentIdToRemove(studentId);
    setIsRemoveConfirmationOpen(true);
  };
  

  const confirmRemoveStudent = () => {
    // Filter out the selected student to be removed
    setSelectedStudents(selectedStudents.filter(id => id !== selectedStudentIdToRemove));
    setIsRemoveConfirmationOpen(false);
  };
  

  return (
    <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     
      <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
      <div className='flex flex-row items-center justify-around w-full'>
          <h3 className='font-semibold text-xl'>
            Professores Fluency Lab
          </h3>
        <select
          className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark px-5 py-2 rounded-md'
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
        >
          <option value="January">Janeiro</option>
          <option value="February">Fevereiro</option>
          <option value="March">Março</option>
          <option value="April">Abril</option>
          <option value="May">Maio</option>
          <option value="June">Junho</option>
          <option value="July">Julho</option>
          <option value="August">Agosto</option>
          <option value="September">Setembro</option>
          <option value="October">Outubro</option>
          <option value="November">Novembro</option>
          <option value="December">Dezembro</option>
        </select>
        <select
          className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark px-4 py-2 rounded-md'
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
        >
          <option value={selectedYear}>2024</option>
        </select>
      </div>

      <Table>
        <TableHeader>
        <TableColumn>Nome</TableColumn>
          <TableColumn>Salário</TableColumn>
          <TableColumn>Alunos</TableColumn>
          <TableColumn>Quantidade de Alunos</TableColumn>
          <TableColumn className='flex flex-col items-center justify-center'>Pagamento</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody>
          {professores.map((professor) => (
            <TableRow key={professor.id}>
              <TableCell>
                  <span onClick={() => openEditModal(professor.id)} className="cursor-pointer">{professor.name}</span>
                </TableCell>
              <TableCell>{professor.salario}</TableCell>
              <TableCell>{renderAlunos(professor.alunos)}</TableCell>
              <TableCell>{professor.alunos ? Object.keys(professor.alunos).length : 0}</TableCell>
              <TableCell className='flex flex-col items-center'>
                {renderPaymentStatus(professor.payments)}
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip className='text-xs font-bold bg-fluency-red-200 rounded-md p-1' content="Excluir professor">
                  <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => openModal(professor.id, professor.name)}>
                      <MdFolderDelete />
                    </span>
                  </Tooltip>
                  <Tooltip className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1' content="Enviar comprovante">
                    <span className="hover:text-fluency-blue-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
                      <RiMailSendFill />
                    </span>
                  </Tooltip>
                  <Tooltip className='text-xs font-bold bg-fluency-green-200 rounded-md p-1' content="Confirmar ou retirar pagamento">
                    <span className="hover:text-fluency-green-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
                    <TbPigMoney onClick={() => confirmPayment(professor.id, new Date(), selectedMonth)} />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
              <div className="flex flex-col">
                <FluencyCloseButton onClick={closeModal}/>
                <div className="mt-3 flex flex-col gap-3 p-4">
                    <h3 className="text-center text-lg leading-6 font-bold mb-2">
                    Tem certeza que deseja excluir o professor {selectedUserName}?                            
                    </h3>
                  <div className="flex justify-center">
                    <FluencyButton variant='danger' onClick={() => { transferUser(selectedUserId); closeModal(); }}>Sim, excluir</FluencyButton>
                    <FluencyButton variant='gray' onClick={closeModal}>Não, cancelar</FluencyButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}



      {/*MODAL TO EDIT TEACHER'S INFORMATION*/}
      {editModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
              
              <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                  <div className="flex flex-col items-center">
                      <FluencyCloseButton onClick={closeEditModal} />
    
                      <div className="mt-2 flex flex-col gap-3 p-4"> 
                      <h3 className="text-lg leading-6 font-medium mb-2">
                          Atualizar Informações do Aluno
                      </h3>

                      <div>
                        <div className='bg-fluency-gray-100 dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-full rounded-xl p-3 flex flex-row items-center gap-3'>
                            <div className="relative inline-block">
                              <div className='bg-gray-300 w-14 h-14 rounded-full flex items-center justify-center mx-auto'>
                                <FaUserCircle className='icon w-14 h-14 rounded-full'/>
                              </div>
                              <span className="absolute animate-pulse top-0 center-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                            </div>
                          
                          <div className='flex flex-col text-left'>
                            <p className='text-md'>Professor Name</p>
                            <p className='text-xs font-normal'>Professor E-mail</p>
                          </div>
                        </div>
                      </div>


                      <div className="mb-4">
                        <label className="block font-bold mb-2">Salário</label>
                        <input
                          type="number"
                          value={newSalary}
                          onChange={handleSalaryChange}
                          className="bg-gray-200 p-2 rounded w-full"
                        />
                      </div>

                      <div className="mb-4">
                            <label className="block font-bold mb-2">Alunos</label>
                            <select className="bg-gray-200 p-2 rounded w-full" onChange={handleStudentSelection}>
                              <option value="">Selecione um aluno</option>
                              {alunos.map((aluno) => (
                                <option key={aluno.id} value={aluno.id}>{aluno.name}</option>
                              ))}
                            </select>
                          <ul>
                            {selectedStudents.map(studentId => (
                              <li key={studentId}>
                                {alunos.find(aluno => aluno.id === studentId)?.name}
                                <button onClick={() => removeStudent(studentId)}>Remover</button>
                              </li>
                            ))}
                          </ul>
                      </div>
                      

                      <div className="flex flex-row justify-center">                            
                        <FluencyButton variant='confirm' onClick={saveChanges}>Salvar</FluencyButton>
                        <FluencyButton variant='gray' onClick={closeEditModal}>Cancelar</FluencyButton>
                      </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>)}

      {isRemoveConfirmationOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
              <div className="flex flex-col">
                <FluencyCloseButton onClick={() => setIsRemoveConfirmationOpen(false)} />
                <div className="mt-3 flex flex-col gap-3 p-4">
                  <h3 className="text-center text-lg leading-6 font-bold mb-2">
                    Tem certeza que deseja remover este aluno?
                  </h3>
                  <div className="flex justify-center">
                    <FluencyButton variant='danger' onClick={confirmRemoveStudent}>Sim, remover</FluencyButton>
                    <FluencyButton variant='gray' onClick={() => setIsRemoveConfirmationOpen(false)}>Cancelar</FluencyButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      </div>
    <Toaster />
  </div>
  );
}
