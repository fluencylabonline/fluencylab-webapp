'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import './tictac.css';
import { useSession } from 'next-auth/react';
import { verbs } from './verbs';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import { CiCircleQuestion } from 'react-icons/ci';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

const TicTacToe: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [gameCode, setGameCode] = useState<string>('');
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [playerXId, setPlayerXId] = useState<string | null>(null);
  const [playerOId, setPlayerOId] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [sentence, setSentence] = useState('');
  const [randomVerb, setRandomVerb] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerXName, setPlayerXName] = useState<string>(''); // State for player X's name
  const [playerOName, setPlayerOName] = useState<string>('');
  const { data: session } = useSession(); // Get session data
  const userId = session?.user?.id || ''; // Get the user ID from session
  const userName = session?.user?.name || 'Player'; // Get the user name from session

  const [isInstrucoesOpen, setIsInstrucoesOpen] = useState(false);
    const openInstrucoes = () => {
        setIsInstrucoesOpen(true);
    };

    const closeInstrucoes = () => {
        setIsInstrucoesOpen(false);
    };  

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

  // Select a random verb from the verbs array
  const getRandomVerb = () => {
    const randomIndex = Math.floor(Math.random() * verbs.length);
    return verbs[randomIndex];
  };

  // Function to create a new game
  const createGame = async () => {
    const id = generateGameId();
    setGameId(id);
    const verb = getRandomVerb();
    setRandomVerb(verb);
    await setDoc(doc(db, 'games', id), {
      board: Array(9).fill(''),
      isXNext: true,
      playerXId: userId, // Set the current user as player X
      playerOId: null, // No player O yet
      isStarted: false, // Game has not started yet
      randomVerb: verb, // Store the random verb in the game document
      winner: null // Initialize winner field
    });
    
    // Copy game code to clipboard
    navigator.clipboard.writeText(id).then(() => {
      toast.success(`Jogo criado! O ID foi copiado para a área de transferência: ${id}`);
    }).catch(err => {
      console.error('Failed to copy game ID: ', err);
      toast.error('Falha ao copiar o ID do jogo.');
    });
  
    // Update the URL with the new gameCode
    const url = new URL(window.location.href);
    url.searchParams.set('gameCode', id);
    window.history.replaceState(null, '', url.toString());
  };
  

  // Function to join an existing game
  const joinGame = async (id: string) => {
    setGameId(id);
    const gameRef = doc(db, 'games', id);
    onSnapshot(gameRef, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setBoard(data.board);
        setIsXNext(data.isXNext);
        setPlayerXId(data.playerXId);
        setPlayerOId(data.playerOId);
        setIsGameStarted(data.isStarted);
        setRandomVerb(data.randomVerb); // Get the random verb from the game document

        // Update player O if player X is already set
        if (data.playerXId && data.playerXId !== userId) {
          if (!data.playerOId) {
            updateDoc(gameRef, { 
              playerOId: userId
            });
          }
        }

        // Fetch player names if available
        if (data.playerXId) {
          // Assume you have a way to fetch user names by their IDs
          fetchUserName(data.playerXId).then(name => setPlayerXName(name));
        }
        if (data.playerOId) {
          fetchUserName(data.playerOId).then(name => setPlayerOName(name));
        }

        // Check if the game has started
        if (data.playerXId && data.playerOId) {
          setIsGameStarted(true);
        }
      }
    });
  };

  const fetchUserName = async (userId: string) => {
    // Replace this with your actual implementation to fetch user names
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data()?.name || 'Unknown Player';
  };
  
  // Function to validate the sentence using AI
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

    const instruction = `Check if a whole sentence with more than one word is provided using the verb "${randomVerb}" in the correct tense and form. If it does match the criteria return only the word "correct". If it does not match the criteria then return only the word "incorrect".`;
    const fullPrompt = `${instruction}\n\nText: ${prompt}`;

    try {
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text().trim(); // Trim whitespace from response text
      setLoading(false);

      // Check if the response contains "correct" or "incorrect"
      if (responseText.toLowerCase() === 'correct') {
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

  // Function to handle player moves
  const handleMove = async () => {
    if (selectedSquare !== null && sentence.trim() !== '') {
      if (gameId && board[selectedSquare] === '' && !checkWinner(board) && !isDraw(board)) {
        if (!isGameStarted) {
          toast.error("Jogo ainda não começou.");
          return;
        }

        if ((isXNext && userId === playerXId) || (!isXNext && userId === playerOId)) {
          const result = await runChat(sentence);

          if (result === 'correct') {
            const newBoard = [...board];
            newBoard[selectedSquare] = isXNext ? 'X' : 'O';
            await updateDoc(doc(db, 'games', gameId), {
              board: newBoard,
              isXNext: !isXNext,
              randomVerb: getRandomVerb()
            });
            
            // Check for a winner or draw after the move
            const winner = checkWinner(newBoard);
            if (winner) {
              await updateDoc(doc(db, 'games', gameId), { winner: winner }); // Store the winner in Firestore
              toast.success(`${getWinnerName()} ganhou!`);
            } else if (isDraw(newBoard)) {
              toast.error("Empate!");
            }

            setModalVisible(false);
            setSelectedSquare(null);
            setSentence('');
          } else if (result === 'incorrect') {
            toast.error("Frase incorreta. Por favor, tente novamente.");
          } else {
            toast.error("Erro ao verificar frase. Tente novamente.");
          }
        } else {
          toast.error("Não é sua vez!");
        }
      } else {
        toast.error("Por favor, coloque uma frase válida.");
      }
    } else {
      toast.error("Por favor, coloque uma frase válida.");
    }
  };

  // Function to render each square of the Tic Tac Toe board
  const renderSquare = (index: number) => {
    return (
      <div
        key={index}
        className="w-24 h-24 border border-fluency-gray-200 flex items-center justify-center text-lg cursor-pointer hover:bg-fluency-gray-100 hover:dark:bg-fluency-gray-500 hover:font-semibold duration-300 ease-in-out transition-all dark:text-white"
        onClick={() => {
          if (userId === (isXNext ? playerXId : playerOId)) {
            setSelectedSquare(index);
            setModalVisible(true);
          } else {
            toast.error("Não é sua vez!");
          }
        }}
      >
        {board[index]}
      </div>
    );
  };

  // Function to start the game
  const startGame = async () => {
    if (gameId && playerXId && playerOId) {
      await updateDoc(doc(db, 'games', gameId), { isStarted: true });
      setIsGameStarted(true);
      toast.success("Jogo iniciou!");
    } else {
      toast.error("Os dois jogadores precisam entrar para iniciar o jogo.");
    }
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

  const getWinnerName = () => {
    const winner = checkWinner(board);
    if (winner === 'X') {
      return playerXName;
    } else if (winner === 'O') {
      return playerOName;
    } else {
      return '';
    }
  };
  return (
    <div className="flex flex-col items-center p-12">
      {/* Display whose turn it is */}
      <div className="mb-4 text-xl">
        {checkWinner(board) ? 
           `Game Over! ${getWinnerName()} ganhou!` :
          isDraw(board) ? 
            "Empate!" :
            <div className='flex flex-row items-center gap-1'>
              <span>
                {!playerXName || !playerOName ? (<span className='font-bold text-fluency-yellow-500'>Jogo não iniciou</span>) : (<span className='font-medium'>Vez de <strong className='font-bold text-fluency-green-500'>{isXNext ? playerXName : playerOName}</strong></span>)}
              </span>
              <CiCircleQuestion onClick={openInstrucoes} className='lg:w-7 lg:h-7 w-5 h-5 text-black dark:text-white cursor-pointer'/>
            </div>
        }
      </div>

      <div className="flex flex-wrap w-72">
        {board.map((_, index) => (
          <div key={index}>
            {renderSquare(index)}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex flex-col items-center justify-center gap-1">
        <p className='text-xs font-bold px-1 rounded-md bg-fluency-yellow-400 dark:bg-fluency-yellow-400 text-black dark:text-black'>Cole o ID aqui depois de criar um jogo e aperte em Entrar</p>
        <FluencyInput
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="Coloque o ID aqui"
        />
        <div className='flex flex-row items-center justify-center gap-1'>
          <FluencyButton variant='confirm' onClick={() => joinGame(gameCode)}>
            Entrar em um jogo
          </FluencyButton>
          <FluencyButton variant='warning' onClick={createGame} className="bg-blue-500 text-white px-4 py-2 rounded">
            Criar jogo
          </FluencyButton>
        </div>
      </div>

      {/* Modal for Sentence Input */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black dark:bg-fluency-gray-800 bg-opacity-50 dark:bg-opacity-90 flex items-center justify-center">
          <div className="flex flex-col items-start gap-2 bg-fluency-pages-light dark:bg-fluency-pages-dark text-black dark:text-white p-4 rounded-md shadow-lg">
            <h3 className="text-lg">Escreva uma frase com: <strong className='text-md text-gray-600 dark:text-gray-200'>{randomVerb}</strong></h3>
            <FluencyInput
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Escreva aqui!"
            />
            <div className='flex flex-row items-center gap-2'>
              <FluencyButton variant='confirm' onClick={handleMove}>
                Checar
              </FluencyButton>
              <FluencyButton variant='warning' onClick={() => setModalVisible(false)}>
                Cancelar
              </FluencyButton>
            </div>
          </div>
        </div>
      )}

        {isInstrucoesOpen && 
          <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none transition-opacity duration-300 ${isInstrucoesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`relative w-auto max-w-md mx-auto my-6 p-6 bg-fluency-pages-light dark:bg-fluency-pages-dark shadow-md rounded-xl text-black dark:text-white instructions-enter`}>
              <FluencyCloseButton onClick={closeInstrucoes} />
              <div className='p-4'>
                <div className="flex justify-between items-center">
                  <h1 className="text-lg font-bold">Instruções</h1>
                </div>
                <div className="mt-4 text-sm">
                  <strong>Como Jogar:</strong>
                  <ol className="list-decimal pl-5">
                    <li><strong>Criar um Jogo:</strong> Clique em Criar jogo para gerar um código. Copie e compartilhe o código com o outro jogador.</li>
                    <li><strong>Entrar em um Jogo:</strong> Cole o código do jogo e clique em Entrar em um jogo para se juntar à partida.</li>
                    <li><strong>Iniciar o Jogo:</strong> Aguarde ambos os jogadores estarem prontos e clique em Iniciar jogo para começar.</li>
                    <li><strong>Movimentos:</strong> Clique em uma célula do tabuleiro, escreva uma frase com o verbo fornecido e clique em Checar para validar seu movimento.</li>
                    <li><strong>Ganhar ou Empatar:</strong> O jogo termina quando um jogador vence ou quando todas as células estão preenchidas (empate).</li>
                    <li><strong>Reiniciar o Jogo:</strong> Clique em Criar jogo para iniciar uma nova partida.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        }

      <Toaster />
    </div>
  );
};

export default TicTacToe;
