'use client';
import React from 'react';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {   
    addDoc,
    getDoc,
    collection,
    getDocs,
    doc,
    serverTimestamp,
    deleteDoc,
    updateDoc,} from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { MdDeleteSweep } from 'react-icons/md';
import { BsFilePdfFill } from "react-icons/bs";
import { GiSchoolBag } from "react-icons/gi";
import { IoFilter } from 'react-icons/io5';
import Link from 'next/link';

import { toast, Toaster } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { IoMdCloudOutline } from 'react-icons/io';
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';

interface Notebook {
    studentName: string;
    id: string;
    title: string;
    description: string;
    createdAt: any;
    student: string;
    content: any;
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


export default function Caderno(){
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

    //Notebooks Creation
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    useEffect(() => {
        const fetchNotebooks = async () => {
            try {
                const notebookRef = collection(db, `users/${id}/Notebooks`);
                const snapshot = await getDocs(notebookRef);
                const notebookList: Notebook[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const notebook: Notebook = {
                        id: doc.id,
                        title: data.title || '',
                        description: data.description || '',
                        createdAt: data.createdAt || '',
                        studentName: data.studentName || '',
                        student: data.student || '',
                        content: data.content || '',
                    };
                    notebookList.push(notebook);
                });
                setNotebooks(notebookList);
            } catch (error) {
                console.error('Error fetching notebooks:', error);
            }
        };
        

        fetchNotebooks();
    }, [id]);

    //Adding a new document with title
    const [isModalDescriptionOpen, setIsModalDescriptionOpen] = useState(false);
    const [description, setDescription] = useState('');
    const handleOpenModalDescription = () => {
        setIsModalDescriptionOpen(true);
    };

    const handleCloseModalDescription = () => {
        setIsModalDescriptionOpen(false);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };

