'use client';
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { DetailsModal } from "@/app/SharedPages/Placement/Components/DetailsModal";
import FluencyButton from "@/app/ui/Components/Button/button";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";
import Link from "next/link";

interface PlacementTest {
  date: string;
  completed: boolean;
  totalScore: number;
  abilitiesCompleted: Record<string, boolean>;
  id: string;
  createdAt: any;
}

interface PlacementCardProps {
  studentId: any;
}

export default function PlacementCard({ studentId }: PlacementCardProps) {
  const [tests, setTests] = useState<PlacementTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {

    
    const fetchUserTests = async () => {
      try {
        const testsRef = collection(db, "users", studentId, "Placement");
        const querySnapshot = await getDocs(testsRef);
        
        const fetchedTests = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const abilitiesScore = data.abilitiesScore || {};
          const totalScore = Object.values(abilitiesScore).reduce((acc: number, score: any) => 
            acc + (Number(score) || 0), 0);
          
          return {
            date: data.createdAt,
            completed: Object.values(data.abilitiesCompleted || {}).every(v => v === true),
            totalScore,
            abilitiesCompleted: data.abilitiesCompleted || {},
            id: doc.id,
            createdAt: data.createdAt?.seconds || 0,
          };
        });

        setTests(fetchedTests.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchUserTests();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const determineCEFRLevel = (score: number): number => {
    if (score >= 90) return 5;  // C2
    if (score >= 75) return 4;  // C1
    if (score >= 60) return 3;  // B2
    if (score >= 45) return 2;  // B1
    if (score >= 30) return 1;  // A2
    return 0;  // A1
  };

  // Animação para os cards de teste
  const testVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    hover: { 
      y: 3,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: { duration: 0.1 }
    }
  };

  // Animação para o container principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col justify-start w-full h-full"
    >
      {loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <SpinningLoader />
        </div>
      ) : (
        <>
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className="bg-fluency-pages-light dark:bg-fluency-pages-dark w-full h-full p-4 rounded-lg"
          >
            <div className="flex flexe-row justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-fluency-orange-600 dark:text-fluency-orange-300">
                Nivelamento
              </h2>
              <Link href={{ pathname: `nivelamento/${encodeURIComponent("Todos")}`, query: { id: studentId } }} passHref className="text-sm font-bold text-fluency-blue-600 dark:text-fluency-blue-300">
                Ver todos
              </Link>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                  Nenhum teste de nivelamento encontrado
                </p>
              </div>
            ) : (
              <div className="space-y-2 h-full overflow-y-auto">
                <AnimatePresence>
                  {tests.map((test, index) => {
                    const isCurrentTest = !test.completed && 
                      Object.values(test.abilitiesCompleted).some(v => v === false);
                    const level = determineCEFRLevel(test.totalScore);
                    
                    return (
                      <motion.div
                        key={test.id}
                        custom={index}
                        variants={testVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`p-2 rounded-lg cursor-pointer transition-all
                          ${test.completed 
                            ? 'bg-fluency-green-100 dark:bg-fluency-green-900/30 border-l-4 border-fluency-green-500'
                            : isCurrentTest 
                              ? 'bg-fluency-yellow-100 dark:bg-fluency-yellow-900/30 border-l-4 border-fluency-yellow-500'
                              : 'bg-fluency-red-100 dark:bg-fluency-red-900/30 border-l-4 border-fluency-red-500'
                          }`}
                        onClick={() => {
                          setModalId(test.id);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex flex-col justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm flex items-center gap-2">
                              {test.completed 
                                ? <span className="text-fluency-green-700 dark:text-fluency-green-300">✓</span> 
                                : isCurrentTest 
                                  ? <span className="text-fluency-yellow-700 dark:text-fluency-yellow-300">⌛</span> 
                                  : <span className="text-fluency-red-700 dark:text-fluency-red-300">✗</span>
                              }
                                {new Date(test.createdAt * 1000).toLocaleDateString('pt-BR', { month: 'numeric', year: 'numeric' })
}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs text-fluency-gray-600 dark:text-fluency-gray-400">Pontuação</div>
                              <div className="font-bold text-md">
                                {test.totalScore.toFixed(1)}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-fluency-gray-600 dark:text-fluency-gray-400">Nível CEFR</div>
                              <div className="font-bold text-md">
                                {level}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <DetailsModal 
            id={studentId} 
            modalId={modalId} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}