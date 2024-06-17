'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@nextui-org/react';

interface Aluno {
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
}

export default function AlunosPassados() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [currentCollection, setCurrentCollection] = useState<string>('users'); // Default to 'users'

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
                    status: doc.data().status,
                    diaAula: doc.data().diaAula,
                };
                updatedAlunos.push(aluno);
            });
            setAlunos(updatedAlunos);
        });

        return () => unsubscribe();
    }, [currentCollection]); // Re-run effect when currentCollection changes

    // Function to generate the Firestore query based on currentCollection
    const getQuery = () => {
        if (currentCollection === 'users') {
            return query(collection(db, 'users'), where('role', '==', 'student'));
        } else if (currentCollection === 'past_students') {
            return query(collection(db, 'past_students'));
        }
        // Default to users collection
        return query(collection(db, 'users'), where('role', '==', 'student'));
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
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Nome</TableColumn>
                    <TableColumn>Professor</TableColumn>
                    <TableColumn>Mensalidade</TableColumn>
                    <TableColumn>Idioma</TableColumn>
                    <TableColumn>Status</TableColumn>
                </TableHeader>
                <TableBody>
                    {alunos.map((aluno) => (
                        <TableRow key={aluno.id}>
                            <TableCell>{aluno.id}</TableCell>
                            <TableCell>{aluno.name}</TableCell>
                            <TableCell>{aluno.professor}</TableCell>
                            <TableCell>{aluno.mensalidade}</TableCell>
                            <TableCell>{aluno.idioma}</TableCell>
                            <TableCell>{aluno.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
