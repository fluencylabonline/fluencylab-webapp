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
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({ ip: '', browser: '' });

    useEffect(() => {
        const fetchIpAndBrowser = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                setFormData({ ip: data.ip, browser: navigator.userAgent });
            } catch (error) {
                console.error("Error fetching IP:", error);
                setFormData({ ip: 'Unknown', browser: 'Unknown' });
            }
        };

        fetchIpAndBrowser();
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const updatedAlunos = snapshot.docs.map((doc) => {
                const data = doc.data();
                let logs = data.ContratoAssinado?.logs || [];

                logs.sort((a: { signedAt: string | number | Date; }, b: { signedAt: string | number | Date; }) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());

                return {
                    id: doc.id,
                    name: data.name,
                    mensalidade: data.mensalidade,
                    studentMail: data.email,
                    ContratoAssinado: {
                        signed: logs.length > 0 ? logs[0].segundaParteAssinou : false,
                        logs: logs.length > 0 ? [logs[0]] : [],
                    },
                };
            });
            setAlunos(updatedAlunos);
        });

        return () => unsubscribe();
    }, []);

    const filteredAlunos = alunos.filter((aluno) => {
        const matchesFilter = filter === 'all' || (filter === 'signed' && aluno.ContratoAssinado.signed) || (filter === 'notSigned' && !aluno.ContratoAssinado.signed);
        const matchesSearchQuery = aluno.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearchQuery;
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value);
    };

    const handleRenovar = async (alunoId: string) => {
        try {
            const userDocRef = doc(db, 'users', alunoId);
            await updateDoc(userDocRef, { 'ContratoAssinado.signed': false });
            toast.success('Contrato enviado para renovação!', { position: 'top-center' });
        } catch (error) {
            console.error("Error renewing contract: ", error);
            toast.error('Falha ao renovar contrato.', { position: 'top-center' });
        }
    };

    const handleAssinar = async (alunoId: string) => {
        try {
            const userDocRef = doc(db, 'users', alunoId);
            const now = new Date();
            const signedAt = now.toISOString(); // Store as ISO string!
            const logID = uuidv4();

            await updateDoc(userDocRef, {
                'ContratoAssinado.signed': true,
                'ContratoAssinado.logs': [{ signedAt, logID, segundaParteAssinou: true }],
            });

            const contratoSubcollectionRef = collection(db, 'users', alunoId, 'Contrato');
            const currentDate = now.toISOString().split('T')[0];
            await updateDoc(doc(contratoSubcollectionRef, currentDate), {
                signedAt, logID, segundaParteAssinou: true,
                SecondCPF: "70625181158", // These should NOT be hardcoded!
                SecondBirthDate: "1999-10-02", // These should NOT be hardcoded!
                SecondIP: formData.ip,
                SecondBrowser: formData.browser,
                SecondNome: "Matheus de Souza Fernandes", // These should NOT be hardcoded!
            });

            toast.success('Contrato assinado com sucesso!', { position: 'top-center' });
        } catch (error) {
            console.error("Error signing contract: ", error);
            toast.error('Falha ao assinar o contrato.', { position: 'top-center' });
        }
    };

    const calculateValidity = (signedAt: string) => {
        const signingDate = new Date(signedAt); // Now correctly parses the ISO string
        const currentDate = new Date();
        const expiryDate = new Date(signingDate);
        expiryDate.setMonth(expiryDate.getMonth() + 11);
        const diffInMilliseconds = expiryDate.getTime() - currentDate.getTime();
        return Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30));
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
                                <p>
                                    <span className="font-bold">Validade: </span>
                                    <span>
                                        {aluno.ContratoAssinado.logs.length > 0 ? (
                                            (() => {
                                                const remainingMonths = calculateValidity(aluno.ContratoAssinado.logs[0].signedAt);
                                                return remainingMonths > 0 ? `${remainingMonths} meses` : "Contrato Expirado";
                                            })()
                                        ) : (
                                            "N/A"
                                        )}
                                    </span>
                                </p>                            
                            </div>
                            <div>
                                {aluno.ContratoAssinado.logs.length > 0 ? (
                                    calculateValidity(aluno.ContratoAssinado.logs[0].signedAt) < 0 ? (
                                        <FluencyButton variant="warning" onClick={() => handleRenovar(aluno.id)}>
                                            <MdAutorenew className="w-6 h-auto"/> Renovar
                                        </FluencyButton>
                                    ) : (
                                        <p className="font-bold text-fluency-green-600">Contrato assinado pelo aluno</p>
                                    )
                                ) : (
                                    <p className="text-center font-bold text-fluency-red-600">Contrato não assinado pelo aluno</p>
                                )}
                            </div>
                            <div className="flex flex-row gap-1 items-center">
                                {aluno.ContratoAssinado.logs.length > 0 && aluno.ContratoAssinado.logs[aluno.ContratoAssinado.logs.length - 1].segundaParteAssinou ? (
                                    <FluencyButton variant="gray" disabled><MdOutlineDoneAll className="w-6 h-auto"/> Assinado</FluencyButton>
                                ) : (
                                    <FluencyButton variant="confirm" onClick={() => handleAssinar(aluno.id)} disabled={aluno.ContratoAssinado.signed}><FaSignature className="w-6 h-auto"/> Assinar</FluencyButton>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}