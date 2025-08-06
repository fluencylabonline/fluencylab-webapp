// src/components/WordBank.tsx
'use client'
import { DraggableWord } from './DraggableWord';
import type { DraggableData } from 'react-draggable';

interface WordBankProps {
  words: string[];
  disabled: boolean;
  onWordDrop: (word: string, data: DraggableData) => void;
}

export const WordBank = ({ words, disabled, onWordDrop }: WordBankProps) => {
  if (disabled) return null;
  
  return (
    <div className="p-4 bg-fluency-gray-50 dark:bg-fluency-gray-900 border-2 border-dashed border-fluency-gray-300 dark:border-fluency-gray-600 rounded-lg mt-8">
      <p className="text-sm font-semibold text-fluency-gray-600 dark:text-fluency-gray-300 mb-4 text-center">Arraste palavras daqui</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {words.map(word => (
            <DraggableWord 
                key={word} 
                word={word} 
                onStop={onWordDrop} 
            />
        ))}
      </div>
    </div>
  );
};