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
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, onSnapshot  } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { IoIosCheckbox } from 'react-icons/io';
import { MdFolderDelete, MdOutlineAttachEmail, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { RiErrorWarningLine, RiMailSendFill } from 'react-icons/ri';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';

import { Toaster, toast } from 'react-hot-toast';
import { FaUserCircle } from 'react-icons/fa';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface ProfessorProps {
  id: string;
  name: string;
  professor: string;
  salario: number;
  payments: any;
  email: string; 
  status: string;
  userName: string;
}

interface AlunoProps {
  id: string;
  name: string;
  professorId: string;
}

interface TimeSlot {
  day: string;
  hour: string;
  status?: {
    studentId: string;
    studentName: string;
  };
}

export default function Professors() {
  const [professores, setProfessores] = useState<ProfessorProps[]>([]);
  const [students, setStudents] = useState<AlunoProps[]>([]);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'users'), where('role', '==', 'teacher')), (snapshot) => {
      const updatedProfessores: ProfessorProps[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ProfessorProps));
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
        <span className="hover:text-fluency-orange-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
          <RiErrorWarningLine className='text-fluency-orange-500'/>
        </span>
      </Tooltip>
    );
  
    const yearPayments = payments[selectedYear] || {};
    const statusData = yearPayments[selectedMonth];
  
    if (!statusData) {
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
      toast.error('Professor deletado!', {
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error transferring user to past-users:', error);
      toast.error('Erro ao deletar aluno!', {
        position: 'top-center',
      });
    }
  };

  const confirmPayment = async (userId: string, date: Date, selectedMonth: string, paymentKey: string) => {
    try {
      const year = date.getFullYear();
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (userData) {
        const currentPayments = userData.payments || {};
        const yearPayments = currentPayments[year] || {};
        const currentStatus = yearPayments[selectedMonth]?.status || 'notPaid';
        const newPaymentKey = uuidv4();
        const newStatus = currentStatus === 'paid' ? 'notPaid' : 'paid';
        const newSalary = userData.salario;
  
        yearPayments[selectedMonth] = {
          status: newStatus,
          salary: newSalary,
          paymentKey: newStatus === 'paid' ? newPaymentKey : paymentKey,
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
  
  const [editModal, setEditModal] = useState<boolean>(false);
  const [newSalary, setNewSalary] = useState<number | "">(0);
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorProps | null>(null);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string | null>(null);
  
  const openEditModal = async (professorId: string) => {
    const professor = professores.find(prof => prof.id === professorId);
    if (professor) {
      setSelectedProfessor(professor);
      setNewSalary(professor.salario);
    }
    setEditModal(true);

    try {
      const userRef = doc(db, 'users', professorId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
      
      if (userData) {

        const storage = getStorage();
        const profilePicRef = ref(storage, `profilePictures/${professorId}`);
        
        getDownloadURL(profilePicRef)
          .then((url: React.SetStateAction<string | null>) => {
            setSelectedUserProfilePic(url);
          })
          .catch((error) => {
            console.error('Error fetching profile picture URL:', error);
            setSelectedUserProfilePic(null);
          });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSelectedUserProfilePic(null);
    }
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'), where('professorId', '==', professorId));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name, 
        professorId: doc.data().professorId,
      }));
      setStudents(fetchedStudents);
      
    } catch (error) {
      console.error('Error fetching students:', error);
    }
    
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedProfessor(null);
    setNewSalary(0);
  };

  const updateProfessorSalary = async (professorId: string, newSalary: number) => {
    const professorRef = doc(db, 'users', professorId);
    await setDoc(professorRef, { salario: newSalary }, { merge: true });
    setEditModal(false);
  };
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSalary(Number(e.target.value));
  };
  

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const fetchTimeSlots = async (professorId: string) => {
    try {
      console.log(`Fetching time slots for professorId: ${professorId}`);
      
      const docRef = doc(db, 'users', professorId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.times) {
          const fetchedTimeSlots: TimeSlot[] = data.times.map((time: any) => ({
            day: time.day || '',
            hour: time.hour || '',
            status: time.status ? {
              studentId: time.status.studentId || '',
              studentName: time.status.studentName || ''
            } : undefined
          }));
          console.log('Fetched time slots:', fetchedTimeSlots);
          setTimeSlots(fetchedTimeSlots);
        } else {
          console.log('No time slots found in the document');
          setTimeSlots([]); // Clear time slots if none are found
        }
      } else {
        console.log('Document not found');
        setTimeSlots([]); // Clear time slots if document not found
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]); // Clear time slots on error
    }
  };
  
  useEffect(() => {
    if (selectedProfessor) {
      console.log('Selected professor changed:', selectedProfessor);
      setTimeSlots([]);
      fetchTimeSlots(selectedProfessor.id);
    }
  }, [selectedProfessor]);
  
  const handleOnClickWelcome = async (userName: string, studentMail: string, name: string) => {
    try {
      const response = await toast.promise(
        fetch('/api/emails/receipts', { // Update the endpoint to the correct one
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName,
            teacherName: name,
            studentMail,
            templateType: 'welcomeTeacher', // Add the templateType parameter
          }),
        }),
        {
          loading: 'Enviando e-mail de boas vindas...',
          success: 'E-mail enviado!',
          error: 'Erro ao enviar e-mail!',
        }
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      toast.error('Erro ao enviar email!', {
        position: 'top-center',
      });
    }
  };

  return (
    <div className="h-screen flex flex-col items-center lg:px-5 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     
      <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
      <div className='flex flex-row items-center justify-around w-full'>
          <h3 className='font-semibold text-xl'>
            Professores
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

      <Table aria-label="Label for accessibility">
        <TableHeader>
        <TableColumn>Nome</TableColumn>
          <TableColumn>Salário</TableColumn>
          <TableColumn className='flex flex-col items-center justify-center'>Pagamento</TableColumn>
          <TableColumn>Ações</TableColumn>
        </TableHeader>
        <TableBody>
          {professores.map((professor) => (
            <TableRow key={professor.id}>
              <TableCell>
                  <span onClick={() => openEditModal(professor.id)} className="cursor-pointer">{professor.name}</span>
                </TableCell>
              <TableCell>R$ {professor.salario}</TableCell>
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
                    <TbPigMoney onClick={() => confirmPayment(professor.id, new Date(), selectedMonth, professor.payments?.[selectedYear]?.[selectedMonth]?.paymentKey || '')} />
                    </span>
                  </Tooltip>
                  <Tooltip className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1' content="Enviar e-mail de boas-vindas">
                      <span className="hover:text-fluency-blue-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
                          <MdOutlineAttachEmail onClick={() => handleOnClickWelcome(professor.name, professor.email, professor.userName)} />
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

      {editModal && selectedProfessor && selectedProfessor.id && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-black dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
              <div className="flex flex-col items-center">
                <FluencyCloseButton onClick={closeEditModal} />
                <div className="mt-2 flex flex-col gap-3 p-4">
                  <h3 className="text-lg leading-6 font-medium mb-2">
                    Atualizar Informações do Professor
                  </h3>
                  <div>
                    <div className='bg-fluency-gray-100 dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-full rounded-xl p-3 flex flex-row items-center gap-3'>
                      <div className="relative inline-block">
                        <div className='bg-gray-300 w-14 h-14 rounded-full flex items-center justify-center mx-auto'>
                          {selectedUserProfilePic ? (
                            <img src={selectedUserProfilePic} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                            <FaUserCircle className='icon w-14 h-14 dark:text-fluency-bg-dark rounded-full'/>
                          )}
                        </div>
                        {selectedProfessor.status === 'online' ? (
                          <span className="absolute top-0 center-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                        ):(
                          <span className="absolute top-0 center-0 w-4 h-4 bg-fluency-red-700 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className='flex flex-col text-left'>
                        <p className='text-md'>{selectedProfessor.name}</p>
                        <p className='text-xs font-normal'>{selectedProfessor.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-bold mb-2">Salário</label>
                    <div className='flex flex-row gap-1 items-center'>
                    <input
                      type="number"
                      value={newSalary || ''}
                      onChange={handleSalaryChange}
                      className="bg-fluency-gray-100 dark:bg-fluency-gray-700 p-2 rounded w-full font-semibold"
                    /><FluencyButton
                    onClick={() => {
                      updateProfessorSalary(selectedProfessor!.id, newSalary as number);
                      closeEditModal();
                    }}
                  >
                    Atualizar
                  </FluencyButton>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-bold mb-2">Alunos: {students.length}</label>
                    <ul className='bg-fluency-gray-100 font-semibold dark:bg-fluency-gray-700 p-2 rounded'>
                      {students.map(student => (
                        <li key={student.id}>
                          <span>{student.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4 w-full">
                    <label className="block font-bold mb-2">Horários disponíveis: {timeSlots.filter(slot => slot.status?.studentId === 'disponivel').length}</label>
                    <ul className='bg-fluency-gray-100 dark:bg-fluency-gray-700 p-2 rounded'>
                      {timeSlots.map((slot, index) => (
                        <li className='flex flex-row gap-2 items-center' key={index}>
                          {slot.day} às {slot.hour}: {
                            slot.status?.studentId === "disponivel" ? (
                              <p className='font-semibold text-fluency-green-500'>Disponível</p>
                            ) : slot.status?.studentName ? (
                              <p className='font-semibold'>{slot.status?.studentName}</p>
                            ) : (
                              "Não disponível"
                            )
                          }                       
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-row justify-center">
                    <FluencyButton variant='gray' onClick={closeEditModal}>Fechar</FluencyButton>
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