// components/TicTacToe.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase'; // Import your Firestore configuration
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import './tictac.css';
import { useSession } from 'next-auth/react'; // Import useSession from next-auth/react

const TicTacToe: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [gameCode, setGameCode] = useState<string>('');
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [playerXId, setPlayerXId] = useState<string | null>(null);
  const [playerOId, setPlayerOId] = useState<string | null>(null);

  const { data: session } = useSession(); // Get session data
  const userId = session?.user?.id || ''; // Get the user ID from session
  const userName = session?.user?.name || 'Player'; // Get the user name from session

  useEffect(() => {
    if (session) {
      setCurrentPlayer(userName);
    }

    // Get the gameCode from the URL
    const params = new URLSearchParams(window.location.search);
    const urlGameCode = params.get('gameCode');

    if (urlGameCode) {
      joinGame(urlGameCode);
      setGameCode(urlGameCode);
    }
  }, [session]);

  // Function to create a new game
  const createGame = async () => {
    const id = generateGameId();
    setGameId(id);
    await setDoc(doc(db, 'games', id), {
      board: Array(9).fill(''),
      isXNext: true,
      playerXId: userId, // Set the current user as player X
      playerOId: null // No player O yet
    });
    toast.success(`Game created! Share this ID: ${id}`);

    // Update the URL with the new gameCode
    const url = new URL(window.location.href);
    url.searchParams.set('gameCode', id);
    window.history.replaceState(null, '', url.toString());
  };

  // Function to join an existing game
  const joinGame = (id: string) => {
    setGameId(id);
    const gameRef = doc(db, 'games', id);
    onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setPlayerXId(data.playerXId);
        setPlayerOId(data.playerOId);

        // Update player O if player X is already set
        if (data.playerXId && data.playerXId !== userId) {
          if (!data.playerOId) {
            updateDoc(gameRef, { 
              playerOId: userId
            });
          }
        }
      }
    });
  };

  // Function to handle player moves
  const makeMove = async (index: number) => {
    if (gameId && board[index] === '' && !checkWinner(board) && !isDraw(board)) {
      if ((isXNext && userId === playerXId) || (!isXNext && userId === playerOId)) {
        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        await updateDoc(doc(db, 'games', gameId), {
          board: newBoard,
          isXNext: !isXNext
        });

        // Check for a winner or draw after the move
        const winner = checkWinner(newBoard);
        if (winner) {
          toast.success(`${winner} wins!`);
        } else if (isDraw(newBoard)) {
          toast.error("It's a draw!");
        }
      } else {
        toast.error("It's not your turn!");
      }
    }
  };

  // Function to render each square of the Tic Tac Toe board
  const renderSquare = (index: number) => {
    return (
      <div
        key={index}
        className="w-24 h-24 border border-fluency-gray-200 flex items-center justify-center text-lg cursor-pointer hover:bg-fluency-gray-100 hover:dark:bg-fluency-gray-500 hover:font-semibold duration-300 ease-in-out transition-all dark:text-white"
        onClick={() => makeMove(index)}
      >
        {board[index]}
      </div>
    );
  };

  // Function to generate a unique game ID
  function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Function to check for a winner
  const checkWinner = (board: string[]) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  };

  // Function to check for a draw
  const isDraw = (board: string[]) => {
    return board.every((cell) => cell !== '') && !checkWinner(board);
  };

  // Determine whose turn it is
  const currentTurnPlayer = isXNext ? playerXId : playerOId;
  const isCurrentPlayerTurn = userId === currentTurnPlayer;

  return (
    <div className="flex flex-col items-center mt-16">
      {/* Display whose turn it is */}
      <div className="mb-4 text-xl">
        {checkWinner(board) ? (
          `Game Over! ${checkWinner(board)} wins!`
        ) : isDraw(board) ? (
          "It's a draw!"
        ) : (
          `It is ${currentTurnPlayer === userId ? 'your turn' : 'opponent\'s turn'}`
        )}
      </div>

      {/* Display player info */}
      <div className="mb-4 text-lg">
        Player: {currentPlayer}
      </div>

      <div className="flex flex-wrap w-72">
        {board.map((_, index) => (
          <div key={index}>
            {renderSquare(index)}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <button onClick={createGame} className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Game
        </button>
      </div>

      <div className="mt-4">
        <input
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="Enter Game ID"
          className="border rounded px-2 py-1"
        />
        <button onClick={() => joinGame(gameCode)} className="bg-green-500 text-white px-4 py-2 rounded ml-2">
          Join Game
        </button>
      </div>

      <Toaster />
    </div>
  );
};

export default TicTacToe;
