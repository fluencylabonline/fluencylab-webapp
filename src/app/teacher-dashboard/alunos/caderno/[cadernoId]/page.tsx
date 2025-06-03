"use client";
import React from "react";
import { useEffect, useState } from "react";

import {
  addDoc,
  getDoc,
  collection,
  getDocs,
  doc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { MdDeleteSweep } from "react-icons/md";
import { GiSchoolBag } from "react-icons/gi";
import { IoFilter } from "react-icons/io5";
import Link from "next/link";

import { toast } from "react-hot-toast";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { Tooltip } from "@nextui-org/react";
import TeacherCallButton from "@/app/SharedPages/Video/TeacherCallButton";
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import InputModal from "@/app/ui/Components/ModalComponents/input";

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
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [studentData, setStudentData] = useState<Aluno | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentDoc = await getDoc(doc(db, `users/${id}`));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data() as Aluno;
          setStudentData(studentData);
        } else {
          // Handle case where student doc doesn't exist
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [id]);

  //Notebooks Creation
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const fetchNotebooks = async () => {
    try {
      const notebookRef = collection(db, `users/${id}/Notebooks`);
      const snapshot = await getDocs(notebookRef);
      const notebookList: Notebook[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const notebook: Notebook = {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          createdAt: data.createdAt || "",
          studentName: data.studentName || "",
          student: data.student || "",
          content: data.content || "",
        };
        notebookList.push(notebook);
      });
      setNotebooks(notebookList);
    } catch (error) {
      console.error("Error fetching notebooks:", error);
    }
  };

  useEffect(() => {
    fetchNotebooks();
  }, [id]);

  //Adding a new document with title
  const [isModalDescriptionOpen, setIsModalDescriptionOpen] = useState(false);
  const [description, setDescription] = useState("");
  const handleOpenModalDescription = () => {
    setIsModalDescriptionOpen(true);
  };

  const handleCloseModalDescription = () => {
    setDescription(""); // Clear description on close
    setIsModalDescriptionOpen(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const createNotebookWithDescription = async () => {
    try {
      const notebookRef = collection(db, `users/${id}/Notebooks`);
      const notebookData = {
        title: new Date().toLocaleDateString(),
        description: description || "Documento sem descrição",
        createdAt: serverTimestamp(),
        student: id || "", // User ID
        studentName: studentData?.name || "", // User name
        professorId: studentData?.professorId || "", // Professor ID
        content: "",
      };
      await addDoc(notebookRef, notebookData);
      console.log(
        "Notebook created successfully with description:",
        description
      );
      toast.success("Caderno novo criado!", {
        position: "top-center",
      });

      await fetchNotebooks();
    } catch (error) {
      console.error("Error creating notebook:", error);
    }
    setDescription(""); // Clear description after creating the notebook
    handleCloseModalDescription(); // Close the modal after creating the notebook
  };

  // State for ConfirmationModal
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [notebookToDeleteId, setNotebookToDeleteId] = useState("");

  const handleDeleteClick = (notebookId: string) => {
    setNotebookToDeleteId(notebookId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteNotebook = async () => {
    try {
      await deleteDoc(doc(db, `users/${id}/Notebooks/${notebookToDeleteId}`));
      // Filter out the deleted notebook from the state
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
      setIsDeleteConfirmationOpen(false); // Close the confirmation modal
      setNotebookToDeleteId(""); // Clear the selected ID
    }
  };

  const createReviewTask = async (
    notebookTitle: string,
    notebookId: string
  ) => {
    try {
      const studentDocRef = doc(db, `users/${id}`);
      const studentDocSnapshot = await getDoc(studentDocRef);
      const studentData = studentDocSnapshot.data() as Aluno;

      if (!studentData) {
        throw new Error("Student data not found");
      }

      const tasksArray = studentData.tasks?.Task || []; // Get the tasks array or initialize it if null
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

  const [modalNoteId, setModalNoteId] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenReportModal = async (notebookId: string) => {
    setModalNoteId(notebookId);

    // Fetch the current report content from the database
    const notebookRef = doc(db, `users/${id}/Notebooks/${notebookId}`);
    const notebookSnap = await getDoc(notebookRef);

    if (notebookSnap.exists()) {
      const currentReport = notebookSnap.data().classReport || "";
      setReportContent(currentReport);
    } else {
      setReportContent("");
    }

    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setModalNoteId(null);
    setReportContent("");
    setIsReportModalOpen(false);
  };

  const handleReportContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReportContent(e.target.value);
  };

  const saveReport = async () => {
    if (modalNoteId) {
      const notebookRef = doc(db, `users/${id}/Notebooks/${modalNoteId}`);
      await updateDoc(notebookRef, {
        classReport: reportContent,
      });

      const updatedNotebooks = notebooks.map((notebook) => {
        if (notebook.id === modalNoteId) {
          return { ...notebook, classReport: reportContent };
        }
        return notebook;
      });

      setNotebooks(updatedNotebooks);
      handleCloseReportModal();
      toast.success("Relatório de aula salvo!", {
        position: "top-center",
      });
    }
  };

  // Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchLower = searchQuery.toLowerCase();

  const filteredNotebooks = notebooks.filter((notebook) => {
    return (
      notebook.title.toLowerCase().includes(searchLower) ||
      notebook.description.toLowerCase().includes(searchLower)
    );
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "asc" | "desc");
  };

  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;

    if (timeA && timeB) {
      if (sortOrder === "asc") {
        return timeA - timeB;
      } else {
        return timeB - timeA;
      }
    }

    const parseDate = (dateString: string) => {
      const parts = dateString.split("/").map(Number);
      let day, month, year;

      // Brazilian date format dd/mm/yyyy - check if day or month is greater than 12
      if (parts[0] > 12) { // Assuming first part is day if > 12
        [day, month, year] = parts;
      } else if (parts[1] > 12) { // Assuming second part is day if > 12 (and first is month)
        [month, day, year] = parts;
      } else { // Default to dd/mm/yyyy if both are <= 12
        [day, month, year] = parts;
      }

      return new Date(year, month - 1, day);
    };

    const dateA = parseDate(a.title);
    const dateB = parseDate(b.title);

    if (sortOrder === "asc") {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });

  return (
    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 flex flex-col gap-4 pb-4 mt-3">
      <div className="flex flex-col items-center w-full gap-2">
        <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-around gap-4 items-center w-full">
          <FluencyInput
            placeholder="Procure por uma aula específica..."
            variant="glass"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-row gap-2 items-center justify-center">
            <TeacherCallButton student={{ studentID: id }} />
            <FluencyButton
              variant="confirm"
              className="min-w-max"
              onClick={handleOpenModalDescription}
            >
              Criar caderno
            </FluencyButton>
          </div>
          <div className="flex min-w-max">
            <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
              <IoFilter />
            </div>
            <select
              className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
              onChange={handleSortChange}
              value={sortOrder}
            >
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="gap-3 flex flex-col w-full">
        <ul className="flex flex-col rounded-md w-full gap-2">
          {sortedNotebooks.map((notebook) => {
            const displayDate = notebook.createdAt?.seconds
              ? new Date(notebook.createdAt.seconds * 1000).toLocaleDateString(
                  "pt-BR",
                  {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }
                )
              : notebook.title;

            return (
              <li
                key={notebook.id}
                className="bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-2 w-full"
              >
                <Link
                  key={notebook.id}
                  href={{
                    pathname: `/teacher-dashboard/alunos/aula/${encodeURIComponent(
                      notebook.studentName
                    )}`,
                    query: { notebook: notebook.id, student: notebook.student },
                  }}
                  passHref
                >
                  <div className="hover:text-fluency-blue-500 hover:font-bold duration-200 ease-out transition-all cursor-pointer">
                    <p className="text-md">{displayDate}</p>
                    <p className="text-sm">{notebook.description}</p>
                  </div>
                </Link>
                <div className="flex flex-row gap-2 items-center">
                  <Tooltip
                    content="Deletar"
                    className="bg-fluency-red-300 font-bold text-black rounded-md px-1"
                  >
                    <p>
                      <MdDeleteSweep
                        onClick={() => handleDeleteClick(notebook.id)}
                        className="w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer"
                      />
                    </p>
                  </Tooltip>

                  <Tooltip
                    content="Enviar como tarefa"
                    className="bg-orange-300 font-bold text-black rounded-md px-1"
                  >
                    <p>
                      <GiSchoolBag
                        onClick={() =>
                          createReviewTask(notebook.description, notebook.id)
                        }
                        className="w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-orange-500 hover:dark:text-fluency-orange-500 duration-300 ease-in-out transition-all cursor-pointer"
                      />
                    </p>
                  </Tooltip>

                  <Tooltip
                    content="Relatório de aula"
                    className="bg-fluency-blue-300 font-bold text-black rounded-md px-1"
                  >
                    <p>
                      <HiOutlineDocumentReport
                        onClick={() => handleOpenReportModal(notebook.id)}
                        className="w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-blue-500 hover:dark:text-fluency-blue-500 duration-300 ease-in-out transition-all cursor-pointer"
                      />
                    </p>
                  </Tooltip>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      
      {isReportModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-full p-6">
              <div className="flex flex-col items-center justify-center p-1 gap-3">
                <h2 className="text-lg font-bold mb-2 p-1">
                  Adicionar Relatório de Aula
                </h2>
                <textarea
                  value={reportContent}
                  onChange={handleReportContentChange}
                  placeholder="Digite o relatório de aula"
                  className="dark:bg-fluency-pages-dark w-full p-2 border border-gray-300 rounded-md"
                  rows={5}
                />
                <div className="flex flex-row items-center justify-center gap-2">
                  <FluencyButton
                    variant="confirm"
                    className="py-2"
                    onClick={saveReport}
                  >
                    Salvar
                  </FluencyButton>
                  <FluencyButton
                    variant="warning"
                    className="py-2"
                    onClick={handleCloseReportModal}
                  >
                    Cancelar
                  </FluencyButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InputModal
        isOpen={isModalDescriptionOpen}
        onClose={handleCloseModalDescription}
        onConfirm={createNotebookWithDescription}
        title="Criar Nova Aula"
        placeholder="Descrição da aula"
        value={description}
        onChange={handleDescriptionChange}
        confirmButtonText="Criar Aula"
        cancelButtonText="Cancelar"
      />

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