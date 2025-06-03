'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
} from '@nextui-org/react';
import { toast} from 'react-hot-toast';
import { MdFolderDelete, MdOutlineAttachEmail } from 'react-icons/md';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import { LuUserCheck2 } from 'react-icons/lu';
import FluencyInput from '@/app/ui/Components/Input/input';
import EditAluno from './EditAlunoModal';

interface Aluno {
    id: string;
    CNPJ: string;
    name: string;
    professor: string;
    professorId: string;
    mensalidade: number;
    idioma: string;
    payments: any;
    studentMail: string;
    comecouEm: string;
    encerrouEm?: string;
    diaAula: string;
    status: string;
    classes: boolean;
    userName: string;
    profilePictureURL: any;
    diaPagamento: any;
}

export default function Lista() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
    const [currentCollection, setCurrentCollection] = useState<string>('users');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const unsubscribe = onSnapshot(getQuery(), (snapshot) => {
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
                    diaAula: doc.data().diaAula,
                    comecouEm: doc.data().comecouEm,
                    encerrouEm: doc.data().encerrouEm,
                    status: currentCollection === 'users' ? 'Ativo' : 'Desativado',
                    classes: doc.data().classes || false,
                    userName: doc.data().userName,
                    profilePictureURL: doc.data().profilePictureURL,
                    diaPagamento: doc.data().diaPagamento
                };
                updatedAlunos.push(aluno);
            });
            setAlunos(updatedAlunos);
        });

        return () => unsubscribe();
    }, [currentCollection]);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredAlunos(alunos);
        } else {
            setFilteredAlunos(
                alunos.filter(aluno =>
                    (aluno.name && aluno.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (aluno.professor && aluno.professor.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (aluno.idioma && aluno.idioma.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            );            
        }
    }, [searchQuery, alunos]);

    const getQuery = () => {
        if (currentCollection === 'users') {
            return query(collection(db, 'users'), where('role', '==', 'student'));
        } else if (currentCollection === 'past_students') {
            return query(collection(db, 'past_students'));
        }
        return query(collection(db, 'users'), where('role', '==', 'student'));
    };

    const capitalizeFirstLetter = (str: string) => {
        if (!str) return ''; // Check for an empty string or null/undefined
        return str.charAt(0).toUpperCase() + str.slice(1);
      };      

    const toggleClassesStatus = async (alunoId: string, currentClasses: boolean) => {
        const alunoRef = doc(db, 'users', alunoId);
        await updateDoc(alunoRef, {
            classes: !currentClasses,
        });
        toast.success(currentClasses ? 'Desativado' : 'Ativado', {
            duration: 3000,
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [modalAction, setModalAction] = useState<'delete' | 'reactivate'>('delete');
    const openModal = (userId: string, userName: string, action: 'delete' | 'reactivate') => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setModalAction(action);
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
                userData.encerrouEm = new Date().toISOString();
                await setDoc(pastUserRef, userData);
                const collections = [
                    'Notebooks', 
                    'Contratos', 
                    'Nivelamento', 
                    'Decks', 
                    'AulasGravadas', 
                    'Slides',
                    'Placement',
                    'Contrato',
                    'enrollments',
                    'quizResults'
                ];
                for (const collectionName of collections) {
                    const collectionRef = collection(db, 'users', userId, collectionName);
                    const snapshot = await getDocs(collectionRef);
                    
                    snapshot.forEach(async (docSnapshot: { data: () => any; id: string; }) => {
                        const docData = docSnapshot.data();
                        const pastCollectionRef = doc(db, 'past_students', userId, collectionName, docSnapshot.id);
                        await setDoc(pastCollectionRef, docData);
                    });
                }
                await deleteDoc(userRef);
                toast.error('Aluno deletado e transferido para alunos passados!', {
                    position: 'top-center',
                });
            }
        } catch (error) {
            console.error('Error transferring user to past-users:', error);
            toast.error('Erro ao transferir aluno para alunos passados!', {
                position: 'top-center',
            });
        }
    };
    
    const reactivateStudent = async (userId: string) => {
        try {
            const pastUserRef = doc(db, 'past_students', userId);
            const userRef = doc(db, 'users', userId);
            const pastUserSnapshot = await getDoc(pastUserRef);
            const pastUserData = pastUserSnapshot.data();
    
            if (pastUserData) {
                delete pastUserData.encerrouEm;
                await setDoc(userRef, pastUserData);
                const collections = [
                    'Notebooks', 
                    'Contratos', 
                    'Nivelamento', 
                    'Decks', 
                    'AulasGravadas', 
                    'Slides'
                ];
                for (const collectionName of collections) {
                    const pastCollectionRef = collection(db, 'past_students', userId, collectionName);
                    const snapshot = await getDocs(pastCollectionRef);
                    
                    snapshot.forEach(async (docSnapshot) => {
                        const docData = docSnapshot.data();
                        const collectionRef = doc(db, 'users', userId, collectionName, docSnapshot.id);
                        await setDoc(collectionRef, docData);
                    });
                }
                await deleteDoc(pastUserRef);
    
                toast.success('Aluno reativado com sucesso!', {
                    position: 'top-center',
                });
            }
        } catch (error) {
            console.error('Error reactivating student:', error);
            toast.error('Erro ao reativar aluno!', {
                position: 'top-center',
            });
        }
    };    

    const handleOnClickWelcome = async (userName: string, studentName: string, studentMail: string, name: string) => {
        try {
          const response = await toast.promise(
            fetch('/api/emails/receipts', { // Update the endpoint to the correct one
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userName,
                studentName,
                studentMail, // Ensure this matches the expected key in your POST function
                templateType: 'welcome', // Add the templateType parameter
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
      
    const handleEditClick = (aluno: Aluno) => {
        setSelectedAluno(aluno);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedAluno(null);
    };
    
    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 rounded-xl">
            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-2 w-full">
                <div className="w-full">
                    <FluencyInput
                        type="text"
                        placeholder="Procure um aluno por aqui..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className='flex flex-row gap-1 w-full'>
                    <button
                        onClick={() => setCurrentCollection('users')}
                        className={currentCollection === 'users' ? 'w-full p-2 rounded-md bg-fluency-blue-600 font-bold text-white' : 'w-full p-2 rounded-md font-bold'}
                        color={currentCollection === 'users' ? 'primary' : 'default'}
                    >
                        Alunos Atuais
                    </button>
                    <button
                        onClick={() => setCurrentCollection('past_students')}
                        className={currentCollection === 'past_students' ? 'w-full p-2 rounded-md bg-fluency-blue-600 font-bold text-white' : 'w-full p-2 rounded-md font-bold'}
                        color={currentCollection === 'past_students' ? 'primary' : 'default'}
                    >
                        Alunos Passados
                    </button>
                </div>
            </div>
            <div className="w-full overflow-y-auto h-[70vh]">
                <Table>
                    <TableHeader>
                        <TableColumn>Nome</TableColumn>
                        <TableColumn>Professor</TableColumn>
                        <TableColumn>Idioma</TableColumn>
                        <TableColumn>Começou em</TableColumn>
                        <TableColumn>Encerrou em</TableColumn>
                        <TableColumn className='flex flex-col justify-center items-center'>Gravações</TableColumn>
                        <TableColumn>Ações</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {filteredAlunos.map((aluno) => (
                            <TableRow key={aluno.id}>
                                <TableCell className='cursor-pointer' onClick={() => handleEditClick(aluno)}>
                                    {aluno.name}
                                </TableCell>
                                <TableCell>{aluno.professor}</TableCell>
                                <TableCell>{capitalizeFirstLetter(aluno.idioma)}</TableCell>
                                <TableCell>{aluno.comecouEm}</TableCell>
                                <TableCell>{aluno.encerrouEm}</TableCell>
                                <TableCell className='flex flex-col justify-center items-center'>
                                    {currentCollection === 'users' && (
                                        <button 
                                            className={`font-bold text-sm text-white py-1 px-2 rounded-md duration-300 ease-in-out transition-all 
                                                ${aluno.classes ? 'bg-red-500 hover:bg-red-700' : 'bg-fluency-green-400 dark:bg-fluency-green-600 hover:bg-fluency-green-600 hover:dark:bg-fluency-green-800'}`}
                                            onClick={() => toggleClassesStatus(aluno.id, aluno.classes)}>
                                            {aluno.classes ? 'Desativar' : 'Ativar'}
                                        </button>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {currentCollection === 'past_students' ? 
                                    <Tooltip className='text-xs font-bold bg-fluency-green-200 rounded-md p-1' content="Reativar aluno">
                                        <span className="hover:text-fluency-green-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => openModal(aluno.id, aluno.name, 'reactivate')}>
                                            <LuUserCheck2  />
                                        </span>
                                    </Tooltip>
                                    : 
                                    <div className='flex flex-row items-center gap-1'>
                                        <Tooltip className='text-xs font-bold bg-fluency-red-200 rounded-md p-1' content="Excluir aluno">
                                        <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => openModal(aluno.id, aluno.name, 'delete')}>
                                            <MdFolderDelete />
                                        </span>
                                        </Tooltip>
                                        <Tooltip className='text-xs font-bold bg-fluency-blue-200 rounded-md p-1' content="Enviar e-mail de boas-vindas">
                                            <span className="hover:text-fluency-blue-500 duration-300 ease-in-out transition-all text-lg text-danger cursor-pointer active:opacity-50">
                                                <MdOutlineAttachEmail onClick={() => handleOnClickWelcome(aluno.name, aluno.studentMail, aluno.userName, aluno.studentMail)} />
                                            </span>                                        
                                        </Tooltip>
                                    </div>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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
                        {modalAction === 'delete' ? `Tem certeza que deseja excluir o aluno ${selectedUserName}?` : `Tem certeza que deseja reativar o aluno ${selectedUserName}?`}                           
                        </h3>
                      <div className="flex justify-center">
                        <FluencyButton variant={modalAction === 'delete' ? "danger" : "confirm"} onClick={() => { modalAction === 'delete' ? transferUser(selectedUserId) : reactivateStudent(selectedUserId); closeModal(); }}>{modalAction === 'delete' ? 'Sim, excluir' : 'Sim, reativar'}</FluencyButton>
                        <FluencyButton variant='gray' onClick={closeModal}>Não, cancelar</FluencyButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>)}

            {isEditModalOpen && selectedAluno && (
                <EditAluno selectedAluno={selectedAluno} onClose={handleCloseModal} />
            )}
    
        </div>
    );
}
