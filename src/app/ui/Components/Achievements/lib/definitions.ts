// src/app/achievements/lib/definitions.ts
import { AchievementDefinition, Aluno, Language } from "../types";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { ref, getDownloadURL } from "firebase/storage";

// Função auxiliar para verificar se o aluno tem notebooks (aulas concluídas)
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

// Função auxiliar para verificar se o aluno tem foto de perfil
const hasProfilePicture = async (alunoId: string): Promise<boolean> => {
  try {
    const profilePictureRef = ref(storage, `profilePictures/${alunoId}`);
    await getDownloadURL(profilePictureRef);
    return true;
  } catch (error) {
    return false;
  }
};

// Updated Brazil time conversion that properly handles all cases
const toBrazilTime = (utcDate: Date): Date => {
  // Create a copy of the original date to avoid mutation
  const dateCopy = new Date(utcDate);

  // Get the UTC hours and subtract 3 for BRT (UTC-3)
  const utcHours = dateCopy.getUTCHours();
  dateCopy.setUTCHours(utcHours - 3);

  return dateCopy;
};

/**
 * Checks if the student had activity on weekends (Saturday or Sunday) in Brazil time
 * @param aluno Student object
 * @returns True if weekend activity exists
 */

const hasWeekendActivity = (aluno: Aluno): boolean => {
  if (!Array.isArray(aluno.lastLoginDates)) return false;

  return aluno.lastLoginDates.some((loginInfo) => {
    if (!loginInfo || typeof loginInfo !== "object") return false;

    try {
      // Convert to Date object if needed
      const utcDate =
        typeof loginInfo.time === "string"
          ? new Date(loginInfo.time)
          : loginInfo.time;

      // Validate date
      if (isNaN(utcDate.getTime())) return false;

      // Convert to Brazil time
      const brazilDate = toBrazilTime(utcDate);
      const day = brazilDate.getDay();
      return day === 0 || day === 6; // Sunday (0) or Saturday (6)
    } catch (error) {
      console.error("Invalid date format:", loginInfo.time);
      return false;
    }
  });
};

/**
 * Checks if the student had activity during night hours (10 PM to 5 AM) in Brazil time
 * @param aluno Student object
 * @returns True if night activity exists
 */

const hasNightActivity = (aluno: Aluno): boolean => {
  if (!Array.isArray(aluno.lastLoginDates)) return false;

  return aluno.lastLoginDates.some((loginInfo) => {
    if (!loginInfo || typeof loginInfo !== "object") return false;

    try {
      // Convert to Date object if needed
      const utcDate =
        typeof loginInfo.time === "string"
          ? new Date(loginInfo.time)
          : loginInfo.time;

      // Validate date
      if (isNaN(utcDate.getTime())) return false;

      // Convert to Brazil time (BRT = UTC-3)
      const brazilDate = new Date(utcDate);
      brazilDate.setHours(brazilDate.getUTCHours() - 3);

      // Get hours in Brazil time (0-23)
      const hours = brazilDate.getUTCHours();

      // Night hours: 10 PM (22) to 5 AM (5) inclusive
      return hours >= 22 || hours <= 5;
    } catch (error) {
      console.error("Invalid date format:", loginInfo.time);
      return false;
    }
  });
};

// Função auxiliar para verificar a frequência do aluno
const hasPerfectAttendance = (aluno: Aluno): boolean => {
  const classes = aluno.Classes;
  if (!classes) return false;

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

  if (totalAulas === 0) return false;

  const frequencia = (aulasFeitas / totalAulas) * 100;
  return frequencia >= 95;
};

// Conquista de múltiplos idiomas
const getIdiomasCount = (idioma: string | string[]): number => {
  if (Array.isArray(idioma)) return idioma.length;
  if (typeof idioma === "string") return 1;
  return 0;
};

// Adicionar esta função no início do arquivo
const getPlacementData = async (alunoId: string): Promise<any> => {
  try {
    const placementRef = collection(db, `users/${alunoId}/Placement`);
    const snapshot = await getDocs(placementRef);

    if (snapshot.empty) return null;

    // Assume que há apenas um documento de Placement por aluno
    const placementDoc = snapshot.docs[0].data();
    return placementDoc;
  } catch (error) {
    console.error("Erro ao buscar Placement:", error);
    return null;
  }
};

// Função para mapear os idiomas do aluno para o tipo Language
const mapLanguage = (idioma: string): Language => {
  // Usando os valores exatos como são salvos no banco
  switch (idioma) {
    case "Ingles":
      return "english";
    case "Espanhol":
      return "spanish";
    case "Libras":
      return "libras";
    case "Portugues":
      return "portuguese";
    default:
      // Caso não reconheça, retorna o padrão
      return "english";
  }
};

