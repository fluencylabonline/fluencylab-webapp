'use client';
import { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import FluencyButton from '@/app/ui/Components/Button/button';
import toast, { Toaster } from 'react-hot-toast';

//Modes
import Anagram from './Modes/Anagram';
import OpenTheBox from './Modes/OpenTheBox';

//NextImports
import Image from 'next/image';

// Import images for each game mode
import MatchUpImg from '../../../../../../public/images/games/match.jpeg';
import QuizImg from '../../../../../../public/images/games/quiz.jpeg';
import AnagramImg from '../../../../../../public/images/games/anagram.jpeg';
import OpenTheBoxImg from '../../../../../../public/images/games/openthebox.jpeg';
import WordsearchImg from '../../../../../../public/images/games/wordsearch.jpeg';
import WhatIsImageImg from '../../../../../../public/images/games/image.jpeg';
import WhatIsImage from './Modes/WhatIsImage';

const gameModes = [
 // { name: 'Deu Match', img: MatchUpImg },
 // { name: 'Quiz', img: QuizImg },
  { name: 'Anagrama', img: AnagramImg },
  { name: 'Caixa surpresa', img: OpenTheBoxImg },
 // { name: 'Caça palavras', img: WordsearchImg },
  { name: 'Qual a imagem', img: WhatIsImageImg },
];

export default function IsPlaying() {
  const [gameID, setGameID] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [isGameModeSelected, setIsGameModeSelected] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [vocabularyData, setVocabularyData] = useState<any[]>([]);
  const [gameName, setGameName] = useState('');
  const [isSingleplayer, setIsSingleplayer] = useState(false);
  const [firstPlayerName, setFirstPlayerName] = useState<string | null>(null); // State for second player's name
  const [secondPlayerName, setSecondPlayerName] = useState<string | null>(null); // State for second player's name

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const multiplayer = params.get('gameID'); // Multiplayer
    const singleplayer = params.get('aloneGameID'); // Singleplayer

    if (multiplayer) {
      setGameID(multiplayer);
      setIsSingleplayer(false);
    } else if (singleplayer) {
      setGameID(singleplayer);
      setIsSingleplayer(true);

      // Fetch vocabulary game data for singleplayer
      const vocabRef = doc(db, 'VocabularyGame', singleplayer);
      getDoc(vocabRef).then((vocabDoc) => {
        if (vocabDoc.exists()) {
          const vocabData = vocabDoc.data();
          setVocabularyData(vocabData?.vocabularies || []);
          setGameName(vocabData?.name);
          setIsGameModeSelected(false); // User needs to select the game mode
        } else {
          toast.error('Vocabulary game not found.');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!gameID || isSingleplayer) return;

    // Multiplayer: Listen to game document
    const gameRef = doc(db, 'games', gameID);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        setGameData(data);
        setGameMode(data.gameMode);
        setIsGameModeSelected(!!data.gameMode);

        if (data.VocabularyGameID) {
          const vocabRef = doc(db, 'VocabularyGame', data.VocabularyGameID);
          getDoc(vocabRef).then((vocabDoc) => {
            if (vocabDoc.exists()) {
              const vocabData = vocabDoc.data();
              setVocabularyData(vocabData?.vocabularies || []);
              setGameName(vocabData?.name);
            } else {
              toast.error('Vocabulary game not found.');
            }
          });
        }
      }
    });

    return () => unsubscribe();
  }, [gameID, isSingleplayer]);

  useEffect(() => {
    if (gameData && gameData.players && gameData.players.length > 1) {
      // Fetch the second player's ID (assuming the second player is at index 1)
      const firstPlayerId = gameData.players[0];
      const secondPlayerId = gameData.players[1];

      // Fetch the second player's name from the Firestore users collection
      const userRef = doc(db, 'users', secondPlayerId); // Assuming users are stored in the 'users' collection
      getDoc(userRef).then((userDoc) => {
        if (userDoc.exists()) {
          setSecondPlayerName(userDoc.data()?.name); // Update state with second player's name
        } else {
          toast.error('Second player not found.');
        }
      });

      const userRefs = doc(db, 'users', firstPlayerId); // Assuming users are stored in the 'users' collection
      getDoc(userRefs).then((userDoc) => {
        if (userDoc.exists()) {
          setFirstPlayerName(userDoc.data()?.name); // Update state with second player's name
        } else {
          toast.error('Second player not found.');
        }
      });
    }
  }, [gameData]); 

  const handleGameModeChange = async (mode: string) => {
    try {
      if (!isSingleplayer && gameID) {
        const gameRef = doc(db, 'games', gameID);
        await updateDoc(gameRef, { gameMode: mode });
      }
      setGameMode(mode);
      setIsGameModeSelected(true);
      toast.success(`Modo de jogo alterado para: ${mode}`);
    } catch (error) {
      toast.error('Erro ao mudar o modo de jogo');
    }
  };

  const handleChangeMode = () => {
    setIsGameModeSelected(false);
    setGameMode(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[90vh] overflow-hidden rounded-md p-3 bg-fluency-pages-light dark:bg-fluency-pages-dark text-black dark:text-white">
      {gameID ? (
        <div className="w-full h-full overflow-y-auto">
          
          <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-between items-center w-full px-2 mb-2">
            {!isSingleplayer && <p className="text-md font-regular"><span className='font-bold mr-1'>Jogador 1:</span>{firstPlayerName}</p>}
              <span className="text-xl font-bold">{gameMode}</span>
              {isGameModeSelected && (
                <FluencyButton variant="orange" onClick={handleChangeMode}>
                  Mudar Modo de Jogo
                </FluencyButton>
              )}
            {!isGameModeSelected && !isSingleplayer && (<p className="text-md font-regular"><span className='font-bold mr-1'>Jogador 2:</span> {secondPlayerName}</p>)}
          </div>

          {!isGameModeSelected && (
            <div className="flex flex-col justify-center items-center w-full">
              <h3 className="text-2xl font-bold mb-4">Escolha um modo de jogo</h3>
                <div className="flex flex-wrap flex-row gap-3 items-center justify-center content-center">
                  {gameModes.map((mode) => (
                    <div
                      key={mode.name}
                      onClick={() => handleGameModeChange(mode.name)}
                      className="flex flex-col items-center justify-center text-2xl text-center font-extrabold px-5 py-3 text-black hover:text-white w-48 h-52 rounded-xl cursor-pointer shadow-sm hover:scale-105 hover:saturate-[125%] saturate-[50%] transition-all ease-in-out duration-300 overflow-hidden"
                    >
                      <Image
                        src={mode.img}
                        alt={mode.name}
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-auto absolute inset-0 z-0"
                        sizes='100'
                        priority
                      />
                      <span className="relative z-10">{mode.name}</span>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {isGameModeSelected && gameMode === 'Anagrama' && vocabularyData.length > 0 && (
            <Anagram gameID={gameID} />
          )}

          {isGameModeSelected && gameMode === 'Caixa surpresa' && vocabularyData.length > 0 && (
            <OpenTheBox gameID={gameID} />
          )}

          {isGameModeSelected && gameMode === 'Qual a imagem' && vocabularyData.length > 0 && (
            <WhatIsImage gameID={gameID} />
          )}
          
        </div>
      ) : (
        <p>Código de jogo inválido ou não encontrado</p>
      )}
      <Toaster />
    </div>
  );
}
