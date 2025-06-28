export interface Workbook {
  id: string;
  title: string;
  level: 'Primeiros Passos' | 'Essencial' | 'Mergulho' | 'Avançado' | 'Específicos';
  coverURL: string;
  guidelines?: string;
};

export interface ClassDate {
  date: Date;
  status: string;
}

export interface Notebook {
  title: string;
  content: string;
  unit: string;
  language: string;
  workbook: string;
  docID: string;
}

export type OrganizedNotebooks = {
  [language: string]: {
    [workbook: string]: Notebook[];
  };
};

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
  classDatesWithStatus: { date: Date; status: string }[];
}

// Used in everything related to the students' calendar
export const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export interface TimeSlot {
  id: string;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceEndDate?: string;
}

export interface ReschedulingRules {
  minAdvanceHours: number;
  maxReschedulesPerWeek: number;
  maxReschedulesPerMonth: number;
}

export type RescheduledClass = {
  id?: any;
  studentId?: string;
  professorId?: string;
  studentName?: string;
  originalDate: string; // Or Timestamp
  originalTime?: any;
  newDate: string; // Or Timestamp
  newTime: string;
  status: 'pending' | 'confirmed' | 'cancelled_by_student' | 'cancelled_by_teacher';
  createdAt: any; // Firestore Timestamp or Date
  requestedAtts?: string[];  // Tornar opcional
}

