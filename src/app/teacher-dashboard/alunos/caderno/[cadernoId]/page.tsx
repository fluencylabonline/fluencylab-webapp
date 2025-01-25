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
import { GiSchoolBag } from "react-icons/gi";
import { IoFilter } from 'react-icons/io5';
import Link from 'next/link';

import { toast, Toaster } from 'react-hot-toast';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
import { IoMdHelpCircleOutline } from 'react-icons/io';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { Tooltip } from '@nextui-org/react';

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

export default function Caderno(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    
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

    useEffect(() => {
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

    const createNotebookWithDescription = async () => {
        try {
            const notebookRef = collection(db, `users/${id}/Notebooks`);
            const notebookData = {
                title: new Date().toLocaleDateString(),
                description: description || 'Documento sem descrição',
                createdAt: serverTimestamp(),
                
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
            await fetchNotebooks();
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
        setDescription(''); // Clear description after creating the notebook
        handleCloseModalDescription(); // Close the modal after creating the notebook
    };
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedNotebookId, setSelectedNotebookId] = useState('');

    const handleOpenDeleteModal = (notebookId: string) => {
        setSelectedNotebookId(notebookId);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setSelectedNotebookId('');
        setIsDeleteModalOpen(false);
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

    const createReviewTask = async (notebookTitle: string, notebookId: string) => {
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
      
          const notebookLink = `/student-dashboard/caderno/aula/${encodeURIComponent(studentData.name)}/?notebook=${notebookId}&student=${id}`;
        
          const newTask = { task: `Revisar a aula de ${notebookTitle}`, done: false, link: notebookLink }; // Include link in the task object
          tasksArray.push(newTask);
      
          await updateDoc(studentDocRef, {
            tasks: { Task: tasksArray }
          });
      
          toast.success('Tarefa adicionada!', {
            position: "top-center",
          });
        } catch (error) {
          console.error('Error creating task:', error);
          toast.error('Tarefa não adicionada!', {
            position: "top-center",
          });
        }
      };
      
    // Upload PowerPoint
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const [slideLink, setSlideLink] = useState('');
    const [slides, setSlides] = useState<{ name: string; url: string; }[]>([]);
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const slidesRef = collection(db, `users/${id}/Slides`);
                const snapshot = await getDocs(slidesRef);
                const slidesList: { name: string; url: string; }[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    slidesList.push({ name: data.name, url: data.url });
                });
                setSlides(slidesList);
            } catch (error) {
                console.error('Error fetching slides:', error);
            }
        };
        fetchSlides();
    }, [id]);

    const [slideName, setSlideName] = useState('');
    const handleSlideNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSlideName(e.target.value);
    const handleSlideLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => setSlideLink(e.target.value);

    const saveSlideLink = async () => {
        try {
            if (!slideLink || !slideName) {
                toast.error('Nome e link não podem estar vazios!', { position: "top-center" });
                return;
            }
            const slideRef = collection(db, `users/${id}/Slides`);
            const newSlide = {
                name: slideName,
                url: slideLink,
            };
            await addDoc(slideRef, newSlide);
            toast.success('Link do slide salvo com sucesso!', { position: "top-center" });
            setSlides([...slides, newSlide]);
            setSlideLink('');
            setSlideName('');
            handleCloseModal();
        } catch (error) {
            console.error('Error saving slide link:', error);
            toast.error('Erro ao salvar o link!', { position: "top-center" });
        }
    };

    const [modalNoteId, setModalNoteId] = useState<string | null>(null);
    const [reportContent, setReportContent] = useState<string>('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleOpenReportModal = async (notebookId: string) => {
        setModalNoteId(notebookId);
    
        // Fetch the current report content from the database
        const notebookRef = doc(db, `users/${id}/Notebooks/${notebookId}`);
        const notebookSnap = await getDoc(notebookRef);
    
        if (notebookSnap.exists()) {
            const currentReport = notebookSnap.data().classReport || '';
            setReportContent(currentReport);
        } else {
            setReportContent('');
        }
    
        setIsReportModalOpen(true);
    };
    

    const handleCloseReportModal = () => {
        setModalNoteId(null);
        setReportContent('');
        setIsReportModalOpen(false);
    };    

    const handleReportContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReportContent(e.target.value);
    };

    const saveReport = async () => {
        if (modalNoteId) {
            const notebookRef = doc(db, `users/${id}/Notebooks/${modalNoteId}`);
            await updateDoc(notebookRef, {
                classReport: reportContent
            });

            const updatedNotebooks = notebooks.map((notebook) => {
                if (notebook.id === modalNoteId) {
                    return { ...notebook, classReport: reportContent };
                }
                return notebook;
            });

            setNotebooks(updatedNotebooks);
            handleCloseReportModal();
            toast.success('Relatório de aula salvo!', {
                position: "top-center",
            });
        }
    };

    const [isDeleteSlideModalOpen, setIsDeleteSlideModalOpen] = useState(false);
    const [selectedSlideUrl, setSelectedSlideUrl] = useState('');

    const handleOpenDeleteSlideModal = (slideUrl: string) => {
        setSelectedSlideUrl(slideUrl);
        setIsDeleteSlideModalOpen(true);
    };

    const handleCloseDeleteSlideModal = () => {
        setSelectedSlideUrl('');
        setIsDeleteSlideModalOpen(false);
    };

    const deleteSlide = async (slideUrl: string) => {
        try {
            const slideRef = collection(db, `users/${id}/Slides`);
            const querySnapshot = await getDocs(slideRef);
            querySnapshot.forEach(async (doc) => {
                if (doc.data().url === slideUrl) {
                    await deleteDoc(doc.ref);
                }
            });

            const updatedSlides = slides.filter((slide) => slide.url !== slideUrl);
            setSlides(updatedSlides);
            toast.error('Slide deletado!', { position: "top-center" });
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error('Erro ao deletar slide!', { position: "top-center" });
        }
    };

    // Search
    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchLower = searchQuery.toLowerCase();

    const filteredNotebooks = notebooks.filter((notebook) => {
        return (
            notebook.title.toLowerCase().includes(searchLower) ||
            notebook.description.toLowerCase().includes(searchLower)
        );
    });

    const filteredSlides = slides.filter((slide) => {
        return (
            slide.name.toLowerCase().includes(searchLower) ||
            slide.url.toLowerCase().includes(searchLower)  // Include filtering by ID
        );
    });

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as 'asc' | 'desc');
    };

    const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
        // Function to convert "dd/mm/yyyy" string to a Date object
        const parseDate = (dateString: string) => {
            const [day, month, year] = dateString.split('/').map(Number);
            // Note: Month is zero-indexed in JavaScript Date (0 = January, 11 = December)
            return new Date(year, month - 1, day);
        };
    
        const dateA = parseDate(a.title);  // Convert the title string of notebook a to a Date object
        const dateB = parseDate(b.title);  // Convert the title string of notebook b to a Date object
    
        if (sortOrder === 'asc') {
            return dateA.getTime() - dateB.getTime();  // Ascending order
        } else {
            return dateB.getTime() - dateA.getTime();  // Descending order
        }
    });
    

    return(
        <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 flex flex-col gap-4 pb-4 mt-3'>
            <div className='flex flex-col items-center w-full gap-2'>
                <h1 className='text-3xl font-bold'>Aulas</h1>
                <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-around gap-4 items-center w-full'>
                    <FluencyInput placeholder='Procure por uma aula específica...' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}/>
                       <div className='flex flex-row gap-2 items-center justify-center'>
                        <FluencyButton variant='confirm' className='min-w-max' onClick={handleOpenModalDescription}>Começar aula</FluencyButton>
                        <FluencyButton variant='warning' className='min-w-max' onClick={handleOpenModal}>Aula com Slides</FluencyButton>
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
                                <Tooltip content="Deletar" className='bg-fluency-red-300 font-bold text-black rounded-md px-1'>
                                <p><MdDeleteSweep onClick={() => handleOpenDeleteModal(notebook.id)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                </Tooltip>

                                <Tooltip content="Enviar como tarefa" className='bg-orange-300 font-bold text-black rounded-md px-1'>
                                <p><GiSchoolBag onClick={() => createReviewTask(notebook.description, notebook.id)} className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-yellow-500 hover:dark:text-fluency-yellow-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                </Tooltip>

                                <Tooltip content="Relatório de aula" className='bg-fluency-blue-300 font-bold text-black rounded-md px-1'>
                                <p><HiOutlineDocumentReport onClick={() => handleOpenReportModal(notebook.id)} className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-blue-500 hover:dark:text-fluency-blue-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                </Tooltip>
                            </div>
                        </li>
                    ))}
                    
                    {filteredSlides.map((slide) => (
                        <li key={slide.url} className='bg-fluency-blue-100 hover:bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <div className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                                <Link key={slide.url} href={{ pathname: `/teacher-dashboard/alunos/slide/${encodeURIComponent(slide.name)}`, query: { slide: slide.url } }} passHref>
                                    <p className='text-md'>{slide.name}</p>
                                    <p className='text-sm'>Slide</p>
                                </Link>
                            </div>
                            <div className='flex flex-row gap-2 items-center'>
                                <Tooltip content="Deletar" className='bg-fluency-orange-300 font-bold text-black rounded-md px-1'>
                                    <p><MdDeleteSweep onClick={() => handleOpenDeleteSlideModal(slide.url)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-orange-500 hover:dark:text-fluency-orange-500 duration-300 ease-in-out transition-all cursor-pointer'/></p>
                                </Tooltip>
                            </div>
                        </li>
                    ))}

                </ul>
            </div>

            <Toaster />

            {isReportModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">

                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-full p-6">
                            <div className='flex flex-col items-center justify-center p-1 gap-3'>
                                <h2 className="text-lg font-bold mb-2 p-1">Adicionar Relatório de Aula</h2>
                                <textarea
                                    value={reportContent}
                                    onChange={handleReportContentChange}
                                    placeholder="Digite o relatório de aula"
                                    className="dark:bg-fluency-pages-dark w-full p-2 border border-gray-300 rounded-md"
                                    rows={5}
                                />
                                <div className='flex flex-row items-center justify-center gap-2'>
                                    <FluencyButton variant='confirm' className="py-2" onClick={saveReport}>Salvar</FluencyButton>
                                    <FluencyButton variant='warning' className="py-2" onClick={handleCloseReportModal}>Cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {isModalOpen && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center p-4">
                            <FluencyCloseButton onClick={handleCloseModal} variant='warning'/>
                            
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                Link do slide Canva
                            </h3>
                            <div className='flex flex-col items-start gap-2 p-4'>
                                <FluencyInput
                                placeholder="Nome do slide"
                                value={slideName}
                                onChange={handleSlideNameChange}
                                />
                                <div className='flex flex-row items-center gap-1'>
                                <FluencyInput
                                    placeholder="Cole o link do slide aqui"
                                    value={slideLink}
                                    onChange={handleSlideLinkChange}
                                />
                                <Tooltip content="Como fazer" className='bg-fluency-yellow-300 font-bold text-black rounded-md px-1'>
                                    <button onClick={() => setIsVideoModalOpen(true)}>
                                        <IoMdHelpCircleOutline className='w-5 h-auto text-fluency-yellow-500' />
                                    </button>
                                </Tooltip>
                                </div>
                            </div>
                        <div className="flex gap-4 mt-4">
                            <FluencyButton variant='warning' onClick={saveSlideLink}>Salvar</FluencyButton>
                            <FluencyButton variant='danger' onClick={handleCloseModal}>Cancelar</FluencyButton>
                        </div>
                        </div>
                    </div>
                </div>
            </div>}

            {isVideoModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-[50%] h-[80%] p-4">
                            <div className="flex flex-col items-center">
                                <FluencyCloseButton onClick={() => setIsVideoModalOpen(false)} />
                                <h3 className="text-lg leading-6 font-medium mb-2">Como conseguir o link</h3>
                                <iframe
                                    className="aspect-video w-full h-full rounded-md border-none"
                                    loading="lazy"
                                    src="https://drive.google.com/file/d/1rGUnvw-nkG4ALDdgeP9JYy9m_axvzb2R/preview"
                                    allowFullScreen
                                    title="Tutorial Video"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

        {isDeleteModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col">
                            <FluencyCloseButton onClick={handleCloseDeleteModal}/>
                            <div className="mt-3 flex flex-col gap-3 p-4">
                                <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                    Tem certeza que deseja excluir este caderno?
                                </h3>
                                <div className="flex justify-center">
                                    <FluencyButton variant='danger' onClick={() => { deleteNotebook(selectedNotebookId); handleCloseDeleteModal(); }}>Sim, excluir</FluencyButton>
                                    <FluencyButton variant='gray' onClick={handleCloseDeleteModal}>Não, cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {isDeleteSlideModalOpen && (
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col">
                            <FluencyCloseButton onClick={handleCloseDeleteSlideModal}/>
                            <div className="mt-3 flex flex-col gap-3 p-4">
                                <h3 className="text-center text-lg leading-6 font-bold mb-2">
                                    Tem certeza que deseja excluir este slide?
                                </h3>
                                <div className="flex justify-center">
                                    <FluencyButton variant='danger' onClick={() => { deleteSlide(selectedSlideUrl); handleCloseDeleteSlideModal(); }}>Sim, excluir</FluencyButton>
                                    <FluencyButton variant='gray' onClick={handleCloseDeleteSlideModal}>Não, cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        </div>
    );
}