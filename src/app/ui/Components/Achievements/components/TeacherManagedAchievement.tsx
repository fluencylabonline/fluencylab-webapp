"use client";

import React, { useState, useEffect } from "react";
import { toggleTeacherManagedAchievement } from "../lib/firebase";
import { achievementDefinitions } from "../lib/definitions";
import { Language, AchievementDefinition } from "../types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpinningLoader from "@/app/ui/Animations/SpinningComponent";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";

interface TeacherManagedAchievementsProps {
  studentId: any;
  language: Language;
}

interface AchievementItemProps {
  achievement: AchievementDefinition;
  studentId: any;
  isUnlocked: boolean;
  language: Language;
  onToggle: (achievementId: string, newStatus: boolean) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    y: -1,
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
};

const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  studentId,
  isUnlocked,
  language,
  onToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newStatus = !isUnlocked;
      const success = await toggleTeacherManagedAchievement(
        studentId,
        achievement.id,
        newStatus,
        language
      );

      if (success) {
        onToggle(achievement.id, newStatus);
        toast.success(
          newStatus
            ? `Conquista "${achievement.name}" concedida!`
            : `Conquista "${achievement.name}" removida!`,
          {
            position: "bottom-center",
            style: {
              background: newStatus ? "#10B981" : "#EF4444",
              color: "white",
              borderRadius: "12px",
              padding: "8px 16px",
              fontWeight: 600,
            },
          }
        );
      } else {
        toast.error("Erro ao atualizar conquista.");
      }
    } catch (error) {
      console.error("Erro ao atualizar conquista:", error);
      toast.error("Erro ao atualizar conquista.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`
        border rounded-lg p-2 transition-all duration-300 w-fit
        ${
          isUnlocked
            ? "bg-gradient-to-br from-white to-fluency-fluency-green-50 border-fluency-green-200 dark:from-fluency-gray-800 dark:to-fluency-green-900 dark:border-fluency-green-800 shadow-sm hover:shadow-lg"
            : "bg-gradient-to-br from-white to-fluency-fluency-gray-50 border-fluency-gray-200 dark:from-fluency-gray-800 dark:to-fluency-gray-800 dark:border-fluency-gray-700 shadow-sm hover:shadow-md"
        }
        overflow-hidden relative
      `}
    >
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-100/10 to-transparent dark:from-green-500/5 pointer-events-none" />
      )}

      <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col lg:items-start md:items-start items-center gap-4">
        <div className="relative flex flex-col items-center gap-1">
          <div
            className={`
            w-16 h-16 rounded-lg flex items-center justify-center text-2xl
            ${
              isUnlocked
                ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
            }
          `}
          >
            {achievement.icon}
          </div>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              isUnlocked
                ? "bg-fluency-green-100 text-fluency-green-800 dark:bg-fluency-green-900 dark:text-fluency-green-200"
                : "bg-fluency-gray-100 text-fluency-gray-600 dark:bg-fluency-gray-700 dark:text-fluency-gray-300"
            }`}
          >
            {isUnlocked ? "Desbloqueada" : "Bloqueada"}
          </span>
        </div>

        <div className="w-fit">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`
              font-bold text-lg truncate 
              ${
                isUnlocked
                  ? "text-green-800 dark:text-green-200"
                  : "text-gray-700 dark:text-gray-300"
              }
            `}
            >
              {achievement.name}
            </h3>
          </div>

          <p
            className={`
            text-sm w-fit max-w-full
            ${
              isUnlocked
                ? "text-green-700 dark:text-green-300/90"
                : "text-gray-600 dark:text-gray-400"
            }
          `}
          >
            {achievement.description}
          </p>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
            px-2 py-2 rounded-lg text-white font-medium transition-all
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : isUnlocked
                ? "bg-gradient-to-r from-fluency-orange-500 to-fluency-orange-600 hover:from-fluency-orange-600 hover:to-fluency-orange-700 focus:ring-2 focus:ring-fluency-orange-300"
                : "bg-gradient-to-r from-fluency-green-500 to-fluency-green-600 hover:from-fluency-green-600 hover:to-fluency-green-700 focus:ring-2 focus:ring-fluency-green-300"
            }
            shadow-md hover:shadow-lg transform hover:-translate-y-0.5
          `}
          >
            {isLoading ? (
              "Atualizando..."
            ) : isUnlocked ? (
              <LockKeyhole />
            ) : (
              <LockKeyholeOpen />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TeacherManagedAchievements: React.FC<TeacherManagedAchievementsProps> = ({
  studentId,
  language,
}) => {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const allApplicableAchievements = achievementDefinitions.filter(
    (achievement) => achievement.languages.includes(language)
  );

  const teacherOnlyAchievements = allApplicableAchievements.filter(
    (achievement) => achievement.teacherManaged === true
  );

  useEffect(() => {
    const fetchUnlockedAchievements = async () => {
      try {
        setLoading(true);
        // Simulação de dados
        setTimeout(() => {
          setUnlockedIds(new Set(["primeira_aula_concluida", "fotogenico"]));
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Erro ao buscar achievements:", error);
        setLoading(false);
      }
    };

    if (studentId) {
      fetchUnlockedAchievements();
    }
  }, [studentId, language]);

  const handleAchievementToggle = (
    achievementId: string,
    newStatus: boolean
  ) => {
    setUnlockedIds((prev) => {
      const newSet = new Set(prev);
      if (newStatus) {
        newSet.add(achievementId);
      } else {
        newSet.delete(achievementId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <SpinningLoader />
      </motion.div>
    );
  }

  if (allApplicableAchievements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Nenhuma conquista encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Não há conquistas disponíveis para o idioma {language} no momento.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {teacherOnlyAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-lg w-full h-full"
        >
          <h1 className="text-xl font-bold text-gray-800 dark:text-white p-1 mb-3">
            Conquistas do aluno
          </h1>

          <div className="flex flex-col overflow-y-auto gap-5">
            <AnimatePresence>
              {teacherOnlyAchievements.map((achievement) => (
                <AchievementItem
                  key={achievement.id}
                  achievement={achievement}
                  studentId={studentId}
                  isUnlocked={unlockedIds.has(achievement.id)}
                  language={language}
                  onToggle={handleAchievementToggle}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeacherManagedAchievements;
