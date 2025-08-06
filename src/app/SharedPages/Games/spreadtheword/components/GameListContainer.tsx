'use client'
import { useState } from 'react';
import { Game } from '../types';
import { Search, PlusCircle } from 'lucide-react';
import { CreateGameModal } from './CreateGameModal';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

interface GameListContainerProps {
  games: Game[];
  selectedGameId?: string;
  loading: boolean;
  onSelectGame: (game: Game) => void;
  onSearch: (query: string) => void;
  onGameCreated: () => void;
}

export const GameListContainer = (props: GameListContainerProps) => {
  const { games, selectedGameId, loading, onSelectGame, onSearch, onGameCreated } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  const handleGameCreated = () => {
    onGameCreated();
    setIsModalOpen(false);
    toast.success('Jogo criado com sucesso!');
  };

  return (
    <div className="w-full rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 shadow-md">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Procurar..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-md focus:ring-2 focus:ring-fluency-blue-500 focus:border-fluency-blue-500 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-gray-800 dark:text-fluency-gray-100"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fluency-gray-400 dark:text-fluency-gray-500" />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {loading && (
          <p className="text-fluency-gray-500 dark:text-fluency-gray-400 p-2">
            Carregando...
          </p>
        )}
        {!loading && games.length === 0 && (
          <p className="text-fluency-gray-500 dark:text-fluency-gray-400 p-2">
            Nenhum jogo encontrado
          </p>
        )}
        {!loading && games.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={`w-full text-left p-3 rounded-md transition-colors ${
              selectedGameId === game.id
                ? 'bg-fluency-blue-600 text-white font-semibold'
                : 'bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700'
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>

      {session?.user.role === 'teacher' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-fluency-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-fluency-green-700 transition-colors"
        >
          <PlusCircle size={20} />
          Criar Novo Jogo
        </button>
      )}

      <CreateGameModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGameCreated={handleGameCreated}
      />
    </div>
  );
};