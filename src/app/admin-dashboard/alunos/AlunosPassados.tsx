'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@nextui-org/react';
import { toast, Toaster } from 'react-hot-toast';

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

    return (
        <div className="flex flex-col w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 overflow-y-auto rounded-xl mt-1">
            <div className="flex justify-start gap-3">
                <button
                    onClick={() => setCurrentCollection('users')}
                    className={currentCollection === 'users' ? 'p-2 rounded-md bg-fluency-blue-600 font-bold' : 'p-2 rounded-md font-bold'}
                    color={currentCollection === 'users' ? 'primary' : 'default'}
                >
                    Alunos Atuais
                </button>
                <button
                    onClick={() => setCurrentCollection('past_students')}
                    className={currentCollection === 'past_students' ? 'p-2 rounded-md bg-fluency-blue-600 font-bold' : 'p-2 rounded-md font-bold'}
                    color={currentCollection === 'past_students' ? 'primary' : 'default'}
                >
                    Alunos Passados
                </button>
            </div>
            <Table>
                <TableHeader>
                    <TableColumn>Nome</TableColumn>
                    <TableColumn>Professor</TableColumn>
                    <TableColumn>Mensalidade</TableColumn>
                    <TableColumn>Idioma</TableColumn>
                    <TableColumn>Começou em</TableColumn>
                    <TableColumn>Encerrou em</TableColumn>
                    <TableColumn>Status</TableColumn>
                    <TableColumn>Gravações</TableColumn>
                </TableHeader>
                <TableBody>
                    {alunos.map((aluno) => (
                        <TableRow key={aluno.id}>
                            <TableCell>{aluno.name}</TableCell>
                            <TableCell>{aluno.professor}</TableCell>
                            <TableCell>{aluno.mensalidade}</TableCell>
                            <TableCell>{capitalizeFirstLetter(aluno.idioma)}</TableCell>
                            <TableCell>{aluno.comecouEm}</TableCell>
                            <TableCell>{aluno.encerrouEm}</TableCell>
                            <TableCell>{capitalizeFirstLetter(aluno.status)}</TableCell>
                            <TableCell>
                                <button onClick={() => toggleClassesStatus(aluno.id, aluno.classes)}>
                                    {aluno.classes ? 'Desativar' : 'Ativar'}
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Toaster position="top-center" />
        </div>
    );
}
