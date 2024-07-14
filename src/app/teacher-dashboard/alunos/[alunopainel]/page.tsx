'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, arrayUnion, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { db } from '@/app/firebase';

import { useSession } from 'next-auth/react';
import { Accordion, AccordionItem, Tooltip } from '@nextui-org/react';

import { FaFilePdf, FaRegFileAudio, FaRegFileImage, FaRegFileVideo } from "react-icons/fa6";

import AlunosAulas from './aluno-aulas';
import Link from 'next/link';

import { toast } from 'react-hot-toast';

import { FaFileAlt } from 'react-icons/fa';
import { IoClose, IoCloudDownloadOutline } from 'react-icons/io5';
import { MdDelete, MdOutlineAddTask } from 'react-icons/md';
import { IoIosAddCircleOutline, IoMdCloudOutline } from 'react-icons/io';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';
import { CiCircleQuestion } from 'react-icons/ci';

interface TasksData {
  tasksSuggestion1: (string | boolean)[][];
  tasksSuggestion2: (string | boolean)[][];
  tasksSuggestion3: (string | boolean)[][];
  tasksSuggestion4: (string | boolean)[][];
  tasksSuggestion5: (string | boolean)[][];
}

interface TasksDataBasics {
  tasksSuggestion1: (string | boolean)[][];
  tasksSuggestion2: (string | boolean)[][];
  tasksSuggestion3: (string | boolean)[][];
  tasksSuggestion4: (string | boolean)[][];
  tasksSuggestion5: (string | boolean)[][];
}

import tasksDataJson from './tasksFirstSteps.json';
import tasksDataJsonBasics from './taskTheBasics.json';

