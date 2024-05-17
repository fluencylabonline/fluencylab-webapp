'use client';
import React from 'react';

//TipTap Editor
import NotebookEditor from '@/app/ui/TipTap/NotebookEditor';


interface Notebook {
    studentName: string;
    id: string;
    title: string;
    description: string;
    createdAt: any;
    content: any;
}

interface Aluno {
    tasks: {};
    overdueClassesCount: number;
    doneClassesCount: number;
    Classes: any;
    id: string;
    name: string;
    email: string;
    number: string;
    userName: string;
    mensalidade: string;
    idioma: string[];
    teacherEmails: string[];
    professorId: string;
    diaAula?: string;
    profilePicUrl?: string;
    frequencia: number;
    classDatesWithStatus: { date: Date; status: string }[];
}

export default function Notebook() {
  return (
    <div>
      <NotebookEditor />    
    </div>
  );
}