    const router = useRouter();
    const createNotebookWithDescription = async () => {
        try {
            const notebookRef = collection(db, `users/${id}/Notebooks`);
            const notebookData = {
                title: new Date().toLocaleDateString(),
                description: description || 'Documento sem descrição',
                createdAt: serverTimestamp(),
                // Store additional information
                student: id || '', // User ID
                studentName: studentData?.name || '', // User name
                professorId: studentData?.professorId || '', // Professor ID
                content: '',
            };
            await addDoc(notebookRef, notebookData);
            console.log('Notebook created successfully with description:', description);
            toast.success('Caderno novo criado!', {
                position: "top-center",
            });
             // Fetch and update notebooks after creation
             const updatedNotebooks: Notebook[] = [...notebooks];
             const newNotebook = {
                 id: notebookRef.id,
                 ...notebookData,
             };
             updatedNotebooks.push(newNotebook);
             setNotebooks(updatedNotebooks);
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
        setDescription(''); // Clear description after creating the notebook
        handleCloseModalDescription(); // Close the modal after creating the notebook
    };
    

    //Deleting a Notebook
    const deleteNotebook = async (notebookId: string) => {
        try {
          await deleteDoc(doc(db, `users/${id}/Notebooks/${notebookId}`));
          // Filter out the deleted notebook from the state
          const updatedNotebooks = notebooks.filter((notebook) => notebook.id !== notebookId);
          setNotebooks(updatedNotebooks);
          toast.error('Caderno deletado!', {
            position: "top-center",
          });
        } catch (error) {
          console.error('Error deleting notebook:', error);
        }
      };
    

    const [searchQuery, setSearchQuery] = useState<string>('');
    const filteredNotebooks = notebooks.filter((notebook) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            notebook.title.toLowerCase().includes(searchLower) ||
            notebook.description.toLowerCase().includes(searchLower)
        );
    });

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as 'asc' | 'desc');
    };

    const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
        if (sortOrder === 'asc') {
            return notebooks.indexOf(a) - notebooks.indexOf(b);
        } else {
            return notebooks.indexOf(b) - notebooks.indexOf(a);
        }
    });

    const createReviewTask = async (notebookTitle: string) => {
        try {
          const studentDocRef = doc(db, `users/${id}`);
          const studentDocSnapshot = await getDoc(studentDocRef);
          const studentData = studentDocSnapshot.data() as Aluno;
      
          if (!studentData) {
            throw new Error('Student data not found');
          }
      
          const tasksArray = studentData.tasks?.Task || []; // Get the tasks array or initialize it if null
          const taskExists = tasksArray.some((task: { task: string; }) => task.task === `Revisar a aula de ${notebookTitle}`);
      
          if (taskExists) {
            toast.error('Tarefa já adicionada!', {
                position: "top-center",
              });
            return;
          }
      
          const newTask = { task: `Revisar a aula de ${notebookTitle}`, done: false };
          tasksArray.push(newTask);
      
          await updateDoc(studentDocRef, {
            tasks: { Task: tasksArray }
          });
      
          toast.error('Tarefa adicionada!', {
            position: "top-center",
          });
        } catch (error) {
          console.error('Error creating task:', error);
          toast.error('Tarefa não adicionada!', {
            position: "top-center",
          });
        }
      };
      

    //Upload PowerPoint
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
      
    const storage = getStorage();
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
    
      const file = files[0];
      const fileName = `${id}/materiais/slides/${file.name}`;
        const storageRef = ref(storage, fileName);
    
      try {
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);
    
        // Handle success, you can update the database or show a success message here
        console.log('File uploaded successfully!');
        toast.success('Arquivo salvo!.', {
          position: "top-center",
        });
        setIsModalOpen(false);
      } catch (error) {
         // Handle error
          console.error('Error uploading file:', error);
          toast.error('Erro ao salvar arquivo!.', {
            position: "top-center",
          });
          setIsModalOpen(false);
        }
      };

      const [slides, setSlides] = useState<{ name: string; url: string; }[]>([]);
      useEffect(() => {
          const fetchSlides = async () => {
              try {
                  // Assuming `id` represents the student's ID
                  const materialsRef = ref(storage, `${id}/materiais/slides`);
                  const slideList = await listAll(materialsRef);
                  const slideUrls = await Promise.all(
                      slideList.items.map(async (item) => {
                          const downloadUrl = await getDownloadURL(item);
                          return { name: item.name, url: downloadUrl };
                      })
                  );
                  setSlides(slideUrls);
              } catch (error) {
                  console.error('Error fetching PowerPoint slides:', error);
              }
          };
  
          fetchSlides();
      }, [id, storage]);

      const deleteSlide = async (slideUrl: string) => {
        try {
            // Perform deletion logic here
            // For example, if you're using Firebase Storage:
            const storageRef = ref(storage, slideUrl);
            await deleteObject(storageRef);
            // Update the slides state after deletion
            const updatedSlides = slides.filter((slide) => slide.url !== slideUrl);
            setSlides(updatedSlides);
            toast.success('Slide deletado!', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error('Erro ao deletar slide!', {
                position: "top-center",
            });
        }
    };

    
    return(
        <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 flex flex-col gap-4 pb-4 mt-3'>
            <div className='flex flex-col items-center w-full gap-2'>
                <h1 className='text-3xl font-bold'>Aulas</h1>
                <div className='flex flex-row justify-around gap-4 items-center w-full'>
                    <FluencyInput placeholder='Procure por uma aula específica...' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}/>
                    <FluencyButton variant='confirm' className='min-w-max' onClick={handleOpenModalDescription}>Começar aula</FluencyButton>
                    <FluencyButton variant='warning' className='min-w-max' onClick={handleOpenModal}>Aula com Slides</FluencyButton>
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

            <div className='gap-3 flex flex-col w-full'>
                <ul className='flex flex-col rounded-md w-full gap-2'>
                    {sortedNotebooks.map((notebook) => (
                        <li key={notebook.id} className='bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <Link key={notebook.id} href={{ pathname: `/teacher-dashboard/alunos/aula/${encodeURIComponent(notebook.studentName)}`, query: { notebook: notebook.id, student: notebook.student } }} passHref>
                                <div className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                                    <p className='text-md'>{notebook.title}</p>
                                    <p className='text-sm'>{notebook.description}</p>
                                </div>
                            </Link>
                            <div className='flex flex-row gap-2 items-center'>
                                <p><MdDeleteSweep onClick={() => deleteNotebook(notebook.id)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                <p><GiSchoolBag onClick={() => createReviewTask(notebook.description)} className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                <p><BsFilePdfFill className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-orange-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                            </div>
                        </li>
                    ))}
                    
                    {slides.map((slide) => (
                        <li key={slide.name} className='bg-fluency-blue-100 hover:bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <a href={slide.url} target="_blank" rel="noopener noreferrer" className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                            <Link key={slide.url} href={{ pathname: `/teacher-dashboard/alunos/slide/${encodeURIComponent(slide.name)}`, query: { slide: slide.url } }} passHref>

                                <p className='text-md'>{slide.name}</p>
                                <p className='text-sm'>PowerPoint Slide</p>
                                </Link>

                            </a>
                            <div className='flex flex-row gap-2 items-center'>
                                <p><MdDeleteSweep onClick={() => deleteSlide(slide.url)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Toaster />

            {isModalOpen && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center">
                            <FluencyCloseButton onClick={handleCloseModal} variant='warning'/>
                            
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                Fazer upload de Arquivo PowerPoint ou PDF
                            </h3>
                            <div className="mt-2 flex p-4">                    
                            <div className="flex items-center justify-center w-full p-2 px-6 h-full">
                                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-fluency-gray-200 border-dashed rounded-lg cursor-pointer bg-fluency-pages-light dark:bg-fluency-pages-dark hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all">
                                    <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4">
                                        <IoMdCloudOutline className='w-10 h-auto'/>                       
                                        <p className="mb-2 text-sm text-fluency-text-light dark:text-fluency-text-dark"><span className="font-semibold">Clique para fazer o upload</span> ou arraste o arquivo aqui</p>
                                        <p className="text-xs text-fluency-text-light dark:text-fluency-text-dark">Apenas arquivos PowerPoint ou PDF</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {isModalDescriptionOpen && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center">
                            <FluencyCloseButton onClick={handleCloseModalDescription}/>
                            
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                Criar nova aula
                            </h3>
                            <div className="mt-2 flex flex-col items-center gap-3 p-4">
                                <FluencyInput type="text" placeholder="Verbos no passado, modal verbs" variant='solid' value={description} onChange={handleDescriptionChange} />
                                <div className="flex justify-center">
                                  <FluencyButton variant='confirm' onClick={createNotebookWithDescription}>Criar aula</FluencyButton>
                                  <FluencyButton variant='gray' onClick={handleCloseModalDescription}>Cancelar</FluencyButton>
                                </div>
                              </div>
                        </div>
                    </div>
                </div>
            </div>}


        </div>
    );
}