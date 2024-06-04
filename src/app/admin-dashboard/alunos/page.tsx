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
import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Toaster, toast } from 'react-hot-toast';
import FluencyInput from '@/app/ui/Components/Input/input';
import { FaUserCircle } from 'react-icons/fa';
import FluencySearch from '@/app/ui/Components/Search/search';
import Contratos from '../contratos/page';

interface Aluno {
  id: string;
  name: string;
  professor: string;
  mensalidade: number;
  idioma: string;
  payments: any;
  studentMail: string;
  status: string;
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
            studentMail: doc.data().email,
            status: doc.data().status,
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
    const monthData = yearPayments[selectedMonth] || {};
    const status = monthData.status || 'notPaid';
  
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
      const pastUserRef = doc(db, 'past_students', userId);
  
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
  
  const confirmPayment = async (userId: string, date: Date, selectedMonth: string, paymentKey: string, mensalidade: number) => {
    try {
      // Get the year from the selected date
      const year = date.getFullYear();
  
      // Generate a random key
      const newPaymentKey = uuidv4();
  
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
        const currentStatus = yearPayments[selectedMonth] ? yearPayments[selectedMonth].status : 'notPaid';
  
        // Determine the new status
        const newStatus = currentStatus === 'paid' ? 'notPaid' : 'paid';
  
        // Update the payment status for the selected month
        yearPayments[selectedMonth] = {
          status: newStatus,
          paymentKey: newStatus === 'paid' ? newPaymentKey : paymentKey,
          mensalidade: mensalidade, // Store the mensalidade value
        };
  
        // Update the payments data in the user's document
        await setDoc(userRef, { payments: { ...currentPayments, [year]: yearPayments } }, { merge: true });
  
        // Update component state to trigger re-render
        setAlunos((prevAlunos) => {
          // Find the index of the updated aluno in the array
          const updatedIndex = prevAlunos.findIndex((aluno) => aluno.id === userId);
  
          // Create a copy of the aluno with updated payments data
          const updatedAluno = {
            ...prevAlunos[updatedIndex],
            payments: {
              ...prevAlunos[updatedIndex].payments,
              [year]: yearPayments, // Update payments for the selected year
            },
          };
  
          // Create a new array with the updated aluno at the correct index
          return [
            ...prevAlunos.slice(0, updatedIndex),
            updatedAluno,
            ...prevAlunos.slice(updatedIndex + 1),
          ];
        });
  
        // Show appropriate toast message based on the new status
        const toastMessage = newStatus === 'paid' ? 'Pagamento registrado!' : 'Pagamento retirado!';
        console.log(paymentKey)
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
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string | null>(null);
  const languages = ['Português', 'Inglês', 'Espanhol', 'Libras', 'Alemão'];
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);

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
  
  // Function to fetch and set user data including the profile picture URL
  const openEditModal = async (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsEditModalOpen(true);
    setSelectedLanguages(aluno.idioma ? [aluno.idioma] : []);
    setSelectedProfessor(professors.find(prof => prof.name === aluno.professor) || null);

    try {
      const userRef = doc(db, 'users', aluno.id);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      
      if (userData) {
        setSelectedUserEmail(userData.email);

        // Fetch profile picture URL from Firebase Storage
        const storage = getStorage();
        const profilePicRef = ref(storage, `profilePictures/${aluno.id}`);
        
        getDownloadURL(profilePicRef)
          .then((url) => {
            setSelectedUserProfilePic(url);
          })
          .catch((error) => {
            console.error('Error fetching profile picture URL:', error);
            setSelectedUserProfilePic(null);
          });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSelectedUserEmail(null);
      setSelectedUserProfilePic(null);
    }
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAluno(null);
    setSelectedLanguages([]);
    setSelectedProfessor(null);
  };
  
  const saveChanges = async () => {
    if (!selectedAluno) return;
  
    try {
      const userRef = doc(db, 'users', selectedAluno.id);
      const updatedData = {
        mensalidade: selectedAluno.mensalidade,
        idioma: selectedLanguages.length > 0 ? selectedLanguages[0] : null,
        professor: selectedProfessor ? selectedProfessor.name : selectedAluno.professor,
      };
  
      await setDoc(userRef, updatedData, { merge: true });
      toast.success('Alterações salvas!', { position: 'top-center' });
      closeEditModal();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Erro ao salvar alterações!', { position: 'top-center' });
    }
  };
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const handleOnClick = async (studentMail: string, selectedMonth: string, paymentStatus: string, studentName: string, studentEmail: string, paymentKey: string, paymentKeyProp: string, mensalidade: number, selectedYear: number) => {
    try {
      const response = await toast.promise(
        fetch('/api/emails/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentMail,
            selectedMonth,
            paymentStatus,
            studentName,
            studentEmail,
            paymentKey,
            paymentKeyProp,
            mensalidade,
            selectedYear
          }),
        }),
        {
          loading: 'Enviando comprovante...',
          success: 'Comprovante enviado!',
          error: 'Erro ao enviar comprovante!',
        }
      );
  
      // If response.ok is true, the promise resolves successfully
      // Otherwise, it throws an error and the error message will be displayed
    } catch (error) {
      console.error('Error sending reminder email:', error);
      toast.error('Erro ao enviar email de cobrança!', {
        position: 'top-center',
      });
    }
  };
  

