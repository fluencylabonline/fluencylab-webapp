// src/types.ts
export type GameLevel = 'easy' | 'medium' | 'hard';

export interface Game {
  id: string;
  title: string;
  audioUrl: string;
  words: string[]; // Sempre terá 12 palavras
  language: string;
  transcription: string;
}