"use client";

import React, { useState } from "react";
import { toggleTeacherManagedAchievement } from "../lib/firebase";
import { getAchievementDefinition } from "../lib/definitions";
import { Language } from "../types";
import toast from "react-hot-toast";

interface TeacherManagedAchievementProps {
  studentId: any;
  achievementId: string;
  initialStatus?: boolean;
  language: Language;
}

const TeacherManagedAchievement: React.FC<TeacherManagedAchievementProps> = ({
  studentId,
  achievementId,
  initialStatus = false,
  language
}) => {
  const [isUnlocked, setIsUnlocked] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  const achievement = getAchievementDefinition(achievementId);
  
  if (!achievement) {
    return <div className="text-red-500">Conquista não encontrada: {achievementId}</div>;
  }
  
  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newStatus = !isUnlocked;
      const success = await toggleTeacherManagedAchievement(
        studentId, 
        achievementId, 
        newStatus,
        language
      );
      
      if (success) {
        setIsUnlocked(newStatus);
      }
    } catch (error) {
      console.error("Erro ao atualizar conquista:", error);
      toast.error("Erro ao atualizar conquista.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`text-2xl ${isUnlocked ? 'text-green-500' : 'text-gray-400'}`}>
          {achievement.icon}
        </div>
        <div>
          <h3 className="font-medium">{achievement.name}</h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
      </div>
      
      <div>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isUnlocked 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isLoading 
            ? 'Atualizando...' 
            : isUnlocked 
              ? 'Remover' 
              : 'Conceder'}
        </button>
      </div>
    </div>
  );
};

export default TeacherManagedAchievement;
