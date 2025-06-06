'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@nextui-org/react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/app/firebase';
import { IoIosCheckbox } from 'react-icons/io';
import { MdFolderDelete, MdOutlineAttachEmail, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { RiErrorWarningLine, RiMailSendFill } from 'react-icons/ri';
import { FaUserCircle, FaGraduationCap } from 'react-icons/fa';
import { LuUserCheck2 } from "react-icons/lu";
import { CameraIcon } from "lucide-react";
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from "@/app/ui/Components/Input/input";
import { FiEdit2, FiTrash2, FiSearch, FiUserCheck, FiMail, FiAward } from 'react-icons/fi';
import { HiOutlineUserGroup, HiOutlineCalendar, HiOutlineCash } from 'react-icons/hi';
import ConfirmationModal from '@/app/ui/Components/ModalComponents/confirmation';
import CertificadoModal from './CertificadoModal';
import EditAluno from './EditAlunoModal';

// Professor interface
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

// Student interface
interface AlunoProps {
  id: string;
  name: string;
  professorId: string;
  CNPJ?: string;
  professor?: string;
  mensalidade?: number;
  idioma?: string;
  payments?: any;
  studentMail?: string;
  comecouEm?: string;
  encerrouEm?: string;
  diaAula?: string;
  status?: string;
  classes?: any;
  userName?: string;
  profilePictureURL?: any;
  diaPagamento?: any;
  ContratosAssinados?: ContractStatus;
}

interface ContractStatus {
  signed: boolean;
  signedByAdmin: boolean;
  logId: string | null;
  signedAt: string | null;
  adminSignedAt: string | null;
}

interface TimeSlot {
  day: string;
  hour: string;
  status?: {
    studentId: string;
    studentName: string;
  };
}

export default function Users() {
  // State variables for professors
  const [professores, setProfessores] = useState<ProfessorProps[]>([]);
  const [students, setStudents] = useState<AlunoProps[]>([]);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [editModal, setEditModal] = useState<boolean>(false);
  const [newSalary, setNewSalary] = useState<number | "">(0);
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorProps | null>(null);
  const [selectedUserProfilePic, setSelectedUserProfilePic] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // State variables for students
  const [alunos, setAlunos] = useState<AlunoProps[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<AlunoProps | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filteredAlunos, setFilteredAlunos] = useState<AlunoProps[]>([]);
  const [currentCollection, setCurrentCollection] = useState<string>("users");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalAction, setModalAction] = useState<"delete" | "reactivate">("delete");
  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<{ name: string; course?: string } | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<'professors' | 'students'>('professors');

  // Responsive breakpoint
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load professors data
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

  // Load students data
  useEffect(() => {
    const unsubscribe = onSnapshot(getQuery(), async (snapshot) => {
      const updatedAlunos: AlunoProps[] = [];
      for (const docSnapshot of snapshot.docs) {
        const aluno: AlunoProps = {
          id: docSnapshot.id,
          name: docSnapshot.data().name,
          CNPJ: docSnapshot.data().CNPJ,
          professor: docSnapshot.data().professor,
          professorId: docSnapshot.data().professorId,
          mensalidade: docSnapshot.data().mensalidade,
          idioma: docSnapshot.data().idioma,
          payments: docSnapshot.data().payments,
          studentMail: docSnapshot.data().email,
          diaAula: docSnapshot.data().diaAula,
          comecouEm: docSnapshot.data().comecouEm,
          encerrouEm: docSnapshot.data().encerrouEm,
          status: currentCollection === "users" ? "Ativo" : "Desativado",
          classes: docSnapshot.data().classes || false,
          userName: docSnapshot.data().userName,
          profilePictureURL: docSnapshot.data().profilePictureURL,
          diaPagamento: docSnapshot.data().diaPagamento,
        };

        // Fetch contract status for each student
        if (docSnapshot.data().ContratosAssinados) {
          aluno.ContratosAssinados = docSnapshot.data().ContratosAssinados;
        } else {
          aluno.ContratosAssinados = {
            signed: false,
            signedByAdmin: false,
            logId: null,
            signedAt: null,
            adminSignedAt: null,
          };
        }
        updatedAlunos.push(aluno);
      }
      setAlunos(updatedAlunos);
    });

    return () => unsubscribe();
  }, [currentCollection]);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredAlunos(alunos);
    } else {
      setFilteredAlunos(
        alunos.filter(
          (aluno) =>
            (aluno.name &&
              aluno.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (aluno.professor &&
              aluno.professor
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (aluno.idioma &&
              aluno.idioma.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
  }, [searchQuery, alunos]);

  // Helper functions
  const getQuery = () => {
    if (currentCollection === "users") {
      return query(collection(db, "users"), where("role", "==", "student"));
    } else if (currentCollection === "past_students") {
      return query(collection(db, "past_students"));
    }
    return query(collection(db, "users"), where("role", "==", "student"));
  };

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

  // Modal functions
  const openModal = (userId: string, userName: string, action: "delete" | "reactivate" = "delete") => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setModalAction(action);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Professor functions
  const transferUser = async (userId: string) => {
    try {
      if (currentCollection === "users" && modalAction === "delete") {
        // Transfer student to past-students
        const userRef = doc(db, "users", userId);
        const pastUserRef = doc(db, "past_students", userId);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();

        if (userData) {
          userData.encerrouEm = new Date().toISOString();
          await setDoc(pastUserRef, userData);
          const collections = [
            "Notebooks",
            "Contratos",
            "Nivelamento",
            "Decks",
            "AulasGravadas",
            "Slides",
            "Placement",
            "Contrato",
            "enrollments",
            "quizResults",
          ];
          for (const collectionName of collections) {
            const collectionRef = collection(db, "users", userId, collectionName);
            const snapshot = await getDocs(collectionRef);

            snapshot.forEach(
              async (docSnapshot: { data: () => any; id: string }) => {
                const docData = docSnapshot.data();
                const pastCollectionRef = doc(
                  db,
                  "past_students",
                  userId,
                  collectionName,
                  docSnapshot.id
                );
                await setDoc(pastCollectionRef, docData);
              }
            );
          }
          await deleteDoc(userRef);
          toast.error("Aluno deletado e transferido para alunos passados!", {
            position: "top-center",
          });
        }
      } else if (currentCollection === "past_students" && modalAction === "reactivate") {
        // Reactivate student
        await reactivateStudent(userId);
      } else {
        // Delete professor
        const userRef = doc(db, 'users', userId);
        const pastUserRef = doc(db, 'past-teachers', userId);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        await setDoc(pastUserRef, userData);
        await deleteDoc(userRef);
        toast.error('Professor deletado!', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error transferring user:', error);
      toast.error('Erro ao processar operação!', {
        position: 'top-center',
      });
    }
  };

  const reactivateStudent = async (userId: string) => {
    try {
      const pastUserRef = doc(db, "past_students", userId);
      const userRef = doc(db, "users", userId);
      const pastUserSnapshot = await getDoc(pastUserRef);
      const pastUserData = pastUserSnapshot.data();

      if (pastUserData) {
        delete pastUserData.encerrouEm;
        await setDoc(userRef, pastUserData);
        const collections = [
          "Notebooks",
          "Contratos",
          "Nivelamento",
          "Decks",
          "AulasGravadas",
          "Slides",
        ];
        for (const collectionName of collections) {
          const pastCollectionRef = collection(
            db,
            "past_students",
            userId,
            collectionName
          );
          const snapshot = await getDocs(pastCollectionRef);

          snapshot.forEach(async (docSnapshot) => {
            const docData = docSnapshot.data();
            const collectionRef = doc(
              db,
              "users",
              userId,
              collectionName,
              docSnapshot.id
            );
            await setDoc(collectionRef, docData);
          });
        }
        await deleteDoc(pastUserRef);

        toast.success("Aluno reativado com sucesso!", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error reactivating student:", error);
      toast.error("Erro ao reativar aluno!", {
        position: "top-center",
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

  // Student functions
  const toggleClassesStatus = async (alunoId: string, currentClasses: boolean) => {
    const alunoRef = doc(db, "users", alunoId);
    await updateDoc(alunoRef, {
      classes: !currentClasses,
    });
    toast.success(currentClasses ? "Desativado" : "Ativado", {
      duration: 3000,
    });
  };

  const handleEditClick = (aluno: AlunoProps) => {
    setSelectedAluno(aluno);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedAluno(null);
  };

  const handleOpenCertificadoModal = (aluno: AlunoProps) => {
    setSelectedStudentForCert({
      name: aluno.name,
      course: aluno.idioma,
    });
    setIsCertificadoModalOpen(true);
  };

  const handleCloseCertificadoModal = () => {
    setIsCertificadoModalOpen(false);
    setSelectedStudentForCert(undefined);
  };

  // Email functions
  const handleOnClickWelcome = async (userName: string, studentMail: string, name: string, templateType: string = 'welcome') => {
    try {
      const response = await toast.promise(
        fetch('/api/emails/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName,
            teacherName: name,
            studentMail,
            templateType,
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

  // Format date for display
  const formatDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }, []);

return (
    <div className="min-h-screen w-full p-2 md:p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl p-4 shadow-sm">
        {/* Tab Navigation - Modern Design */}
        <div className="flex mb-6 border-b border-fluency-gray-200 dark:border-fluency-gray-700">
          <button
            onClick={() => setActiveTab('professors')}
            className={`py-3 px-6 flex items-center gap-2 font-medium transition-all ${
              activeTab === 'professors'
                ? 'border-b-2 border-fluency-blue-500 text-fluency-blue-500'
                : 'text-fluency-gray-500 hover:text-fluency-blue-400'
            }`}
          >
            <HiOutlineUserGroup className="text-lg" />
            <span>Professores</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-3 px-6 flex items-center gap-2 font-medium transition-all ${
              activeTab === 'students'
                ? 'border-b-2 border-fluency-blue-500 text-fluency-blue-500'
                : 'text-fluency-gray-500 hover:text-fluency-blue-400'
            }`}
          >
            <FaGraduationCap />
            <span>Alunos</span>
          </button>
        </div>

        {/* Professors Tab - Modern Card Design */}
        {activeTab === 'professors' && (
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <HiOutlineUserGroup className="text-fluency-blue-500" />
                Lista de Professores
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      className="w-full bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark pl-3 pr-8 py-2 rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                      value={selectedMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    <HiOutlineCalendar className="absolute right-3 top-3 text-fluency-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <select
                      className="w-full bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark pl-3 pr-8 py-2 rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                      value={selectedYear}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    >
                      <option value={selectedYear}>{selectedYear}</option>
                    </select>
                    <HiOutlineCalendar className="absolute right-3 top-3 text-fluency-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-700">
              <Table aria-label="Professors table" className="min-w-full">
                <TableHeader className="bg-fluency-gray-100 dark:bg-fluency-gray-800">
                  <TableColumn className="py-3 px-4 text-left font-semibold">Professor</TableColumn>
                  <TableColumn className="py-3 px-4 text-left font-semibold">Salário</TableColumn>
                  <TableColumn className="py-3 px-4 text-center font-semibold">Pagamento</TableColumn>
                  <TableColumn className="py-3 px-4 text-right font-semibold">Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {professores.map((professor) => (
                    <TableRow key={professor.id} className="border-b border-fluency-gray-100 dark:border-fluency-gray-700 hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800">
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                            <FaUserCircle className="text-xl text-fluency-gray-400" />
                          </div>
                          <span 
                            onClick={() => openEditModal(professor.id)} 
                            className="font-medium cursor-pointer hover:text-fluency-blue-500 transition-colors"
                          >
                            {professor.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <HiOutlineCash className="text-fluency-green-500" />
                          <span>R$ {professor.salario}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 flex justify-center">
                        {renderPaymentStatus(professor.payments)}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Tooltip content="Editar" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                            <button 
                              onClick={() => openEditModal(professor.id)}
                              className="p-2 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-900/50 transition-colors"
                            >
                              <FiEdit2 className="text-fluency-blue-500" />
                            </button>
                          </Tooltip>
                          
                          <Tooltip content="Enviar comprovante" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                            <button className="p-2 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-900/50 transition-colors">
                              <RiMailSendFill className="text-fluency-blue-500" />
                            </button>
                          </Tooltip>
                          
                          <Tooltip content="Confirmar pagamento" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                            <button 
                              onClick={() => confirmPayment(professor.id, new Date(), selectedMonth, professor.payments?.[selectedYear]?.[selectedMonth]?.paymentKey || '')}
                              className="p-2 rounded-lg hover:bg-fluency-green-100 dark:hover:bg-fluency-green-900/50 transition-colors"
                            >
                              <TbPigMoney className="text-fluency-green-500" />
                            </button>
                          </Tooltip>
                          
                          <Tooltip content="Excluir" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                            <button 
                              onClick={() => openModal(professor.id, professor.name)}
                              className="p-2 rounded-lg hover:bg-fluency-red-100 dark:hover:bg-fluency-red-900/50 transition-colors"
                            >
                              <FiTrash2 className="text-fluency-red-500" />
                            </button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Students Tab - Modern Card Design */}
        {activeTab === 'students' && (
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
            <div className="flex flex-col gap-4 mb-6">
              <h3 className='text-xl font-bold flex items-center gap-2'>
                <FaGraduationCap />
                {currentCollection === "users" ? "Alunos Ativos" : "Alunos Passados"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fluency-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar aluno..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-600 bg-fluency-bg-light dark:bg-fluency-bg-dark focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentCollection("users")}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      currentCollection === "users"
                        ? "bg-fluency-blue-500 text-white shadow-md"
                        : "bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700"
                    }`}
                  >
                    Ativos
                  </button>
                  <button
                    onClick={() => setCurrentCollection("past_students")}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      currentCollection === "past_students"
                        ? "bg-fluency-blue-500 text-white shadow-md"
                        : "bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700"
                    }`}
                  >
                    Passados
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-700">
              <Table className="min-w-full">
                <TableHeader className="bg-fluency-gray-100 dark:bg-fluency-gray-800">
                  <TableColumn className="py-3 px-4 text-left font-semibold">Aluno</TableColumn>
                  <TableColumn className="py-3 px-4 text-left font-semibold">Professor</TableColumn>
                  <TableColumn className="py-3 px-4 text-left font-semibold">Contrato</TableColumn>
                  <TableColumn className="py-3 px-4 text-left font-semibold">Início</TableColumn>
                  <TableColumn className="py-3 px-4 text-left font-semibold">Término</TableColumn>
                  <TableColumn className="py-3 px-4 text-right font-semibold">Ações</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredAlunos.map((aluno) => (
                    <TableRow key={aluno.id} className="border-b border-fluency-gray-100 dark:border-fluency-gray-700 hover:bg-fluency-gray-50 dark:hover:bg-fluency-gray-800">
                      <TableCell 
                        className="py-3 px-4 font-medium cursor-pointer hover:text-fluency-blue-500 transition-colors"
                        onClick={() => handleEditClick(aluno)}
                      >
                        {aluno.name}
                      </TableCell>
                      <TableCell className="py-3 px-4">{aluno.professor}</TableCell>
                      <TableCell className="py-3 px-4">
                        {aluno.ContratosAssinados?.signed ? (
                          <span className="inline-flex items-center gap-1 text-fluency-green-500">
                            <LuUserCheck2 className="text-lg" /> Assinado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-fluency-red-500">
                            <RiErrorWarningLine /> Pendente
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">{formatDate(aluno.comecouEm)}</TableCell>
                      <TableCell className="py-3 px-4">{formatDate(aluno.encerrouEm)}</TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          {currentCollection === "past_students" ? (
                            <Tooltip content="Reativar aluno" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                              <button 
                                onClick={() => openModal(aluno.id, aluno.name, "reactivate")}
                                className="p-2 rounded-lg hover:bg-fluency-green-100 dark:hover:bg-fluency-green-900/50 transition-colors"
                              >
                                <FiUserCheck className="text-fluency-green-500" />
                              </button>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip content="Editar" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                                <button 
                                  onClick={() => handleEditClick(aluno)}
                                  className="p-2 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-900/50 transition-colors"
                                >
                                  <FiEdit2 className="text-fluency-blue-500" />
                                </button>
                              </Tooltip>
                              
                              <Tooltip content="Excluir" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                                <button 
                                  onClick={() => openModal(aluno.id, aluno.name, "delete")}
                                  className="p-2 rounded-lg hover:bg-fluency-red-100 dark:hover:bg-fluency-red-900/50 transition-colors"
                                >
                                  <FiTrash2 className="text-fluency-red-500" />
                                </button>
                              </Tooltip>
                              
                              <Tooltip content="Enviar e-mail" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                                <button 
                                  onClick={() => handleOnClickWelcome(aluno.userName || "", aluno.studentMail || "", aluno.name)}
                                  className="p-2 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-900/50 transition-colors"
                                >
                                  <FiMail className="text-fluency-blue-500" />
                                </button>
                              </Tooltip>
                              
                              <Tooltip content="Certificado" className="text-xs bg-fluency-gray-700 text-white px-2 py-1 rounded">
                                <button 
                                  onClick={() => handleOpenCertificadoModal(aluno)}
                                  className="p-2 rounded-lg hover:bg-fluency-green-100 dark:hover:bg-fluency-green-900/50 transition-colors"
                                >
                                  <FiAward className="text-fluency-green-500" />
                                </button>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Delete/Reactivate Confirmation Modal - Modern Design */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {modalAction === "delete" ? "Excluir" : "Reativar"} {currentCollection.includes("student") ? "Aluno" : "Professor"}
                </h3>
                <FluencyCloseButton onClick={closeModal} />
              </div>
              <p className="mb-6 text-fluency-gray-700 dark:text-fluency-gray-300">
                {modalAction === "delete"
                  ? `Tem certeza que deseja excluir ${selectedUserName}? Esta ação não pode ser desfeita.`
                  : `Tem certeza que deseja reativar ${selectedUserName}?`}
              </p>
              <div className="flex justify-end gap-3">
                <FluencyButton
                  onClick={closeModal}
                  variant="gray"
                >
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  onClick={() => {
                    transferUser(selectedUserId);
                    closeModal();
                  }}
                  variant={modalAction === "delete" ? "danger" : "confirm"}
                >
                  {modalAction === "delete" ? "Excluir" : "Reativar"}
                </FluencyButton>
              </div>
            </div>
          </div>
        )}

        {/* Professor Edit Modal - Modern Design */}
        {editModal && selectedProfessor && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Editar Professor</h3>
                <FluencyCloseButton onClick={closeEditModal} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Section */}
                <div className="md:col-span-1 flex flex-col items-center">
                  {selectedUserProfilePic ? (
                    <img
                      src={selectedUserProfilePic}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-fluency-blue-100 dark:border-fluency-gray-700"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-32 h-32 flex items-center justify-center mb-4">
                      <FaUserCircle className="text-6xl text-fluency-gray-400" />
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-center">{selectedProfessor.name}</h4>
                  <p className="text-sm text-fluency-gray-500 text-center">{selectedProfessor.email}</p>
                </div>
                
                {/* Details Section */}
                <div className="md:col-span-2">
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Salário (R$)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newSalary}
                        onChange={handleSalaryChange}
                        className="w-full p-3 rounded-lg border border-fluency-gray-200 dark:border-fluency-gray-600 bg-fluency-bg-light dark:bg-fluency-bg-dark focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                      />
                      <HiOutlineCash className="absolute right-3 top-3.5 text-fluency-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Students List */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <FaGraduationCap className="text-fluency-blue-500" />
                        Alunos ({students.length})
                      </h5>
                      <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {students.length > 0 ? (
                          students.map((student) => (
                            <div key={student.id} className="py-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark mb-2 last:mb-0">
                              {student.name}
                            </div>
                          ))
                        ) : (
                          <p className="text-fluency-gray-500 text-center py-4">Nenhum aluno associado</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Schedule */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <HiOutlineCalendar className="text-fluency-blue-500" />
                        Horários
                      </h5>
                      <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot, index) => (
                            <div key={index} className="py-2 px-3 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark mb-2 last:mb-0 flex justify-between">
                              <span className="font-medium">{slot.day} - {slot.hour}</span>
                              {slot.status ? (
                                <span className="text-fluency-blue-500">{slot.status.studentName}</span>
                              ) : (
                                <span className="text-fluency-green-500">Disponível</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-fluency-gray-500 text-center py-4">Nenhum horário cadastrado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <FluencyButton
                  onClick={closeEditModal}
                  variant="gray"
                >
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  onClick={() => updateProfessorSalary(selectedProfessor.id, Number(newSalary))}
                >
                  Salvar Alterações
                </FluencyButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={() => {
            if (modalAction === "delete") {
              transferUser(selectedUserId);
            } else {
              reactivateStudent(selectedUserId);
            }
            closeModal();
          }}
          title={
            modalAction === "delete"
              ? `Confirmar Exclusão`
              : `Confirmar Reativação`
          }
          message={
            modalAction === "delete"
              ? `Tem certeza que deseja excluir o aluno ${selectedUserName}?`
              : `Tem certeza que deseja reativar o aluno ${selectedUserName}?`
          }
          confirmButtonText={
            modalAction === "delete" ? "Sim, excluir" : "Sim, reativar"
          }
          cancelButtonText="Não, cancelar"
          confirmButtonVariant={modalAction === "delete" ? "danger" : "success"}
        />
      )}

      {/* Modal de Certificado */}
      <CertificadoModal
        isOpen={isCertificadoModalOpen}
        onClose={handleCloseCertificadoModal}
        studentData={selectedStudentForCert}
      />

      {isEditModalOpen && selectedAluno && (
        <EditAluno selectedAluno={selectedAluno} onClose={handleCloseModal} />
      )}
      
    </div>
  );
}