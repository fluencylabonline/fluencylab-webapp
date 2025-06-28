"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StudentAchievement, Aluno } from "../types"; // Adjust import path as needed
import {
  getStudentAchievements,
  getTeacherManagedAchievements,
} from "../lib/firebase"; // Adjust import path as needed
import { getAchievementDefinition } from "../lib/definitions"; // Adjust import path as needed
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase"; // Adjust import path as needed
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UnlockedAchievementsDisplayProps {
  /** Maximum number of achievements to display. Defaults to 5 */
  maxDisplay?: number;
  /** Show only recent achievements (last N days). If not provided, shows all unlocked */
  recentDays?: number;
  /** Custom CSS classes for styling */
  className?: string;
  /** Show achievement descriptions */
  showDescriptions?: boolean;
  /** Show unlock dates */
  showDates?: boolean;
  /** Compact view (smaller display) */
  compact?: boolean;
  /** Show empty state when no achievements */
  showEmptyState?: boolean;
}

const UnlockedAchievementsDisplay: React.FC<
  UnlockedAchievementsDisplayProps
> = ({
  maxDisplay = 5,
  recentDays,
  className = "",
  showDescriptions = true,
  showDates = true,
  compact = false,
  showEmptyState = true,
}) => {
  const { data: session, status } = useSession();
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = session?.user?.id;

  useEffect(() => {
    const fetchUnlockedAchievements = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get student data to verify they exist
        const studentDocRef = doc(db, "users", studentId);
        const studentDocSnap = await getDoc(studentDocRef);

        if (!studentDocSnap.exists()) {
          setError("Dados do aluno não encontrados.");
          setLoading(false);
          return;
        }

        // Fetch regular achievements
        const regularAchievements = await getStudentAchievements(studentId);

        // Fetch teacher-managed achievements
        const teacherAchievements = await getTeacherManagedAchievements(
          studentId
        );

        // Merge achievements, prioritizing teacher-managed ones
        const mergedAchievements = [...regularAchievements];
        teacherAchievements.forEach((teacherAchievement) => {
          const existingIndex = mergedAchievements.findIndex(
            (a) => a.achievementId === teacherAchievement.achievementId
          );

          if (existingIndex >= 0) {
            mergedAchievements[existingIndex] = teacherAchievement;
          } else {
            mergedAchievements.push(teacherAchievement);
          }
        });

        // Filter only unlocked achievements
        let unlockedAchievements = mergedAchievements.filter(
          (achievement) => achievement.unlocked
        );

        // Filter by recent days if specified
        if (recentDays && recentDays > 0) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - recentDays);
          const cutoffTimestamp = cutoffDate.getTime();

          unlockedAchievements = unlockedAchievements.filter(
            (achievement) =>
              achievement.unlockedAt &&
              achievement.unlockedAt >= cutoffTimestamp
          );
        }

        // Sort by unlock date (most recent first)
        unlockedAchievements.sort((a, b) => {
          if (!a.unlockedAt && !b.unlockedAt) return 0;
          if (!a.unlockedAt) return 1;
          if (!b.unlockedAt) return -1;
          return b.unlockedAt - a.unlockedAt;
        });

        // Limit the number of achievements displayed
        const limitedAchievements = unlockedAchievements.slice(0, maxDisplay);

        setAchievements(limitedAchievements);
      } catch (err) {
        console.error("Error fetching unlocked achievements:", err);
        setError("Erro ao carregar conquistas desbloqueadas.");
      } finally {
        setLoading(false);
      }
    };

    if (status !== "loading") {
      fetchUnlockedAchievements();
    }
  }, [studentId, status, maxDisplay, recentDays]);

  // Don't render anything if user is not authenticated
  if (status === "loading") {
    return (
      <div
        className={`flex justify-center items-center ${
          compact ? "h-16" : "h-20"
        } ${className}`}
      >
        <div
          className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${
            compact ? "h-6 w-6" : "h-8 w-8"
          }`}
        ></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Don't show anything for unauthenticated users
  }

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center ${
          compact ? "h-16" : "h-20"
        } ${className}`}
      >
        <div
          className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${
            compact ? "h-6 w-6" : "h-8 w-8"
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 text-red-700 ${
          compact ? "px-2 py-1 text-sm" : "px-4 py-3"
        } rounded ${className}`}
      >
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (achievements.length === 0) {
    if (!showEmptyState) return null;

    return (
      <div
        className={`text-center ${
          compact ? "py-4 text-sm" : "py-6"
        } text-gray-500 ${className}`}
      >
        <p>
          {recentDays
            ? `Nenhuma conquista desbloqueada nos últimos ${recentDays} dias.`
            : "Nenhuma conquista desbloqueada ainda."}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? "2" : "3"} ${className}`}>
      {!compact && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {recentDays
            ? `Conquistas Recentes (${recentDays} dias)`
            : "Conquistas Desbloqueadas"}
        </h3>
      )}

      <div className={`space-y-${compact ? "2" : "3"}`}>
        {achievements.map((achievement) => {
          const definition = getAchievementDefinition(
            achievement.achievementId
          );

          if (!definition) {
            return null; // Skip if definition not found
          }

          const unlockedDate = achievement.unlockedAt
            ? format(
                new Date(achievement.unlockedAt),
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )
            : null;

          // Get language label
          let languageLabel = "";
          if (achievement.language) {
            switch (achievement.language) {
              case "english":
                languageLabel = "Inglês";
                break;
              case "spanish":
                languageLabel = "Espanhol";
                break;
              case "libras":
                languageLabel = "Libras";
                break;
              case "portuguese":
                languageLabel = "Português";
                break;
            }
          }

          return (
            <div
              key={achievement.achievementId}
              className={`
                bg-fluency-gray-100 dark:bg-fluency-green-900/20 border border-fluency-green-200 dark:border-fluency-green-800 
                rounded-lg transition-all duration-200 hover:shadow-md overflow-hidden
                ${compact ? "p-3" : "p-4"}
              `}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`
                  bg-fluency-green-100 dark:bg-fluency-green-800/50 text-fluency-green-600 dark:text-fluency-green-300 
                  rounded-full flex items-center justify-center flex-shrink-0
                  ${compact ? "w-10 h-10 text-lg" : "w-10 h-10 text-xl"}
                `}
                >
                  {definition.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between space-x-2">
                    <h4
                      className={`font-semibold text-green-800 truncate ${
                        compact ? "text-sm" : "text-base"
                      }`}
                    >
                      {definition.name}
                    </h4>
                    {languageLabel && (
                      <span
                        className={`bg-fluency-green-300 dark:bg-fluency-green-800 text-black dark:text-fluency-text-dark rounded-sm font-semibold ${
                          compact ? "px-2 py-0.5 text-xs" : "px-2 py-1 text-xs"
                        }`}
                      >
                        {languageLabel}
                      </span>
                    )}
                  </div>

                  {showDescriptions && !compact && (
                    <p className="text-sm text-green-700 mt-1">
                      {definition.description}
                    </p>
                  )}

                  {showDates && unlockedDate && (
                    <p
                      className={`text-gray-500 mt-1 ${
                        compact ? "text-xs" : "text-xs"
                      }`}
                    >
                      Desbloqueada em: {unlockedDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {achievements.length === maxDisplay && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Mostrando {maxDisplay} conquistas mais recentes
          </p>
        </div>
      )}
    </div>
  );
};

export default UnlockedAchievementsDisplay;

// // Example usage in different scenarios

// import UnlockedAchievementsDisplay from "@/components/UnlockedAchievementsDisplay"; // Adjust path

// // 1. Basic usage - shows all unlocked achievements (max 5)
// export const BasicExample = () => {
//   return (
//     <div>
//       <UnlockedAchievementsDisplay />
//     </div>
//   );
// };

// // 2. Dashboard widget - compact view with recent achievements
// export const DashboardWidget = () => {
//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <UnlockedAchievementsDisplay
//         maxDisplay={3}
//         recentDays={7}
//         compact={true}
//         showDescriptions={false}
//       />
//     </div>
//   );
// };

// // 3. Sidebar component - minimal space
// export const SidebarAchievements = () => {
//   return (
//     <div className="w-64">
//       <UnlockedAchievementsDisplay
//         maxDisplay={3}
//         compact={true}
//         showDescriptions={false}
//         showDates={false}
//         className="bg-gray-50 p-4 rounded"
//       />
//     </div>
//   );
// };

// // 4. Full page section - detailed view
// export const FullPageSection = () => {
//   return (
//     <section className="container mx-auto py-8">
//       <UnlockedAchievementsDisplay
//         maxDisplay={10}
//         showDescriptions={true}
//         showDates={true}
//         className="max-w-4xl mx-auto"
//       />
//     </section>
//   );
// };

// // 5. Recent achievements notification area
// export const RecentNotifications = () => {
//   return (
//     <div className="fixed top-4 right-4 w-80 z-50">
//       <UnlockedAchievementsDisplay
//         maxDisplay={2}
//         recentDays={1}
//         compact={true}
//         showEmptyState={false}
//         className="bg-white shadow-lg rounded-lg p-4"
//       />
//     </div>
//   );
// };

// // 6. Profile page achievements summary
// export const ProfileAchievements = () => {
//   return (
//     <div className="mt-6">
//       <h2 className="text-2xl font-bold mb-4">Minhas Conquistas</h2>
//       <UnlockedAchievementsDisplay
//         maxDisplay={6}
//         showDescriptions={true}
//         showDates={true}
//       />
//     </div>
//   );
// };

// // 7. Modal or popup with achievements
// export const AchievementsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Suas Conquistas</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>
//         <UnlockedAchievementsDisplay
//           maxDisplay={20}
//           showDescriptions={true}
//           showDates={true}
//         />
//       </div>
//     </div>
//   );
// };
