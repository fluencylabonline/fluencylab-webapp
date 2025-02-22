// src/app/u/placement/types.ts (or wherever you prefer)
export type QuestionType = 'mcq' | 'statement' | 'listening' | 'speaking' | 'true_false' | 'text';

export interface Question {
    id: string;
    difficulty: number;
    type: any; // Use the literal type here!
    question?: string;     // Make question optional as it might not be relevant for all types (e.g., speaking text)
    options?: string[];      // Make options optional as it's not for "text" or "speaking" type
    answer?: string;       // Make answer optional as it's not for "speaking" type
    text?: string;        // For reading and listening questions
    statement?: string;   // For true/false questions
    correctAnswer?: boolean; // For true/false questions
    referenceText?: string; // For speaking questions - the expected phrase
}