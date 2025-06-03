"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Aluno, Language } from "../types";
import AchievementCard from "./AchievementCard";
import { useAchievements } from "../hooks/useAchievements";
import { getApplicableAchievements } from "../lib/definitions";

interface AchievementListProps {
  aluno: Aluno;
}

const AchievementList: React.FC<AchievementListProps> = ({ aluno }) => {
  const { achievements, loading, error, refreshAchievements } =
    useAchievements();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [language, setLanguage] = useState<"all" | Language>("all");
  const [applicableAchievements, setApplicableAchievements] = useState<
    string[]
  >([]);

  // Mapear os idiomas do aluno para exibição
  const studentLanguages =
    (Array.isArray(aluno.idioma)
      ? aluno.idioma
      : aluno.idioma
      ? [aluno.idioma]
      : []
    )?.map((idioma) => {
      switch (idioma) {
        case "Ingles":
          return { code: "english" as Language, name: "Inglês" };
        case "Espanhol":
          return { code: "spanish" as Language, name: "Espanhol" };
        case "Libras":
          return { code: "libras" as Language, name: "Libras" };
        case "Portugues":
          return { code: "portuguese" as Language, name: "Português" };
        default:
          return { code: "english" as Language, name: idioma };
      }
    }) || [];

  // Obter IDs de conquistas aplicáveis ao aluno
  useEffect(() => {
    const applicable = getApplicableAchievements(aluno);
    setApplicableAchievements(applicable.map((a) => a.id));
  }, [aluno]);

  // Criar lista completa de conquistas
  const allPossibleAchievements = React.useMemo(() => {
    const applicableDefinitions = getApplicableAchievements(aluno);
    const existingAchievementIds = new Set(
      achievements.map((a) => a.achievementId)
    );

    const completeList = [...achievements];

    applicableDefinitions.forEach((def) => {
      if (!existingAchievementIds.has(def.id)) {
        let language: Language | undefined = undefined;
        if (def.languages.length === 1) {
          language = def.languages[0];
        }

        completeList.push({
          achievementId: def.id,
          unlocked: false,
          unlockedAt: undefined,
          language,
        });
      }
    });

    return completeList;
  }, [achievements, aluno]);

  // Filtrar conquistas
  const filteredAchievements = allPossibleAchievements.filter((achievement) => {
    if (!applicableAchievements.includes(achievement.achievementId)) {
      return false;
    }

    if (
      language !== "all" &&
      achievement.language &&
      achievement.language !== language
    ) {
      return false;
    }

    if (filter === "all") return true;
    if (filter === "unlocked") return achievement.unlocked;
    if (filter === "locked") return !achievement.unlocked;
    return true;
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refreshAchievements(aluno);
    } catch (error) {
      console.error("Erro ao atualizar conquistas:", error);
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl shadow-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-200"
      >
        <div className="flex justify-between items-center">
          <div>
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline">
              {" "}Não foi possível carregar suas conquistas.
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="bg-red-200 hover:bg-red-300 text-red-800 font-medium py-1 px-3 rounded-lg text-sm dark:bg-red-800/50 dark:hover:bg-red-700 dark:text-red-100"
          >
            Tentar novamente
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Todas (
            {
              allPossibleAchievements.filter((a) =>
                applicableAchievements.includes(a.achievementId)
              ).length
            }
            )
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("unlocked")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === "unlocked"
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Desbloqueadas (
            {
              allPossibleAchievements.filter(
                (a) =>
                  applicableAchievements.includes(a.achievementId) && a.unlocked
              ).length
            }
            )
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("locked")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === "locked"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Bloqueadas (
            {
              allPossibleAchievements.filter(
                (a) =>
                  applicableAchievements.includes(a.achievementId) &&
                  !a.unlocked
              ).length
            }
            )
          </motion.button>
        </div>

        {studentLanguages.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                language === "all"
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Todos os idiomas
            </motion.button>
            {studentLanguages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  language === lang.code
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {lang.name}
              </motion.button>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium shadow hover:shadow-md transition-shadow dark:bg-gray-800 dark:text-blue-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Atualizar
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {filteredAchievements.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                {filter === "all" 
                  ? "Nenhuma conquista disponível" 
                  : filter === "unlocked" 
                    ? "Nenhuma conquista desbloqueada" 
                    : "Nenhuma conquista bloqueada"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === "all"
                  ? `Parece que ainda não há conquistas disponíveis ${
                      language === "all" ? "para seus idiomas" : "neste idioma"
                    }`
                  : filter === "unlocked"
                  ? `Você ainda não desbloqueou conquistas ${
                      language !== "all" ? "neste idioma" : ""
                    }`
                  : `Não há conquistas bloqueadas ${
                      language !== "all" ? "neste idioma" : ""
                    }`}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="achievements-grid"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredAchievements.map((achievement) => (
              <motion.div key={achievement.achievementId} variants={item}>
                <AchievementCard
                  studentAchievement={achievement}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementList;