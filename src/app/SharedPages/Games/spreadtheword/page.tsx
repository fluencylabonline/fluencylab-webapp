'use client'
import { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';
import { GameListContainer } from './components/GameListContainer';
import { useGames } from './hooks/useGames';
import type { Game } from './types';

export default function SpreadTheWord() {
    const { games, loading, error, refetchGames } = useGames();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectGame = (game: Game) => {
        setSelectedGame(game);
    };

    useEffect(() => {
        // Select the first game by default if available
        if (games.length > 0 && !selectedGame) {
            setSelectedGame(games[0]);
        }
    }, [games, selectedGame]);

    useEffect(() => {
        // Filter games based on search query
        const lowercasedQuery = searchQuery.toLowerCase();
        const result = games.filter(game =>
            game.title.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredGames(result);
    }, [searchQuery, games]);

    return (
        <div className="text-slate-800 px-4">
            <div className="max-w-7xl mx-auto">

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Game */}
                    <div className="lg:col-span-2">
                        {loading && <p>Loading game...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && selectedGame ? (
                            <GameContainer key={selectedGame.id} game={selectedGame} />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md p-8">
                                <p className="text-slate-500">Select a game from the list to begin.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Game List & Search */}
                    <div className="lg:col-span-1 overflow-y-auto">
                        <GameListContainer
                            games={filteredGames}
                            selectedGameId={selectedGame?.id}
                            onSelectGame={handleSelectGame}
                            onSearch={setSearchQuery}
                            onGameCreated={refetchGames}
                            loading={loading}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}