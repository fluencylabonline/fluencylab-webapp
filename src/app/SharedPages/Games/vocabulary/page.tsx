'use client'
import { useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { db } from '@/app/firebase';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import CriarJogo from "./Components/CriarJogo";
import ShowGames from "./Components/ShowGames";

export default function Vocabulary() {
    const { data: session } = useSession();
    const userId = session?.user?.id || '';
    const [gameId, setGameId] = useState<string | null>(null);
    const [joinGameCode, setJoinGameCode] = useState('');
    const [availableGames, setAvailableGames] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter()

    const generateGameId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const fetchAvailableGames = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'VocabularyGame'));
            const games = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAvailableGames(games);
        } catch (error) {
            toast.error("Erro ao carregar jogos disponíveis.");
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
        fetchAvailableGames();
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const randomWords = ["Apple", "Banana", "Carrot", "Dog", "Elephant", "Friday", "Monday", "Tuesday", "Sunday"];

    const generateOpenTheBoxMode = (vocabularyData: any[]) => {
        return vocabularyData.map((item) => {
            const correctOption = item.vocab;
            const randomOptions = [...randomWords.filter(word => word !== correctOption)]; // Filter out the correct word from randomWords
            const shuffledOptions = [
                correctOption,
                ...randomOptions.sort(() => 0.5 - Math.random()).slice(0, 2),  // Get two random options and shuffle
            ].sort(() => 0.5 - Math.random());  // Shuffle the options

            return {
                imageURL: item.imageURL,
                vocab: item.vocab,
                options: shuffledOptions,
                clickedOption: null,
                isCorrect: null,
            };
        });
    };

    const generateWhatIsImageMode = (vocabularyData: any[]) => {
        return vocabularyData.map((item) => {
            const correctOption = item.vocab;
            const randomOptions = [...randomWords.filter(word => word !== correctOption)]; // Filter out the correct word from randomWords
            const shuffledOptions = [
                correctOption,
                ...randomOptions.sort(() => 0.5 - Math.random()).slice(0, 2),  // Get two random options and shuffle
            ].sort(() => 0.5 - Math.random());  // Shuffle the options
    
            return {
                imageURL: item.imageURL,
                vocab: item.vocab,
                options: shuffledOptions,
                clickedOption: null,
                isCorrect: null,
                isGuess: null,
            };
        });
    };
    
    const createGame = async (vocabGameId: string) => {
        const id = generateGameId();
    
        try {
            // Fetch the VocabularyGame data from the db using vocabGameId
            const vocabGameRef = doc(db, 'VocabularyGame', vocabGameId);
            const vocabGameSnapshot = await getDoc(vocabGameRef);
    
            if (!vocabGameSnapshot.exists()) {
                toast.error('Jogo de vocabulário não encontrado.');
                return;
            }
    
            const vocabGameData = vocabGameSnapshot.data();
            
            // Assuming vocabGameData.vocabularies contains an array of objects
            const vocabularyData = vocabGameData.vocabularies || [];  // Ensure to handle the vocabularies array
    
            // Create a new game document in the 'games' collection
            await setDoc(doc(db, 'games', id), {
                creatorId: userId,
                createdAt: new Date(),
                players: [userId],
                status: 'waiting',
                gameMode: '',  // Set the game mode if needed
                VocabularyGameID: vocabGameId,
                gameName: 'VocabularyGame',
            });
    
            // Create a sub-collection for modes inside the game document
            const modesRef = collection(db, 'games', id, 'modes');
    
            // Create the 'anagram' mode with vocabulary data inside the sub-collection
            await setDoc(doc(modesRef, 'anagram'), {
                vocabularydata: vocabularyData,  // Populate with vocabulary data from the VocabularyGame
            });
    
            // Create the 'openthebox' mode
            const opentheboxData = generateOpenTheBoxMode(vocabularyData);
            await setDoc(doc(modesRef, 'openthebox'), {
                vocabularydata: opentheboxData,  // Populate with the open the box data
            });
    
            // Create the 'whatisimage' mode
            const whatisimageData = generateWhatIsImageMode(vocabularyData);
            await setDoc(doc(modesRef, 'whatisimage'), {
                currentIndex: 0,
                score: 0,
                vocabularydata: whatisimageData,  // Populate with the whatisimage data
            });
    
            setGameId(id);
            navigator.clipboard.writeText(id).then(() => {
                toast.success(`Jogo criado com sucesso! O código da sala foi copiado: ${id}`);
            });
    
        } catch (error) {
            toast.error('Erro ao criar o jogo. Tente novamente.');
        }
    };    

    const handleJoinGame = async () => {
        if (!joinGameCode) {
            toast.error("Por favor, insira um código de jogo.");
            return;
        }

        try {
            const gameRef = doc(db, 'games', joinGameCode);
            const gameSnapshot = await getDoc(gameRef);

            if (!gameSnapshot.exists()) {
                toast.error("Jogo não encontrado.");
                return;
            }

            const gameData = gameSnapshot.data();
            const players = gameData.players;
            if (players.includes(userId)) {
                toast.success("Você já está no jogo.");
                router.push(`vocabulary/Jogando?gameID=${joinGameCode}`); // Navigate to the new URL
                return;
            }

            players.push(userId);
            await setDoc(gameRef, { ...gameData, players }, { merge: true });

            router.push(`vocabulary/Jogando?gameID=${joinGameCode}`); // Navigate to the new URL
            toast.success("Você entrou no jogo com sucesso!");
        } catch (error) {
            toast.error("Erro ao entrar no jogo. Tente novamente.");
        }
    };

    return (
        <div className="w-full h-[90vh] rounded-md bg-fluency-pages-light dark:bg-fluency-pages-dark overflow-hidden">
            <Toaster />
            <div className="flex flex-col items-center justify-center p-4 gap-4">

                {session?.user.role === 'teacher' && (
                    <CriarJogo />
                )}

                <div className="flex flex-col items-center gap-2">
                    <FluencyInput
                        type="text"
                        value={joinGameCode}
                        onChange={(e) => setJoinGameCode(e.target.value)}
                        placeholder="Coloque o ID aqui"
                        className='w-full'
                    />
                    <div className='w-full lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center justify-center'>
                        <FluencyButton variant='confirm' onClick={handleJoinGame}>
                            Entrar em uma sala
                        </FluencyButton>
                        <p className='px-4 font-bold'>ou</p>
                        <FluencyButton variant='orange' onClick={openModal}>
                            Criar uma sala
                        </FluencyButton>
                    </div>
                </div>

                <ShowGames />

                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white dark:bg-fluency-bg-dark p-6 rounded-md w-3/4 max-w-[500px]">
                            <h2 className="text-xl font-bold mb-4">Escolha um jogo existente</h2>
                            <div className="space-y-2">
                                {availableGames.length > 0 ? (
                                    availableGames.map((game) => (
                                        <div key={game.id} className="bg-fluency-pages-light dark:bg-fluency-pages-dark flex justify-between items-center p-2 border rounded-md">
                                            <span>{game.name}</span>
                                            <FluencyButton
                                                variant="confirm"
                                                onClick={() => createGame(game.id)}
                                            >
                                                Selecionar
                                            </FluencyButton>
                                        </div>
                                    ))
                                ) : (
                                    <p>Sem jogos disponíveis.</p>
                                )}
                            </div>
                            <div className="mt-4 flex justify-center">
                                <FluencyButton variant="gray" onClick={closeModal}>
                                    Fechar
                                </FluencyButton>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
