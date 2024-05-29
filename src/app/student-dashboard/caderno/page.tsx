'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { db } from '@/app/firebase';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/dropdown';
import { Button } from '@nextui-org/react';

import { toast, Toaster } from 'react-hot-toast';

import { FaFilePdf, FaRegFileAudio, FaRegFileImage, FaRegFileVideo } from "react-icons/fa6";
import { FaFileAlt } from 'react-icons/fa';
import { IoClose, IoCloudDownloadOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { SlNotebook } from "react-icons/sl";

import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import FluencyButton from '@/app/ui/Components/Button/button';

import './cadernostyle.css';

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


function Caderno() {
    //TeacherDataFetching
    const { data: session } = useSession();
    const [role, setRole] = useState<string>('');
    const [idioma, setIdioma] = useState<string>('');
    useEffect(() => {
        if (session) {
            const { user } = session;    
            if (user.role) {
                setRole(user.role);
                setIdioma(user.idioma);
            }
        }
    }, [session]);

    //StudentDataFetching
    const id = session?.user.id;
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
        return <FaFilePdf className='w-5 h-auto'/>;
      } else if (fileType === 'mp3') {
        return <FaRegFileAudio className='w-5 h-auto'/>;
      } else if (fileType === 'mp4') {
        return <FaRegFileVideo className='w-5 h-auto'/>;
      } else if (fileType === 'txt') {
        return <FaFileAlt className='w-7 h-auto'/>;
      } else if (fileType === 'jpg') {
        return <FaRegFileImage className='w-5 h-auto'/>        ;
      } else if (fileType === 'png') {
        return <FaRegFileImage className='w-5 h-auto'/>        ;
      }
      return null; // Return null if file type is not recognized
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
                    const studentDocSnap = await getDoc(studentDocRef);
                    if (studentDocSnap.exists()) {
                        const studentData = studentDocSnap.data() as Aluno;
                        setTasks(studentData.tasks || {});
                    }
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            };
    
            fetchTasks();
          }, [id]);

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
                    }
                    return completionPercentage;
                }
                return prevPercentage + 1;
            });
        }, 10);

        return () => clearInterval(progressInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, tasksCompletedToastShown]);

    
    const [inglesWorkbooks, setInglesWorkbooks] = useState<string[]>([]);
    const [espanholWorkbooks, setEspanholWorkbooks] = useState<string[]>([]);
    const [librasWorkbooks, setLibrasWorkbooks] = useState<string[]>([]);
    const fetchWorkbooks = async (language: string) => {
        const storage = getStorage();
        const languageFolderRef = ref(storage, `/${language}/`);
        try {
            const languageFolderList = await listAll(languageFolderRef);
            const workbookNames = languageFolderList.items.map(item => item.name);
            switch (language) {
                case 'ingles':
                    setInglesWorkbooks(workbookNames);
                    break;
                case 'espanhol':
                    setEspanholWorkbooks(workbookNames);
                    break;
                case 'libras':
                    setLibrasWorkbooks(workbookNames);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error fetching workbooks: ', error);
            toast.error('Failed to fetch workbooks. Please try again.');
        }
    };

    useEffect(() => {
        // Fetch the list of workbooks for each language when the component mounts
        fetchWorkbooks('ingles');
        fetchWorkbooks('espanhol');
        fetchWorkbooks('libras');
    }, []);

    const handleDownloadBook = async (workbook: string, language: string) => {
        const storage = getStorage();
        const workbookRef = ref(storage, `/${language}/${workbook}`);
        try {
            const url = await getDownloadURL(workbookRef);
            // Use the URL to download the workbook
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error downloading workbook: ', error);
            toast.error('Failed to download workbook. Please try again.');
        }
    };

    const renderWorkbooks = () => {
        switch (idioma) {
            case 'ingles':
                return inglesWorkbooks;
            case 'espanhol':
                return espanholWorkbooks;
            case 'libras':
                return librasWorkbooks;
            default:
                return [];
        }
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

    
          <div className='fade-in fade-out p-3 h-[92vh] min-w-screen overflow-y-scroll'>
            <div className="gap-3 h-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col">

            <div className='flex flex-col gap-3'>

              <div className='lg:flex lg:flex-row flex flex-col h-full w-full gap-3 items-strech'>
                <div className="flex justify-center items-center h-full rounded-md bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 cursor-pointer duration-300 ease-in-out transition-all">
                 {studentData && (
                  <Link href={{ pathname: `caderno/${encodeURIComponent(studentData.name)}`, query: { id: id } }} passHref>
                    <h1 className="text-xl flex flex-col gap-1 items-center font-semibold text-center lg:px-12 md:px-4 sm:px-4 sm:py-8">Anotações <SlNotebook className='w-6 h-auto' /></h1>
                  </Link>)}
                </div>
              
                <div className='hidden h-full w-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-1 rounded-lg flex-col items-center justify-center gap-1'>
                    <div className="rounded-md flex flex-col gap-2 lg:row-span-1 md:row-span-5 sm:row-span-5">  
                    <h1 className="text-xl font-semibold text-center lg:px-12 md:px-4 sm:px-4">Apostilas</h1>
                        <div>
                            <ul className="flex flex-wrap gap-2">
                            {renderWorkbooks().map(workbook => (
                                    <li key={workbook} className="w-36 h-52 text-center px-3 bg-fluency-blue-200 dark:bg-fluency-gray-600 hover:bg-fluency-blue-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all rounded-sm flex flex-col items-center justify-center font-semibold">
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button className="relative -top-12 left-14">
                                                    <BsThreeDotsVertical className="w-4 h-auto hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu className="bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-md" aria-label="Static Actions">
                                                <DropdownItem className="dark:text-white hover:text-fluency-blue-500 duration-300 ease-in-out transition-all" key="copy" onClick={() => handleDownloadBook(workbook, idioma)}>Baixar</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                        <span className="mb-8">{workbook}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
              </div>


              <div className="h-full flex flex-col items-center overflow-hidden p-3 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
                <div className="flex flex-col justify-between items-center rounded-md w-full h-full">                
                    <div className="flex flex-col gap-2 items-center justify-center w-full p-2">
                      <h1 className="text-xl font-semibold text-center mb-2">Materiais</h1>
                      <div className="flex flex-col rounded-lg gap-2 ustify-start w-full h-80 overflow-y-auto overflow-hidden">
                        {materials.map((material, index) => (
                          <div key={index} className="bg-fluency-gray-50 dark:bg-fluency-bg-dark rounded-md p-1 px-4 gap-4 flex flex-row items-center justify-between w-full min-h-16">
                            <p className='font-semibold'>{material.name}</p>
                            <div className='bg-fluency-gray-100 dark:bg-fluency-gray-700 p-3 px-5 rounded-md flex flex-row gap-6'>
                              <p>{renderMaterialIcon(material.name)}</p>
                              <div className='flex flex-row gap-2'>
                                <p onClick={() => handleDownload(material.url)}><IoCloudDownloadOutline className='w-5 h-auto hover:text-fluency-green-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold'/></p>
                                <p onClick={() => handleDelete(material.name)}><MdDelete className='w-5 h-auto hover:text-fluency-red-500 transition-all ease-in-out duration-300 cursor-pointer font-semibold' /></p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              </div>

            </div>

              <div className="lg:w-full md:w-full sm:w-full full h-full p-3 pr-6 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg">
                <div className='w-full lg:flex lg:flex-row lg:justify-around lg:items-center lg:gap-4  md:flex md:flex-col md:justify-between md:items-center md:gap-2 flex flex-col justify-center items-center gap-2 mx-4'>
                    <h1 className='p-1 font-semibold text-xl'>Tarefas</h1>
                    <div className="w-full flex justify-center p-1">
                        <div className="w-full bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-lg">
                          <div
                              className="w-full bg-green-500 text-xs leading-none py-1 text-center font-normal text-white rounded-lg"
                              style={{ width: `${taskCompletionPercentage}%`, transition: 'width 0.4s linear' }}
                              >
                              <p className='pl-2'>{taskCompletionPercentage.toFixed()}%</p>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className='flex flex-col lg:items-start md:items-start sm:items-center w-full h-[90%] mt-1 mb-3 mx-2 p-2 pb-4 rounded-md overflow-hidden overflow-y-scroll bg-fluency-gray-100 dark:bg-fluency-bg-dark'>
                    <div className='p-1 w-full h-full overflow-hidden overflow-y-scroll'>            
                      {tasks && tasks.Task && tasks.Task.map((task: any, index: number) => (
                        <div key={index} className='flex flex-row mt-1 justify-between gap-2 items-center bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-700 hover:dark:bg-fluency-gray-800 transition-all ease-in-out duration-300 p-[0.25rem] px-3 rounded-md'>
                          <div className='flex flex-row gap-2 items-center'> 
                          <div className="checkbox-wrapper-11">
                            <input id="02-11" type="checkbox" name="r" value="2" checked={task.done} onChange={(e) => handleTaskStatusChange('Task', index, e.target.checked)}/>
                            <label htmlFor="02-11">{task.link ? (
                              <Link href={task.link}>
                                <span className='font-semibold'>{task.task}</span>
                              </Link>
                              ) : (
                              <span className='font-semibold'>{task.task}</span>)}</label>
                          </div>
                          </div>
                      </div>))}
                    </div>
                  </div>
              </div>

            </div>
        </div>
      <Toaster />
    </div>
    );
}

export default Caderno;

