'use client'

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

interface Report {
  id: string;
  nome: string;
  idioma: string;
  preferedDayTime: string;
  cronograma: string;
  report: string;
  createdAt: any;
  addedToStudentId?: string;
  addedToStudentName?: string;
}

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
  relatorioDeAula?: Report;
}

// Função auxiliar para formatar a data
function formatDate(date: any): string {
  if (!date) return '';
  // Verifica se a data é um Firebase Timestamp
  if (date.toDate) {
    return date.toDate().toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
}

export default function RelatorioAluno() {
  const searchParams = useSearchParams();
  // Since the id is always provided, we can safely assert it as a string.
  const id = searchParams.get('id') as string;

  const [student, setStudent] = useState<Aluno | null>(null);

  // Busca os dados do aluno, incluindo o campo "relatorioDeAula"
  useEffect(() => {
    const studentRef = doc(db, 'users', id);
    getDoc(studentRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() } as Aluno);
        } else {
          toast.error("Aluno não encontrado");
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar aluno:", error);
        toast.error("Erro ao buscar aluno");
      });
  }, [id]);

  return (
    <div className="min-h-fit p-4 rounded-md bg-gray-100 dark:bg-gray-900 dark:text-white m-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">
          Relatório do aluno {student ? student.name : "Carregando..."}
        </h2>
        {student?.relatorioDeAula ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded mb-2 bg-white dark:bg-gray-700 dark:border-gray-600">
            <div className="mb-2 md:mb-0">
              <p><strong>Nome:</strong> {student.relatorioDeAula.nome}</p>
              <p><strong>Idioma:</strong> {student.relatorioDeAula.idioma}</p>
              <p><strong>Dia/horários:</strong> {student.relatorioDeAula.preferedDayTime}</p>
              <p><strong>Cronograma:</strong> {student.relatorioDeAula.cronograma}</p>
              <p><strong>Relatório:</strong> {student.relatorioDeAula.report}</p>
              <p><strong>Data:</strong> {formatDate(student.relatorioDeAula.createdAt)}</p>
              {student.relatorioDeAula.addedToStudentName && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Adicionado a: {student.relatorioDeAula.addedToStudentName}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="dark:text-white">Nenhum relatório encontrado para este aluno.</p>
        )}
      </div>
    </div>
  );
}
