'use client'

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { toast, Toaster } from 'react-hot-toast';

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

export default function AulaTeste() {
  // Estados para alunos e relatórios
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  // Estados do formulário de criação do relatório
  const [reportName, setReportName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [preferedDayTime, setPreferedDayTime] = useState('');
  const [cronograma, setCronograma] = useState('');
  const [reportText, setReportText] = useState('');
  
  // Estados para o modal de associação do relatório a um aluno
  const [showModal, setShowModal] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Busca alunos com role 'student'
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedAlunos: Aluno[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Aluno, 'id'>)
        }));
        setAlunos(fetchedAlunos);
      },
      (error) => {
        console.error("Erro ao buscar alunos:", error);
        toast.error("Erro ao buscar alunos");
      }
    );
    return () => unsubscribe();
  }, []);

  // Busca relatórios criados na coleção "Aulas Teste"
  useEffect(() => {
    const qReports = query(collection(db, 'Aulas Teste'));
    const unsubscribeReports = onSnapshot(
      qReports,
      (snapshot) => {
        const fetchedReports: Report[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Report, 'id'>)
        }));
        setReports(fetchedReports);
      },
      (error) => {
        console.error("Erro ao buscar relatórios:", error);
        toast.error("Erro ao buscar relatórios");
      }
    );
    return () => unsubscribeReports();
  }, []);

  // Cria um novo relatório na coleção "Aulas Teste" com os campos extras
  const handleCreateReport = async () => {
    if (!reportName || !selectedLanguage || !preferedDayTime || !cronograma || !reportText) {
      toast.error("Preencha todos os campos!");
      return;
    }
    try {
      await addDoc(collection(db, 'Aulas Teste'), {
        nome: reportName,
        idioma: selectedLanguage,
        preferedDayTime,
        cronograma,
        report: reportText,
        createdAt: new Date()
      });
      toast.success("Relatório criado na coleção Aulas Teste!");
      // Limpa os campos do formulário
      setReportName('');
      setSelectedLanguage('');
      setPreferedDayTime('');
      setCronograma('');
      setReportText('');
    } catch (error: any) {
      console.error("Erro ao criar relatório:", error);
      toast.error("Erro ao criar relatório");
    }
  };

  // Abre o modal com o relatório selecionado
  const handleOpenModalWithReport = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  // Associa o relatório ao aluno escolhido e atualiza o documento do relatório
  const handleAddReportToAluno = async () => {
    if (!selectedAluno || !selectedReport) {
      toast.error("Selecione um aluno e um relatório!");
      return;
    }
    try {
      // Atualiza o aluno com o relatório selecionado
      const alunoRef = doc(db, 'users', selectedAluno.id);
      await updateDoc(alunoRef, {
        relatorioDeAula: selectedReport
      });

      // Atualiza o relatório com os dados do aluno
      const reportRef = doc(db, 'Aulas Teste', selectedReport.id);
      await updateDoc(reportRef, {
        addedToStudentId: selectedAluno.id,
        addedToStudentName: selectedAluno.name
      });
      
      toast.success("Relatório associado ao aluno com sucesso!");
      setShowModal(false);
      setSelectedReport(null);
      setSelectedAluno(null);
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro ao associar relatório ao aluno");
    }
  };

  return (
    <div className="min-h-screen p-4 rounded-md bg-gray-100 dark:bg-gray-900 dark:text-white">
      <Toaster />

      {/* Listagem dos relatórios criados */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Lista de Relatórios</h2>
        <ul>
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded mb-2 bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <div className="mb-2 md:mb-0">
                <p><strong>Nome:</strong> {report.nome}</p>
                <p><strong>Idioma:</strong> {report.idioma}</p>
                <p><strong>Dia/horários:</strong> {report.preferedDayTime}</p>
                <p><strong>Cronograma:</strong> {report.cronograma}</p>
                <p><strong>Relatório:</strong> {report.report}</p>
                {report.addedToStudentName && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Adicionado a: {report.addedToStudentName}
                  </p>
                )}
              </div>
              <button
                className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded mt-2 md:mt-0"
                onClick={() => handleOpenModalWithReport(report)}
              >
                Adicionar ao aluno
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Formulário para criação de novo relatório */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Criar Relatório</h2>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white">Nome:</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" 
            placeholder="Digite o nome do relatório" 
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white">Idioma:</label>
          <select 
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="ingles">Inglês</option>
            <option value="espanhol">Espanhol</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white">Dia e Horários de preferência:</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" 
            placeholder="Ex: Segundas e Quartas, 19h às 21h" 
            value={preferedDayTime}
            onChange={(e) => setPreferedDayTime(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white">Sugestão de cronograma:</label>
          <textarea 
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" 
            placeholder="Digite a sugestão de cronograma" 
            rows={3}
            value={cronograma}
            onChange={(e) => setCronograma(e.target.value)}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium dark:text-white">Relatório:</label>
          <textarea 
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white" 
            placeholder="Digite o conteúdo do relatório" 
            rows={5}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          ></textarea>
        </div>
        
        <button
          className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleCreateReport}
        >
          Criar
        </button>
      </div>

      {/* Modal para associar relatório a um aluno */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-80 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded w-80">
            <h2 className="text-lg font-bold mb-4 dark:text-white">Adicionar relatório ao aluno</h2>
            <div className="mb-4">
              <p className="dark:text-white"><strong>Relatório:</strong> {selectedReport.nome}</p>
              <p className="dark:text-white"><strong>Idioma:</strong> {selectedReport.idioma}</p>
            </div>
            <select
              className="w-full border p-2 rounded bg-white dark:bg-gray-800 dark:text-white mb-4"
              value={selectedAluno ? selectedAluno.id : ''}
              onChange={(e) => {
                const aluno = alunos.find((a) => a.id === e.target.value);
                setSelectedAluno(aluno || null);
              }}
            >
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 dark:bg-gray-600 dark:text-white px-3 py-1 rounded"
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                  setSelectedAluno(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={handleAddReportToAluno}
              >
                Adicionar relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
