'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase'; // Import your Firestore configuration
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react'; // Import useSession from next-auth/react
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { wordClues } from './wordClues';

const WhatAmI: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [word, setWord] = useState<string>('');
  const [clues, setClues] = useState<string[]>([]);
  const [currentClueIndex, setCurrentClueIndex] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [player1Id, setPlayer1Id] = useState<string | null>(null);
  const [player2Id, setPlayer2Id] = useState<string | null>(null);
  const [player1Name, setPlayer1Name] = useState<string | null>(null);
  const [player2Name, setPlayer2Name] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<{ playerId: string; guess: string }[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [guess, setGuess] = useState('');
  const [joinGameCode, setJoinGameCode] = useState('');
  const { data: session } = useSession(); // Get session data
  const userId = session?.user?.id || ''; // Get the user ID from session

  const isCurrentPlayer = currentPlayer === userId;
  const isDisabled = !isCurrentPlayer || winner !== null || guesses.length > 6;

  useEffect(() => {
    if (session) {
      setCurrentPlayer(session.user?.id);
    }

    const params = new URLSearchParams(window.location.search);
    const urlGameCode = params.get('gameCode');

    if (urlGameCode) {
      joinGame(urlGameCode);
      setGameId(urlGameCode);
    }
  }, [session]);

  const createGame = async () => {
    const id = generateGameId();
    setGameId(id);

    // Select a random word and clues
    const randomIndex = Math.floor(Math.random() * wordClues.length);
    const { word: exampleWord, clues: exampleClues } = wordClues[randomIndex];

    const playerName = session?.user?.name || 'Player 1';

    await setDoc(doc(db, 'games', id), {
      word: exampleWord,
      clues: exampleClues,
      currentTurn: 'player1', // Player 1 starts first
      player1Id: userId, // Set the current user as player 1
      player1Name: playerName, // Store player 1's name
      player2Id: null, // No player 2 yet
      player2Name: null, // No player 2 name yet
      guesses: [],
      currentClueIndex: 0,
      winner: null,
    });

    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast.success(`Jogo criado! O ID foi copiado para área de transferência: ${id}`);
      })
      .catch((err) => {
        console.error('Failed to copy game ID: ', err);
        toast.error('Failed to copy game ID.');
      });

    const url = new URL(window.location.href);
    url.searchParams.set('gameCode', id);
    window.history.replaceState(null, '', url.toString());
  };

  const joinGame = async (id: string) => {
    setGameId(id);
    const gameRef = doc(db, 'games', id);

    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setWord(data.word);
        setClues(data.clues);
        setCurrentClueIndex(data.currentClueIndex);
        setPlayer1Id(data.player1Id);
        setPlayer2Id(data.player2Id);
        setGuesses(data.guesses);
        setWinner(data.winner);
        setPlayer1Name(data.player1Name);
        setPlayer2Name(data.player2Name);

        // Update player2Id if it is not set
        if (!data.player2Id && data.player1Id !== userId) {
          const playerName = session?.user?.name || 'Player 2';
          updateDoc(gameRef, {
            player2Id: userId,
            player2Name: playerName,
          });
        }

        // Update current player
        setCurrentPlayer(data.currentTurn === 'player1' ? data.player1Id : data.player2Id);
      }
    });

    // Update the URL with the game code
    const url = new URL(window.location.href);
    url.searchParams.set('gameCode', id);
    window.history.replaceState(null, '', url.toString());

    return () => unsubscribe(); // Clean up listener on component unmount
  };

  const handleGuess = async () => {
    if (guess.trim() === '') {
      toast.error('Please enter a guess.');
      return;
    }
  
    if (gameId && currentPlayer) {
      const normalizedGuess = guess.toLowerCase(); // Convert the guess to lowercase
      const normalizedWord = word.toLowerCase();   // Convert the target word to lowercase
  
      const newGuess = { playerId: currentPlayer, guess: normalizedGuess };
      const nextClueIndex = (currentClueIndex + 1) % clues.length; // Move to the next clue or loop back to the first clue
  
      // Check if the guesses length exceeds 6 or if all clues have been used
      const isGameOver = guesses.length > 6 || (nextClueIndex === 0 && currentClueIndex === clues.length - 1);
  
      await updateDoc(doc(db, 'games', gameId), {
        guesses: [...guesses, newGuess],
        currentTurn: currentPlayer === player1Id ? 'player2' : 'player1',
        currentClueIndex: isGameOver ? currentClueIndex : nextClueIndex,
        ...(normalizedGuess === normalizedWord && { winner: currentPlayer }),
        ...(isGameOver && { winner: null }), // Set winner to null if game is over
      });
  
      if (normalizedGuess === normalizedWord) {
        setWinner(currentPlayer);
        toast.success(`${currentTurnPlayerName} guessed correctly!`);
      } else if (isGameOver) {
        setWinner(null);
        toast.error('Game over! Mais de 6 tentativas feitas.');
      } else {
        toast.error('Incorreto. Tente de novo.');
      }
      setGuess('');
    }
  };
  

  const handleJoinGame = () => {
    if (joinGameCode) {
      joinGame(joinGameCode);
    } else {
      toast.error('Por favor, coloque um ID.');
    }
  };

  const handleStartNewGame = async () => {
    // Reset game state
    setWinner(null);
    setGameId(null);
    setCurrentClueIndex(0);
    setClues([]);
    setWord('');
    setGuesses([]);
    setPlayer1Id(null);
    setPlayer2Id(null);
    setPlayer1Name(null);
    setPlayer2Name(null);
    setJoinGameCode('');
  
    // Clear the game code from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete('gameCode');
    window.history.replaceState(null, '', url.toString());
  };
  

  const generateGameId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Calculate the current turn player's name based on the current player ID
  const currentTurnPlayerName =
    currentPlayer === player1Id ? player1Name || 'Player 1' : player2Name || 'Player 2';

  // In the listenForPlayerUpdates function:
  useEffect(() => {
    if (gameId) {
      const gameRef = doc(db, 'games', gameId);
      
      // Listen to changes including winner field
      const unsubscribe = onSnapshot(gameRef, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setWord(data.word);
          setClues(data.clues);
          setCurrentClueIndex(data.currentClueIndex);
          setPlayer1Id(data.player1Id);
          setPlayer2Id(data.player2Id);
          setGuesses(data.guesses);
          setWinner(data.winner);
          setPlayer1Name(data.player1Name);
          setPlayer2Name(data.player2Name);

          // Update player2Id if it is not set
          if (!data.player2Id && data.player1Id !== userId) {
            const playerName = session?.user?.name || 'Player 2';
            updateDoc(gameRef, {
              player2Id: userId,
              player2Name: playerName,
            });
          }

          // Update current player
          setCurrentPlayer(data.currentTurn === 'player1' ? data.player1Id : data.player2Id);
        }
      });

      return () => unsubscribe(); // Clean up listener on component unmount
    }
  }, [gameId]);

  return (
    <div className="flex flex-col items-center p-12 gap-2">

        {!gameId && !player2Id && !winner && (
            <div className="w-[60%] min-h-screen flex flex-col items-center gap-2">
                <FluencyInput
                    type="text"
                    value={joinGameCode}
                    onChange={(e) => setJoinGameCode(e.target.value)}
                    placeholder="Coloque o ID aqui!"
                    className='w-full'
                />
                <div className='w-full flex flex-row items-center justify-center'>
                    <FluencyButton variant='confirm' onClick={handleJoinGame}>
                        Entrar em um jogo
                    </FluencyButton>
                    <p className='px-4 font-bold'>ou</p>
                    <FluencyButton variant='gray' onClick={createGame}>
                        Criar jogo
                    </FluencyButton>
                </div>

                <div className='p-4 rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark mt-4'>
                    <p className="font-bold text-lg mb-4">
                        <strong>Como Jogar:</strong>
                    </p>
                    <ol className="list-decimal pl-5 mb-4">
                        <li><strong>Criar um Jogo:</strong> Clique em Criar jogo para iniciar uma nova partida. O ID do jogo será gerado e copiado para você.</li>
                        <li><strong>Entrar em um Jogo:</strong> Digite o ID do jogo no campo e clique em Entrar em um jogo para se juntar à partida.</li>
                        <li><strong>Fazer Chutes:</strong> Veja a dica e digite seu chute. O chute não diferencia maiúsculas de minúsculas.</li>
                        <li><strong>Regras:</strong> Tente adivinhar a palavra em até 6 chutes. Se acertar, você ganha. Se acabar as tentativas sem sucesso, o jogo termina sem vencedor.</li>
                        <li><strong>Reiniciar o Jogo:</strong> Após o fim do jogo, clique em Jogar novamente para começar uma nova partida.</li>
                    </ol>
                </div>
            </div>
        )}


        {gameId && !player2Id && !winner && (
            <div className="flex flex-col items-center gap-2 my-4 text-lg bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-3">
                <span className='font-bold'>Esperando pelo jogador 2 para iniciar...</span>
                <span className='font-bold text-fluency-yellow-500'>{gameId}</span>
            </div>
        )}

      {gameId && (
        <div className='flex flex-row items-start gap-2 w-full'>
        <div className='flex flex-col items-start gap-2 w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-3'>
            <div className="text-xl">
                {winner === null && guesses.length >= 6
                ? <span className='font-bold text-fluency-red-500'>Game Over! Ninguém venceu.</span>
                : winner
                ? <span className='font-bold text-fluency-green-500'>Game Over! {winner === player1Id ? player1Name : player2Name} venceu!</span>
                : player1Id && player2Id
                ?   <div className='flex flex-col items-start gap-1 text-md'>
                        <p><strong className='font-bold'>Vez de:</strong> {currentTurnPlayerName}.</p> 
                        <p><strong className='font-bold'>Dica:</strong> <span className='text-fluency-green-500'>{clues[currentClueIndex]}</span></p>
                    </div>
                : <span className='font-bold text-fluency-yellow-500'>Jogo ainda não iniciou</span>}
            </div>

            <div className="w-full flex flex-row items-center gap-2">
                <FluencyInput
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Coloque aqui seu chute"
                disabled={isDisabled}
                className='px-8'
                />
                <FluencyButton
                onClick={handleGuess}
                variant='confirm'
                disabled={isDisabled}
                >
                Enviar
                </FluencyButton>
            </div>
        </div>

        <div className="w-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md p-3">
            <h2 className="text-xl mb-2 font-bold">Chutes:</h2>
            <ul className="list-disc pl-5">
            {guesses.map((guess, index) => (
                <li key={index} className="mb-1">
                {guess.playerId === player1Id ? player1Name : player2Name}: {guess.guess}
                </li>
            ))}
            </ul>
        </div>
      </div>
      )}

      {(winner !== null || guesses.length > 6) && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <FluencyButton variant='warning' onClick={handleStartNewGame}>
            Jogar novamente
          </FluencyButton>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default WhatAmI;
