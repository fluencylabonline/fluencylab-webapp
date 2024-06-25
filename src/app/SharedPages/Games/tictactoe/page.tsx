// components/TicTacToe.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { verbs } from './verbs'; // Assuming verbs is imported correctly from './verbs'
import { Toaster, toast } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import './tictac.css';
import FluencyButton from '@/app/ui/Components/Button/button';

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

const TicTacToe: React.FC = () => {
  // Shuffle the entire verbs array and take the first 9 for the board
  useEffect(() => {
    shuffleVerbs();
  }, []);

  const shuffleVerbs = () => {
    const shuffledVerbs = shuffleArray(verbs).slice(0, 9); // Take the first 9 shuffled verbs
    setBoard(shuffledVerbs);
  };

  const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };

  const [board, setBoard] = useState<string[]>([]); // Initialize empty board on first render
  const [isXNext, setIsXNext] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentBox, setCurrentBox] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [disabledBoxes, setDisabledBoxes] = useState<number[]>([]); // Track disabled boxes
  const [winner, setWinner] = useState<string | null>(null); // Track winner ('X' or 'O')
  const [gameOver, setGameOver] = useState(true); // Initially set to true to prevent immediate display of "Play Again"

  useEffect(() => {
    const checkWinner = checkWin();
    if (checkWinner) {
      setWinner(checkWinner);
      setGameOver(true);
    } else if (disabledBoxes.length === board.length) {
      // All boxes disabled, tie game
      setGameOver(true);
    } else {
      setGameOver(false); // Reset game over state if game is still ongoing
    }
  }, [board, disabledBoxes]);

  const handleClick = (index: number) => {
    if (board[index] === '' || disabledBoxes.includes(index) || gameOver) return; // Skip if no verb, already disabled, or game over
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
      const responseText = result.response.text().trim(); // Trim whitespace from response text
      setLoading(false);

      // Check if the response contains "correct" or "incorrect"
      if (responseText.toLowerCase() === 'correct') {
        const updatedBoard = [...board];
        updatedBoard[currentBox as number] = isXNext ? 'X' : 'O';
        setBoard(updatedBoard);
        setIsXNext(!isXNext);
        setDisabledBoxes([...disabledBoxes, currentBox as number]); // Disable the box
        toast.success('Frase correta! Movimento aceito.');
        return 'correct';
      } else if (responseText.toLowerCase() === 'incorrect') {
        return 'incorrect';
      } else {
        return 'unknown'; // Handle other cases if necessary
      }
    } catch (error) {
      setLoading(false);
      console.error('Error during AI verification:', error);
      return 'unknown'; // Handle error case
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

    for (let i = 0; i < winLines.length; i++) {
      const [a, b, c] = winLines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Return 'X' or 'O' if there's a winner
      }
    }

    return null; // Return null if no winner
  };

  const handlePlayAgain = () => {
    shuffleVerbs(); // Shuffle verbs for new game
    setIsXNext(true); // Reset player turn
    setDisabledBoxes([]); // Reset disabled boxes
    setWinner(null); // Reset winner
    setGameOver(false); // Reset game over state
  };

  return (
    <div className="flex flex-col items-center mt-16">
      <div className="flex flex-wrap w-72">
        {board.map((_, index) => (
          <div key={index}>
            {renderSquare(index)}
          </div>
        ))}
      </div>

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-800 dark:bg-slate-300 bg-opacity-50">
          <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl mb-4">Escreva uma frase usando o verbo: "{board[currentBox as number]}"</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full p-2 border rounded mb-4 outline-none bg-fluency-bg-light dark:bg-fluency-bg-dark text-black dark:text-white"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Use o verbo "${board[currentBox as number]}" em uma frase`}
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
            onClick={handlePlayAgain}
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
