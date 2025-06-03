"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { db } from "@/app/firebase";
import { useSession } from "next-auth/react";

import {
  FaFilePdf,
  FaRegFileAudio,
  FaRegFileImage,
  FaRegFileVideo,
} from "react-icons/fa6";

import AlunosAulas from "./aluno-aulas";
import Link from "next/link";

import { toast } from "react-hot-toast";

import { FaFileAlt } from "react-icons/fa";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";
import { MdDelete, MdOutlineAddTask } from "react-icons/md";
import { IoMdCloudOutline } from "react-icons/io";
import FluencyButton from "@/app/ui/Components/Button/button";
import { CiCircleQuestion } from "react-icons/ci";
import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";
import TeacherManagedAchievement from "@/app/ui/Components/Achievements/components/TeacherManagedAchievement";

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
  chooseProfessor: string;
  diaAula?: string;
  profilePicUrl?: string;
  frequencia: number;
  classDatesWithStatus: { date: Date; status: string }[];
}

function AlunoPainel() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string>("");
  useEffect(() => {
    if (session) {
      const { user } = session;
      if (user.role) {
        setRole(user.role);
      }
    }
  }, [session]);

  //StudentDataFetching
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [studentData, setStudentData] = useState<Aluno | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      try {
        const studentDoc = await getDoc(doc(db, `users/${id}`));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data() as Aluno;
          setStudentData(studentData);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [id]);

  const [materials, setMaterials] = useState<any[]>([]);
  const storage = getStorage();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !id) return;

    const file = files[0];
    const fileName = `alunosmateriais/${id}/materiais/archives/${file.name}`;
    const storageRef = ref(storage, fileName);

    try {
      await uploadBytes(storageRef, file);
      toast.success("Arquivo salvo!.", { position: "top-center" });
      fetchMaterialsReal();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao salvar arquivo!.", { position: "top-center" });
    }
  };

  const fetchMaterialsReal = async () => {
    if (!id) return;
    try {
      const materialsRef = ref(
        storage,
        `alunosmateriais/${id}/materiais/archives`
      );
      const materialList = await listAll(materialsRef);
      const materialUrls = await Promise.all(
        materialList.items.map(async (item) => {
          const downloadUrl = await getDownloadURL(item);
          return { name: item.name, url: downloadUrl };
        })
      );
      setMaterials(materialUrls);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  useEffect(() => {
    if (studentData) {
      fetchMaterialsReal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData]);


  const renderMaterialIcon = (fileName: string) => {
    const fileType = fileName.split(".").pop()?.toLowerCase();
    if (fileType === "pdf") return <FaFilePdf className="w-4 h-auto" />;
    if (["mp3", "wav"].includes(fileType || "")) return <FaRegFileAudio className="w-4 h-auto" />;
    if (["mp4", "mov"].includes(fileType || "")) return <FaRegFileVideo className="w-4 h-auto" />;
    if (fileType === "txt") return <FaFileAlt className="w-6 h-auto" />;
    if (["jpg", "jpeg", "png", "gif"].includes(fileType || "")) return <FaRegFileImage className="w-4 h-auto" />;
    return <FaFileAlt className="w-6 h-auto" />;
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isDeleteFileModalOpen, setDeleteFileModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const handleDeleteFileClick = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteFileModalOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !id) return;
    const fileRef = ref(
      storage,
      `/alunosmateriais/${id}/materiais/archives/${fileToDelete}`
    );
    try {
      await deleteObject(fileRef);
      toast.success("Arquivo deletado!", { position: "top-center" });
      fetchMaterialsReal();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file!", { position: "top-center" });
    } finally {
        setDeleteFileModalOpen(false);
        setFileToDelete(null);
    }
  };


  const [tasks, setTasks] = useState<any>({});
  useEffect(() => {
    if (!id) return;
    const studentDocRef = doc(db, `users/${id}`);
    const unsubscribe = onSnapshot(studentDocRef, (doc) => {
      if (doc.exists()) {
        setTasks(doc.data().tasks || {});
      }
    });
    return () => unsubscribe();
  }, [id]);

  const handleAddTask = async (day: string, task: string, done: boolean) => {
    if (!id) return;
    try {
      const studentDocRef = doc(db, `users/${id}`);
      await updateDoc(studentDocRef, {
        [`tasks.${day}`]: arrayUnion({ task, done }),
      });
      toast.success("Tarefa Adicionada!", { position: "top-center" });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    day: string
  ) => {
    if (event.key === "Enter" && event.currentTarget.value.trim() !== "") {
      const enteredTask = event.currentTarget.value.trim();
      handleAddTask(day, enteredTask, false);
      event.currentTarget.value = "";
    }
  };

  const handleTaskStatusChange = async (
    day: string,
    index: number,
    done: boolean
  ) => {
    if (!id) return;
    try {
      const updatedTasks = [...tasks[day]];
      updatedTasks[index].done = done;

      const studentDocRef = doc(db, `users/${id}`);
      await updateDoc(studentDocRef, {
        [`tasks.${day}`]: updatedTasks,
      });

      setTasks((prevTasks: { [x: string]: any }) => ({
        ...prevTasks,
        [day]: updatedTasks,
      }));

      const taskStatus = done
        ? "marcada como concluída"
        : "marcada como não concluída";
      toast.success(`Tarefa ${taskStatus}!`, {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (day: string, index: number) => {
    if (!id) return;
    try {
      const updatedTasks = [...tasks[day]];
      updatedTasks.splice(index, 1);

      const studentDocRef = doc(db, `users/${id}`);
      await updateDoc(studentDocRef, {
        [`tasks.${day}`]: updatedTasks,
      });

      toast.error("Tarefa deletada!", { position: "top-center" });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao deletar tarefa!", { position: "top-center" });
    }
  };

  const [isDeleteAllTasksModalOpen, setDeleteAllTasksModalOpen] = useState(false);

  const handleDeleteAllTasks = async () => {
    if (!id) return;
    try {
      const studentDocRef = doc(db, `users/${id}`);
      await updateDoc(studentDocRef, {
        tasks: {},
      });
      toast.error("Todas as tarefas excluídas!", { position: "top-center" });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      toast.error("Erro ao excluir todas as tarefas!", {
        position: "top-center",
      });
    } finally {
        setDeleteAllTasksModalOpen(false);
    }
  };

  const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
  const openInstrucoes = () => setIsInstrucoesOpen(true);
  const closeInstrucoes = () => setIsInstrucoesOpen(false);

  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState<number>(0);
  const [tasksCompletedToastShown, setTasksCompletedToastShown] = useState<boolean>(false);

  useEffect(() => {
    const calculateTaskCompletionPercentage = () => {
        if (!tasks || !tasks.Task || tasks.Task.length === 0) return 0;
        const totalTasks = tasks.Task.length;
        const completedTasks = tasks.Task.filter((task: any) => task.done).length;
        return (completedTasks / totalTasks) * 100;
    };
    
    const newPercentage = calculateTaskCompletionPercentage();
    setTaskCompletionPercentage(newPercentage);

    if (newPercentage >= 100 && !tasksCompletedToastShown) {
      toast.success("Parabéns! Você completou todas as tarefas!", {
        position: "top-center",
      });
      setTasksCompletedToastShown(true);
    } else if (newPercentage < 100) {
        setTasksCompletedToastShown(false);
    }
  }, [tasks, tasksCompletedToastShown]);

  return (
    <div>
        {/* MODALS */}
        {isInstrucoesOpen && (
            <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">
                <button
                    onClick={closeInstrucoes}
                    className="absolute top-0 left-0 mt-2 ml-2 "
                >
                    <span className="sr-only">Fechar</span>
                    <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-blue-600 ease-in-out duration-300" />
                </button>

                <h3 className="text-xl font-bold text-center leading-6 mb-4">
                    Tarefas
                </h3>

                <div className="text-justify flex gap-1 flex-col">
                    <span>
                    Coloque aqui as atividades para ajudar seu aluno a estudar
                    todo dia.
                    </span>
                    <span>O ideal criar uma atividade para cada dia.</span>
                    <span>
                    Ao fim de cada semana pode excluir todas e criar novas.
                    </span>
                </div>
                </div>
            </div>
            </div>
        )}

        <ConfirmationModal
            isOpen={isDeleteFileModalOpen}
            onClose={() => setDeleteFileModalOpen(false)}
            onConfirm={confirmDeleteFile}
            title="Excluir Arquivo"
            message={`Tem certeza que deseja excluir o arquivo "${fileToDelete}"?`}
            confirmButtonText="Sim, Excluir"
            confirmButtonVariant="danger"
        />

        <ConfirmationModal
            isOpen={isDeleteAllTasksModalOpen}
            onClose={() => setDeleteAllTasksModalOpen(false)}
            onConfirm={handleDeleteAllTasks}
            title="Excluir Todas as Tarefas"
            message="Tem certeza que deseja excluir todas as tarefas? Esta ação não pode ser desfeita."
            confirmButtonText="Sim, Excluir Todas"
            confirmButtonVariant="danger"
        />
        
        {/* MAIN CONTENT */}
      <div className="fade-in fade-out p-3 h-[92vh] min-w-screen overflow-y-scroll">
      <div className="h-full lg:flex lg:flex-row lg:gap-3 md:flex md:flex-col md:gap-3 flex flex-col justify-around gap-12">
        <div className="flex flex-col gap-3">
          <div className="lg:flex lg:flex-row flex flex-col h-full w-full gap-3 items-strech">
            <div className="flex justify-center items-center h-full rounded-md bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 cursor-pointer duration-300 ease-in-out transition-all">
              {studentData && (
                <Link
                  href={{
                    pathname: `caderno/${encodeURIComponent(
                      studentData.name
                    )}`,
                    query: { id: id },
                  }}
                  passHref
                >
                  <h1 className="text-xl font-semibold text-center lg:px-12 md:px-4 sm:px-4 sm:py-8">
                    Anotações
                  </h1>
                </Link>
              )}
            </div>

            <div className="h-full w-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-1 rounded-lg flex flex-col items-center justify-center gap-1">
              <div className="rounded-md flex flex-col gap-2 lg:row-span-1 md:row-span-5 sm:row-span-5">
                <AlunosAulas id={id} />
              </div>
            </div>
          </div>

          <div className="min-h-[63%] flex flex-col items-center p-3 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
            <div className="lg:flex lg:flex-row lg:justify-around lg:items-center lg:gap-4  md:flex md:flex-col md:justify-between md:items-center md:gap-2 flex flex-col justify-center items-center gap-2 mx-4">
              <h1 className="p-1 font-semibold text-xl">Tarefas</h1>
              <div className="flex justify-center">
                <div className="lg:w-72 md:w-72 w-52 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-lg">
                  <div
                    className="bg-green-500 text-xs leading-none py-1 text-center font-normal text-white rounded-lg"
                    style={{
                      width: `${taskCompletionPercentage}%`,
                      transition: "width 0.5s ease-in-out",
                    }}
                  >
                    <p className="pl-2">
                      {taskCompletionPercentage.toFixed()}%
                    </p>
                  </div>
                </div>
              </div>
              <FluencyButton
                onClick={() => setDeleteAllTasksModalOpen(true)}
                className="w-max p-2 h-8 relative right-0 lg:text-md md:text-sm sm:text-xs"
                variant="danger"
              >
                Excluir Todas
              </FluencyButton>
            </div>

            <div className="flex flex-col lg:items-start md:items-start sm:items-center w-full h-[85%] mt-1 mb-3 mx-2 p-2 pb-4 rounded-md overflow-y-scroll bg-fluency-gray-100 dark:bg-fluency-bg-dark">
              <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-center items-center gap-2 pb-2">
                <input
                  className="lg:w-[26rem] md:w-[22rem] w-[17rem] h-7 border-fluency-gray-100 outline-none focus:border-fluency-red-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-400 dark:text-fluency-gray-100 text-fluency-gray-800 rounded-md p-2"
                  placeholder="Adicionar Tarefa: Segunda - Treinar a atividade 1.2"
                  id="taskInput"
                  onKeyPress={(e) => handleKeyPress(e, "Task")}
                />
                <div className="flex flex-row gap-2 justify-center items-center">
                  <p>
                    <MdOutlineAddTask
                      onClick={() => {
                        const taskInput = document.getElementById("taskInput") as HTMLInputElement;
                        const taskContent = taskInput?.value.trim();
                        if (taskContent) {
                          handleAddTask("Task", taskContent, false);
                          taskInput.value = "";
                        }
                      }}
                      className="w-6 h-auto text-fluency-green-500 hover:text-fluency-green-600 duration-300 ease-in-out transition-all cursor-pointer"
                    />
                  </p>
                  <CiCircleQuestion
                    className="w-6 h-auto cursor-pointer"
                    onClick={openInstrucoes}
                  />
                </div>
              </div>

              <div className="p-1 w-full min-h-[100%] overflow-hidden overflow-y-scroll">
                {tasks?.Task?.map((task: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-row mt-1 justify-between gap-2 items-center bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-700 hover:dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 p-[0.25rem] px-3 rounded-md"
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <label
                        className="relative flex items-center p-3 rounded-full cursor-pointer"
                        htmlFor={`checkbox-${index}`}
                      >
                        <input
                          className="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-fluency-gray-500 dark:border-fluency-gray-100 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-fluency-green-700 checked:bg-fluency-green-700 checked:before:bg-fluency-green-700 hover:before:opacity-10"
                          id={`checkbox-${index}`}
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) =>
                            handleTaskStatusChange(
                              "Task",
                              index,
                              e.target.checked
                            )
                          }
                        />
                        <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </span>
                      </label>
                      <span className="font-semibold">{task.task}</span>
                    </div>
                    <MdDelete
                      className="min-w-5 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold"
                      onClick={() => handleDeleteTask("Task", index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-full md:w-full sm:w-full px-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
          <div className="flex flex-col justify-between items-center rounded-md w-full h-full">
            <div className="flex flex-col gap-2 items-center justify-center w-full p-2">
              <h1 className="text-xl font-semibold text-center mb-2">
                Materiais
              </h1>
              <div className="flex flex-col rounded-lg gap-2 justify-start w-full h-80 overflow-y-auto overflow-hidden">
                {materials.map((material, index) => (
                  <div
                    key={index}
                    className="bg-fluency-gray-50 dark:bg-fluency-bg-dark rounded-md p-1 px-4 gap-4 flex flex-row items-center justify-between w-full min-h-16"
                  >
                    <p className="font-semibold text-sm">{material.name}</p>
                    <div className="bg-fluency-gray-100 dark:bg-fluency-gray-700 p-2 px-4 rounded-md flex flex-row gap-2">
                      <p>{renderMaterialIcon(material.name)}</p>
                      <div className="flex flex-row gap-1">
                          <IoCloudDownloadOutline onClick={() => handleDownload(material.url, material.name)} className="w-4 h-auto hover:text-fluency-green-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold" />
                          <MdDelete onClick={() => handleDeleteFileClick(material.name)} className="w-4 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center w-full p-2 h-[10rem]">
              <label className="flex flex-col items-center justify-center w-full h-full border-2 border-fluency-gray-200 border-dashed rounded-lg cursor-pointer bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all">
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <IoMdCloudOutline className="w-10 h-auto" />
                  <p className="mb-2 text-sm text-fluency-text-light dark:text-fluency-text-dark">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark">
                    PDF, PNG, JPG, MP3, MP4 etc.
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default AlunoPainel;