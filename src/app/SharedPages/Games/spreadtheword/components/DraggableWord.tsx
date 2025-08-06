// src/components/DraggableWord.tsx
'use client'
import Draggable from 'react-draggable';
import type { DraggableEvent, DraggableData } from 'react-draggable';

interface DraggableWordProps {
  word: string;
  onStop: (word: string, data: DraggableData) => void;
}

export const DraggableWord = ({ word, onStop }: DraggableWordProps) => {
  
  const handleStop = (_e: DraggableEvent, data: DraggableData) => {
    onStop(word, data);
  };

  return (
    <Draggable onStop={handleStop} position={{ x: 0, y: 0 }}>
      <div className="text-white inline-block px-4 py-2 bg-amber-500 dark:bg-amber-900 border border-amber-400 dark:border-amber-700 rounded-md cursor-grab touch-none select-none shadow-sm">
        {word}
      </div>
    </Draggable>
  );
};