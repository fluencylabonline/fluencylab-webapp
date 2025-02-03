'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { IoToday } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MdDelete } from 'react-icons/md';

export default function ShowGames() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'VocabularyGame'), (snapshot) => {
      const gamesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGames(gamesList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching games:', error);
      toast.error('Erro ao carregar os jogos.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteGame = async (gameId: string) => {
    try {
      const gameRef = doc(db, 'VocabularyGame', gameId);
      await deleteDoc(gameRef);
      toast.success('Jogo deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Erro ao deletar o jogo.');
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Jogos disponíveis Single Player</h1>

      {loading ? (
        <p>Carregando jogos...</p>
      ) : (
        <div className="space-y-4 overflow-y-auto h-[50vh]">
          {games.map(game => (
            <div key={game.id} className="flex justify-between items-center p-4 border border-black dark:border-white rounded-lg hover:bg-fluency-blue-600 hover:border-fluency-blue-600 dark:hover:bg-fluency-blue-1100 dark:hover:border-fluency-blue-1100 duration-300 ease-in-out transition-all">
              <Link href={{ pathname: `vocabulary/${encodeURIComponent(game.name)}`, query: { aloneGameID: game.id } }} passHref>
                <div>
                  <h2 className="text-lg font-semibold">{game.name}</h2>
                  <p className="text-sm text-gray-900 dark:text-gray-400">Total de palavras: {game.vocabularies.length}</p>
                </div>
              </Link>
              {session?.user.role === 'admin' &&
              <div className="flex items-center gap-2">
                <MdDelete onClick={() => handleDeleteGame(game.id)} className="w-8 h-8 text-red-500 hover:text-red-600 duration-300 ease-in-out transition-all cursor-pointer" />
              </div>}

              <IoToday className='hidden w-8 h-8' />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