// Definições de conquistas
export const achievementDefinitions: AchievementDefinition[] = [
  // Conquistas de aulas concluídas
  {
    id: "primeira_aula_concluida",
    name: "Primeira Aula Concluída!",
    description: "Parabéns por concluir sua primeira aula.",
    icon: "🎓",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: async (aluno: Aluno) => {
      const notebookCount = await getNotebookCount(aluno.id);
      return notebookCount >= 1;
    },
  },
  {
    id: "cinco_aulas_concluidas",
    name: "Cinco Aulas na Conta!",
    description: "Você já concluiu 5 aulas. Continue assim!",
    icon: "🌟",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: async (aluno: Aluno) => {
      const notebookCount = await getNotebookCount(aluno.id);
      return notebookCount >= 5;
    },
  },
  {
    id: "dez_aulas_concluidas",
    name: "Maratona de 10 Aulas!",
    description: "Incrível! 10 aulas concluídas.",
    icon: "🚀",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: async (aluno: Aluno) => {
      const notebookCount = await getNotebookCount(aluno.id);
      return notebookCount >= 10;
    },
  },

  {
    id: "frequencia_perfeita_mes",
    name: "Frequência Perfeita (Mês)",
    description: "Você não perdeu nenhuma aula este mês.",
    icon: "📅",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => hasPerfectAttendance(aluno),
  },

  {
    id: "explorador_de_idiomas",
    name: "Explorador de Idiomas",
    description: "Você está aprendendo mais de um idioma!",
    icon: "🌍",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => getIdiomasCount(aluno.idioma) > 1,
  },

  // Conquista gerenciada pelo professor
  {
    id: "aprendeu_verbo_be",
    name: "Dominou o Verbo 'To Be'",
    description: "Você aprendeu o temido verbo 'to be' e suas aplicações!",
    icon: "📝",
    languages: ["english"],
    criteria: (aluno: Aluno) => false, // Sempre falso, pois é gerenciado pelo professor
    teacherManaged: true,
  },

  // Conquista de foto de perfil
  {
    id: "fotogenico",
    name: "Fotogênico",
    description: "Você personalizou seu perfil com uma foto!",
    icon: "📸",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: async (aluno: Aluno) => {
      return await hasProfilePicture(aluno.id);
    },
  },

  // Conquista de estudo no fim de semana
  {
    id: "nao_para_nem_no_fim_de_semana",
    name: "Não Para Nem no Fim de Semana",
    description: "Você estudou durante um fim de semana. Dedicação total!",
    icon: "🏆",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => hasWeekendActivity(aluno),
  },

  // Conquista de estudo noturno
  {
    id: "corujao_da_fluency",
    name: "Corujão da Fluency",
    description: "Você estudou durante a madrugada. Conhecimento não tem hora!",
    icon: "🦉",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => hasNightActivity(aluno),
  },

  // Conquistas de Quiz
  {
    id: "quiz_iniciante",
    name: "Quiz Iniciante",
    description: "Você completou seu primeiro quiz!",
    icon: "❓",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => (aluno.quizzes || 0) >= 1,
  },
  {
    id: "quiz_aprendiz",
    name: "Quiz Aprendiz",
    description: "Você já completou 5 quizzes!",
    icon: "❔",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => (aluno.quizzes || 0) >= 5,
  },
  {
    id: "quiz_mestre",
    name: "Quiz Mestre",
    description: "Você já completou 10 quizzes. Impressionante!",
    icon: "🧩",
    languages: ["english", "spanish", "libras", "portuguese"],
    criteria: (aluno: Aluno) => (aluno.quizzes || 0) >= 10,
  },

  // Conquistas baseadas em habilidades do nivelamento - Inglês
    {
    id: "speaking_iniciante",
    name: "Orador Iniciante",
    description: "Você demonstrou suas primeiras habilidades de fala em inglês!",
    icon: "🗣️",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.speakingScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "speaking_intermediario",
    name: "Orador Intermediário",
    description: "Sua habilidade de fala em inglês está se desenvolvendo bem!",
    icon: "🎤",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.speakingScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "speaking_avancado",
    name: "Orador Avançado",
    description: "Sua habilidade de fala em inglês está em nível avançado!",
    icon: "🎙️",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.speakingScore;
      return score != null && score >= 85;
    },
  },

  // Conquistas de vocabulário
  {
    id: "vocabulary_iniciante",
    name: "Vocabulário Iniciante",
    description: "Você está expandindo seu vocabulário em inglês!",
    icon: "📚",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.vocabularyScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "vocabulary_intermediario",
    name: "Vocabulário Intermediário",
    description: "Seu vocabulário em inglês está crescendo rapidamente!",
    icon: "📖",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.vocabularyScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "vocabulary_avancado",
    name: "Vocabulário Avançado",
    description: "Seu vocabulário em inglês está em nível avançado!",
    icon: "📕",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.vocabularyScore;
      return score != null && score >= 85;
    },
  },

  // Conquistas de leitura
  {
    id: "reading_iniciante",
    name: "Leitor Iniciante",
    description: "Você está desenvolvendo suas habilidades de leitura em inglês!",
    icon: "👓",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.readingScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "reading_intermediario",
    name: "Leitor Intermediário",
    description: "Sua habilidade de leitura em inglês está se desenvolvendo bem!",
    icon: "📰",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.readingScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "reading_avancado",
    name: "Leitor Avançado",
    description: "Sua habilidade de leitura em inglês está em nível avançado!",
    icon: "📑",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.readingScore;
      return score != null && score >= 85;
    },
  },

  // Conquistas de escrita
  {
    id: "writing_iniciante",
    name: "Escritor Iniciante",
    description: "Você está desenvolvendo suas habilidades de escrita em inglês!",
    icon: "✏️",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.writingScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "writing_intermediario",
    name: "Escritor Intermediário",
    description: "Sua habilidade de escrita em inglês está se desenvolvendo bem!",
    icon: "📝",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.writingScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "writing_avancado",
    name: "Escritor Avançado",
    description: "Sua habilidade de escrita em inglês está em nível avançado!",
    icon: "📄",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.writingScore;
      return score != null && score >= 85;
    },
  },

  // Conquistas de compreensão auditiva
  {
    id: "listening_iniciante",
    name: "Ouvinte Iniciante",
    description: "Você está desenvolvendo suas habilidades de compreensão auditiva em inglês!",
    icon: "👂",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.listeningScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "listening_intermediario",
    name: "Ouvinte Intermediário",
    description: "Sua habilidade de compreensão auditiva em inglês está se desenvolvendo bem!",
    icon: "🎧",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.listeningScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "listening_avancado",
    name: "Ouvinte Avançado",
    description: "Sua habilidade de compreensão auditiva em inglês está em nível avançado!",
    icon: "🎵",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.listeningScore;
      return score != null && score >= 85;
    },
  },

  // Conquistas de gramática
  {
    id: "grammar_iniciante",
    name: "Gramática Iniciante",
    description: "Você está desenvolvendo suas habilidades gramaticais em inglês!",
    icon: "📏",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.grammarScore;
      return score != null && score >= 30;
    },
  },
  {
    id: "grammar_intermediario",
    name: "Gramática Intermediária",
    description: "Sua habilidade gramatical em inglês está se desenvolvendo bem!",
    icon: "📐",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.grammarScore;
      return score != null && score >= 60;
    },
  },
  {
    id: "grammar_avancado",
    name: "Gramática Avançada",
    description: "Sua habilidade gramatical em inglês está em nível avançado!",
    icon: "📊",
    languages: ["english"],
    criteria: async (aluno: Aluno) => {
      const placement = await getPlacementData(aluno.id);
      if (!placement || !placement.abilitiesScore) return false;
      const score = placement.abilitiesScore.grammarScore;
      return score != null && score >= 85;
    },
  },
];

// Função para obter uma definição de conquista específica por ID
export const getAchievementDefinition = (
  id: string
): AchievementDefinition | undefined => {
  return achievementDefinitions.find((def) => def.id === id);
};

// Função para filtrar conquistas por idioma
export const getAchievementsByLanguage = (
  language: Language
): AchievementDefinition[] => {
  return achievementDefinitions.filter((def) =>
    def.languages.includes(language)
  );
};

// Função para obter todas as conquistas aplicáveis a um aluno com base em seus idiomas
export const getApplicableAchievements = (
  aluno: Aluno
): AchievementDefinition[] => {
  if (!aluno.idioma || aluno.idioma.length === 0) {
    return [];
  }

  // Mapear os idiomas do aluno para o tipo Language usando os valores corretos
  const languages: Language[] = Array.isArray(aluno.idioma)
    ? aluno.idioma.map((idioma) => mapLanguage(idioma))
    : [mapLanguage(aluno.idioma as string)];

  console.log("Idiomas mapeados:", languages);

  // Filtrar conquistas que se aplicam a pelo menos um dos idiomas do aluno
  return achievementDefinitions.filter((def) =>
    def.languages.some((lang) => languages.includes(lang))
  );
};
