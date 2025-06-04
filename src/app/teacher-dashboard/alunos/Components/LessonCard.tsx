"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import TeacherCallButton from '@/app/SharedPages/Video/TeacherCallButton';
import { TbBook2 } from 'react-icons/tb';
import { FiPlusSquare, FiTrash2 } from 'react-icons/fi';
import ConfirmationModal from '@/app/ui/Components/ModalComponents/confirmation';
import { FileCheck2, Trash } from 'lucide-react';
import FluencyButton from '@/app/ui/Components/Button/button';

interface Notebook {
  id: string;
  title: string;
  description: string;
  createdAt: any;
  studentName: string;
  student: string;
  content: any;
}

interface Aluno {
  tasks?: {
    Task: Array<{ task: string; done: boolean; link: string }>;
  };
  name: string;
}

interface LessonCardProps {
  studentId: string | null;
}

const LessonCard: React.FC<LessonCardProps> = ({ studentId }) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [displayedLessons, setDisplayedLessons] = useState(3);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [notebookToDeleteId, setNotebookToDeleteId] = useState<string | null>(null);

  const id = studentId;

  useEffect(() => {
    const fetchNotebooks = async () => {
      if (!id) return;
      try {
        const notebookRef = collection(db, `users/${id}/Notebooks`);
        const snapshot = await getDocs(notebookRef);
        const notebookList: Notebook[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notebook));
        setNotebooks(notebookList);
      } catch (error) {
        console.error("Error fetching notebooks:", error);
      }
    };
    fetchNotebooks();
  }, [id]);

  const handleDeleteClick = (notebookId: string) => {
    setNotebookToDeleteId(notebookId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteNotebook = async () => {
    if (!notebookToDeleteId || !id) {
      toast.error("Erro: ID do caderno ou do aluno ausente.");
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${id}/Notebooks/${notebookToDeleteId}`));
      const updatedNotebooks = notebooks.filter(
        (notebook) => notebook.id !== notebookToDeleteId
      );
      setNotebooks(updatedNotebooks);
      toast.error("Caderno deletado!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error deleting notebook:", error);
      toast.error("Erro ao deletar caderno.", {
        position: "top-center",
      });
    } finally {
      setIsDeleteConfirmationOpen(false);
      setNotebookToDeleteId(null);
    }
  };

  const createReviewTask = async (
    notebookTitle: string,
    notebookId: string
  ) => {
    if (!id) {
      toast.error("Erro: ID do aluno ausente.");
      return;
    }
    try {
      const studentDocRef = doc(db, `users/${id}`);
      const studentDocSnapshot = await getDoc(studentDocRef);
      const studentData = studentDocSnapshot.data() as Aluno;

      if (!studentData) {
        toast.error("Dados do aluno não encontrados.");
        return;
      }

      const tasksArray = studentData.tasks?.Task || [];
      const taskExists = tasksArray.some(
        (task: { task: string }) =>
          task.task === `Revisar a aula de ${notebookTitle}`
      );

      if (taskExists) {
        toast.error("Tarefa já adicionada!", {
          position: "top-center",
        });
        return;
      }

      const notebookLink = `/student-dashboard/caderno/aula/${encodeURIComponent(
        studentData.name
      )}/?notebook=${notebookId}&student=${id}`;

      const newTask = {
        task: `Revisar a aula de ${notebookTitle}`,
        done: false,
        link: notebookLink,
      };
      tasksArray.push(newTask);

      await updateDoc(studentDocRef, {
        tasks: { Task: tasksArray },
      });

      toast.success("Tarefa adicionada!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Tarefa não adicionada!", {
        position: "top-center",
      });
    }
  };

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    const parseDate = (dateString: string) => {
      const parts = dateString.split('/').map(Number);
      if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(a.createdAt?.toDate ? a.createdAt.toDate() : 0);
    };

    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : parseDate(a.title);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : parseDate(b.title);

    return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });

  const displayedNotebooks = sortedNotebooks.slice(0, displayedLessons);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) setSearchQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full rounded-lg bg-fluency-pages-light dark:bg-fluency-pages-dark p-4"
    >
      <div className="flex flex-row justify-between items-center mb-4 gap-4 tour-call-button">
        {!isSearchOpen && (
          <>
            <TeacherCallButton student={{ studentID: id }} />
            <Link href={{ pathname: `caderno/${encodeURIComponent('Lições')}`, query: { id: id } }} passHref>
              <FluencyButton variant='purple'>
                <span className="hidden sm:inline">Ver todas</span>
                <TbBook2 className="w-5 h-auto sm:hidden" />
              </FluencyButton>
            </Link>
          </>
        )}

        <div className={`${isSearchOpen ? 'w-full' : 'w-auto'} transition-all duration-300`}>
          {isSearchOpen ? (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Buscar lições..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                autoFocus
              />
              <FaSearch className="absolute left-3 top-3 text-fluency-blue-500" />
              <button
                onClick={handleSearchToggle}
                className="absolute right-3 top-3 text-fluency-gray-500 hover:text-fluency-red-500"
              >
                <FaTimes />
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSearchToggle}
              className="p-2 rounded-full hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700 transition-colors"
              aria-label="Abrir busca"
            >
              <FaSearch className="w-5 h-5 text-fluency-gray-500" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 tour-notebooks-list overflow-y-auto" style={{ maxHeight: '55vh' }}>
        <AnimatePresence>
          {displayedNotebooks.length > 0 ? (
            <>
              {displayedNotebooks.map((notebook) => (
                <motion.div
                  key={notebook.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.001, y: -5 }}
                  className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700"
                >
                  <div className="flex justify-between items-start p-4">
                    <Link key={notebook.id} href={{ pathname: `/teacher-dashboard/alunos/aula/${encodeURIComponent(notebook.studentName)}`, query: { notebook: notebook.id, student: notebook.student } }} passHref className="flex-1">
                      <div>
                        <h3 className="font-bold text-lg mb-2 truncate">{notebook.title}</h3>
                        <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm line-clamp-2">{notebook.description || "Sem descrição"}</p>
                      </div>
                    </Link>
                    <div className="flex flex-row items-center">
                      {/* "Add as Task" Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => createReviewTask(notebook.title, notebook.id)}
                        className="p-2 rounded-full text-fluency-green-500 hover:bg-fluency-green-100 dark:hover:bg-fluency-gray-700 transition-colors"
                        aria-label="Adicionar como tarefa"
                      >
                        <FileCheck2 className="w-5 h-5" />
                      </motion.button>

                      {/* "Delete Notebook" Button - Triggers the modal */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(notebook.id)}
                        className="p-2 rounded-full text-fluency-red-500 hover:bg-fluency-red-100 dark:hover:bg-fluency-gray-700 transition-colors"
                        aria-label="Deletar caderno"
                      >
                        <Trash className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-8 text-fluency-gray-500"
            >
              {searchQuery ? "Nenhum caderno encontrado" : "Nenhum caderno disponível"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal Component */}
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={confirmDeleteNotebook}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja deletar este caderno? Esta ação não pode ser desfeita."
        confirmButtonText="Deletar"
        cancelButtonText="Cancelar"
        confirmButtonVariant="danger" // Uses the danger variant defined in your modal
      />
    </motion.div>
  );
};

export default LessonCard;