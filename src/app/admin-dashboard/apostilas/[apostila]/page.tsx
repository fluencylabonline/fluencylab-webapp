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


export default function Notebook() {
  return (
    <div>
      <NotebookEditor />    
    </div>
  );
}
