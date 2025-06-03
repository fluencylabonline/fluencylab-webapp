"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import toast from "react-hot-toast";
import AchievementList from "@/app/ui/Components/Achievements/components/AchievementList";
import { Aluno } from "@/app/ui/Components/Achievements/types";
import { motion } from "framer-motion";
import { cardVariants, fadeIn, slideIn, staggerContainer } from "@/app/ui/Components/Animations/motion";

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [aluno, setAluno] = React.useState<Aluno | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notebookCount, setNotebookCount] = React.useState(0);

  React.useEffect(() => {
    const fetchStudentData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const studentId = session.user.id;
        const studentDocRef = doc(db, "users", studentId);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          // Buscar dados do aluno
          const alunoData = { id: studentDoc.id, ...studentDoc.data() } as Aluno;
          
          // Buscar dados de Placement
          const placementData = await fetchPlacementData(studentId);
          
          // Garantir que o objeto Placement tenha a estrutura correta
          const formattedPlacement = placementData ? {
            abilitiesScore: {
              speakingScore: placementData.abilitiesScore?.speakingScore,
              vocabularyScore: placementData.abilitiesScore?.vocabularyScore,
              readingScore: placementData.abilitiesScore?.readingScore,
              writingScore: placementData.abilitiesScore?.writingScore,
              listeningScore: placementData.abilitiesScore?.listeningScore,
              grammarScore: placementData.abilitiesScore?.grammarScore
            }
          } : undefined;
          
          // Combinar os dados com tipagem correta
          const alunoWithPlacement: Aluno = {
            ...alunoData,
            Placement: formattedPlacement
          };
          
          // Atualizar estado
          setAluno(alunoWithPlacement);
          
          // Já que temos o aluno, podemos pegar notebooks
          const notebooks = await getNotebookCount(studentId);
          setNotebookCount(notebooks);
          
        } else {
          toast.error("Dados do aluno não encontrados.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error);
        toast.error("Erro ao carregar dados do aluno.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [session]);

  // Função para buscar os dados de Placement do aluno
  const fetchPlacementData = async (userId: string) => {
    try {
      const placementRef = collection(db, `users/${userId}/Placement`);
      const placementSnapshot = await getDocs(placementRef);
      
      if (!placementSnapshot.empty) {
        return placementSnapshot.docs[0].data();
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar dados de nivelamento:", error);
      return null;
    }
  };

const getFrequencia = (aluno: Aluno): number => {
    const classes = aluno.Classes;
    if (!classes) return 0;

    let totalAulas = 0;
    let aulasFeitas = 0;

    for (const ano in classes) {
      const meses = classes[ano];
      for (const mes in meses) {
        const dias = meses[mes];
        for (const dia in dias) {
          const status = dias[dia];
          if (["Feita", "Modificada", "Cancelada"].includes(status)) {
            totalAulas += 1;
            if (status === "Feita") {
              aulasFeitas += 1;
            }
          }
        }
      }
    }

    if (totalAulas === 0) return 0;

    return Math.round((aulasFeitas / totalAulas) * 100);
  };

  const getNotebookCount = async (alunoId: string): Promise<number> => {
    try {
      const notebookRef = collection(db, `users/${alunoId}/Notebooks`);
      const snapshot = await getDocs(notebookRef);
      return snapshot.size;
    } catch (error) {
      console.error("Erro ao buscar notebooks:", error);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[89vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300"
          >
            Carregando suas conquistas...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!aluno) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.div
          variants={fadeIn("up", "tween", 0, 0.5)}
          initial="hidden"
          animate="show"
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl relative shadow-sm"
          role="alert"
        >
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline">
            {" "}
            Não foi possível carregar seus dados. Por favor, tente novamente
            mais tarde ou entre em contato com o suporte.
          </span>
        </motion.div>
      </motion.div>
    );
  }
  
  const frequencia = getFrequencia(aluno);
  const idiomaCount = typeof aluno.idioma === "string"
    ? 1
    : Array.isArray(aluno.idioma)
    ? aluno.idioma.filter((lang) => typeof lang === "string" && lang.trim() !== "").length
    : 0;

  return (
    <motion.div
      variants={staggerContainer(0.1, 0.2)}
      initial="hidden"
      animate="show"
      className="container mx-auto px-2 py-1 min-h-[89vh]"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0.2, 0.5)}
        className="mb-2 text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-fluency-blue-600 to-purple-600 dark:from-fluency-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Suas Conquistas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Acompanhe seu progresso e desbloqueie conquistas à medida que avança em
          seus estudos.
        </p>
      </motion.div>

      <motion.div
        variants={slideIn("up", "tween", 0.4, 0.5)}
        className="p-6 "
      >
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.div 
            variants={cardVariants(0.1)}
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Aulas Concluídas</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{notebookCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants(0.2)}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-700/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Frequência</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{frequencia}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={cardVariants(0.3)}
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Idiomas</h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{idiomaCount}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lista de conquistas */}
        <motion.div variants={fadeIn("up", "tween", 0.5, 0.5)}>
          <AchievementList aluno={aluno} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}