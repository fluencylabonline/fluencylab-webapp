'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
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
import { toast, Toaster } from 'react-hot-toast';
import { MdFolderDelete } from 'react-icons/md';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import { LuUserCheck2 } from 'react-icons/lu';

interface Aluno {
    id: string;
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
    classes: boolean; // Add the classes field to the interface
}

export default function AlunosPassados() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [currentCollection, setCurrentCollection] = useState<string>('users');
    
    useEffect(() => {
        const unsubscribe = onSnapshot(getQuery(), (snapshot) => {
            const updatedAlunos: Aluno[] = [];
            snapshot.forEach((doc) => {
                const aluno: Aluno = {
                    id: doc.id,
                    name: doc.data().name,
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
                    classes: doc.data().classes || false, // Assuming classes field exists in Firestore
                };
                updatedAlunos.push(aluno);
            });
            setAlunos(updatedAlunos);
        });

        return () => unsubscribe();
    }, [currentCollection]); // Re-run effect when currentCollection changes

    const getQuery = () => {
        if (currentCollection === 'users') {
            return query(collection(db, 'users'), where('role', '==', 'student'));
        } else if (currentCollection === 'past_students') {
            return query(collection(db, 'past_students'));
        }
        
        return query(collection(db, 'users'), where('role', '==', 'student'));
    };

    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const toggleClassesStatus = async (alunoId: string, currentClasses: boolean) => {
        const alunoRef = doc(db, 'users', alunoId);
        await updateDoc(alunoRef, {
            classes: !currentClasses, // Toggle the classes field
        });

        // Show toast notification based on currentClasses state
        toast.success(currentClasses ? 'Desativado' : 'Ativado', {
            duration: 3000, // Display for 3 seconds
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

    const reactivateStudent = async (userId: string) => {
        try {
            const pastUserRef = doc(db, 'past_students', userId);
            const userRef = doc(db, 'users', userId);

            const pastUserSnapshot = await getDoc(pastUserRef);
            const pastUserData = pastUserSnapshot.data();

            if (pastUserData) {
                // Set the 'encerrouEm' field to 0
                pastUserData.encerrouEm = 0;

                await setDoc(userRef, pastUserData);
                await deleteDoc(pastUserRef);

                toast.success('Aluno reativado!', {
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

    return (
        <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
            <div className="flex justify-start gap-3">
                <button
                    onClick={() => setCurrentCollection('users')}
                    className={currentCollection === 'users' ? 'p-2 rounded-md bg-fluency-blue-600 font-bold text-white' : 'p-2 rounded-md font-bold'}
                    color={currentCollection === 'users' ? 'primary' : 'default'}
                >
                    Alunos Atuais
                </button>
                <button
                    onClick={() => setCurrentCollection('past_students')}
                    className={currentCollection === 'past_students' ? 'p-2 rounded-md bg-fluency-blue-600 font-bold text-white' : 'p-2 rounded-md font-bold'}
                    color={currentCollection === 'past_students' ? 'primary' : 'default'}
                >
                    Alunos Passados
                </button>
            </div>
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
                    {alunos.map((aluno) => (
                        <TableRow key={aluno.id}>
                            <TableCell>{aluno.name}</TableCell>
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
                                <Tooltip className='text-xs font-bold bg-fluency-red-200 rounded-md p-1' content="Excluir aluno">
                                    <span className="hover:text-fluency-red-500 duration-300 ease-in-out transition-all text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => openModal(aluno.id, aluno.name, 'delete')}>
                                        <MdFolderDelete />
                                    </span>
                                </Tooltip>
                                }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Toaster position="top-center" />

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
            
        </div>
    );
}
