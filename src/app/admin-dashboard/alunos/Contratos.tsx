'use client';
import { SetStateAction, useEffect, useState } from "react";
import { collection, query, where, doc, setDoc, getDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { v4 as uuidv4 } from 'uuid';
import FluencyButton from "@/app/ui/Components/Button/button";
import { FaSignature } from "react-icons/fa6";
import { MdAutorenew, MdOutlineDoneAll } from "react-icons/md";
import FluencyInput from "@/app/ui/Components/Input/input";
import { toast } from 'react-hot-toast';

interface Aluno {
    id: string;
    name: string;
    mensalidade: number;
    studentMail: string;
    ContratoAssinado: {
        signed: boolean;
        logs: { logID: string; signedAt: string; segundaParteAssinou: boolean }[];
    };
}

export default function ContratosAdmin() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filter, setFilter] = useState('all');

    const [formData, setFormData] = useState({
        ip: '',
        browser: '',
    });

    // Fetch IP and Browser
    useEffect(() => {
        const fetchIpAndBrowser = async () => {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const browser = navigator.userAgent;
            setFormData((prevData) => ({ ...prevData, ip: data.ip, browser }));
        };

        fetchIpAndBrowser();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snapshot) => {
            const updatedAlunos: Aluno[] = [];
            snapshot.forEach((doc) => {
                const logs = doc.data().ContratoAssinado?.logs || [];
                
                // Sort logs array based on signedAt date in descending order (most recent first)
                logs.sort((a: { signedAt: string }, b: { signedAt: string }) => {
                    const dateA = new Date(a.signedAt);
                    const dateB = new Date(b.signedAt);
                    return dateB.getTime() - dateA.getTime();
                });
    
                const aluno: Aluno = {
                    id: doc.id,
                    name: doc.data().name,
                    mensalidade: doc.data().mensalidade,
                    studentMail: doc.data().email,
                    ContratoAssinado: {
                        signed: logs.length > 0 ? logs[0].segundaParteAssinou : false,
                        logs: logs.length > 0 ? [logs[0]] : [],
                    },
                };
    
                updatedAlunos.push(aluno);
            });
            setAlunos(updatedAlunos);
        });
    
        return () => unsubscribe();
    }, []);

