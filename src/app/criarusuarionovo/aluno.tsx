'use client';
import { useEffect, useState } from "react";

import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, getDocs, getDoc, updateDoc, onSnapshot, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';

import { auth, db } from "@/app/firebase";
import { FaKey, FaRegCircleUser, FaUser } from "react-icons/fa6";
import { TbLanguage, TbLogin2, TbUserEdit } from "react-icons/tb";
import { IoPeopleCircle } from "react-icons/io5";
import { MdAttachMoney } from "react-icons/md";
import { LuCalendarClock, LuUserPlus2 } from "react-icons/lu";
import { RiTimeLine } from "react-icons/ri";

import notebookContent from './notebookexample.json';

import { toast, Toaster } from 'react-hot-toast';
import FluencyButton from "../ui/Components/Button/button";
import Link from "next/link";

interface Professor {
    id: string;
    name: string;
}

export default function CreateAluno(){
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [idioma, setIdioma] = useState('');
    const [frequencia, setFrequencia]  = useState('');
    const [diaAula, setDiaAula] = useState('');
    const [comecouEm, setComecouEm] = useState('');

    const handleDateChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setComecouEm(e.target.value);
    };
    const [mensalidade, setMensalidade] = useState('');
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [professor, setProfessor] = useState<string>('');

    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
                const querySnapshot = await getDocs(q);
                const professorList: Professor[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setProfessors(professorList);
            } catch (error) {
                console.error('Error fetching professors:', error);
            }
        };

        fetchProfessors();
    }, []);

    const handleProfessorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProfessor(e.target.value);
    };
    

    const handleSignUpAluno = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Get the name of the selected professor
            const selectedProfessor = professors.find(p => p.id === professor);
            const professorName = selectedProfessor ? selectedProfessor.name : '';
    
            // Create a new student document
            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                userName: userName,
                email: email,
                role: "student",
                professorId: professor, // Store professor ID
                professor: professorName, // Store professor name
                mensalidade: mensalidade,
                idioma: idioma,
                frequencia: frequencia,
                diaAula: diaAula,
                comecouEm: comecouEm,
            });
    
            // Create a new 'Notebooks' collection inside the user's document
            const notebooksCollectionRef = collection(doc(db, 'users', user.uid), 'Notebooks');
    
            // Add a new document with the notebook content
            const notebookDocRef = await addDoc(notebooksCollectionRef, {
                content: notebookContent[0],
                title: 'Caderno de Exemplo',
                student: user.uid,
                description: 'Um caderno de exemplo',
                createdAt: serverTimestamp(),
                studentName: userName,

            });
    
            console.log("Notebook added with ID: ", notebookDocRef.id);
    
            // Reset form fields after successful sign-up
            setName('');
            setUserName('');
            setEmail('');
            setProfessor('');
            setMensalidade('');
            setIdioma('');
            setFrequencia('');
            setDiaAula('');
            setComecouEm('');
    
            // Sign out the user
            await auth.signOut();
    
            setIsLoading(false);
            
            toast.success('Aluno criado com sucesso!', {
                position: "top-center",
            });
    
        } catch (error: any) { // Explicitly define the type of error
            setIsLoading(false);
    
            // Display an error message based on the error code
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Este email já está sendo usado.', {
                    position: "top-center",
                });
            } else if (error.code === 'auth/weak-password') {
                toast.error('Senha fraca, use uma mais forte.', {
                    position: "top-center",
                });
            } else {
                toast.error('Um erro aconteceu, por favor tente novamente', {
                    position: "top-center",
                });
            }
        }
    };
    
  return(
  <div>
    <div className='lg:flex lg:flex-row md:flex md:flex-row sm:flex sm:flex-col gap-4 items-strecht justify-center'>
        <div className='flex flex-col items-stretch'>
            <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Nome do Aluno</label>
                    <div className="flex">  
                    <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                        <FaUser />
                    </div>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                        placeholder="Nome do Aluno" 
                    />
                    </div>
                </div>
            </div>
            <div className="flex -mx-3">
            <div className="w-full px-3 mb-4">
                <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">E-mail FluencyLab</label>
                <div className="flex">  
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                    <TbUserEdit />
                </div>
                <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                    placeholder="johnsmith@fluency.lab" 
                />
                </div>
            </div>
            </div>
            <div className="flex -mx-3">
            <div className="w-full px-3 mb-4">
                <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Email</label>
                <div className="flex">  
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                    <FaRegCircleUser />
                </div>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                    placeholder="johnsmith@email.com" 
                />
                </div>
            </div>
            </div>
            <div className="flex -mx-3">
            <div className="w-full px-3 mb-4">
                <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Senha</label>
                <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                    <FaKey />
                </div>
                <input 
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                    placeholder="************" 
                />
                </div>
            </div>
            </div>
        </div>


        <div className='flex flex-col items-stretch'>
            <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Professor</label>
                    <div className="flex">  
                    <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                        <IoPeopleCircle />
                    </div>
                        <select 
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                            value={professor}
                            onChange={handleProfessorChange}
                        >
                            <option value="">Lista de Professores</option>
                            {professors.map(professor => (
                                <option key={professor.id} value={professor.id}>
                                    {professor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                </div>
                <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Mensalidade</label>
                    <div className="flex">
                    <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                        <MdAttachMoney />
                    </div>
                    <input 
                        type="number"
                        inputMode="numeric"
                        max="3"
                        value={mensalidade} 
                        onChange={(e) => setMensalidade(e.target.value)}
                        className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                        placeholder="Valor da mensalidade" 
                    />
                    </div>
                </div>
            </div>
            <div className="flex -mx-3">
                    <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Idioma</label>
                    <div className="flex">  
                    <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                        <TbLanguage />
                    </div>
                    <select 
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                        className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"                        
                    >
                        <option value="">Selecione um idioma</option>
                        <option value="ingles">Inglês</option>
                        <option value="libras">Libras</option>
                        <option value="espanhol">Espanhol</option>
                    </select>
                    </div>
                </div>
            </div>
        </div>


        <div className='flex flex-col items-stretch'>
                <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Frequência</label>
                    <div className="flex">
                    <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                        <LuCalendarClock />
                    </div>
                    <input 
                        type="number"
                        inputMode="numeric"
                        max="3"
                        value={frequencia} 
                        onChange={(e) => setFrequencia(e.target.value)}
                        className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                        placeholder="Quantas aulas por semana?" 
                    />
                    </div>
                </div>
            </div>
            <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                        <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Dia da Aula</label>
                        <div className="flex">  
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <RiTimeLine />
                        </div>
                        <select 
                            value={diaAula}
                            onChange={(e) => setDiaAula(e.target.value)}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"                        
                        >
                            <option value="segunda">Segunda</option>
                            <option value="terca">Terça</option>
                            <option value="quarta">Quarta</option>
                            <option value="quinta">Quinta</option>
                            <option value="sexta">Sexta</option>
                            <option value="sabado">Sábado</option>
                            <option value="domingo">Domingo</option>

                        </select>
                        </div>
                    </div>
            </div>
            <div className="flex -mx-3">
                <div className="w-full px-3 mb-4">
                    <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Começou em</label>
                    <div className="flex">  
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <RiTimeLine />
                        </div>
                        <input 
                            type="date" 
                            value={comecouEm}
                            onChange={handleDateChange}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                            placeholder="Começou em..." 
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div className="w-full px-3 mb-4 mt-4 flex flex-row gap-2 justify-center">
            <FluencyButton
                disabled={isLoading}
                onClick={handleSignUpAluno}
            >
                {isLoading ? 'Cadastrando...' : 'Criar Aluno'}
                <LuUserPlus2 className="w-6 h-auto" />
            </FluencyButton>

            <Link href={"/signin"}>
                <FluencyButton variant="warning"> 
                    Entrar <TbLogin2 className="w-6 h-auto" />
                </FluencyButton>
            </Link>
        </div>

    <Toaster />
   </div>
 );
}