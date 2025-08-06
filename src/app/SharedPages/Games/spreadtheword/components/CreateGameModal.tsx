'use client'
import { useState, FormEvent } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import type { GameLevel } from "../types";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

const levelWordCount: Record<GameLevel, number> = {
  easy: 4,
  medium: 7,
  hard: 10,
};

export const CreateGameModal = ({ isOpen, onClose, onGameCreated }: ModalProps) => {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [words, setWords] = useState('');
  const [language, setLanguage] = useState('pt-BR');
  const [transcription, setTranscription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const requiredWordCount = 12;

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const wordList = words.split(',').map(w => w.trim()).filter(Boolean);
    if (!audioFile || wordList.length === 0 || !title) {
      setError('Título, arquivo de áudio e palavras são obrigatórios.');
      return;
    }
    if (wordList.length !== requiredWordCount) {
      setError(`Você deve fornecer exatamente ${requiredWordCount} palavras.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload audio file
      const audioRef = ref(storage, `audio/${Date.now()}_${audioFile.name}`);
      const snapshot = await uploadBytes(audioRef, audioFile);
      const audioUrl = await getDownloadURL(snapshot.ref);

      // Add game data to Firestore
      await addDoc(collection(db, 'games'), {
        title,
        audioUrl,
        words: wordList,
        language,
        transcription,
        createdBy: session?.user?.id,
        createdAt: new Date(),
      });

      toast.success('Jogo criado com sucesso!');
      onGameCreated();
      onClose();
    } catch (err) {
      console.error("Error creating game:", err);
      toast.error('Falha ao criar o jogo.');
      setError('Falha ao criar o jogo. Verifique o console para detalhes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-fluency-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-fluency-gray-800 dark:text-fluency-gray-100">Criar Novo Jogo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300"
            >
              Título do Jogo
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-gray-800 dark:text-fluency-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="audio"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300"
            >
              Arquivo de Áudio (.mp3, .wav)
            </label>
            <input
              type="file"
              id="audio"
              accept="audio/*"
              onChange={(e) =>
                setAudioFile(e.target.files ? e.target.files[0] : null)
              }
              required
              className="mt-1 block w-full text-sm text-fluency-gray-500 dark:text-fluency-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-fluency-blue-100 dark:file:bg-fluency-blue-900 file:text-fluency-blue-700 dark:file:text-fluency-blue-200 hover:file:bg-fluency-blue-200 dark:hover:file:bg-fluency-blue-800"
            />
          </div>
          <div className="mt-1">
            <label htmlFor="words" className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300">
              Palavras (separadas por vírgula)
            </label>
            <textarea 
              id="words" 
              value={words} 
              onChange={(e) => setWords(e.target.value)} 
              rows={4} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-gray-800 dark:text-fluency-gray-100" 
              placeholder="ex: casa, carro, árvore..."
            ></textarea>
            <p className="text-xs text-fluency-gray-500 dark:text-fluency-gray-400 mt-1">
              Forneça exatamente <strong>{requiredWordCount} palavras</strong>.
            </p>
          </div>
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300"
            >
              Idioma
            </label>
            <input
              type="text"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-gray-800 dark:text-fluency-gray-100"
            />
          </div>
          <div>
            <label
              htmlFor="transcription"
              className="block text-sm font-medium text-fluency-gray-700 dark:text-fluency-gray-300"
            >
              Transcrição Completa (Opcional)
            </label>
            <textarea
              id="transcription"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-gray-800 dark:text-fluency-gray-100"
            ></textarea>
          </div>
          {error && (
            <p className="text-fluency-red-600 dark:text-fluency-red-400 bg-fluency-red-100 dark:bg-fluency-red-900 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-fluency-gray-200 dark:bg-fluency-gray-700 text-fluency-gray-800 dark:text-fluency-gray-100 rounded-md hover:bg-fluency-gray-300 dark:hover:bg-fluency-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-4 py-2 bg-fluency-blue-600 text-white rounded-md hover:bg-fluency-blue-700 disabled:bg-fluency-gray-400 dark:disabled:bg-fluency-gray-600 transition-colors"
            >
              {isSubmitting ? 'Criando...' : 'Criar Jogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};