// Filter the list of students based on the selected filter and search query
const filteredAlunos = alunos.filter((aluno) => {
    const matchesFilter = filter === 'all' || (filter === 'signed' && aluno.ContratoAssinado.signed) || (filter === 'notSigned' && !aluno.ContratoAssinado.signed);
    const matchesSearchQuery = aluno.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearchQuery;
});

    const handleFilterChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setFilter(e.target.value);
      };

    const handleRenovar = async (alunoId: string) => {
        try {
            const userDocRef = doc(db, 'users', alunoId);
            await updateDoc(userDocRef, {
                'ContratoAssinado.signed': false,
            });
            toast.success('Contrato enviado para renovação!', {
                position: 'top-center',
              });
        } catch (error) {
            console.error("Error renewing contract: ", error);
            toast.error('Falha ao renovar contrato.', {
                position: 'top-center',
              });
        }
    };

    const handleDesativarContrato = async (alunoId: string) => {
        try {
            const userDocRef = doc(db, 'users', alunoId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const pastStudentDocRef = doc(db, 'past_students', alunoId);
                await setDoc(pastStudentDocRef, userData);
                await deleteDoc(userDocRef);
                toast.error('Contrato desativado com sucesso.', {
                    position: 'top-center',
                  });
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error deactivating contract: ", error);
            alert('Falha ao desativar o contrato.');
        }
    };

    const handleAssinar = async (alunoId: string) => {
        try {
            const userDocRef = doc(db, 'users', alunoId);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) throw new Error("No such document!");

            const userData = userDocSnap.data();
            const logs = userData.ContratoAssinado.logs || [];

            if (logs.length === 0) {
                throw new Error("No logs found!");
            }

            const lastLogIndex = logs.length - 1;
            const lastLog = logs[lastLogIndex];

            const now = new Date();
            const SecondSignedAt = new Intl.DateTimeFormat('pt-BR', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: false 
            }).format(now).replace(',','');

            const SecondLogID = uuidv4();
            const SecondCPF = "70625181158";
            const SecondBirthDate = "1999-10-02";
            const SecondIP = formData.ip;
            const SecondBrowser = formData.browser;
            const SecondNome = "Matheus de Souza Fernandes";

            const updatedLog = {
                ...lastLog,
                segundaParteAssinou: true,
                SecondSignedAt,
                SecondLogID,
                SecondCPF,
                SecondBirthDate,
                SecondIP,
                SecondBrowser,
                SecondNome,
            };

            logs[lastLogIndex] = updatedLog;

            await updateDoc(userDocRef, {
                'ContratoAssinado.signed': true,
                'ContratoAssinado.logs': logs
            });

            toast.success('Contrato assinado com sucesso!', {
                position: 'top-center',
              });
        } catch (error) {
            console.error("Error signing contract: ", error);
            toast.error('Falha ao assinar o contrato.', {
                position: 'top-center',
              });
        }
    };

    const calculateValidity = (signedAt: string) => {
        const signingDate = new Date(signedAt);
        const currentDate = new Date();
        const expiryDate = new Date(signingDate);
    
        // Add 12 months to the signing date to get the expiry date
        expiryDate.setMonth(expiryDate.getMonth() + 12);
    
        // Calculate the difference in milliseconds between expiry and current date
        const diffInMilliseconds = expiryDate.getTime() - currentDate.getTime();
    
        // Calculate remaining validity period in months
        const remainingMonths = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30));
    
        return remainingMonths;
    };
      
    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark lg:p-4 md:p-4 p-2 rounded-xl">
            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-2 w-full">
                <FluencyInput 
                    placeholder="Procure um aluno por aqui..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div>
                    <select
                    id="filter"
                    name="filter"
                    className="outline-none flex flex-row justify-center items-center bg-fluency-bg-light dark:bg-fluency-bg-dark dark:text-fluency-gray-100 py-3 rounded-md px-6"
                    value={filter}
                    onChange={handleFilterChange}
                    >
                    <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="all">Todos contratos</option>
                    <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="signed">Assinados</option>
                    <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="notSigned">Não Assinados</option>
                    </select>
                </div>
            </div>
            <div className="w-full overflow-y-auto h-[70vh]">
                {filteredAlunos.map((aluno) => (
                    <div key={aluno.id}>
                        <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-between w-full p-2 gap-3 bg-fluency-gray-100 dark:bg-fluency-gray-500 rounded-md mt-2">
                            <div className="flex flex-col gap-1 items-start p-2">
                                <p><span className="font-bold" >Aluno:</span> {aluno.name}</p>
                                <p><span className="font-bold" >Validade:</span> <span>{aluno.ContratoAssinado.logs.length > 0 ? calculateValidity(aluno.ContratoAssinado.logs[0].signedAt) : 'N/A'} meses</span></p>
                            </div>
                            <div>
                            {aluno.ContratoAssinado.logs.length > 0 ? (
                                calculateValidity(aluno.ContratoAssinado.logs[0].signedAt) < 0 ? (
                                    <FluencyButton variant="warning" onClick={() => handleRenovar(aluno.id)}>
                                        <MdAutorenew className="w-6 h-auto"/> Renovar
                                    </FluencyButton>
                                    ) : (
                                        <p className="font-bold text-fluency-green-600">Contrato válido</p>
                                    )
                                ) : (
                                <p className="text-center font-bold text-fluency-red-600">Contrato não assinado pelo aluno</p>
                            )}
                            </div>
                            <div className="flex flex-row gap-1 items-center">
                                {aluno.ContratoAssinado.logs.length > 0 && aluno.ContratoAssinado.logs[aluno.ContratoAssinado.logs.length - 1].segundaParteAssinou ? (
                                    <FluencyButton variant="gray" disabled><MdOutlineDoneAll className="w-6 h-auto"/> Assinado</FluencyButton>
                                ) : (
                                    <FluencyButton variant="confirm" onClick={() => handleAssinar(aluno.id)}><FaSignature className="w-6 h-auto"/> Assinar</FluencyButton>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