const tasksDataBasics: TasksDataBasics = tasksDataJsonBasics as TasksDataBasics;
const tasksData: TasksData = tasksDataJson as TasksData;

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
    //TeacherDataFetching
    const { data: session } = useSession();
    const [role, setRole] = useState<string>('');
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
    const id = params.get('id');
    const [studentData, setStudentData] = useState<Aluno | null>(null);

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
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentData();
    }, [id]);
    

    const [materials, setMaterials] = useState<any[]>([]);
    const storage = getStorage();

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
    
      const file = files[0];
    
      // Generate a unique filename (you can use UUID or any other method)
      const fileName = `alunosmateriais/${id}/materiais/archives/${file.name}`;
    
      // Create a reference to the storage location
      const storageRef = ref(storage, fileName);
    
      try {
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);
    
        // Handle success, you can update the database or show a success message here
        console.log('File uploaded successfully!');
        fetchMaterialsReal()
        toast.success('Arquivo salvo!.', {
          position: "top-center",
        });
        fetchMaterialsReal();
      } catch (error) {
         // Handle error
          console.error('Error uploading file:', error);
          toast.error('Erro ao salvar arquivo!.', {
            position: "top-center",
          });
        }
      };
    
    const fetchMaterialsReal = async () => {
      try {
          const materialsRef = ref(storage, `alunosmateriais/${id}/materiais/archives`);
          const materialList = await listAll(materialsRef);
          const materialUrls = await Promise.all(materialList.items.map(async (item) => {
              const downloadUrl = await getDownloadURL(item);
              return { name: item.name, url: downloadUrl };
          }));
          setMaterials(materialUrls);
      } catch (error) {
          console.error('Error fetching materials:', error);
      }
    };

    if (studentData) {
        fetchMaterialsReal();
    }

    useEffect(() => {
      const fetchMaterials = async () => {
        try {
          const materialsRef = ref(storage, `alunosmateriais/${id}/materiais/archives`);
          const materialList = await listAll(materialsRef);
          const materialUrls = await Promise.all(materialList.items.map(async (item) => {
            const downloadUrl = await getDownloadURL(item);
            return { name: item.name, url: downloadUrl };
          }));
          setMaterials(materialUrls);
        } catch (error) {
          console.error('Error fetching materials:', error);
        }
      };
      if (studentData) {
        fetchMaterials();
      }
    }, [id, studentData, storage]);
  
    const renderMaterialIcon = (fileName: string) => {
      const fileType = fileName.split('.').pop()?.toLowerCase();
      if (fileType === 'pdf') {
        return <FaFilePdf className='w-4 h-auto'/>;
      } else if (fileType === 'mp3') {
        return <FaRegFileAudio className='w-4 h-auto'/>;
      } else if (fileType === 'mp4') {
        return <FaRegFileVideo className='w-4 h-auto'/>;
      } else if (fileType === 'txt') {
        return <FaFileAlt className='w-6 h-auto'/>;
      } else if (fileType === 'jpg') {
        return <FaRegFileImage className='w-4 h-auto'/>;
      } else if (fileType === 'png') {
        return <FaRegFileImage className='w-4 h-auto'/>;
      }
      return null;
    };


    const handleDownload = async (url: string) => {
      // Use HTML anchor tag to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState('');

    const openModal = (fileName: React.SetStateAction<string>) => {
        setFileToDelete(fileName);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDelete = (fileName: any) => {
      openModal(fileName);
  };
  

    const handleFileDelete = async (fileName: string) => {
            const fileRef = ref(storage, `/alunosmateriais/${id}/materiais/archives/${fileName}`);
            try {
                await deleteObject(fileRef);
                // Fetch materials again to reflect the changes
                fetchMaterialsReal();
                toast.success('Arquivo deletado!', {
                    position: "top-center",
                });
                setIsModalOpen(false);
              } catch (error) {
                  console.error('Error deleting file:', error);
                  toast.error('Error deleting file!', {
                      position: "top-center",
                  });
                  setIsModalOpen(false);
              }
    };

          const [tasks, setTasks] = useState<any>({});
          useEffect(() => {
            const fetchTasks = async () => {
              try {
                const studentDocRef = doc(db, `users/${id}`);
                const unsubscribe = onSnapshot(studentDocRef, (doc) => {
                  if (doc.exists()) {
                    const studentData = doc.data();
                    setTasks(studentData.tasks || {});
                  }
                });
                return unsubscribe;
              } catch (error) {
                console.error('Error fetching tasks:', error);
              }
            };
        
            const unsubscribe = fetchTasks();
            // Ensure unsubscribe is a function before calling it
            if (unsubscribe instanceof Function) {
              return () => unsubscribe();
            }
          }, [id]);


        const handleAddTask = async (day: string, task: string, done: boolean) => {
          try {
              const studentDocRef = doc(db, `users/${id}`);
              await updateDoc(studentDocRef, {
                  [`tasks.${day}`]: arrayUnion({ task, done })
              });
              toast.success('Tarefa Adicionada!', {
                position: "top-center",
              });
            } catch (error) {
                console.error('Error adding task:', error);
            }
        };
        

        const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, day: string) => {
          if (event.key === 'Enter' && event.currentTarget.value.trim() !== '') {
              const enteredTask = event.currentTarget.value.trim();
              const taskIdSeparatorIndex = enteredTask.indexOf(':');
              if (taskIdSeparatorIndex !== -1) {
                  // Extract task ID and task description
                  const taskId = enteredTask.slice(0, taskIdSeparatorIndex).trim();
                  const taskDescription = enteredTask.slice(taskIdSeparatorIndex + 1).trim();
      
                  // Check if task ID is valid and task exists
                  if (tasks && tasks[day]) {
                      const taskIndex = tasks[day].findIndex((task: any) => task.task === taskId);
                      if (taskIndex !== -1) {
                          // Toggle task completion status
                          const updatedTasks = [...tasks[day]];
                          updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;
      
                          // Update task in Firestore and local state
                          handleTaskStatusChange(day, taskIndex, updatedTasks[taskIndex].done);
                      } else {
                          // If task ID doesn't exist, add a new task
                          handleAddTask(day, enteredTask, false);
                      }
                  }
              } else {
                  // If no task ID is provided, add a new task
                  handleAddTask(day, enteredTask, false);
              }
      
              // Clear input field after adding or updating task
              event.currentTarget.value = '';
          }
        };

        const handleTaskStatusChange = async (day: string, index: number, done: boolean) => {
          try {
              const updatedTasks = [...tasks[day]];
              updatedTasks[index].done = done;
      
              const studentDocRef = doc(db, `users/${id}`);
              await updateDoc(studentDocRef, {
                  [`tasks.${day}`]: updatedTasks
              });
      
              setTasks((prevTasks: { [x: string]: any; }) => ({
                  ...prevTasks,
                  [day]: updatedTasks
              }));
      
              const taskStatus = done ? 'marcada como concluída' : 'marcada como não concluída';
              const toastColor = done ? 'success' : 'error';

              // Show toast with task status
              toast[toastColor](`Tarefa ${taskStatus}!`, {
                  position: "top-center",
              });

          } catch (error) {
              console.error('Error updating task status:', error);
          }
      };

      const handleDeleteTask = async (day: string, index: number) => {
        try {
            const updatedTasks = [...tasks[day]];
            updatedTasks.splice(index, 1);
    
            const studentDocRef = doc(db, `users/${id}`);
            await updateDoc(studentDocRef, {
                [`tasks.${day}`]: updatedTasks
            });
    
            setTasks((prevTasks: { [x: string]: any }) => ({
                ...prevTasks,
                [day]: updatedTasks
            }));
    
            toast.error('Tarefa deletada!', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Erro ao deletar tarefa!', {
                position: "top-center",
            });
        }
    };

    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const openDeleteConfirmationModal = () => {
        setIsDeleteConfirmationModalOpen(true);
    };
    
    const closeDeleteConfirmationModal = () => {
        setIsDeleteConfirmationModalOpen(false);
    };

    const handleDeleteAllTasksConfirmation = () => {
      handleDeleteAllTasks();
      closeDeleteConfirmationModal();
  };
    
    const handleDeleteAllTasks = async () => {
      try {
          const studentDocRef = doc(db, `users/${id}`);
          await updateDoc(studentDocRef, {
              tasks: {}
          });
  
          setTasks({});
          
          toast.error('Todas as tarefas excluídas!', {
              position: "top-center",
          });
      } catch (error) {
          console.error('Error deleting all tasks:', error);
          toast.error('Erro ao excluir todas as tarefas!', {
              position: "top-center",
          });
      }
  };
      

  const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
  const openInstrucoes = () => {
      setIsInstrucoesOpen(true);
  };

  const closeInstrucoes = () => {
      setIsInstrucoesOpen(false);
  };  

  
  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState<number>(0);
  const [tasksCompletedToastShown, setTasksCompletedToastShown] = useState<boolean>(false);

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
                    if (completionPercentage >= 100 && !tasksCompletedToastShown) {
                        toast.success('Parabéns! Você completou todas as tarefas!', {
                            position: 'top-center',
                        });
                        setTasksCompletedToastShown(true); // Update state to prevent duplicate toast
                    } return completionPercentage;
                } return prevPercentage + 1;
            });
        }, 10);
        return () => clearInterval(progressInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, tasksCompletedToastShown]);

    async function handleTaskModal(tasks: (string | boolean)[][]) {
      const handleAddTask = async (day: string | boolean, task: string | boolean, done: string | boolean) => {
        try {
          const studentDocRef = doc(db, `users/${id}`);
          await updateDoc(studentDocRef, {
            [`tasks.${day}`]: arrayUnion({ task, done })
          });
        } catch (error) {
          console.error('Error adding task:', error);
          throw error;
        }
      };
    
      const addAllTasks = async () => {
        for (const [day, task, done] of tasks) {
          await handleAddTask(day, task, done);
        }
      };
    
      toast.promise(
        addAllTasks(),
        {
          loading: 'Adicionando todas as tarefas...',
          success: 'Todas as tarefas foram adicionadas com sucesso!',
          error: 'Erro ao adicionar todas as tarefas'
        }
      );
    }
    

    const [isSugestoes, setIsSugestoes] = useState(false);
    const openSugestoes = () => {
      setIsSugestoes(true);
    };
  
    const closeSugestoes = () => {
      setIsSugestoes(false);
    };  

