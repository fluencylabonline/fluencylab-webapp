"use client";
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import LoadingAnimation from "@/app/ui/Animations/LoadingAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { DetailsModal } from "@/app/SharedPages/Placement/Components/DetailsModal";

export default function NivelamentoTeacher() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("student");
  const [tests, setTests] = useState<
    {
      date: string;
      completed: boolean;
      totalScore: number;
      abilitiesCompleted: Record<string, boolean>;
      id: string;
      createdAt: any;
    }[]
  >([]);

  const [nivelamentoPermitido, setNivelamentoPermitido] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (id) {
        try {
          const profile = doc(db, "users", id);
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

      const fetchedTests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          date: data.date,
          completed: Object.values(data.abilitiesCompleted || {}).every(
            (v) => v === true
          ),
          totalScore: Object.values(data.abilitiesScore || {}).reduce(
            (acc: number, score: any) => acc + (Number(score) || 0),
            0
          ),
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
        const userRef = doc(db, "users", id);
        setDoc(userRef, { NivelamentoPermitido: true }, { merge: true });
      } catch (error) {
        console.error("Error updating NivelamentoPermitido field:", error);
      }
    }
  }

  const determineCEFRLevel = (score: number): number => {
    if (score >= 90) return 5; // Naldo Benny (C2)
    if (score >= 75) return 4; // Joel Santana (C1)
    if (score >= 60) return 3; // Richarlisson (B2)
    if (score >= 45) return 2; // Alcione (B1)
    if (score >= 30) return 1; // Nabote (A2)
    return 0; // Sabrina Sato (A1)
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
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.02,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    },
  };

  // Animação para o container principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 mt-4 flex flex-col items-center w-full"
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            className="bg-fluency-gray-50 dark:bg-fluency-gray-900 w-full max-w-4xl rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-fluency-blue-600 dark:text-fluency-blue-300">
                Histórico de Testes de Nivelamento
              </h2>

              <div className="flex items-center space-x-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    nivelamentoPermitido
                      ? "bg-fluency-yellow-500"
                      : "bg-fluency-green-500"
                  }`}
                ></span>
                <span className="text-sm font-medium">
                  {nivelamentoPermitido
                    ? "Nivelamento Liberado"
                    : "Nivelamento Bloqueado"}
                </span>
              </div>
            </div>

            {tests.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                  Nenhum teste de nivelamento encontrado
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <AnimatePresence>
                  {tests.map((test, index) => {
                    const isCurrentTest =
                      !test.completed &&
                      Object.values(test.abilitiesCompleted).some(
                        (v) => v === false
                      );
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
                        className={`p-4 rounded-lg cursor-pointer transition-all
                          ${
                            test.completed
                              ? "bg-fluency-green-50 dark:bg-fluency-green-900/30 border-l-4 border-fluency-green-500"
                              : isCurrentTest
                              ? "bg-fluency-yellow-50 dark:bg-fluency-yellow-900/30 border-l-4 border-fluency-yellow-500"
                              : "bg-fluency-red-50 dark:bg-fluency-red-900/30 border-l-4 border-fluency-red-500"
                          }`}
                        onClick={() => {
                          setModalId(test.id);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold flex items-center gap-2">
                              {test.completed ? (
                                <span className="text-fluency-green-700 dark:text-fluency-green-300">
                                  ✓
                                </span>
                              ) : isCurrentTest ? (
                                <span className="text-fluency-yellow-700 dark:text-fluency-yellow-300">
                                  ⌛
                                </span>
                              ) : (
                                <span className="text-fluency-red-700 dark:text-fluency-red-300">
                                  ✗
                                </span>
                              )}
                              Teste realizado em {test.date}
                            </h3>
                            <p className="text-sm text-fluency-gray-600 dark:text-fluency-gray-400 mt-1">
                              {test.completed
                                ? "Teste completo"
                                : isCurrentTest
                                ? "Em progresso"
                                : "Não finalizado"}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-xs text-fluency-gray-600 dark:text-fluency-gray-400">
                                Pontuação
                              </div>
                              <div className="font-bold text-lg">
                                {test.totalScore.toFixed(1)}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-xs text-fluency-gray-600 dark:text-fluency-gray-400">
                                Nível CEFR
                              </div>
                              <div className="font-bold text-lg">{level}</div>
                            </div>

                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-fluency-blue-100 dark:bg-fluency-blue-900/50">
                              <span className="font-bold text-fluency-blue-700 dark:text-fluency-blue-300">
                                {level}
                              </span>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            {nivelamentoPermitido ? (
              <FluencyButton
                variant="warning"
                className="flex items-center gap-2"
                disabled
              >
                <span>Nivelamento pendente pelo aluno</span>
              </FluencyButton>
            ) : (
              <FluencyButton
                variant="confirm"
                onClick={handleNivelamento}
                className="flex items-center gap-2"
              >
                <span>Liberar novo nivelamento</span>
              </FluencyButton>
            )}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <DetailsModal
            id={id}
            modalId={modalId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
