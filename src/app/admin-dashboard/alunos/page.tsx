'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Skeleton,
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

interface Aluno {
  id: string;
  name: string;
  professor: string;
  mensalidade: number;
  idioma: string;
  payments: any;
}

interface Professor {
  id: string;
  name: string;
}

export default function Students() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snapshot) => {
        const updatedAlunos: Aluno[] = [];
        snapshot.forEach((doc) => {
          const aluno: Aluno = {
            id: doc.id,
            name: doc.data().name,
            professor: doc.data().professor,
            mensalidade: doc.data().mensalidade,
            idioma: doc.data().idioma,
            payments: doc.data().payments,
          };
          updatedAlunos.push(aluno);
        });
        setAlunos(updatedAlunos);
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
    const status = yearPayments[selectedMonth];
  
    if (status === 'paid') {
      return (
        <Tooltip
          className='text-xs font-bold bg-fluency-green-200 rounded-md p-1'
          content="Pago"
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
      // Create references to the user's document in both collections
      const userRef = doc(db, 'users', userId);
      const pastUserRef = doc(db, 'past-users', userId);
  
      // Get the user's data from the 'users' collection
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      // Transfer the user's data to the 'past-users' collection
      await setDoc(pastUserRef, userData);
  
      // Delete the user's document from the 'users' collection
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
      // Get the year from the selected date
      const year = date.getFullYear();
  
      // Create a reference to the user's document
      const userRef = doc(db, 'users', userId);
  
      // Get the user's document data
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      // Check if userData is not undefined
      if (userData) {
        // Get the current payments data
        const currentPayments = userData.payments || {};
  
        // Get the payments for the selected year or initialize an empty object
        const yearPayments = currentPayments[year] || {};
  
        // Check the current payment status for the selected month
        const currentStatus = yearPayments[selectedMonth];
  
        // Determine the new status
        const newStatus = currentStatus === 'paid' ? 'notPaid' : 'paid';
  
        // Update the payment status for the selected month
        yearPayments[selectedMonth] = newStatus;
  
        // Update the payments data in the user's document
        await setDoc(userRef, { payments: { ...currentPayments, [year]: yearPayments } }, { merge: true });
  
        // Show appropriate toast message based on the new status
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
  
  //Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const openEditModal = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsEditModalOpen(true);
    try {
      const userRef = doc(db, 'users', aluno.id);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      if (userData) {
        setSelectedUserEmail(userData.email); // Assuming the email field is named 'email'
        setSelectedUserProfilePic(userData.profilePicture); // Assuming the profile picture URL field is named 'profilePicture'
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSelectedUserEmail(null);
      setSelectedUserProfilePic(null);
    }
  };
  
  const handleMensalidadeChange = (value: number) => {
    if (selectedAluno) {
      setSelectedAluno({ ...selectedAluno, mensalidade: value });
    }
  };

  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages = ['Português', 'Inglês', 'Espanhol', 'Libras', 'Alemão'];
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const [professors, setProfessors] = useState<Professor[]>([]);

    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
                const querySnapshot = await getDocs(q);
                const professorList: Professor[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setProfessors(professorList);
            } catch (error) {
                console.error('Error fetching professors:', error);
            }
        };

        fetchProfessors();
    }, []);

    const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null); // Store the selected professor
    const handleProfessorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const professorId = e.target.value;
      const selectedProf = professors.find((professor) => professor.id === professorId);
      setSelectedProfessor(selectedProf || null);
    };


    const saveChanges = async (updatedAluno: Aluno) => {
      try {
        const { id, ...alunoData } = updatedAluno;
        const userRef = doc(db, 'users', id);
        const dataToSave = { ...alunoData, idioma: selectedLanguage };
        await setDoc(userRef, dataToSave, { merge: true });
        toast.success('Alterações salvas com sucesso!', { position: 'top-center' });
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Error saving changes:', error);
        toast.error('Erro ao salvar alterações!', { position: 'top-center' });
      }
    };

  return (
    <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     
      <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
      <div className='flex flex-row items-center justify-around w-full'>
          <h3 className='font-semibold text-xl'>
            Alunos Fluency Lab
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
          <TableColumn>Professor</TableColumn>
          <TableColumn>Mensalidade</TableColumn>
          <TableColumn>Idioma</TableColumn>
          <TableColumn className='flex flex-col items-center justify-center'>Pagamento</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody>
          {alunos.map((aluno) => (
            <TableRow key={aluno.id}>
              <TableCell>
                  <span className="cursor-pointer" onClick={() => openEditModal(aluno)}>{aluno.name}</span>
                </TableCell>
              <TableCell>{aluno.professor}</TableCell>
              <TableCell>{aluno.mensalidade}</TableCell>
              <TableCell>{aluno.idioma}</TableCell>
              <TableCell className='flex flex-col items-center'>
                {renderPaymentStatus(aluno.payments)}
              </TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
                  <Tooltip className='text-xs font-bold bg-fluency-red-200 rounded-md p-1' content="Excluir aluno">
                  <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => openModal(aluno.id, aluno.name)}>
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
                    <TbPigMoney onClick={() => confirmPayment(aluno.id, new Date(), selectedMonth)} />
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
                        Tem certeza que deseja excluir o aluno {selectedUserName}?                            
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

            {isEditModalOpen && selectedAluno && (
              <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center">
                            <FluencyCloseButton onClick={() => setIsEditModalOpen(false)}/>
          
                            <div className="mt-2 flex flex-col gap-3 p-4"> 
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                Atualizar Informações do Aluno
                            </h3>

                            <div>
                              <div className='bg-fluency-gray-100 dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-full rounded-xl p-3 flex flex-row items-center gap-3'>
                                  <div className="relative inline-block">
                                    <div className='bg-gray-300 w-14 h-14 rounded-full flex items-center justify-center mx-auto'>
                                      {selectedUserProfilePic ? (
                                        <Image src={selectedUserProfilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                                      ) : (
                                        <FaUserCircle className='icon w-14 h-14 rounded-full'/>
                                      )}
                                    </div>
                                    <span className="absolute animate-pulse top-0 center-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                                  </div>
                                
                                <div className='flex flex-col text-left'>
                                  <p className='text-md'>{selectedAluno.name}</p>
                                  <p className='text-xs font-normal'>{selectedUserEmail}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className='text-xs font-semibold'>Mensalidade</p>
                              <FluencyInput 
                                type="number"
                                id="mensalidade"
                                value={selectedAluno.mensalidade}
                                onChange={(e) => handleMensalidadeChange(parseFloat(e.target.value))}/>
                            </div>

                            <div>
                              <p className='text-xs font-semibold'>Idioma</p>
                              <select value={selectedLanguage} onChange={handleLanguageChange} className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'>
                                <option value="">Selecionar Idioma</option>
                                {languages.map((language) => (
                                  <option key={language} value={language}>
                                    {language}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <p className='text-xs font-semibold'>Professor</p>
                              <select value={selectedProfessor?.id || ''} onChange={handleProfessorChange} className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-yellow-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'>
                                <option value="">Selecionar Professor</option>
                                  {professors.map((professor) => (
                                    <option key={professor.id} value={professor.id}>
                                      {professor.name}
                                </option>))}
                              </select>
                            </div>

                            <div className="flex flex-row justify-center">                            
                              <FluencyButton variant='confirm' onClick={() => saveChanges(selectedAluno)}>Salvar</FluencyButton>
                              <FluencyButton variant='gray' onClick={() => setIsEditModalOpen(false)}>Cancelar</FluencyButton>
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
