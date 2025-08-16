"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  getDoc,
  doc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { db } from "@/app/firebase";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  FaFilePdf,
  FaRegFileAudio,
  FaRegFileImage,
  FaRegFileVideo,
} from "react-icons/fa6";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaHeadset,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { SlClose, SlNotebook } from "react-icons/sl";
import { Aluno } from "@/app/types";
import { AnimatePresence, motion } from "framer-motion";
import ReminderModal from "@/app/ui/Components/Caderno/ReminderModal";
import { CheckCheck, Lightbulb } from "lucide-react";
import StudentCallButton from "@/app/SharedPages/Video/StudentCallButton";
import Tour from "@/app/ui/Components/JoyRide/FluencyTour";

// Dynamic import for html2pdf to avoid SSR issues
import dynamic from "next/dynamic";

interface Notebook {
  studentName: string;
  id: string;
  title: string;
  description: string;
  createdAt: any;
  student: string;
  content: any;
}

function Caderno() {
  const { data: session } = useSession();
  const id = session?.user.id;
  const [studentData, setStudentData] = useState<Aluno | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: "text" | "video";
    value: string;
    title: string;
  } | null>(null);

  // Function to open the modal
  const openModal = (type: "text" | "video", value: string, title: string) => {
    setModalContent({ type, value, title });
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Use the extracted ID to fetch student data
        const studentDoc = await getDoc(doc(db, `users/${id}`));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data() as Aluno;
          setStudentData(studentData);
        } else {
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [id]);

  // Fetch notebooks
  useEffect(() => {
    const fetchNotebooks = async () => {
      if (!id) return;
      try {
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
          });
        });
        setNotebooks(notebookList);
      } catch (error) {
        console.error("Error fetching notebooks:", error);
      }
    };
    fetchNotebooks();
  }, [id]);

  // Filter notebooks based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = notebooks.filter(
        (notebook) =>
          notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotebooks(filtered);
    } else {
      setFilteredNotebooks(notebooks);
    }
  }, [searchQuery, notebooks]);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
    const parseDate = (dateString: string) => {
      const [day, month, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    const dateA = parseDate(a.title); // Convert the title string of notebook a to a Date object
    const dateB = parseDate(b.title); // Convert the title string of notebook b to a Date object

    if (sortOrder === "asc") {
      return dateA.getTime() - dateB.getTime(); // Ascending order
    } else {
      return dateB.getTime() - dateA.getTime(); // Descending order
    }
  });

  const [materials, setMaterials] = useState<any[]>([]);
  const storage = getStorage();

  useEffect(() => {
    const fetchMaterials = async () => {
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
    if (studentData) {
      fetchMaterials();
    }
  }, [id, studentData, storage]);

  const renderMaterialIcon = (fileName: string) => {
    const fileType = fileName.split(".").pop()?.toLowerCase();
    if (fileType === "pdf") {
      return <FaFilePdf className="w-4 h-auto" />;
    } else if (fileType === "mp3") {
      return <FaRegFileAudio className="w-4 h-auto" />;
    } else if (fileType === "mp4") {
      return <FaRegFileVideo className="w-4 h-auto" />;
    } else if (fileType === "txt") {
      return <FaFileAlt className="w-6 h-auto" />;
    } else if (fileType === "jpg") {
      return <FaRegFileImage className="w-4 h-auto" />;
    } else if (fileType === "png") {
      return <FaRegFileImage className="w-4 h-auto" />;
    }
    return null; // Return null if file type is not recognized
  };

  const handleDownload = async (url: string) => {
    window.open(url, "_blank");
  };

  const [tasks, setTasks] = useState<any>({});
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const studentDocRef = doc(db, `users/${id}`);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          const studentData = studentDocSnap.data() as Aluno;
          setTasks(studentData.tasks || {});
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [id]);

  const handleTaskStatusChange = async (
    day: string,
    index: number,
    done: boolean
  ) => {
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
      const toastColor = done ? "success" : "error";

      // Show toast with task status
      toast[toastColor](`Tarefa ${taskStatus}!`, {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const [taskCompletionPercentage, setTaskCompletionPercentage] =
    useState<number>(0);
  const [tasksCompletedToastShown, setTasksCompletedToastShown] =
    useState<boolean>(false);

  useEffect(() => {
    setTaskCompletionPercentage(calculateTaskCompletionPercentage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // Calculate task completion percentage
  const calculateTaskCompletionPercentage = () => {
    if (!tasks || !tasks.Task || tasks.Task.length === 0) return 0; // Check if there are no tasks
    const totalTasks = tasks.Task.length;
    const completedTasks = tasks.Task.filter((task: any) => task.done).length;
    return (completedTasks / totalTasks) * 100;
  };

  useEffect(() => {
    const completionPercentage = calculateTaskCompletionPercentage();
    const progressInterval = setInterval(() => {
      setTaskCompletionPercentage((prevPercentage) => {
        if (prevPercentage >= completionPercentage) {
          clearInterval(progressInterval);
          return completionPercentage;
        }
        return prevPercentage + 1;
      });
    }, 10);

    return () => clearInterval(progressInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, tasksCompletedToastShown]);

  // Tour steps configuration
  const tourSteps = [
    {
      target: ".tour-notebooks-search",
      title: "Buscar Cadernos",
      content: "Aqui você pode buscar seus cadernos por título ou descrição.",
      placement: "bottom" as const,
      disableBeacon: true,
    },
    {
      target: ".tour-notebooks-list",
      title: "Seus Cadernos",
      content:
        "Esta é sua lista de cadernos de aula. Clique em um para ver detalhes.",
      placement: "right" as const,
    },
    {
      target: ".tour-notebooks-pdf-download",
      title: "Baixar seus Cadernos",
      content: "Clique neste botão para fazer o download em PDF da sua aula.",
      placement: "right" as const,
    },
    {
      target: ".tour-tasks-section",
      title: "Tarefas",
      content:
        "Acompanhe suas tarefas aqui. Marque como concluídas quando finalizar.",
      placement: "left" as const,
    },
    {
      target: ".tour-materials-section",
      title: "Materiais",
      content: "Baixe materiais extras enviados pelo seu professor.",
      placement: "top" as const,
    },
    {
      target: ".tour-guidelines-section",
      title: "Guias e Informações",
      content: "Acesse tutoriais e informações importantes sobre a plataforma.",
      placement: "left" as const,
    },
    {
      target: ".tour-call-button",
      title: "Chamada de Vídeo",
      content:
        "Aqui o botão vai mudar quando seu professor estiver em chamada.",
      placement: "bottom" as const,
    },
  ];

  // Fixed PDF download function with proper client-side loading
  const downloadNotebookAsPdf = async (notebook: Notebook) => {
    // Create toast promise
    const pdfPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Dynamically import html2pdf only on client side
        const html2pdf = (await import("html2pdf.js")).default;

        const element = document.createElement("div");
        element.innerHTML = `
        <div class="p-8 bg-white text-black">
          <h1 class="text-3xl font-bold mb-4">${notebook.title}</h1>
          <div class="text-sm text-gray-600 mb-6">
            ${new Date(notebook.createdAt?.toDate()).toLocaleDateString(
              "pt-BR"
            )}
          </div>
          <div class="notebook-content">${notebook.content}</div>
        </div>
      `;

        // Updated CSS for PDF generation
        const style = document.createElement("style");
        style.innerHTML = `
          .notebook-content {
            line-height: 1.6;
            font-size: 16px;
          }
          /* Add these new styles for pre/code blocks */
          .notebook-content pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin: 1em 0;
            overflow: auto;
            white-space: pre-wrap;       /* Allow wrapping */
            word-break: break-word;     /* Break long words */
            font-family: monospace;
          }
          .notebook-content code {
            font-family: monospace;
            white-space: pre-wrap;      /* Inherit wrapping */
            display: block;             /* Ensure full width */
          }
          /* Keep existing styles */
          .notebook-content h1, .notebook-content h2, .notebook-content h3 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: bold;
          }
          .notebook-content h1 { font-size: 24px; }
          .notebook-content h2 { font-size: 20px; }
          .notebook-content h3 { font-size: 18px; }
          .notebook-content p {
            margin-bottom: 1em;
            text-align: justify;
          }
          .notebook-content ul, .notebook-content ol {
            margin-left: 20px;
            margin-bottom: 1em;
          }
          .notebook-content li {
            margin-bottom: 0.5em;
          }
          .notebook-content strong {
            font-weight: bold;
          }
          .notebook-content em {
            font-style: italic;
          }
          .notebook-content hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2em 0;
          }
        `;
        element.appendChild(style);

        const opt = {
          margin: 10,
          filename: `${notebook.title.replace(/\//g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        };

        // Generate PDF
        await html2pdf().set(opt).from(element).save();

        resolve();
      } catch (err) {
        console.error("PDF generation failed:", err);
        reject(new Error("Falha ao gerar PDF"));
      }
    });

    // Show toast with promise
    toast.promise(
      pdfPromise,
      {
        loading: "Gerando PDF...",
        success: "PDF baixado com sucesso!",
        error: (err) => err.message || "Erro ao gerar PDF",
      },
      {
        position: "top-center",
        duration: 3000,
        style: {
          background: "#333",
          color: "#fff",
          minWidth: "250px",
        },
      }
    );
  };

  return (
    <div>
      <Tour
        steps={tourSteps}
        pageKey="caderno"
        userId={id || undefined}
        delay={1000}
        onTourEnd={() => console.log("Caderno tour completed")}
      />

      <div className="fade-in fade-out p-2 h-max md:h-max lg:h-[92vh] min-w-screen overflow-hidden">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col gap-3 h-full overflow-hidden">
          {/* Search Bar - Mobile */}
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 flex-shrink-0">
            <div className="relative w-full tour-notebooks-search">
              <input
                type="text"
                placeholder="Buscar lições..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-fluency-gray-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-fluency-gray-500 hover:text-fluency-red-500"
                >
                  <SlClose />
                </button>
              )}
            </div>
          </div>

          {/* Notebooks List - Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 min-h-[40vh] max-h-[40vh] overflow-y-auto tour-notebooks-list"
          >
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {sortedNotebooks.length > 0 ? (
                    sortedNotebooks.map((notebook) => (
                      <motion.div
                        key={notebook.id}
                        whileHover={{ scale: 1.01 }}
                        exit={{ scale: 0.9 }}
                        className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start gap-3">
                            <Link
                              href={{
                                pathname: `/student-dashboard/caderno/aula/${encodeURIComponent(
                                  notebook.studentName
                                )}`,
                                query: {
                                  notebook: notebook.id,
                                  student: notebook.student,
                                },
                              }}
                              className="flex-1 min-w-0"
                            >
                              <h3 className="font-bold text-lg mb-1 break-words">
                                {notebook.title}
                              </h3>
                              <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm break-words">
                                {notebook.description || "Sem descrição"}
                              </p>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadNotebookAsPdf(notebook);
                              }}
                              className="p-2 rounded-full hover:bg-fluency-blue-200 dark:hover:bg-fluency-gray-700 transition-colors tour-notebooks-pdf-download"
                              aria-label="Download PDF"
                            >
                              <FaFilePdf className="w-5 h-5 text-fluency-red-500" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-fluency-gray-500"
                    >
                      {searchQuery
                        ? "Nenhum caderno encontrado"
                        : "Nenhum caderno disponível"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Other sections for mobile */}
          <div className="grid grid-cols-1 gap-3 flex-shrink-0">
            {/* Tasks - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg w-full min-h-max overflow-hidden tour-tasks-section"
            >
              <div className="w-full bg-gray-300 dark:bg-fluency-gray-500 h-3 mb-2">
                <motion.div
                  className="bg-fluency-green-500 h-3 transition-all duration-500"
                  style={{
                    width: `${taskCompletionPercentage}%`,
                  }}
                />
              </div>
              <div className="px-4 py-2">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <CheckCheck className="text-fluency-green-500" />
                    Tarefas
                  </h2>
                </div>
                <motion.div
                  className="space-y-2 w-full max-h-[300px] overflow-y-auto pr-2"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {tasks &&
                      tasks.Task &&
                      tasks.Task.map((task: any, index: number) => (
                        <motion.div
                          key={index}
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                          }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                              className={`text-sm font-medium truncate ${
                                task.done
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {task.task}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            {/* Materials & Guidelines - Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 tour-materials-section"
              >
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <IoCloudDownloadOutline className="text-fluency-blue-500" />
                  Materiais
                </h2>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {materials.length > 0 ? (
                    materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-fluency-blue-100 dark:bg-fluency-gray-800"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="p-1 rounded bg-fluency-blue-200 dark:bg-fluency-gray-700">
                            {renderMaterialIcon(material.name)}
                          </div>
                          <span className="text-sm truncate">
                            {material.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(material.url)}
                          className="p-1 rounded bg-fluency-green-100 dark:bg-fluency-green-900"
                        >
                          <IoCloudDownloadOutline className="w-4 h-4 text-fluency-green-700 dark:text-fluency-green-300" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-full p-3 mb-2 mx-auto w-fit">
                        <IoCloudDownloadOutline className="w-6 h-6 text-fluency-gray-500" />
                      </div>
                      <p className="text-sm text-fluency-gray-500">
                        Nenhum material
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 tour-guidelines-section"
              >
                <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
                  <Lightbulb className="text-fluency-orange-500" />
                  Guidelines
                </h2>
                <div className="space-y-2 h-32 overflow-y-auto">
                  <div
                    onClick={() =>
                      openModal(
                        "text",
                        "Nossa plataforma foi pensada para você! Aqui você pode:\n\n- Acessar seus cadernos de aula\n- Ver suas tarefas e marcar como concluídas\n- Baixar materiais extras e complementares\n- E muito mais! As outras abas te permitem praticar o idioma \n E também remarcar suas aulas!",
                        "Como usar a plataforma"
                      )
                    }
                    className="flex items-center gap-2 p-2 rounded bg-fluency-blue-50 dark:bg-fluency-gray-800 cursor-pointer"
                  >
                    <div className="bg-fluency-orange-100 dark:bg-fluency-orange-900 p-1 rounded">
                      <FaInfoCircle className="text-fluency-yellow-600 dark:text-fluency-yellow-300 w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">
                        Como usar a plataforma
                      </h3>
                      <p className="text-xs text-fluency-gray-600 dark:text-fluency-gray-300">
                        Guia completo
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-3 h-full overflow-hidden">
          {/* Notebooks Section - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-2/3 rounded-lg bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 flex flex-col min-h-0"
          >
            <div className="flex justify-between items-center mb-4 gap-4 tour-call-button flex-shrink-0">
              <div className="relative w-full tour-notebooks-search">
                <input
                  type="text"
                  placeholder="Buscar lições..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-800 border border-fluency-gray-200 dark:border-fluency-gray-700 focus:outline-none focus:ring-2 focus:ring-fluency-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-fluency-gray-500" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-fluency-gray-500 hover:text-fluency-red-500"
                  >
                    <SlClose />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 tour-notebooks-list">
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-4 pr-2">
                  <AnimatePresence>
                    {sortedNotebooks.length > 0 ? (
                      sortedNotebooks.map((notebook) => (
                        <motion.div
                          key={notebook.id}
                          whileHover={{ scale: 1.02, y: 5 }}
                          exit={{ scale: 0.9 }}
                          className="bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-lg overflow-hidden border border-fluency-gray-200 dark:border-fluency-gray-700 flex-shrink-0"
                        >
                          <div className="flex justify-between items-start p-4">
                            <Link
                              href={{
                                pathname: `/student-dashboard/caderno/aula/${encodeURIComponent(
                                  notebook.studentName
                                )}`,
                                query: {
                                  notebook: notebook.id,
                                  student: notebook.student,
                                },
                              }}
                              passHref
                              className="flex-1 min-w-0"
                            >
                              <div>
                                <h3 className="font-bold text-lg mb-2 break-words">
                                  {notebook.title}
                                </h3>
                                <p className="text-fluency-gray-600 dark:text-fluency-gray-300 text-sm line-clamp-2 break-words">
                                  {notebook.description || "Sem descrição"}
                                </p>
                              </div>
                            </Link>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadNotebookAsPdf(notebook);
                              }}
                              className="ml-4 p-2 rounded-full hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700 transition-colors tour-notebooks-pdf-download flex-shrink-0"
                              aria-label="Download PDF"
                            >
                              <FaFilePdf className="w-5 h-5 text-fluency-red-500" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center py-8 text-fluency-gray-500"
                      >
                        {searchQuery
                          ? "Nenhum caderno encontrado"
                          : "Nenhum caderno disponível"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Desktop */}
          <div className="flex flex-col gap-4 w-1/3">
            {/* Tasks Section - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg tour-tasks-section"
            >
              <div className="w-full bg-gray-300 dark:bg-fluency-gray-500 h-3 mb-2">
                <motion.div
                  className="bg-fluency-green-500 h-3 transition-all duration-500"
                  style={{
                    width: `${taskCompletionPercentage}%`,
                  }}
                />
              </div>
              <div className="p-4">
                <div className="w-full flex flex-col lg:flex-row lg:justify-around lg:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <CheckCheck className="text-fluency-green-500" />
                      Tarefas
                    </h2>
                  </div>
                </div>

                <motion.div
                  className="space-y-2 w-full max-h-[300px] overflow-y-auto pr-2"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {tasks &&
                      tasks.Task &&
                      tasks.Task.map((task: any, index: number) => (
                        <motion.div
                          key={index}
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                          }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-fluency-gray-100 dark:bg-fluency-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                            <label
                              htmlFor={`checkbox-${index}`}
                              className="flex-1 min-w-0"
                            >
                              {task.link ? (
                                <Link href={task.link}>
                                  <span
                                    className={`font-semibold text-sm break-words ${
                                      task.done
                                        ? "line-through text-gray-500 dark:text-gray-400"
                                        : "text-gray-800 dark:text-gray-200"
                                    }`}
                                  >
                                    {task.task}
                                  </span>
                                </Link>
                              ) : (
                                <span
                                  className={`font-semibold text-sm break-words ${
                                    task.done
                                      ? "line-through text-gray-500 dark:text-gray-400"
                                      : "text-gray-800 dark:text-gray-200"
                                  }`}
                                >
                                  {task.task}
                                </span>
                              )}
                            </label>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>

            {/* Materials Section - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-md overflow-hidden tour-materials-section"
            >
              <div className="p-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <IoCloudDownloadOutline className="text-fluency-blue-500" />
                  Materiais
                </h2>
              </div>

              <div className="h-max overflow-y-auto custom-scrollbar p-2">
                <AnimatePresence>
                  {materials.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {materials.map((material, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-fluency-blue-100 dark:bg-fluency-gray-800 hover:bg-fluency-blue-50 dark:hover:bg-fluency-gray-700 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-md bg-fluency-blue-200 dark:bg-fluency-gray-700 flex-shrink-0">
                              {renderMaterialIcon(material.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-fluency-gray-800 dark:text-fluency-gray-100">
                                {material.name}
                              </p>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload(material.url)}
                            className="p-2 rounded-full bg-fluency-green-100 dark:bg-fluency-green-900 hover:bg-fluency-green-200 dark:hover:bg-fluency-green-800 flex-shrink-0"
                            aria-label="Download"
                          >
                            <IoCloudDownloadOutline className="w-5 h-5 text-fluency-green-700 dark:text-fluency-green-300" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center py-8"
                    >
                      <div className="bg-fluency-gray-100 dark:bg-fluency-gray-800 rounded-full p-4 mb-3">
                        <IoCloudDownloadOutline className="w-8 h-8 text-fluency-gray-500 dark:text-fluency-gray-400" />
                      </div>
                      <p className="text-fluency-gray-500 dark:text-fluency-gray-400">
                        Nenhum material disponível
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Guidelines Section - Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl shadow-md overflow-hidden tour-guidelines-section"
            >
              <div className="p-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Lightbulb className="text-fluency-orange-500" />
                  Guidelines
                </h2>
              </div>

              <div className="p-4">
                <ul className="space-y-2 h-max overflow-y-auto custom-scrollbar">
                  <motion.li
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-fluency-blue-50 dark:bg-fluency-gray-800 hover:bg-fluency-blue-100 dark:hover:bg-fluency-gray-700 cursor-pointer transition-colors"
                    onClick={() =>
                      openModal(
                        "text",
                        "Nossa plataforma foi pensada para você! Aqui você pode:\n\n- Acessar seus cadernos de aula\n- Ver suas tarefas e marcar como concluídas\n- Baixar materiais extras e complementares\n- E muito mais! As outras abas te permitem praticar o idioma \n E também remarcar suas aulas!",
                        "Como usar a plataforma"
                      )
                    }
                  >
                    <div className="bg-fluency-orange-100 dark:bg-fluency-orange-900 p-2 rounded-md mt-0.5 flex-shrink-0">
                      <FaInfoCircle className="text-fluency-yellow-600 dark:text-fluency-yellow-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-fluency-gray-800 dark:text-fluency-gray-100">
                        Como usar a plataforma
                      </h3>
                      <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300 mt-1">
                        Guia completo de utilização
                      </p>
                    </div>
                  </motion.li>

                  <motion.li
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{
                      y: -2,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-fluency-green-50 dark:bg-fluency-gray-800 hover:bg-fluency-green-100 dark:hover:bg-fluency-gray-700 cursor-pointer transition-colors"
                    onClick={() =>
                      openModal(
                        "text",
                        "Para entrar em contato com a gente, use o WhatsApp: +55 (86) 9 9953-5791.\n\nPara suporte técnico, envie um e-mail para fluencylab.online@gmail.com",
                        "Contatos oficiais"
                      )
                    }
                  >
                    <div className="bg-fluency-green-100 dark:bg-fluency-green-900 p-2 rounded-md mt-0.5 flex-shrink-0">
                      <FaHeadset className="text-fluency-green-600 dark:text-fluency-green-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-fluency-gray-800 dark:text-fluency-gray-100">
                        Contatos oficiais
                      </h3>
                      <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-300 mt-1">
                        Canais de atendimento
                      </p>
                    </div>
                  </motion.li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ReminderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={modalContent}
      />
    </div>
  );
}

export default Caderno;
