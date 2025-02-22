'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, DocumentData, getDoc, query, orderBy, limit } from "firebase/firestore";
import LoadingAnimation from "@/app/ui/Animations/LoadingAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { DetailsModal } from "@/app/SharedPages/Placement/Components/DetailsModal";

export default function NivelamentoTeacher() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const { data: session } = useSession();
    const [tests, setTests] = useState<{ 
        date: string; 
        completed: boolean;
        totalScore: number;
        abilitiesCompleted: Record<string, boolean>;
        id: string;
        createdAt: any,
      }[]>([]);

    const [nivelamentoPermitido, setNivelamentoPermitido] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalId, setModalId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (id) {
                try {
                    const profile = doc(db, 'users', id);
                    const docSnap = await getDoc(profile);
                    if (docSnap.exists()) {
                        setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document: ", error);
                }
            }
        };
        fetchUserInfo();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchUserTests();
        } else {
            setLoading(false); // If id is missing, stop loading
        }
    }, [id]);
    
    const fetchUserTests = async () => {
        if (!id) return;
    
        try {
            const testsRef = collection(db, "users", id, "Placement");
            const querySnapshot = await getDocs(testsRef);
            
            const fetchedTests = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    date: data.date,
                    completed: Object.values(data.abilitiesCompleted || {}).every(v => v === true),
                    totalScore: Object.values(data.abilitiesScore || {}).reduce((acc: number, score: any) => 
                        acc + (Number(score) || 0), 0),
                    abilitiesCompleted: data.abilitiesCompleted || {},
                    id: doc.id,
                    createdAt: data.createdAt?.seconds || 0, 
                };
            });
    
            // Sort tests by createdAt (newest first)
            setTests(fetchedTests.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error("Error fetching tests:", error);
        } finally {
            setLoading(false); // Ensure loading stops even on error
        }
    };    

    function handleNivelamento() {
        if (id) {
            try {
                const userRef = doc(db, 'users', id);
                setDoc(userRef, { NivelamentoPermitido: true }, { merge: true });
            } catch (error) {
                console.error('Error updating NivelamentoPermitido field:', error);
            }
        }
    }

    const determineCEFRLevel = (score: number): number => {
        if (score >= 90) return 5;  // Naldo Benny (C2)
        if (score >= 75) return 4;  // Joel Santana (C1)
        if (score >= 60) return 3;  // Richarlisson (B2)
        if (score >= 45) return 2;  // Alcione (B1)
        if (score >= 30) return 1;  // Nabote (A2)
        return 0;  // Sabrina Sato (A1)
      };  

return (
    <div className="p-4 mt-4 flex flex-col items-center w-full">
        {loading ? (
            <div className="flex items-center justify-center min-h-full min-w-full absolute top-[0%]">
                <LoadingAnimation />
            </div>
        ) : (
            <>  
                <div className="bg-fluency-gray-100 dark:bg-fluency-pages-dark w-full h-[75vh] flex flex-col items-center justify-between rounded-md border-white border p-8">
                <div className="flex flex-col text-center w-full">
                    <p id="text-gradient" className="font-bold text-[2rem] mb-4">Seu progresso:</p>
                    <div className='flex flex-col gap-2 justify-start h-[50vh] overflow-y-auto'>
                    <AnimatePresence>
                        {tests.map((test, index) => {
                        const isCurrentTest = !test.completed && Object.values(test.abilitiesCompleted).some(v => v === false);
                        return (
                            <motion.div
                                key={test.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                onClick={() => {
                                    setModalId(test.id);
                                    setIsModalOpen(true);
                                }}
                            className="flex justify-between items-center rounded-md p-2 px-4 cursor-pointer bg-fluency-pages-light hover:bg-fluency-gray-200 dark:bg-fluency-bg-dark dark:hover:bg-fluency-gray-500 duration-300 ease-in-out transition-all"
                            >
                            <p className='font-bold'>
                                {test.completed ? "Finalizado em" : isCurrentTest ? "Iniciado em" : "Iniciado em"} {test.date}
                            </p>
                            <div className="flex-col items-center">
                                <p>Pontuação: {test.totalScore.toFixed(1)}</p>
                                <p className="text-sm">Nível: {determineCEFRLevel(test.totalScore)}</p>
                            </div>
                            <span className={`px-3 py-2 font-bold rounded-md ${test.completed ? "bg-green-500" : isCurrentTest ? "bg-yellow-500" : "bg-red-500"}`}>
                                {test.completed ? "Finalizado" : isCurrentTest ? "Em Progresso" : "Não Finalizado"}
                            </span>
                            </motion.div>
                        );
                        })}
                    </AnimatePresence>
                    </div>
                </div>
                </div>
                <div className="flex flex-row items-center justify-center gap-2 mt-4">
                    {nivelamentoPermitido === true ? (
                        <FluencyButton variant="warning">Aguardando Aluno Fazer Nivelamento</FluencyButton>
                    ) : (
                        <FluencyButton variant="confirm" onClick={handleNivelamento}>Refazer Nivelamento do Aluno</FluencyButton>
                    )}
                </div>
            </>
        )}

        {isModalOpen && (
            <DetailsModal id={id} modalId={modalId} onClose={() => setIsModalOpen(false)} />
        )}

    </div>
);
}

