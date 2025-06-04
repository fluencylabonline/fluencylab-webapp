"use client";
import React, { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/app/firebase";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import { MdDelete, MdOutlineAddTask } from "react-icons/md";
import { CiCircleQuestion } from "react-icons/ci";
import { IoClose } from "react-icons/io5";

import ConfirmationModal from "@/app/ui/Components/ModalComponents/confirmation";

interface TaskCardProps {
  studentId: string | null;
}

const TaskCard: React.FC<TaskCardProps> = ({ studentId }) => {
  const [tasks, setTasks] = useState<any>({});
  const [isDeleteAllTasksModalOpen, setDeleteAllTasksModalOpen] =
    useState(false);
  const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
  const [taskCompletionPercentage, setTaskCompletionPercentage] =
    useState<number>(0);
  const [tasksCompletedToastShown, setTasksCompletedToastShown] =
    useState<boolean>(false);

  useEffect(() => {
    if (!studentId) return;
    const studentDocRef = doc(db, `users/${studentId}`);
    const unsubscribe = onSnapshot(studentDocRef, (doc) => {
      if (doc.exists()) {
        setTasks(doc.data().tasks || {});
      }
    });
    return () => unsubscribe();
  }, [studentId]);

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

  const handleAddTask = async (day: string, task: string, done: boolean) => {
    if (!studentId) return;
    try {
      const studentDocRef = doc(db, `users/${studentId}`);
      await updateDoc(studentDocRef, {
        [`tasks.${day}`]: arrayUnion({ task, done }),
      });
      toast.success("Tarefa adicionada!", { position: "top-center" });
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
    if (!studentId) return;
    try {
      const updatedTasks = [...tasks[day]];
      updatedTasks[index].done = done;

      const studentDocRef = doc(db, `users/${studentId}`);
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
    if (!studentId) return;
    try {
      const updatedTasks = [...tasks[day]];
      updatedTasks.splice(index, 1);

      const studentDocRef = doc(db, `users/${studentId}`);
      await updateDoc(studentDocRef, {
        [`tasks.${day}`]: updatedTasks,
      });

      toast.error("Tarefa deletada!", { position: "top-center" });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao deletar tarefa!", { position: "top-center" });
    }
  };

  const handleDeleteAllTasks = async () => {
    if (!studentId) return;
    try {
      const studentDocRef = doc(db, `users/${studentId}`);
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

  const openInstrucoes = () => setIsInstrucoesOpen(true);
  const closeInstrucoes = () => setIsInstrucoesOpen(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const progressBarVariants = {
    initial: { width: 0 },
    animate: {
      width: `${taskCompletionPercentage}%`,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* MODALS */}
      <AnimatePresence>
        {isInstrucoesOpen && (
          <motion.div
            className="fixed z-[9999] inset-0 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center min-h-screen">
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />

              <motion.div
                className="relative bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-8 max-w-md w-full mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <button
                  onClick={closeInstrucoes}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <IoClose className="w-6 h-6" />
                </button>

                <h3 className="text-xl font-bold text-center mb-4">Tarefas</h3>

                <div className="text-gray-700 dark:text-gray-300 space-y-3">
                  <p>
                    Coloque aqui as atividades para ajudar seu aluno a estudar
                    todo dia.
                  </p>
                  <p>O ideal criar uma atividade para cada dia.</p>
                  <p>Ao fim de cada semana pode excluir todas e criar novas.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isDeleteAllTasksModalOpen}
        onClose={() => setDeleteAllTasksModalOpen(false)}
        onConfirm={handleDeleteAllTasks}
        title="Excluir Todas as Tarefas"
        message="Tem certeza que deseja excluir todas as tarefas? Esta ação não pode ser desfeita."
        confirmButtonText="Sim, Excluir Todas"
        confirmButtonVariant="danger"
      />

      {/* CARD CONTENT */}
      <motion.div
        className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg w-full min-h-max overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full bg-gray-300 dark:bg-fluency-gray-500 h-3 mb-2">
          <motion.div
            className="bg-fluency-green-500 h-3"
            variants={progressBarVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center justify-between w-full mb-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Tarefas
            </h1>

            <MdDelete
              className="w-4 h-4 cursor-pointer text-fluency-red-500"
              onClick={() => setDeleteAllTasksModalOpen(true)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:bg-fluency-gray-700 dark:border-fluency-gray-600 focus:ring-2 focus:ring-fluency-blue-500 focus:border-transparent transition-all"
                placeholder="Adicionar nova tarefa..."
                id="taskInput"
                onKeyPress={(e) => handleKeyPress(e, "Task")}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const taskInput = document.getElementById(
                    "taskInput"
                  ) as HTMLInputElement;
                  const taskContent = taskInput?.value.trim();
                  if (taskContent) {
                    handleAddTask("Task", taskContent, false);
                    taskInput.value = "";
                  }
                }}
                className="p-2 rounded-full bg-fluency-blue-500 hover:bg-fluency-blue-600 text-white transition-colors"
              >
                <MdOutlineAddTask className="w-5 h-5" />
              </button>
              <button
                onClick={openInstrucoes}
                className="p-2 rounded-full bg-fluency-gray-200 hover:bg-fluency-gray-300 dark:bg-fluency-gray-700 dark:hover:bg-fluency-gray-600 transition-colors"
              >
                <CiCircleQuestion className="w-5 h-5" />
              </button>
            </div>
          </div>

          <motion.div
            className="space-y-2 w-full max-h-[300px] overflow-y-auto pr-2 mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {tasks?.Task?.map((task: any, index: number) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={task.done}
                        onChange={(e) =>
                          handleTaskStatusChange(
                            "Task",
                            index,
                            e.target.checked
                          )
                        }
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                        ${
                          task.done
                            ? "bg-green-500 border-green-500"
                            : "border-gray-400 dark:border-gray-500 hover:border-blue-500"
                        }`}
                      >
                        {task.done && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                    <span
                      className={`${
                        task.done
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {task.task}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask("Task", index)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default TaskCard;
