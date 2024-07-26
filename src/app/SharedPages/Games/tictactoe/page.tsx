'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { verbs } from './verbs';
import { Toaster, toast } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import './tictac.css';
import FluencyButton from '@/app/ui/Components/Button/button';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useSession } from 'next-auth/react';

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

const TicTacToe: React.FC = () => {
  const { data: session } = useSession(); // Get current session
  const userId = session?.user?.id ?? null; // Use null if userId is undefined
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [board, setBoard] = useState<string[]>([]);
  const [isXNext, setIsXNext] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentBox, setCurrentBox] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [disabledBoxes, setDisabledBoxes] = useState<number[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(true);
  const [gameID, setGameID] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X'); // New state for current turn
  const [playerIds, setPlayerIds] = useState<{X: string | null, O: string | null}>({ X: null, O: null }); // Store player IDs

  useEffect(() => {
    const id = searchParams.get('gameID');
    if (id) {
      setGameID(id);
      loadGame(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (gameStarted) {
      saveGame();
    }
  }, [board, disabledBoxes, isXNext, winner, gameOver, gameStarted]);

  useEffect(() => {
    setCurrentTurn(isXNext ? 'X' : 'O'); // Update current turn based on isXNext
  }, [isXNext]);

  useEffect(() => {
    if (playerIds.X && playerIds.O) {
      if ((userId === playerIds.X && currentTurn === 'X') || (userId === playerIds.O && currentTurn === 'O')) {
        // Allow the user to play if it is their turn
      } else {
        // Optionally, show a message or disable the board
      }
    }
  }, [playerIds, userId, currentTurn]);

  const shuffleVerbs = () => {
    const shuffledVerbs = shuffleArray(verbs).slice(0, 9);
    setBoard(shuffledVerbs);
  };

  const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  useEffect(() => {
    const checkWinner = checkWin();
    if (checkWinner) {
      setWinner(checkWinner);
      setGameOver(true);
    } else if (disabledBoxes.length === board.length) {
      setGameOver(true);
    } else {
      setGameOver(false);
    }
  }, [board, disabledBoxes]);

  const handleClick = (index: number) => {
    if (board[index] === '' || disabledBoxes.includes(index) || gameOver || (currentTurn !== (isXNext ? 'X' : 'O'))) return;
    setCurrentBox(index);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setUserInput('');
  };

  const runChat = async (prompt: string) => {
    setLoading(true);
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = await model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "HELLO" }],
        },
        {
          role: "model",
          parts: [{ text: "Hello there! How can I assist you today?" }],
        },
      ],
    });

    const instruction = `Check if a whole sentence with more than one word is provided using the verb "${board[currentBox as number]}" in the correct tense and form. If it does match the criteria return only the word "correct". If it does not match the criteria then return only the word "incorrect".`;
    const fullPrompt = `${instruction}\n\nText: ${prompt}`;

    try {
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text().trim();
      setLoading(false);

      if (responseText.toLowerCase() === 'correct') {
        const updatedBoard = [...board];
        updatedBoard[currentBox as number] = isXNext ? 'X' : 'O';
        setBoard(updatedBoard);
        setIsXNext(!isXNext);
        setDisabledBoxes([...disabledBoxes, currentBox as number]);
        toast.success('Frase correta! Movimento aceito.');
        saveGame();
        return 'correct';
      } else if (responseText.toLowerCase() === 'incorrect') {
        return 'incorrect';
      } else {
        return 'unknown';
      }
    } catch (error) {
      setLoading(false);
      console.error('Error during AI verification:', error);
      return 'unknown';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentBox !== null) {
      const result = await runChat(userInput);
      if (result === 'incorrect') {
        toast.error('Frase incorreta. Tente novamente.');
      } else if (result === 'unknown') {
        toast.error('Error verifying sentence. Please try again.');
      }
    }
    handleCloseModal();
  };

  const renderSquare = (index: number) => {
    const isWinnerSquare = winner && board[index] === winner;
    return (
      <div
        key={index}
        className={`w-24 h-24 border border-fluency-gray-200 flex items-center justify-center text-lg cursor-pointer hover:bg-fluency-gray-100 hover:dark:bg-fluency-gray-500 hover:font-semibold duration-300 ease-in-out transition-all dark:text-white ${disabledBoxes.includes(index) ? 'opacity-50 text-black' : ''} ${isWinnerSquare ? 'bg-fluency-green-500 opacity-0' : ''}`}
        onClick={() => handleClick(index)}
      >
        {board[index] === '' ? '' : board[index]}
      </div>
    );
  };

  const checkWin = () => {
    const winLines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleStartGame = () => {
    shuffleVerbs();
    setIsXNext(true);
    setDisabledBoxes([]);
    setWinner(null);
    setGameOver(false);
    setGameID(uuidv4());
    setGameStarted(true);
    setPlayerIds({ X: userId, O: null }); // Set the current user as X
    saveGame();
  };

  const handleJoinGame = () => {
    if (gameID) {
      loadGame(gameID);
    } else {
      toast.error('Please enter a game ID.');
    }
  };

  const saveGame = async () => {
    if (gameID) {
      try {
        console.log('Saving game:', { board, isXNext, disabledBoxes, winner, gameOver });
        await setDoc(doc(db, 'games', gameID), {
          board,
          isXNext,
          disabledBoxes,
          winner,
          gameOver,
          playerIds,
        });
      } catch (error) {
        console.error('Error saving game:', error);
        toast.error('Error saving game.');
      }
    } else {
      console.log('Cannot save game: No game ID provided.');
    }
  };

  const loadGame = async (id: string) => {
    try {
      const gameDoc = await getDoc(doc(db, 'games', id));
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        setBoard(gameData.board || []);
        setIsXNext(gameData.isXNext || true);
        setDisabledBoxes(gameData.disabledBoxes || []);
        setWinner(gameData.winner || null);
        setGameOver(gameData.gameOver || true);
        setPlayerIds(gameData.playerIds || { X: null, O: null }); // Load player IDs
        setGameStarted(true);
      } else {
        toast.error('Game not found.');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Error loading game.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-16">
      {!gameID && !gameStarted && (
        <FluencyButton
          variant='confirm'
          onClick={handleStartGame}
          className="mb-4"
        >
          Iniciar jogo
        </FluencyButton>
      )}

      <div className="mb-4 flex flex-row items-center gap-2">
        <input
          type="text"
          value={gameID || ''}
          onChange={(e) => setGameID(e.target.value)}
          placeholder="Enter Game ID"
          className="p-2 border rounded mr-2"
        />
        <FluencyButton
          variant='warning'
          onClick={handleJoinGame}
        >
          Entrar no jogo
        </FluencyButton>
      </div>

      <div className="flex flex-wrap w-72">
        {board.map((_, index) => (
          <div key={index}>
            {renderSquare(index)}
          </div>
        ))}
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800 dark:bg-slate-500 bg-opacity-50">
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl mb-4">Escreva uma frase usando o verbo: {board[currentBox as number]}</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full p-2 border rounded mb-4 outline-none bg-fluency-bg-light dark:bg-fluency-bg-dark text-black dark:text-white"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Use o verbo ${board[currentBox as number]} em uma frase`}
                required
              />
              <div className="flex justify-end space-x-4">
                <FluencyButton
                  type="button"
                  variant='warning'
                  onClick={handleCloseModal}
                >
                  Cancelar
                </FluencyButton>
                <FluencyButton
                  type="submit"
                  variant='orange'
                  disabled={loading}
                >
                  {loading ? 'Checando...' : 'Enviar'}
                </FluencyButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="mt-4">
          <FluencyButton
            variant='confirm'
            onClick={handleStartGame}
          >
            Jogar Novamente
          </FluencyButton>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default TicTacToe;