const totalStudents = alunos.length;
const totalMensalidade = alunos.reduce((sum, aluno) => sum + Number(aluno.mensalidade), 0);

const [selectedOption, setSelectedOption] = useState('financeiro');

  return (
    <div className="h-screen flex flex-col items-start lg:px-2 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     

      <select
        className='font-bold text-xl outline-none bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark px-5 py-3 rounded-md'
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="financeiro">Financeiro</option>
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="juridico">Jurídico</option>
      </select>

      {selectedOption === 'financeiro' && (
      <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
      <div className='flex flex-row items-center justify-around gap-2 w-full'>
          <FluencyInput 
          value={searchQuery}
          placeholder='Procure um aluno por aqui...'
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full'
          />

        <select
          className='outline-none flex flex-row justify-center items-center bg-fluency-bg-light dark:bg-fluency-bg-dark dark:text-fluency-gray-100 py-2 rounded-md px-3'
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
          className='outline-none flex flex-row justify-center items-center bg-fluency-bg-light dark:bg-fluency-bg-dark dark:text-fluency-gray-100 py-2 rounded-md px-3'
          value={selectedYear}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
        >
          <option value={selectedYear}>2024</option>
        </select>
      </div>
      <Table aria-label='Table' >
        <TableHeader>
        <TableColumn>Nome</TableColumn>
          <TableColumn>Professor</TableColumn>
          <TableColumn>Mensalidade</TableColumn>
          <TableColumn>Idioma</TableColumn>
          <TableColumn className='flex flex-col items-center justify-center'>Pagamento</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody>
          {alunos.filter(aluno => {
            const searchText = `${aluno.name.toLowerCase()} ${aluno.professor.toLowerCase()}`;
            return searchText.includes(searchQuery.toLowerCase());
            }).map((aluno) => (
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
                    <RiMailSendFill onClick={() => handleOnClick(aluno.studentMail, selectedMonth, aluno.payments[selectedYear]?.[selectedMonth] || 'notPaid', aluno.name, aluno.studentMail, aluno.payments[selectedYear]?.['paymentKey'] || '', aluno.payments?.[selectedYear]?.[selectedMonth]?.paymentKey || '', aluno.mensalidade, selectedYear)} />
                    </span>                                        
                  </Tooltip>
                  <Tooltip className='text-xs font-bold bg-fluency-green-200 rounded-md p-1' content="Confirmar ou retirar pagamento">
                    <span className="hover:text-fluency-green-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
                    <TbPigMoney onClick={() => confirmPayment(aluno.id, new Date(), selectedMonth, aluno.payments?.[selectedYear]?.[selectedMonth]?.paymentKey || '', aluno.mensalidade)} />
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
                                        <img src={selectedUserProfilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                                      ) : (
                                        <FaUserCircle className='icon w-14 h-14 rounded-full'/>
                                      )}
                                    </div>
                                    {selectedAluno.status === 'online' ? (
                                      <span className="absolute top-0 center-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                                    ):(
                                      <span className="absolute top-0 center-0 w-4 h-4 bg-fluency-red-700 border-2 border-white rounded-full"></span>
                                    )}
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
                                  value={selectedAluno.mensalidade}
                                  onChange={(e) => setSelectedAluno({ ...selectedAluno, mensalidade: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                              <p className='text-xs font-semibold'>Idioma</p>
                                <select
                                  value={selectedLanguages}
                                  onChange={(e) => setSelectedLanguages(Array.from(e.target.selectedOptions, option => option.value))}
                                  className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'
                                >
                                  {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                  ))}
                                </select>
                            </div>
                            
                            <div>
                                <p className='text-xs font-semibold'>Professor</p>
                                <select
                                  value={selectedProfessor ? selectedProfessor.id : ''}
                                  onChange={(e) => {
                                    const selectedProf = professors.find(prof => prof.id === e.target.value) || null;
                                    setSelectedProfessor(selectedProf);
                                  }}
                                  className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-yellow-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'
                                >
                                  <option value="">Selecionar Professor</option>
                                  {professors.map((prof) => (
                                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                                  ))}
                                </select>
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
      </div>
      )}

      {selectedOption === 'juridico' && (
          <Contratos />
      )}

    <Toaster />
  </div>
  );
}