return (
    <div>
      {/*Modais*/}
      {isInstrucoesOpen && 
        <div className="fixed z-[9999] inset-0 overflow-y-hidden text-fluency-text-light  ">
        <div className="flex items-center justify-center min-h-screen">

                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

            <div className="dark:text-fluency-text-dark bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-8">                        
                        
                    <button onClick={closeInstrucoes} className="absolute top-0 left-0 mt-2 ml-2 ">
                        <span className="sr-only">Fechar</span>
                        <IoClose className="w-10 h-10 text-fluency-text-light hover:text-fluency-blue-600 ease-in-out duration-300" />
                    </button>
            
                    <h3 className="text-xl font-bold text-center leading-6 mb-4">
                        Tarefas
                    </h3>   

                <div className='text-justify flex gap-1 flex-col'>
                    <span>Coloque aqui as atividades para ajudar seu aluno a estudar todo dia.</span>
                    <span>O ideal criar uma atividade para cada dia.</span>
                    <span>Ao fim de cada semana pode excluir todas e criar novas.</span>
                </div>                                                      
            </div>
        </div>
      </div>}

      {isModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
          
                  <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                      <div className="flex flex-col">
                          <FluencyCloseButton onClick={closeModal}/>
                          <div className="mt-3 flex flex-col gap-3 p-4">
                              <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                  Tem certeza que deseja excluir o arquivo {fileToDelete}?
                              </h3>
                              <div className="flex justify-center">
                                  <FluencyButton variant='danger' onClick={() => handleFileDelete(fileToDelete)}>
                                      Sim, excluir
                                  </FluencyButton>
                                  <FluencyButton variant='gray' onClick={closeModal}>
                                      Não, cancelar
                                  </FluencyButton>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

    {isDeleteConfirmationModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                    <div className="flex flex-col">
                        <FluencyCloseButton onClick={closeDeleteConfirmationModal}/>
                        <div className="mt-3 flex flex-col gap-3 p-4">
                            <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                Tem certeza que deseja excluir todas as tarefas?
                            </h3>
                            <div className="flex justify-center">
                                <FluencyButton variant='danger' onClick={handleDeleteAllTasksConfirmation}>
                                    Sim, excluir
                                </FluencyButton>
                                <FluencyButton variant='gray' onClick={closeDeleteConfirmationModal}>
                                    Não, cancelar
                                </FluencyButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

          <div className='fade-in fade-out p-3 h-[92vh] min-w-screen overflow-y-scroll'>
            <div className="gap-3 h-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col">

            <div className='flex flex-col gap-3'>

              <div className='lg:flex lg:flex-row flex flex-col h-full w-full gap-3 items-strech'>
                <div className="flex justify-center items-center h-full rounded-md bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 cursor-pointer duration-300 ease-in-out transition-all">
                 {studentData && (
                  <Link href={{ pathname: `caderno/${encodeURIComponent(studentData.name)}`, query: { id: id } }} passHref>
                    <h1 className="text-xl font-semibold text-center lg:px-12 md:px-4 sm:px-4 sm:py-8">Anotações</h1>
                  </Link>)}
                </div>
              
                <div className='h-full w-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-1 rounded-lg flex flex-col items-center justify-center gap-1'>
                  <div className="rounded-md flex flex-col gap-2 lg:row-span-1 md:row-span-5 sm:row-span-5">  
                    <AlunosAulas id={id} />
                  </div>
                </div>
              </div>


              <div className="h-full flex flex-col items-center overflow-hidden p-3 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
                  <div className='lg:flex lg:flex-row lg:justify-around lg:items-center lg:gap-4  md:flex md:flex-col md:justify-between md:items-center md:gap-2 flex flex-col justify-center items-center gap-2 mx-4'>
                    <h1 className='p-1 font-semibold text-xl'>Tarefas</h1>
                    <div className="flex justify-center">
                        <div className="w-72 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-lg">
                          <div
                              className="bg-green-500 text-xs leading-none py-1 text-center font-normal text-white rounded-lg"
                              style={{ width: `${taskCompletionPercentage}%`, transition: 'width 0.4s linear' }}
                              >
                              <p className='pl-2'>{taskCompletionPercentage.toFixed()}%</p>
                          </div>
                        </div>
                    </div>
                      <FluencyButton onClick={openDeleteConfirmationModal} className='w-max p-2 h-8 relative right-0 lg:text-md md:text-sm sm:text-xs' variant='danger'>Excluir Todas</FluencyButton>                
                      <FluencyButton className='w-max p-2 h-8 relative right-0 lg:text-md md:text-sm sm:text-xs' variant='warning' onClick={openSugestoes}>Modelos de Tarefa</FluencyButton>
                  </div>


                  <div className='flex flex-col lg:items-start md:items-start sm:items-center w-full h-[85%] mt-1 mb-3 mx-2 p-2 pb-4 rounded-md overflow-hidden overflow-y-scroll bg-fluency-gray-100 dark:bg-fluency-bg-dark'>
                    <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-center items-center gap-2 pb-2'>
                      <input className='lg:w-[26rem] md:w-[22rem] w-[17rem] h-7 border-fluency-gray-100 outline-none focus:border-fluency-red-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-400 dark:text-fluency-gray-100 text-fluency-gray-800 rounded-md p-2' 
                        placeholder='Adicionar Tarefa: Segunda - Treinar a atividade 1.2' id="taskInput"
                        onKeyPress={(e) => handleKeyPress(e, 'Task')} />
                        <div className='flex flex-row gap-2 justify-center items-center'>
                          <p>
                            <MdOutlineAddTask 
                              onClick={() => {
                                const taskContent = (document.getElementById('taskInput') as HTMLInputElement)?.value.trim();
                                if (taskContent) {
                                  handleAddTask('Task', taskContent, false);
                                  (document.getElementById('taskInput') as HTMLInputElement).value = '';
                                }
                              }}
                              className='w-6 h-auto text-fluency-green-500 hover:text-fluency-green-600 duration-300 ease-in-out transition-all cursor-pointer' />
                            </p>
                            <CiCircleQuestion className='w-6 h-auto cursor-pointer' onClick={openInstrucoes}/>
                        </div>
                    </div>

                    <div className='p-1 w-full h-full overflow-hidden overflow-y-scroll'>            
                      {tasks && tasks.Task && tasks.Task.map((task: any, index: number) => (
                        <div key={index} className='flex flex-row mt-1 justify-between gap-2 items-center bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-700 hover:dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 p-[0.25rem] px-3 rounded-md'>
                          <div className='flex flex-row gap-2 items-center'> 
                            <label className="relative flex items-center p-3 rounded-full cursor-pointer" htmlFor="checkbox">
                              <input 
                                className="before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-fluency-gray-500 dark:border-fluency-gray-100 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-fluency-green-700 checked:bg-fluency-green-700 checked:before:bg-fluency-green-700 hover:before:opacity-10"
                                id="checkbox"  
                                type="checkbox"
                                checked={task.done}
                                onChange={(e) => handleTaskStatusChange('Task', index, e.target.checked)}/>
                              <span
                                className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"
                                  stroke="currentColor" strokeWidth="1">
                                  <path fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"></path>
                                </svg>
                              </span>
                            </label>
                            <span className='font-semibold'>{task.task}</span>
                          </div>
                          <MdDelete className='min-w-5 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold' 
                            onClick={() => handleDeleteTask('Task', index)} />
                      </div>))}
                    </div>
                  </div>
              </div>

            </div>

              <div className="lg:w-full md:w-full sm:w-full full h-full px-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
                <div className="flex flex-col justify-between items-center rounded-md w-full h-full">                
                    <div className="flex flex-col gap-2 items-center justify-center w-full p-2">
                      <h1 className="text-xl font-semibold text-center mb-2">Materiais</h1>
                      <div className="flex flex-col rounded-lg gap-2 ustify-start w-full h-80 overflow-y-auto overflow-hidden">
                        {materials.map((material, index) => (
                          <div key={index} className="bg-fluency-gray-50 dark:bg-fluency-bg-dark rounded-md p-1 px-4 gap-4 flex flex-row items-center justify-between w-full min-h-16">
                            <p className='font-semibold text-sm'>{material.name}</p>
                            <div className='bg-fluency-gray-100 dark:bg-fluency-gray-700 p-2 px-4 rounded-md flex flex-row gap-2'>
                              <p>{renderMaterialIcon(material.name)}</p>
                              <div className='flex flex-row gap-1'>
                                <p onClick={() => handleDownload(material.url)}><IoCloudDownloadOutline className='w-4 h-auto hover:text-fluency-green-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold'/></p>
                                <p onClick={() => handleDelete(material.name)}><MdDelete className='w-4 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold' /></p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center w-full p-2 h-[10rem]">
                      <label className="flex flex-col items-center justify-center w-full h-full border-2 border-fluency-gray-200 border-dashed rounded-lg cursor-pointer bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <IoMdCloudOutline className='w-10 h-auto'/>                       
                            <p className="mb-2 text-sm text-fluency-text-light dark:text-fluency-text-dark"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>

                </div>
              </div>

            </div>
        </div>

        {isSugestoes && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
              <div className="fade-in fade-out fixed inset-0 transition-opacity duration-200 ease-in-out">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5 m-20">
                <div className="flex flex-col">
                  <FluencyCloseButton onClick={closeSugestoes} />
                  <div className="w-full mt-3 flex flex-col p-4">
                    <h3 className="text-center text-lg font-bold">
                      Sugestões
                    </h3>
                    <Accordion className='w-full flex flex-row items-center justify-around'>
                      <AccordionItem className='text-lg w-max' key={1} title="First Steps">
                        {Object.keys(tasksData).map((key) => (
                          <Tooltip
                            key={key}
                            content={(
                              <div className="p-2 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark rounded-md">
                                {tasksData[key as keyof TasksData].map((task, index) => (
                                  <div key={index} className="flex flex-row justify-between items-center w-full">
                                    <span>{task[1]}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            placement="right"
                          >
                            <div className="flex flex-col gap-6 p-1">
                              <div className="flex flex-row justify-between gap-4 items-center">
                                <h4 className="text-md font-semibold">Sugestão {key.replace('tasksSuggestion', '')}</h4>
                                <IoIosAddCircleOutline
                                  className='w-5 h-auto text-fluency-blue-500 hover:text-fluency-blue-600 duration-300 ease-in-out transition-all cursor-pointer'
                                  onClick={() => handleTaskModal(tasksData[key as keyof TasksData])} 
                                />
                              </div>
                            </div>
                          </Tooltip>
                        ))}
                      </AccordionItem>

                      <AccordionItem className='text-lg w-max' key={1} title="The Basics">
                        {Object.keys(tasksData).map((key) => (
                          <Tooltip
                            key={key}
                            content={(
                              <div className="p-2 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark rounded-md">
                                {tasksData[key as keyof TasksDataBasics].map((task, index) => (
                                  <div key={index} className="flex flex-row justify-between items-center w-full">
                                    <span>{task[1]}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            placement="right"
                          >
                            <div className="flex flex-col gap-6 p-1">
                              <div className="flex flex-row justify-between gap-4 items-center">
                                <h4 className="text-md font-semibold">Sugestão {key.replace('tasksSuggestion', '')}</h4>
                                <IoIosAddCircleOutline
                                  className='w-5 h-auto text-fluency-blue-500 hover:text-fluency-blue-600 duration-300 ease-in-out transition-all cursor-pointer'
                                  onClick={() => handleTaskModal(tasksData[key as keyof TasksDataBasics])} 
                                />
                              </div>
                            </div>
                          </Tooltip>
                        ))}
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </div>)}

      
    </div>
    );
}

export default AlunoPainel;
