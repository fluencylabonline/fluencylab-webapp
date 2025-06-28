// src/app/achievements/hooks/useAchievements.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { StudentAchievement, Aluno } from "../types";
import { checkAndUpdateAchievements } from "../lib/firebase";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import toast from "react-hot-toast";

interface UseAchievementsResult {
  achievements: StudentAchievement[];
  loading: boolean;
  error: Error | null;
  refreshAchievements: (alunoData: Aluno) => Promise<void>;
}

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

export const useAchievements = (): UseAchievementsResult => {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const studentId = session?.user?.id; // Assuming student ID is stored in session.user.id

  // Function to fetch and potentially update achievements
  const fetchAndCheckAchievements = useCallback(
    async (alunoData: Aluno | null) => {
      if (!alunoData || !alunoData.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Buscar dados de Placement e injetar no objeto Aluno
        const rawPlacementData = await fetchPlacementData(alunoData.id);
        
        // Criar uma cópia do objeto Aluno com os dados de Placement formatados
        const alunoWithPlacement = {
          ...alunoData,
          Placement: rawPlacementData ? {
            abilitiesScore: {
              speakingScore: rawPlacementData.speakingScore,
              vocabularyScore: rawPlacementData.vocabularyScore,
              readingScore: rawPlacementData.readingScore,
              writingScore: rawPlacementData.writingScore,
              listeningScore: rawPlacementData.listeningScore,
              grammarScore: rawPlacementData.grammarScore,
            }
          } : undefined
        };
        
        console.log("Dados de Placement injetados:", rawPlacementData);
        
        // Check criteria and update if necessary, then fetch the latest list
        const updatedAchievements = await checkAndUpdateAchievements(alunoWithPlacement);
        setAchievements(updatedAchievements);
      } catch (err) {
        console.error("Error in fetchAndCheckAchievements:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load achievements")
        );
        toast.error("Erro ao carregar suas conquistas.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial fetch and listener setup
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      // Maybe set an error or specific state if user is not logged in
      return;
    }

    setLoading(true);
    // Listener for real-time updates on the student's data
    const studentDocRef = doc(db, "users", studentId);

    const unsubscribeStudent = onSnapshot(
      studentDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const alunoData = { id: docSnap.id, ...docSnap.data() } as Aluno;
          // When student data changes, re-evaluate achievements
          await fetchAndCheckAchievements(alunoData);
        } else {
          console.warn(`User document ${studentId} not found.`);
          setError(new Error("Dados do aluno não encontrados."));
          setAchievements([]); // Clear achievements if student data is gone
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to student data:", err);
        setError(err);
        toast.error("Erro ao sincronizar dados do aluno.");
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      unsubscribeStudent();
    };
  }, [studentId, fetchAndCheckAchievements]);

  // Manual refresh function (optional, if needed outside of real-time updates)
  const refreshAchievements = useCallback(
    async (alunoData: Aluno) => {
      await fetchAndCheckAchievements(alunoData);
    },
    [fetchAndCheckAchievements]
  );

  return { achievements, loading, error, refreshAchievements };
};
