'use client'
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, collection, getDocs, getDoc, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from "react-hot-toast";
import { GiSchoolBag } from "react-icons/gi";

interface ClassData {
    className: string;
    classNumber: number;
    videoLink: string;
    pdfLink: string;
    videoID: string;
    pdfID: string;
    ankiLink: string;
    externalLinks: string;
    id: string;
    description: string;
    done: boolean;
    deckNAME: string;
    audioID: string;
}

interface ModuleData {
    moduleName: string;
    id: string;
}

interface StudentData {
    name: string;
    id: string;
}

export default function Aulas() {
    const { data: session } = useSession();

    const [createClass, setCreateClass] = useState(false);
    const [moduleData, setModuleData] = useState<ModuleData | null>(null);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [className, setClassName] = useState('');
    const [classNumber, setClassNumber] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [pdfLink, setPdfLink] = useState('');
    const [videoID, setVideoID] = useState('');
    const [pdfID, setPdfID] = useState('');
    const [audioID, setAudioID] = useState('');
    const [deckNAME, setDeckNAME] = useState('');
    const [description, setDescription] = useState('');
    const [ankiLink, setAnkiLink] = useState('');
    const [externalLinks, setExternalLinks] = useState('');
    const [editClass, setEditClass] = useState<ClassData | null>(null);
    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
    const [classToAdd, setClassToAdd] = useState<ClassData | null>(null);
    const [isMarkAsDoneModalOpen, setIsMarkAsDoneModalOpen] = useState(false);
    const [classToMarkAsDone, setClassToMarkAsDone] = useState<ClassData | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(true);

    const [languageareaName, setLanguageareaName] = useState<string | null>(null);
    const [moduleID, setModuleID] = useState<string | null>(null);


    // Extract moduleID from URL parameters
    /*
    const params = new URLSearchParams(window.location.search);
    const moduleID = params.get('moduleID');
    const languageareaName = params.get('languageareaName');
    */

    // Extract language area name from URL on client side
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setLanguageareaName(params.get('languageareaName'));
        setModuleID(params.get('moduleID'));
    }, []);

    // Function to handle opening the create class modal
    const openCreateClass = () => {
        setCreateClass(true);
    };

    // Function to handle closing the create class modal
    const closeCreateClass = () => {
        setCreateClass(false);
    };

    // Fetch module data when moduleID changes
    const fetchModuleData = useCallback(async () => {
        if (moduleID && languageareaName) {
            setLoading(false)
            try {
                const moduleDocRef = doc(db, 'LanguageAreas', languageareaName, 'Modules', moduleID);
                const moduleDoc = await getDoc(moduleDocRef);

                if (moduleDoc.exists()) {
                    setModuleData({
                        id: moduleDoc.id,
                        moduleName: moduleDoc.data().moduleName
                    });
                } else {
                    console.error("Module not found");
                }
            } catch (error) {
                console.error("Error fetching module: ", error);
            }
        } else {
            setLoading(false);
        }
    }, [moduleID]);

    const fetchClasses = useCallback(async () => {
        if (moduleID && languageareaName) {
            try {
                setLoading(true)
                const classesRef = collection(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes');
                const classSnapshot = await getDocs(classesRef);

                const fetchedClasses: ClassData[] = classSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ClassData[];

                // Check if each class is marked as done for the current user
            if (session?.user) {
                const userClassesRef = collection(db, 'users', session.user.id, 'AulasGravadas');
                const userClassesSnapshot = await getDocs(userClassesRef);
                const userClasses = userClassesSnapshot.docs.reduce((acc, doc) => {
                    acc[doc.id] = doc.data().done;
                    return acc;
                }, {} as { [key: string]: boolean });
                
                fetchedClasses.forEach((classData) => {
                    classData.done = userClasses[classData.id] || false;
                });
            }

            fetchedClasses.sort((a, b) => a.classNumber - b.classNumber);
            setClasses(fetchedClasses);
            
            } catch (error) {
                console.error('Error fetching classes: ', error);
            }
            setLoading(false)
            console.log("aulas fetched")
        }
    }, [moduleID, languageareaName]);

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredClasses = classes.filter(classData =>
        classData.className.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchModuleData(); // Fetch classes on component mount
    }, [fetchModuleData]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Function to handle creating a new class within the selected module
    const handleCreateClass = async () => {
        if (moduleID && languageareaName) {
            try {
                const classRef = doc(collection(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes'));
                await setDoc(classRef, {
                    className,
                    classNumber: parseInt(classNumber),
                    videoLink,
                    pdfLink,
                    videoID,
                    pdfID,
                    ankiLink,
                    externalLinks,
                    description,
                    audioID,
                    deckNAME,
                    done: false // Assuming a default value
                });
                fetchClasses()
                // Clear form inputs after saving
                setClassName('');
                setClassNumber('');
                setVideoLink('');
                setPdfLink('');
                setVideoID('');
                setPdfID('');
                setAudioID('');
                setDeckNAME('');
                setAnkiLink('');
                setExternalLinks('');
                setDescription('');
                closeCreateClass();
                toast.success('Aula criada!');
            } catch (error) {
                console.error('Error creating class: ', error);
                toast.error('Error creating class.');
            }
        } else {
            toast.error("Erro. Recarregue a página");
        }
    };

    const totalClasses = classes.length;
    const doneClasses = classes.filter((classData) => classData.done).length;
    const percentageDone = (doneClasses / totalClasses) * 100;

    const openDeleteConfirmationModal = (classData: ClassData) => {
        setClassToDelete(classData);
        setIsDeleteConfirmationModalOpen(true);
    };

    const closeDeleteConfirmationModal = () => {
        setClassToDelete(null);
        setIsDeleteConfirmationModalOpen(false);
    };

    const handleDeleteClass = async () => {
        try {
            if (classToDelete && languageareaName && moduleID) {
                const classRef = doc(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes', classToDelete.id);
                await deleteDoc(classRef);
                closeDeleteConfirmationModal();
                fetchClasses();
            }
        } catch (error) {
            console.error('Error deleting document: ', error);
        }
    };
    
    const [students, setStudents] = useState<StudentData[]>([]);
    const [showStudentModal, setShowStudentModal] = useState(false);

    const openStudentModal = (classData: ClassData) => {
        setShowStudentModal(true);
        setClassToAdd(classData);
    };

    const closeStudentModal = () => {
        setShowStudentModal(false);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (session) {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', session.user.id));
                const querySnapshot = await getDocs(q);
                const fetchedStudents: StudentData[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedStudents.push({
                        id: doc.id, ...doc.data(),
                        name: doc.data().name,
                    });
                });
                setStudents(fetchedStudents);
            }
        };
        fetchStudents();
    }, [session]);

    const handleAddDeckAsTask = async (studentId: string, className: string, id: string) => {
        try {
            const studentDocRef = doc(db, 'users', studentId);
            const studentDocSnapshot = await getDoc(studentDocRef);
            const studentData = studentDocSnapshot.data();

            if (!studentData || !studentData.tasks) {
                toast.error('Erro ao adicionar tarefa.');
                return;
            }

            const tasksArray = studentData.tasks.Task || [];
            const taskExists = tasksArray.some((task: { task: string; }) => task.task === `Assistir a aula de ${className}`);

            if (taskExists) {
                toast.error('Aula já adicionada!');
                return;
            }

            //PRECISA ARRUMAR
            const deckLink = `/student-dashboard/aulas-gravadas/${languageareaName}/Aula/${encodeURIComponent(className)}?moduleID=${moduleID}&languageareaName=${languageareaName}&id=${id}`;
            const newTask = { task: `Clique para assistir a aula de ${className}`, link: deckLink, done: false };
            tasksArray.push(newTask);

            await updateDoc(studentDocRef, {
                tasks: { Task: tasksArray }
            });

            toast.success('Aula adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar aula:', error);
            toast.error('Erro ao adicionar aula.');
        }
    };
    
    const openMarkAsDoneModal = (classData: ClassData) => {
        setClassToMarkAsDone(classData);
        setIsMarkAsDoneModalOpen(true);
    };

    const closeMarkAsDoneModal = () => {
        setClassToMarkAsDone(null);
        setIsMarkAsDoneModalOpen(false);
    };

    const handleMarkAsDone = async () => {
        try {
            if (classToMarkAsDone && session?.user) {
                const classRef = doc(db, 'users', session.user.id, 'AulasGravadas', classToMarkAsDone.id);
                await setDoc(classRef, { done: true });
                closeMarkAsDoneModal();
                toast.success('Aula marcada como feita!');
            }
        } catch (error) {
            console.error('Error marking class as done: ', error);
            toast.error('Erro ao marcar aula como feita.');
        }

        fetchClasses()
    };

     // Function to handle opening the edit class popup
     const openEditClass = (classData: ClassData) => {
        setClassName(classData.className);
        setClassNumber(classData.classNumber.toString());
        setVideoLink(classData.videoLink);
        setPdfLink(classData.pdfLink);
        setVideoID(classData.videoID);
        setPdfID(classData.pdfID);
        setAudioID(classData.audioID);
        setDeckNAME(classData.deckNAME);
        setAnkiLink(classData.ankiLink);
        setExternalLinks(classData.externalLinks);
        setDescription(classData.description);
        setEditClass(classData);
    };

    // Function to handle closing the edit class popup
   const closeEditClass = () => {
        setClassName('');
        setClassNumber('');
        setVideoLink('');
        setPdfLink('');
        setVideoID('');
        setPdfID('');
        setAudioID('');
        setDeckNAME('');
        setAnkiLink('');
        setExternalLinks('');
        setDescription('');
        setEditClass(null);
    };

    // Function to handle form submission for editing class
    const handleEditSubmit = async () => {
        if(moduleID && languageareaName){
            try {
                const classRef = doc(db, 'LanguageAreas', languageareaName, 'Modules', moduleID, 'Classes', editClass!.id);
                await updateDoc(classRef, {
                    className,
                    classNumber,
                    videoLink,
                    pdfLink,
                    videoID,
                    audioID,
                    deckNAME,
                    pdfID,
                    ankiLink,
                    externalLinks,
                    description
                });
                // After saving, clear form inputs and close modal
                setClassName('');
                setClassNumber('');
                setVideoLink('');
                setPdfLink('');
                setVideoID('');
                setPdfID('');
                setAudioID('');
                setDeckNAME('');
                setAnkiLink('');
                setExternalLinks('');
                setDescription('');
                closeEditClass();
                // Fetch updated class list
                fetchClasses();
            } catch (error) {
                console.error('Error editing document: ', error);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <Toaster />

            <div className="flex flex-col sm:flex-row gap-2 justify-around items-center mt-4 mb-2 w-full">
                <div className="w-[70%] flex flex-col items-center">
                    <FluencyInput
                        type="text"
                        placeholder="Buscar aulas..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        className="w-full z-50"
                    />
                    {session?.user.role === 'student' && 
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${percentageDone}%` }}></div>
                    </div>}
                </div>
                {session?.user.role === 'admin' && ( <FluencyButton className="w-full" variant="confirm" onClick={openCreateClass}>Adicionar Aula</FluencyButton>)}
                {session?.user.role === 'student' && <span className="font-bold">{`${doneClasses} de ${totalClasses} aulas concluidas`}</span>}
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-screen absolute bottom-0">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
            <div className="flex flex-row flex-wrap items-center justify-center w-full gap-2">
                {filteredClasses.map((classData, index) => (
                    <div key={index} className="relative">
                        <Link 
                            href={{
                            pathname: `Aula/${encodeURIComponent(classData.className)}`,
                            query: { moduleID: moduleID, languageareaName: languageareaName, id: classData.id }
                            }} passHref>
                            <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark w-[230px] h-[340px] mt-4 group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-md ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
                                <span className={`absolute top-10 z-10 h-20 w-20 rounded-full ${
                                        classData.done ? 'bg-green-500' : 'bg-fluency-gray-500'} transition-all duration-300 group-hover:scale-[10]`}></span>
                                <div className="relative z-10 mx-auto max-w-md">
                                    <div className={`grid h-20 w-20 place-items-center rounded-full transition-all duration-300 group-hover:bg-fluency-gray-400 ${
                                        classData.done ? 'bg-green-500' : 'bg-fluency-gray-500'}`}>
                                        <p className="text-2xl font-bold text-white">{classData.classNumber}</p>
                                    </div>

                                    <div className="flex flex-col justify-around h-full" >
                                        <div className="space-y-4 pt-3 text-base font-semibold leading-7 text-fluency-gray-400 transition-all duration-300 group-hover:text-white/90">
                                            <p>{classData.description}</p>
                                        </div>
                                        <div className="pt-4 text-base font-semibold w-full">
                                            <p>
                                                <span className="text-fluency-gray-600 dark:text-fluency-gray-100 text-2xl font-bold transition-all duration-300 group-hover:text-white">{classData.className}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        {session?.user.role === 'student' && (
                            <div className="flex flex-col gap-1 absolute top-2 right-0">
                            {!classData.done ? <FluencyButton onClick={() => openMarkAsDoneModal(classData)} variant="confirm" >Marcar como feita</FluencyButton> : ""}
                        </div>)}

                        {session?.user.role === 'teacher' && (
                            <div className="flex flex-col gap-1 absolute top-2 right-0">
                                <FluencyButton variant='confirm' onClick={() => openStudentModal(classData)}>Enviar <GiSchoolBag className="w-4 h-auto" /></FluencyButton>
                            </div>
                        )}
                        {session?.user.role === 'admin' && (
                            <div className="flex flex-row justify-center">
                                <FluencyButton variant="gray" onClick={() => openEditClass(classData)}>Editar</FluencyButton>
                                <FluencyButton variant="danger" onClick={() => openDeleteConfirmationModal(classData)}>Excluir</FluencyButton>
                            </div>
                        )}
                    </div>
                ))}
            </div>)}

            {createClass && (
                <div className="fixed z-50 inset-0 overflow-y-hidden p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-[70vh] p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeCreateClass} />

                                <h3 className="text-lg leading-6 font-medium p-2 mb-2">
                                    Insira as Informacoes da Aula
                                </h3>

                                <div className="mt-2 flex flex-row items-start gap-3 p-4">
                                    <div className="flex flex-col items-start gap-2 w-full">
                                        <FluencyInput type="text" placeholder="Nome da Aula" value={className} onChange={(e) => setClassName(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Numero da Aula" value={classNumber} onChange={(e) => setClassNumber(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Link do Video" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                                        <FluencyInput type="text" placeholder="ID do Video" value={videoID} onChange={(e) => setVideoID(e.target.value)} />
                                    </div>

                                    <div className="flex flex-col items-start gap-2 w-full">
                                        <FluencyInput type="text" placeholder="Link do PDF" value={pdfLink} onChange={(e) => setPdfLink(e.target.value)} />
                                        <FluencyInput type="text" placeholder="ID do PDF" value={pdfID} onChange={(e) => setPdfID(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Link do Anki" value={ankiLink} onChange={(e) => setAnkiLink(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Links Externos" value={externalLinks} onChange={(e) => setExternalLinks(e.target.value)} />
                                    </div>

                                    <div className="flex flex-col items-start gap-2 w-full">
                                        <FluencyInput type="text" placeholder="Audio ID" value={audioID} onChange={(e) => setAudioID(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Deck ID" value={deckNAME} onChange={(e) => setDeckNAME(e.target.value)} />
                                        <FluencyInput type="text" placeholder="Descricao" value={description} onChange={(e) => setDescription(e.target.value)} />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-center">
                                    <FluencyButton variant='confirm' onClick={handleCreateClass}>Criar</FluencyButton>
                                    <FluencyButton variant='danger' onClick={closeCreateClass}>Cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editClass && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-full p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeEditClass} />

                                <h3 className="text-lg leading-6 font-medium p-2 mb-2">
                                    Editar Informacoes da Aula
                                </h3>

                                <div className="mt-2 flex flex-col items-center gap-3 p-4 overflow-y-scroll w-full h-[70vh]">
                                    <FluencyInput type="text" placeholder="Nome da Aula" value={className} onChange={(e) => setClassName(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Número da Aula" value={classNumber} onChange={(e) => setClassNumber(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Link do Vídeo" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                                    <FluencyInput type="text" placeholder="ID do Vídeo" value={videoID} onChange={(e) => setVideoID(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Link do PDF" value={pdfLink} onChange={(e) => setPdfLink(e.target.value)} />
                                    <FluencyInput type="text" placeholder="ID do PDF" value={pdfID} onChange={(e) => setPdfID(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Link do Anki" value={ankiLink} onChange={(e) => setAnkiLink(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Links Externos" value={externalLinks} onChange={(e) => setExternalLinks(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Audio ID" value={audioID} onChange={(e) => setAudioID(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Deck ID" value={deckNAME} onChange={(e) => setDeckNAME(e.target.value)} />
                                    <FluencyInput type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>
                                <div className="flex justify-center">
                                        <FluencyButton variant='confirm' onClick={handleEditSubmit}>Salvar Alteracoes</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeEditClass}>Cancelar</FluencyButton>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteConfirmationModalOpen && classToDelete &&
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="flex flex-col items-center bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full p-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusao</h3>
                                <FluencyCloseButton onClick={closeDeleteConfirmationModal} />
                            </div>
                            <div className="mt-2 flex flex-col items-center text-center">
                                <p className="text-black dark:text-white">Tem certeza que deseja excluir a aula <span className="font-bold">{classToDelete.className}</span>?</p>
                                <div className="mt-4 flex gap-2">
                                    <FluencyButton variant="danger" onClick={handleDeleteClass}>Excluir</FluencyButton>
                                    <FluencyButton variant="gray" onClick={closeDeleteConfirmationModal}>Cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}

                {showStudentModal && classToAdd && (
                    <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-5">
                        <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <FluencyCloseButton onClick={closeStudentModal} />
                        <div className="flex flex-col items-center p-4 w-full">
                            <h2 className="text-lg font-semibold mb-4">Lista dos seus Alunos</h2>
                            <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="p-2 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark px-4 mb-4"
                            >
                            <option value="">Selecione um aluno</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                {student.name}
                                </option>
                            ))}
                            </select>
                            <button
                            className="p-2 text-sm text-white bg-fluency-green-500 dark:bg-fluency-green-800 hover:bg-fluency-green-600 hover:dark:bg-fluency-green-900 duration-300 ease-in-out transition-all font-bold rounded-md"
                            onClick={() => {
                                handleAddDeckAsTask(selectedStudentId, classToAdd.className, classToAdd.id);
                                closeStudentModal();
                            }}
                            >
                            Adicionar como tarefa
                            </button>
                        </div>
                        </div>
                    </div>
                </div>)}

                {isMarkAsDoneModalOpen && (
                    <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="flex flex-col items-center bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full p-6">
                            <div className="flex justify-between items-center">
                                <FluencyCloseButton onClick={closeDeleteConfirmationModal} />
                            </div>
                            <div className="mt-2 p-2 flex flex-col items-center text-center">
                                <p>Tem certeza que deseja marcar a aula <span className="font-bold">{classToMarkAsDone?.className}</span> como feita?</p>
                                <div className="mt-4 flex gap-2">
                                    <FluencyButton variant="confirm" onClick={handleMarkAsDone}>Sim</FluencyButton>
                                    <FluencyButton variant="gray" onClick={closeMarkAsDoneModal}>Cancelar</FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
