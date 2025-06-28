// Tipos de idiomas suportados
export type Language = "english" | "spanish" | "libras" | "portuguese";

// Interface para testes de nivelamento
export interface PlacementTest {
  id: string;
  date: string;
  completed: boolean;
  totalScore: number;
  createdAt: number;
  abilitiesCompleted: {
    speaking?: boolean;
    vocabulary?: boolean;
    reading?: boolean;
    writing?: boolean;
    listening?: boolean;
    grammar?: boolean;
  };
  abilitiesScore: {
    speakingScore?: number;  // Changed from speaking
    vocabularyScore?: number;  // Changed from vocabulary
    readingScore?: number;  // Changed from reading
    writingScore?: number;  // Changed from writing
    listeningScore?: number;  // Changed from listening
    grammarScore?: number;  // Changed from grammar
  };
}

// src/app/achievements/types.ts

// Tipo para conquista combinada (com status de desbloqueio)
export interface CombinedAchievement extends Achievement {
  teacherManaged: any;
  progress: undefined;
  progressMax: undefined;
  unlocked: boolean;
  unlockedAt?: Date | null;
  language: Language; // Idioma específico desta instância
}

// Define a estrutura para o status de uma conquista para um aluno específico
export interface StudentAchievement {
  achievementId: string; // ID da definição da conquista
  unlocked: boolean; // Se o aluno desbloqueou esta conquista
  unlockedAt?: number; // Timestamp de quando foi desbloqueada (opcional)
  progress?: number; // Progresso atual para conquistas com etapas (opcional)
  progressMax?: number; // Valor máximo do progresso (opcional)
  language?: Language; // Idioma específico ao qual esta conquista se aplica (opcional)
}

interface LoginInfo {
  status: string;
  time: string | Date; // Can be either string or Date object
}

export interface Aluno {
  tasks: {};
  overdueClassesCount: number;
  doneClassesCount: number;
  Classes: any;
  id: string;
  name: string;
  email: string;
  number: string;
  userName: string;
  mensalidade: string;
  idioma: string[];
  professorId?: string;
  teacherEmails: string[];
  chooseProfessor: string;
  diaAula?: string[];
  horario?: string[];
  profilePicUrl?: string;
  frequencia: number;
  achievements?: StudentAchievement[];
  
  // NEW FIELD: Single Placement object
  Placement?: {
    abilitiesScore: {
      speakingScore?: number;
      vocabularyScore?: number;
      readingScore?: number;
      writingScore?: number;
      listeningScore?: number;
      grammarScore?: number;
    };
  };
  
  // Campos adicionados com base na lógica de 'definitions.ts'
  lastLoginDates?: LoginInfo[]; // Optional array of login info
  quizzes?: number;
  placementTests?: PlacementTest[];
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  number: string;
}

// Define a estrutura para uma definição de conquista
export interface AchievementDefinition {
  id: string; // Identificador único (ex: 'primeira_aula', 'dez_aulas')
  name: string; // Nome da conquista (ex: "Primeira Aula Concluída")
  description: string; // Descrição do que é necessário para desbloquear
  icon: string; // Nome ou caminho para um ícone (pode ser um componente React ou URL)
  languages: Language[]; // Idiomas aos quais esta conquista se aplica
  criteria: (aluno: Aluno) => boolean | Promise<boolean>; // Critério pode ser síncrono ou assíncrono
  teacherManaged?: boolean; // Indica se esta conquista é gerenciada pelo professor
}

// Interface para notebooks (aulas concluídas)
export interface Notebook {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  studentName: string;
  student: string;
  content: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  languages: Language[];
  category?: "progresso" | "habilidades" | "social"; // Categoria da conquista
  difficulty?: "facil" | "medio" | "dificil"; // Nível de dificuldade
  criteria: {
    type: "aulas_concluidas" | "streak" | "quiz" | "perfil" | "habilidade";
    threshold?: number;
    skill?:
      | "speaking"
      | "vocabulary"
      | "reading"
      | "writing"
      | "listening"
      | "grammar";
    level?: "iniciante" | "intermediario" | "avancado";
  };
  xpReward?: number; // Experiência concedida ao desbloquear
  isSecret?: boolean; // Se a conquista é oculta até ser desbloqueada
}