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
import { v4 as uuidv4 } from 'uuid';

import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc, onSnapshot, updateDoc  } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from '@/app/firebase';
import * as XLSX from 'xlsx';
import { IoIosCheckbox } from 'react-icons/io';
import { MdFolderDelete, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { RiErrorWarningLine, RiMailSendFill } from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import { CgRemoveR } from 'react-icons/cg';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';

import { Toaster, toast } from 'react-hot-toast';

import Contratos from '../contratos/page';
import AlunosPassados from './AlunosPassados';

interface Aluno {
  CNPJ: string;
  id: string;
  name: string;
  professor: string;
  professorId: string;
  mensalidade: number;
  idioma: string;
  payments: any;
  studentMail: string;
  status: string;
  diaAula: string;
  diaPagamento?: number;
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
            CNPJ: doc.data().CNPJ,
            professor: doc.data().professor,
            professorId: doc.data().professorId,
            mensalidade: doc.data().mensalidade,
            idioma: doc.data().idioma,
            payments: doc.data().payments,
            studentMail: doc.data().email,
            status: doc.data().status,
            diaAula: doc.data().diaAula,
            diaPagamento: doc.data().diaPagamento,
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
      const userRef = doc(db, 'users', userId);
      const pastUserRef = doc(db, 'past_students', userId);
  
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (userData) {
        // Add the 'encerrouEm' field with the current date
        userData.encerrouEm = new Date().toISOString();
  
        await setDoc(pastUserRef, userData);
        await deleteDoc(userRef);
  
        toast.error('Aluno deletado!', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error transferring user to past-users:', error);
      toast.error('Erro ao deletar aluno!', {
        position: 'top-center',
      });
    }
  };
  
  const confirmPayment = async (userId: string, date: Date, selectedMonth: string, paymentKey: string, mensalidade: number) => {
    try {
      const year = date.getFullYear();
      const newPaymentKey = uuidv4();
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (userData) {
        const currentPayments = userData.payments || {};
        const yearPayments = currentPayments[year] || {};
        const currentStatus = yearPayments[selectedMonth] ? yearPayments[selectedMonth].status : 'notPaid';
        const newStatus = currentStatus === 'paid' ? 'notPaid' : 'paid';
  
        yearPayments[selectedMonth] = {
          status: newStatus,
          paymentKey: newStatus === 'paid' ? newPaymentKey : paymentKey,
          mensalidade: mensalidade,
        };
  
        await setDoc(userRef, { payments: { ...currentPayments, [year]: yearPayments } }, { merge: true });
  
        setAlunos((prevAlunos) => {
          const updatedIndex = prevAlunos.findIndex((aluno) => aluno.id === userId);
          const updatedAluno = {
            ...prevAlunos[updatedIndex],
            payments: {
              ...prevAlunos[updatedIndex].payments,
              [year]: yearPayments,
            },
          };
  
          return [
            ...prevAlunos.slice(0, updatedIndex),
            updatedAluno,
            ...prevAlunos.slice(updatedIndex + 1),
          ];
        });
  
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

  const [selectedCNPJ, setSelectedCNPJ] = useState<string | null>(selectedAluno?.CNPJ || '');

  useEffect(() => {
    setSelectedCNPJ(selectedAluno?.CNPJ || '');
  }, [selectedAluno]);
  
  const saveChanges = async () => {
    if (!selectedAluno) return;
    const CNPJ = selectedAluno.CNPJ || '';
    try {
      const userRef = doc(db, 'users', selectedAluno.id);
      const updatedData = {
        mensalidade: selectedAluno.mensalidade,
        CNPJ: selectedCNPJ,
        diaPagamento: selectedAluno.diaPagamento,
        idioma: selectedLanguages.length > 0 ? selectedLanguages[0] : null,
        professor: selectedProfessor ? selectedProfessor.name : selectedAluno.professor,
        professorId: selectedProfessor ? selectedProfessor.id : selectedAluno.professor,
      };
  
      await setDoc(userRef, updatedData, { merge: true });

      toast.success('Alterações salvas!', { position: 'top-center' });
      closeEditModal();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Erro ao salvar alterações!', { position: 'top-center' });
    }
  };
  
  const removeProfessor = async () => {
    if (!selectedAluno) return;
  
    try {
      const userRef = doc(db, 'users', selectedAluno.id);
      await updateDoc(userRef, {
        professor: '',
        professorId: ''
      });
      toast.success('Professor removido!', { position: 'top-center' });
      closeEditModal()
    } catch (error) {
      console.error('Error removing professor:', error);
      toast.error('Erro ao remover professor!', { position: 'top-center' });
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

const [relatorio, setRelatorio] = useState(false)
function openRelatorio(){
  setRelatorio(true)
}
function closeRelatorio(){
  setRelatorio(false)
}

const exportToExcel = () => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(alunos);
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, 'students.xlsx');
};

  return (
    <div className="h-screen flex flex-col items-start lg:px-2 px-2 py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     

      <select
        className='font-bold text-xl outline-none bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark px-5 py-3 rounded-md'
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="financeiro">Financeiro</option>
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="juridico">Jurídico</option>
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="lista">Lista</option>
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

        <FluencyButton variant='confirm' onClick={openRelatorio}>
          Relatório
        </FluencyButton>
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
          <TableColumn>Dia de Pagamento</TableColumn>
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
              <TableCell>R$ {aluno.mensalidade}</TableCell>
              <TableCell>Dia: {aluno.diaPagamento}</TableCell>
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

            {relatorio && (
            <div className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                  <div className="flex flex-col">
                    <FluencyCloseButton onClick={closeRelatorio}/>
                    <div className="mt-3 flex flex-col gap-3 p-4">
                        <div className='flex flex-col items-start gap-1'>
                          <p>Total de alunos: <span>{totalStudents}</span></p>
                          <p>Total mensalidades: <span>R$ {totalMensalidade}</span></p>
                        </div>
                      <div className="flex justify-center">
                        <FluencyButton variant='danger'>Baixar PDF</FluencyButton>
                        <FluencyButton variant='confirm' onClick={exportToExcel}>Baixar Excel</FluencyButton>
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
                              <p className='text-xs font-semibold'>Dia de Pagamento</p>
                                <FluencyInput
                                  type="number"
                                  value={selectedAluno.diaPagamento}
                                  onChange={(e) => setSelectedAluno({ ...selectedAluno, diaPagamento: Number(e.target.value) })}
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
                              <p className='text-xs font-semibold'>Pagamento para:</p>
                                <select
                                  className='ease-in-out duration-300 w-full pl-4 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800'
                                  value={selectedAluno?.CNPJ || ''}
                                    onChange={(e) => setSelectedAluno({ ...selectedAluno, CNPJ: e.target.value })}
                                  >
                                    <option value="">Selecione o CNPJ</option>
                                    <option value="55.450.653/0001-64">Deise Laiane</option>
                                    <option value="47.63.142/0001-07">Matheus Fernandes</option>
                                </select>  
                            </div>
                            
                            {selectedAluno.professor === '' && selectedAluno.professorId === '' ? (
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
                            ):(
                              <div>
                                  <p className='text-xs font-semibold'>Professor Atual</p>
                                <div className='flex flex-row gap-2 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 px-3 rounded-md'>
                                  <p>{selectedAluno.professor}</p>
                                  <button onClick={removeProfessor}><CgRemoveR className='w-4 h-auto text-fluency-red-500 hover:text-fluency-red-700 duration-300 ease-in-out' /></button>
                                </div>
                              </div>
                            )}

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

      {selectedOption === 'lista' && (
          <AlunosPassados />
      )}

    <Toaster />
  </div>
  );
}