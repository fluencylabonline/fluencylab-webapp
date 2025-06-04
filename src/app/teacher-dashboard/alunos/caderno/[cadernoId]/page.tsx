"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  addDoc, getDoc, collection, getDocs, doc, 
  serverTimestamp, deleteDoc, updateDoc 
} from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Tooltip } from "@nextui-org/react";
import TeacherCallButton from "@/app/SharedPages/Video/TeacherCallButton";
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import InputModal from "@/app/ui/Components/ModalComponents/input";
import { Backpack, FileText, Trash, PlusCircle } from "lucide-react";
import { GiNotebook } from "react-icons/gi";

interface Notebook {
  studentName: string;
  id: string;
  title: string;
  description: string;
  createdAt: any;
  student: string;
  content: any;
  classReport?: string;
}

interface Aluno {
  tasks: any;
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

export default function Caderno() {
  const [studentData, setStudentData] = useState<Aluno | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setId(params.get("id"));
  }, []);

  // Fetch student data and notebooks
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch student data
        const studentDoc = await getDoc(doc(db, `users/${id}`));
        if (studentDoc.exists()) {
          setStudentData(studentDoc.data() as Aluno);
        }
        
        // Fetch notebooks
        const notebookRef = collection(db, `users/${id}/Notebooks`);
        const snapshot = await getDocs(notebookRef);
        const notebookList: Notebook[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notebookList.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            createdAt: data.createdAt || "",
            studentName: data.studentName || "",
            student: data.student || "",
            content: data.content || "",
            classReport: data.classReport || "",
          });
        });
        setNotebooks(notebookList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  // State management
  const [isModalDescriptionOpen, setIsModalDescriptionOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [notebookToDeleteId, setNotebookToDeleteId] = useState("");
  const [modalNoteId, setModalNoteId] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create notebook handler
  const createNotebookWithDescription = async () => {
    if (!id || !studentData) return;
    try {
      const notebookRef = collection(db, `users/${id}/Notebooks`);
      await addDoc(notebookRef, {
        title: new Date().toLocaleDateString("pt-BR"),
        description: description || "Documento sem descrição",
        createdAt: serverTimestamp(),
        student: id,
        studentName: studentData.name,
        professorId: studentData.professorId || "",
        content: "",
      });
      toast.success("Caderno novo criado!", { position: "top-center" });
      
      // Refresh notebooks
      const snapshot = await getDocs(notebookRef);
      const updatedNotebooks: Notebook[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedNotebooks.push({
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          createdAt: data.createdAt || "",
          studentName: data.studentName || "",
          student: data.student || "",
          content: data.content || "",
          classReport: data.classReport || "",
        });
      });
      setNotebooks(updatedNotebooks);
    } catch (error) {
      console.error("Error creating notebook:", error);
      toast.error("Erro ao criar caderno", { position: "top-center" });
    }
    setDescription("");
    setIsModalDescriptionOpen(false);
  };

  // Delete notebook handler
  const confirmDeleteNotebook = async () => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, `users/${id}/Notebooks/${notebookToDeleteId}`));
      setNotebooks(notebooks.filter(notebook => notebook.id !== notebookToDeleteId));
      toast.error("Caderno deletado!", { position: "top-center" });
    } catch (error) {
      console.error("Error deleting notebook:", error);
      toast.error("Erro ao deletar caderno.", { position: "top-center" });
    }
    setIsDeleteConfirmationOpen(false);
    setNotebookToDeleteId("");
  };

  // Create review task
  const createReviewTask = async (notebookTitle: string, notebookId: string) => {
    if (!id || !studentData) return;
    try {
      const studentDocRef = doc(db, `users/${id}`);
      const studentDocSnapshot = await getDoc(studentDocRef);
      const studentData = studentDocSnapshot.data() as Aluno;

      const tasksArray = studentData.tasks?.Task || [];
      const taskExists = tasksArray.some(
        (task: { task: string }) => task.task === `Revisar a aula de ${notebookTitle}`
      );

      if (taskExists) {
        toast.error("Tarefa já adicionada!", { position: "top-center" });
        return;
      }

      const notebookLink = `/student-dashboard/caderno/aula/${encodeURIComponent(
        studentData.name
      )}/?notebook=${notebookId}&student=${id}`;

      tasksArray.push({
        task: `Revisar a aula de ${notebookTitle}`,
        done: false,
        link: notebookLink,
      });

      await updateDoc(studentDocRef, { tasks: { Task: tasksArray } });
      toast.success("Tarefa adicionada!", { position: "top-center" });
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Tarefa não adicionada!", { position: "top-center" });
    }
  };

  // Report modal handlers
  const handleOpenReportModal = async (notebookId: string) => {
    if (!id) return;
    setModalNoteId(notebookId);
    try {
      const notebookRef = doc(db, `users/${id}/Notebooks/${notebookId}`);
      const notebookSnap = await getDoc(notebookRef);
      setReportContent(notebookSnap.exists() ? notebookSnap.data().classReport || "" : "");
    } catch (error) {
      console.error("Error fetching report:", error);
    }
    setIsReportModalOpen(true);
  };

  const saveReport = async () => {
    if (!id || !modalNoteId) return;
    try {
      const notebookRef = doc(db, `users/${id}/Notebooks/${modalNoteId}`);
      await updateDoc(notebookRef, { classReport: reportContent });
      
      setNotebooks(notebooks.map(notebook => 
        notebook.id === modalNoteId ? { ...notebook, classReport: reportContent } : notebook
      ));
      
      toast.success("Relatório de aula salvo!", { position: "top-center" });
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("Erro ao salvar relatório", { position: "top-center" });
    }
    setIsReportModalOpen(false);
  };

  // Filter notebooks
  const searchLower = searchQuery.toLowerCase();
  const filteredNotebooks = notebooks.filter(notebook => 
    notebook.title.toLowerCase().includes(searchLower) || 
    notebook.description.toLowerCase().includes(searchLower)
  );

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-4 flex flex-col gap-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark">
            Cadernos de Aula
          </h1>
          <p className="text-fluency-gray-600 dark:text-fluency-gray-400">
            {studentData?.name ? `Aluno: ${studentData.name}` : "Carregando..."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <TeacherCallButton student={{ studentID: id || "" }} />
          <FluencyButton
            variant="confirm"
            onClick={() => setIsModalDescriptionOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Caderno
          </FluencyButton>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full"
      >
        <FluencyInput
          placeholder="Pesquisar cadernos por título ou descrição..."
          variant="glass"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </motion.div>

      {/* Notebooks List */}
      {filteredNotebooks.length > 0 ? (
        <motion.ul 
          className="flex flex-col gap-3 w-full"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {filteredNotebooks.map((notebook) => {
              const displayDate = notebook.createdAt?.seconds
                ? new Date(notebook.createdAt.seconds * 1000).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })
                : notebook.title;

              return (
                <motion.li
                  key={notebook.id}
                  variants={item}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                  className="bg-fluency-blue-50 dark:bg-fluency-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700"
                >
                  <Link
                    href={{
                      pathname: `/teacher-dashboard/alunos/aula/${encodeURIComponent(notebook.studentName)}`,
                      query: { notebook: notebook.id, student: notebook.student },
                    }}
                    passHref
                  >
                    <div className="p-4 cursor-pointer hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700 transition-colors duration-200 flex items-start">
                      <div className="mr-3 mt-1 text-fluency-blue-500 dark:text-fluency-blue-300">
                        <GiNotebook className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-fluency-blue-800 dark:text-fluency-blue-200 flex items-center gap-2">
                          <span>{displayDate}</span>
                          {notebook.classReport && (
                            <span className="text-xs bg-fluency-green-100 dark:bg-fluency-green-900 text-fluency-green-800 dark:text-fluency-green-200 px-2 py-1 rounded-full">
                              Relatório
                            </span>
                          )}
                        </h3>
                        <p className="text-fluency-gray-700 dark:text-fluency-gray-300 mt-1 line-clamp-2">
                          {notebook.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="px-4 py-3 bg-fluency-blue-100 dark:bg-fluency-gray-900 flex justify-end gap-3 border-t border-fluency-gray-200 dark:border-fluency-gray-700">
                    <Tooltip
                      content="Deletar caderno"
                      className="bg-fluency-red-100 dark:bg-fluency-red-900 text-fluency-red-800 dark:text-fluency-red-100 font-medium rounded-md px-2 py-1"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotebookToDeleteId(notebook.id);
                          setIsDeleteConfirmationOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-fluency-red-100 dark:hover:bg-fluency-red-900/50 transition-colors"
                      >
                        <Trash className="w-5 h-5 text-fluency-red-500" />
                      </button>
                    </Tooltip>

                    <Tooltip
                      content="Enviar como tarefa"
                      className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 font-medium rounded-md px-2 py-1"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          createReviewTask(notebook.description, notebook.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                      >
                        <Backpack className="w-5 h-5 text-fluency-orange-500" />
                      </button>
                    </Tooltip>

                    <Tooltip
                      content="Relatório de aula"
                      className="bg-fluency-blue-100 dark:bg-fluency-blue-900 text-fluency-blue-800 dark:text-fluency-blue-100 font-medium rounded-md px-2 py-1"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReportModal(notebook.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-fluency-blue-100 dark:hover:bg-fluency-blue-900/50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-fluency-blue-500" />
                      </button>
                    </Tooltip>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-fluency-blue-50/50 dark:bg-fluency-gray-800/50 border border-dashed border-fluency-gray-300 dark:border-fluency-gray-600"
        >
          <GiNotebook className="w-16 h-16 text-fluency-blue-300 dark:text-fluency-blue-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? "Nenhum caderno encontrado" : "Nenhum caderno criado"}
          </h3>
          <p className="text-fluency-gray-600 dark:text-fluency-gray-400 mb-6 max-w-md">
            {searchQuery
              ? "Sua pesquisa não encontrou nenhum caderno correspondente."
              : "Comece criando seu primeiro caderno de aula para este aluno."}
          </p>
          <FluencyButton
            variant="confirm"
            onClick={() => setIsModalDescriptionOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Criar primeiro caderno
          </FluencyButton>
        </motion.div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Relatório de Aula</h3>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-fluency-gray-500 hover:text-fluency-red-500 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Conteúdo do Relatório
                </label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Descreva o conteúdo da aula, pontos de atenção, desempenho do aluno..."
                  className="w-full min-h-[200px] p-3 border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-lg bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark focus:ring-2 focus:ring-fluency-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <FluencyButton
                  variant="danger"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  variant="confirm"
                  onClick={saveReport}
                >
                  Salvar Relatório
                </FluencyButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notebook Creation Modal */}
      <InputModal
        isOpen={isModalDescriptionOpen}
        onClose={() => setIsModalDescriptionOpen(false)}
        onConfirm={createNotebookWithDescription}
        title="Criar Nova Aula"
        placeholder="Descrição da aula (ex: Aula sobre verbos no passado)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        confirmButtonText="Criar Aula"
        cancelButtonText="Cancelar"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={confirmDeleteNotebook}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este caderno? Esta ação não pode ser desfeita."
        confirmButtonText="Sim, Excluir"
        cancelButtonText="Não, Cancelar"
        confirmButtonVariant="danger"
      />
    </div>
  );
}