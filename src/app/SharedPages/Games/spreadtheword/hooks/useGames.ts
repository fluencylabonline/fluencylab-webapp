// src/hooks/useGames.ts
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/app/firebase';
import type { Game } from '../types';

export const useGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gamesCollection = collection(db, 'games');
      const q = query(gamesCollection, orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const gamesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Game[];
      setGames(gamesData);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refetchGames: fetchGames };
};