'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { doc, getDoc, setDoc, collection, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiPrinter, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import ReactToPrint from 'react-to-print';
import { Aluno, ContractLog, ContractStatus, SignatureFormData } from '@/app/ui/Components/Contract/contrato-types';
import { db } from '@/app/firebase';
import ContratoPDF from '@/app/ui/Components/Contract/ContratoPDF';
import SignatureModal from '@/app/ui/Components/Contract/SignatureModal';
import SpinningLoader from '@/app/ui/Animations/SpinningComponent';
import { Signature } from 'lucide-react';
import FluencyButton from '@/app/ui/Components/Button/button';

const ContratoPage: React.FC = () => {
    const { data: session, status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [alunoData, setAlunoData] = useState<Aluno | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const contractRef = useRef<HTMLDivElement>(null);

    // Function to check if contract is still valid (6 months)
    const isContractValid = (signedAt: string): boolean => {
        if (!signedAt) return false;
        
        const signedDate = new Date(signedAt);
        const currentDate = new Date();
        const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000; // Approximate 6 months in milliseconds
        
        return (currentDate.getTime() - signedDate.getTime()) < sixMonthsInMs;
    };

    // Function to invalidate expired contract
    const invalidateExpiredContract = async (userId: string) => {
        try {
            const userRef = doc(db, 'users', userId);
            const invalidatedStatus: ContractStatus = {
                signed: false,
                signedByAdmin: false,
                logId: null,
                signedAt: null,
                adminSignedAt: null,
            };
            
            await updateDoc(userRef, { ContratosAssinados: invalidatedStatus });
            setContractStatus(invalidatedStatus);
            
            toast.error('Contrato expirado (6 meses). É necessário assinar novamente.');
            console.log('Contract expired and invalidated for user:', userId);
        } catch (error) {
            console.error('Error invalidating expired contract:', error);
            toast.error('Erro ao processar contrato expirado.');
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                if (status === 'authenticated' && session?.user?.id) {
                    const userRef = doc(db, 'users', session.user.id);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data() as Aluno;
                        setAlunoData(userData);
                        const currentStatus: ContractStatus = userData.ContratosAssinados || { signed: false, signedByAdmin: false };
                        
                        // Check contract validity if it's signed
                        if (currentStatus.signed && currentStatus.signedAt) {
                            const contractValid = isContractValid(currentStatus.signedAt);
                            
                            if (!contractValid) {
                                // Contract is expired, invalidate it
                                await invalidateExpiredContract(session.user.id);
                                return; // Early return since contract status is updated in invalidateExpiredContract
                            }
                        }
                        
                        setContractStatus(currentStatus);

                        if (currentStatus.signed && currentStatus.logId) {
                            const contractLogRef = doc(db, 'users', session.user.id, 'Contratos', currentStatus.logId);
                            const contractLogSnap = await getDoc(contractLogRef);

                            if (contractLogSnap.exists()) {
                                const contractLogData = contractLogSnap.data() as ContractLog;
                                // When loading, specifically merge form data and admin data into alunoData
                                // This ensures the PDF displays the signed data from the log
                                setAlunoData(prevData => ({
                                    ...(prevData as Aluno),
                                    ...contractLogData,
                                    // Ensure the original user ID is kept if it's not part of the form data
                                    id: prevData?.id || session.user?.id, 
                                }));
                            } else {
                                console.warn(`Log de contrato com ID ${currentStatus.logId} não encontrado.`);
                                toast.error('Não foi possível carregar os detalhes da assinatura anterior.');
                            }
                        }
                    } else {
                        toast.error('Dados do usuário não encontrados.');
                        setAlunoData(null);
                    }
                } else if (status === 'unauthenticated') {
                    setAlunoData(null);
                }
            } catch (error: any) {
                console.error('Erro ao buscar dados do usuário:', error);
                toast.error(`Erro ao carregar dados: ${error.message}`);
                setAlunoData(null);
            } finally {
                setLoading(false);
            }
        };

        if (status !== 'loading') {
            fetchUserData();
        }

    }, [session, status]);

    const handleSignContract = async (formData: SignatureFormData) => {
        if (!session?.user?.id || !alunoData) {
            toast.error('Erro: Usuário não autenticado ou dados incompletos.');
            return;
        }
        if (contractStatus?.signed && contractStatus?.signedByAdmin) {
            // Double-check validity before preventing signing
            if (contractStatus.signedAt && isContractValid(contractStatus.signedAt)) {
                toast.error('Contrato já assinado por ambas as partes.');
                return;
            } else {
                // Contract is expired, allow signing
                console.log('Contract expired, allowing re-signing');
            }
        }

        setIsSigning(true);
        const now = new Date();
        const timestampISO = now.toISOString();

        let adminIpAddress = 'N/A (Server-side)';
        let adminBrowserInfo = 'N/A (Server-side)';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) adminIpAddress = (await ipResponse.json()).ip;
        } catch (e) { console.warn('Could not fetch admin IP for log'); }

        const adminSignData = {
            segundaParteAssinou: true,
            SecondCPF: "70625181158",
            SecondBirthDate: "1999-10-02",
            SecondIP: adminIpAddress,
            SecondBrowser: adminBrowserInfo,
            SecondNome: "Matheus de Souza Fernandes",
            adminSignedAt: timestampISO,
        };

        // Construct logData with only the necessary information:
        // 1. User's ID (for reference, but not part of the form)
        // 2. Data from the signature form (formData)
        // 3. Admin signature data
        // 4. Timestamps and agreement status
        const logData: ContractLog = {
            name: formData.name, // From form
            cpf: formData.cpf, // From form
            birthDate: formData.birthDate, // From form
            address: formData.address, // From form
            city: formData.city, // From form
            state: formData.state, // From form
            zipCode: formData.zipCode, // From form
            ip: formData.ip, // From form (client-side)
            browser: formData.browser, // From form (client-side)
            viewedAt: timestampISO,
            signedAt: timestampISO,
            agreedToTerms: true, // This comes from the checkbox in the modal
            ...adminSignData,
        };

        try {
            const docRef = doc(collection(db, 'users', session.user.id, 'Contratos'));
            logData.logID = docRef.id;
            await setDoc(docRef, logData);

            const userRef = doc(db, 'users', session.user.id);
            const newStatus: ContractStatus = {
                signed: true,
                signedByAdmin: true,
                logId: docRef.id,
                signedAt: timestampISO,
                adminSignedAt: timestampISO,
            };
            await updateDoc(userRef, { ContratosAssinados: newStatus });

            setContractStatus(newStatus);
            // When updating alunoData after signing, only merge the signed form data
            // and the admin signature data, ensuring the PDF reflects the signed contract
            setAlunoData(prevData => {
                if (!prevData) return null;
                return { 
                    ...prevData, 
                    ...formData, // Merge form data
                    ...adminSignData, // Merge admin sign data
                    id: prevData.id,
                    ContratosAssinados: newStatus // Update the contract status within alunoData
                } as Aluno;
            });
            setIsModalOpen(false);
            toast.success('Contrato assinado com sucesso por ambas as partes!');

        } catch (error) {
            console.error('Erro ao assinar o contrato:', error);
            toast.error('Falha ao assinar o contrato. Tente novamente.');
        } finally {
            setIsSigning(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <SpinningLoader />
            </div>
        );
    }

    if (!alunoData) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col justify-center">
                <FiAlertTriangle className="text-red-500 dark:text-red-400 mx-auto mb-4 animate-pulse" size={40} />
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-red-600 dark:text-red-500">Erro ao Carregar Dados</h1>
                <p className="text-gray-700 dark:text-gray-300">Não foi possível carregar os dados do aluno para exibir o contrato.</p>
                <p className="mt-4 text-gray-700 dark:text-gray-300">Por favor, tente recarregar a página ou contate o suporte.</p>
            </div>
        );
    }

    const isSigned = contractStatus?.signed && contractStatus?.signedByAdmin;

    return (
        <div className="container mx-auto p-4 min-h-screen transition-colors duration-300">
            <div
                ref={contractRef}
                className="contract-page mb-8 transition-all duration-300 transform"
            >
                <ContratoPDF alunoData={alunoData} contractStatus={contractStatus} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center fixed bottom-0 left-0 right-0 z-30 animate-fadeIn bg-fluency-gray-500 dark:bg-fluency-gray-800 text-black dark:text-white p-4 shadow-lg">
                {isSigned ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold transition-colors duration-300">
                            <FiCheckCircle size={20} />
                            <span className='text-center'>Contrato assinado em {contractStatus.signedAt ? new Date(contractStatus.signedAt).toLocaleDateString('pt-BR') : ''}.</span>
                        </div>
                        <ReactToPrint
                            trigger={() => (
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md hover:shadow-lg"
                                    disabled={loading || isSigning}
                                >
                                    <FiPrinter size={18} />
                                    Imprimir
                                </button>
                            )}
                            content={() => contractRef.current}
                            documentTitle={`Contrato_${alunoData.name?.replace(/\s+/g, '_') || 'Aluno'}`}
                            pageStyle="@page { size: auto; margin: 0.2in; } @media print { body { -webkit-print-color-adjust: exact; } }"
                        />
                    </div>
                ) : (
                    <FluencyButton
                        onClick={() => setIsModalOpen(true)}
                        variant='glass'
                        disabled={loading || isSigning}
                    >
                        {isSigning ? (
                            <span className="flex items-center">
                                <FiLoader className="animate-spin mr-2" /> 
                                Assinando...
                            </span>
                        ) : <span className="flex items-center">
                                <Signature className="mr-2" /> 
                                Assinar
                            </span>}
                    </FluencyButton>
                )}
            </div>

            {alunoData && (
                <SignatureModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSignContract}
                    studentName={alunoData.name}
                />
            )}
        </div>
    );
};

export default ContratoPage;