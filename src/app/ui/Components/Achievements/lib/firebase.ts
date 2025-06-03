// src/app/achievements/lib/firebase.ts
import { db } from "@/app/firebase"; // Assuming firebase is initialized here
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { StudentAchievement, Language, Aluno } from "../types";
import { getApplicableAchievements } from "./definitions";
import toast from "react-hot-toast";

const ACHIEVEMENTS_COLLECTION = "student_achievements";
const TEACHER_MANAGED_COLLECTION = "teacher_managed_achievements";

// Function to get a student's achievements from Firestore
export const getStudentAchievements = async (
  studentId: string
): Promise<StudentAchievement[]> => {
  try {
    const docRef = doc(db, ACHIEVEMENTS_COLLECTION, studentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Ensure data format matches StudentAchievement[]
      const data = docSnap.data();
      // Assuming achievements are stored in a field, e.g., 'achievementsList'
      return data.achievementsList || [];
    } else {
      // No specific achievement document for this student yet, return empty array
      console.log(`No achievement document found for student ${studentId}.`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching student achievements:", error);
    throw new Error("Failed to fetch achievements.");
  }
};

// Function to get teacher-managed achievements for a student
export const getTeacherManagedAchievements = async (
  studentId: string
): Promise<StudentAchievement[]> => {
  try {
    const achievementsRef = collection(db, TEACHER_MANAGED_COLLECTION);
    const q = query(achievementsRef, where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);

    const achievements: StudentAchievement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      achievements.push({
        achievementId: data.achievementId,
        unlocked: data.unlocked || false,
        unlockedAt: data.unlockedAt || undefined, // Change from null to undefined
        language: data.language || undefined, // Also change this if needed
      });
    });

    return achievements;
  } catch (error) {
    console.error("Error fetching teacher-managed achievements:", error);
    return [];
  }
};

// Function to toggle a teacher-managed achievement for a student
export const toggleTeacherManagedAchievement = async (
  studentId: string,
  achievementId: string,
  unlocked: boolean,
  language: Language
): Promise<boolean> => {
  try {
    const achievementsRef = collection(db, TEACHER_MANAGED_COLLECTION);
    const q = query(
      achievementsRef,
      where("studentId", "==", studentId),
      where("achievementId", "==", achievementId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update existing record
      const docRef = doc(
        db,
        TEACHER_MANAGED_COLLECTION,
        querySnapshot.docs[0].id
      );
      await updateDoc(docRef, {
        unlocked,
        unlockedAt: unlocked ? Timestamp.now().toMillis() : undefined, // Change from null
      });
    } else {
      // Create new record
      await addDoc(collection(db, TEACHER_MANAGED_COLLECTION), {
        studentId,
        achievementId,
        unlocked,
        unlockedAt: unlocked ? Timestamp.now().toMillis() : undefined, // Change from null
        language,
      });
    }

    // Notify success
    toast.success(
      unlocked
        ? "Conquista desbloqueada para o aluno!"
        : "Conquista removida do aluno."
    );

    return true;
  } catch (error) {
    console.error("Error toggling teacher-managed achievement:", error);
    toast.error("Erro ao atualizar conquista.");
    return false;
  }
};
// Improved checkAndUpdateAchievements function
export const checkAndUpdateAchievements = async (
  aluno: Aluno
): Promise<StudentAchievement[]> => {
  if (!aluno || !aluno.id) {
    console.error("Invalid Aluno data provided.");
    return [];
  }

  const studentId = aluno.id;
  let currentAchievements = await getStudentAchievements(studentId);

  // Obter conquistas gerenciadas pelo professor
  const teacherManagedAchievements = await getTeacherManagedAchievements(
    studentId
  );

  // Mesclar as conquistas gerenciadas pelo professor com as conquistas normais
  teacherManagedAchievements.forEach((teacherAchievement) => {
    const existingIndex = currentAchievements.findIndex(
      (a) => a.achievementId === teacherAchievement.achievementId
    );

    if (existingIndex >= 0) {
      currentAchievements[existingIndex] = teacherAchievement;
    } else {
      currentAchievements.push(teacherAchievement);
    }
  });

  let updated = false;
  const updatedAchievements = [...currentAchievements];

  // Obter apenas as conquistas aplicáveis aos idiomas do aluno
  const applicableAchievements = getApplicableAchievements(aluno);
  const existingAchievementIds = new Set(
    updatedAchievements.map((a) => a.achievementId)
  );

  // Verificar cada conquista aplicável
  for (const definition of applicableAchievements) {
    const existingAchievement = updatedAchievements.find(
      (ach) => ach.achievementId === definition.id
    );

    // Determinar o idioma da conquista (se aplicável a apenas um idioma)
    let language: Language | undefined = undefined;
    if (definition.languages.length === 1) {
      language = definition.languages[0];
    }

    // Se a conquista não existe, criar entrada como bloqueada
    if (!existingAchievement) {
      updatedAchievements.push({
        achievementId: definition.id,
        unlocked: false,
        unlockedAt: undefined,
        language,
      });
      updated = true;
      console.log(
        `Added locked achievement for student ${studentId}: ${definition.name}`
      );
    }

    // Pular conquistas gerenciadas pelo professor para verificação automática
    if (definition.teacherManaged) continue;

    // Verificar se pode desbloquear conquistas não desbloqueadas
    if (!existingAchievement?.unlocked) {
      try {
        const meetsCondition = await Promise.resolve(
          definition.criteria(aluno)
        );

        if (meetsCondition) {
          const now = Timestamp.now();
          const targetAchievement =
            existingAchievement ||
            updatedAchievements.find((a) => a.achievementId === definition.id);

          if (targetAchievement) {
            targetAchievement.unlocked = true;
            targetAchievement.unlockedAt = now.toMillis();
            if (language) targetAchievement.language = language;
            updated = true;
            console.log(
              `Achievement unlocked for student ${studentId}: ${definition.name}`
            );
            toast.success(`Conquista desbloqueada: ${definition.name}!`);
          }
        }
      } catch (error) {
        console.error(
          `Error checking criteria for achievement ${definition.id}:`,
          error
        );
      }
    }
  }

  // If any achievement was updated or added, save back to Firestore
  if (updated) {
    try {
      const sanitizedAchievements = updatedAchievements.map((achievement) => {
        const sanitized: any = {
          achievementId: achievement.achievementId,
          unlocked: achievement.unlocked,
        };
        if (
          achievement.unlockedAt !== undefined &&
          achievement.unlockedAt !== null
        ) {
          sanitized.unlockedAt = achievement.unlockedAt;
        }
        if (
          achievement.language !== undefined &&
          achievement.language !== null
        ) {
          sanitized.language = achievement.language;
        }
        if (achievement.progress !== undefined)
          sanitized.progress = achievement.progress;
        if (achievement.progressMax !== undefined)
          sanitized.progressMax = achievement.progressMax;
        return sanitized;
      });

      const docRef = doc(db, ACHIEVEMENTS_COLLECTION, studentId);
      await setDoc(
        docRef,
        { achievementsList: sanitizedAchievements },
        { merge: true }
      );

      console.log(
        `Achievements updated successfully for student ${studentId}.`
      );
      return sanitizedAchievements;
    } catch (error) {
      console.error("Error updating student achievements in Firestore:", error);
      throw new Error("Failed to update achievements.");
    }
  }

  return updatedAchievements;
};
