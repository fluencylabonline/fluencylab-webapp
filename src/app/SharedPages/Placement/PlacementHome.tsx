'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

import { v4 as uuidv4 } from 'uuid';
import { CiCircleQuestion } from "react-icons/ci";

// Firebase imports
import { db } from "@/app/firebase";
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection, onSnapshot } from "firebase/firestore";

// Toast notifications and icon
import { toast, Toaster } from "react-hot-toast";
import { VscDebugStart } from "react-icons/vsc";

// Framer Motion imports
import { motion, AnimatePresence } from 'framer-motion';

// Language-based imports
import EnglishSpeaking from './Database/English/Speaking.json';
import EnglishVocabulary from './Database/English/Vocabulary.json';
import EnglishReading from './Database/English/Reading.json';
import EnglishWriting from './Database/English/Writing.json';
import EnglishListening from './Database/English/Listening.json';
import EnglishGrammar from './Database/English/Grammar.json';

import SpanishSpeaking from './Database/Spanish/Speaking.json';
import SpanishVocabulary from './Database/Spanish/Vocabulary.json';
import SpanishReading from './Database/Spanish/Reading.json';
import SpanishWriting from './Database/Spanish/Writing.json';
import SpanishListening from './Database/Spanish/Listening.json';
import SpanishGrammar from './Database/Spanish/Grammar.json';

//The Placement Test Page
import PlacementTest from './PlacementTest';
import { DetailsModal } from './Components/DetailsModal';
import Badges from './Components/Badges/Badges';
import { Levels } from './Components/Badges/Levels';
import './Placement.css';
import { IoClose } from 'react-icons/io5';

export default function PlacementUser() {
    const { data: session } = useSession();
    const [language, setLanguage] = useState('');
    const [tests, setTests] = useState<{
        date: string;
        completed: boolean;
        totalScore: number;
        abilitiesCompleted: Record<string, boolean>;
        id: string;
        createdAt: any,
    }[]>([]);
    const [showTest, setShowTest] = useState(false);
    const [currentTestId, setCurrentTestId] = useState<string | null>(null);
    const [modalId, setModalId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExplanationOpen, setIsExplanationOpen] = useState(false);
    const [isProgressOpen, setIsProgressOpen] = useState(false);
    const [nivelamentoPermitido, setNivelamentoPermitido] = useState<boolean | null>(null);
    const hasIncompleteTest = tests.some(test => !test.completed);
    const shouldShowButton = nivelamentoPermitido || hasIncompleteTest;

    useEffect(() => {
        if (session) {
            setLanguage(session.user.idioma);
            fetchUserTests();
        }
    }, [session]);

    useEffect(() => {
        const fetchUserInfo = () => {
            if (session) {
                const profileRef = doc(db, 'users', session.user.id);

                // Set up a real-time listener for the user document
                const unsubscribe = onSnapshot(profileRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                    } else {
                        console.log("No such document!");
                    }
                }, (error) => {
                    console.error("Error fetching document: ", error);
                });

                // Clean up the listener when the component is unmounted or session changes
                return () => unsubscribe();
            }
        };

        fetchUserInfo();
    }, [session]);  // Only run this effect when session changes

    const fetchUserTests = useCallback(async () => {
        if (!session) return;

        const testsRef = collection(db, "users", session.user.id, "Placement");

        // Listen for real-time changes
        const unsubscribe = onSnapshot(testsRef, (querySnapshot) => {
            const fetchedTests = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const abilitiesCompleted = data.abilitiesCompleted || {};
                const abilitiesScore = data.abilitiesScore || {};

                return {
                    date: data.date,
                    completed: Object.values(abilitiesCompleted).every(v => v === true),
                    totalScore: Object.values(abilitiesScore).reduce((acc: number, score: any) =>
                        acc + (Number(score) || 0), 0),
                    abilitiesCompleted,
                    id: doc.id,
                    createdAt: data.createdAt?.seconds || 0, // Convert Firestore timestamp to seconds
                };
            });

            // Sort by createdAt (newest first)
            const sortedTests = fetchedTests.sort((a, b) => b.createdAt - a.createdAt);
            setTests(sortedTests); // Assuming setTests is defined in your state
        });

        // Return unsubscribe function to clean up the listener when the component unmounts
        return unsubscribe;
    }, [session]); // Dependencies array, will re-run if session changes

    const determineCEFRLevel = (score: number): number => {
        if (score >= 90) return 5;   // Naldo Benny (C2)
        if (score >= 75) return 4;   // Joel Santana (C1)
        if (score >= 60) return 3;   // Richarlisson (B2)
        if (score >= 45) return 2;   // Alcione (B1)
        if (score >= 30) return 1;   // Nabote (A2)
        return 0;     // Sabrina Sato (A1)
    };

    // Select database based on user language
    const getDatabase = () => {
        if (language === 'Ingles') {
            return {
                speaking: EnglishSpeaking,
                vocabulary: EnglishVocabulary,
                reading: EnglishReading,
                writing: EnglishWriting,
                listening: EnglishListening,
                grammar: EnglishGrammar
            };
        } else if (language === 'Espanhol') {
            return {
                speaking: SpanishSpeaking,
                vocabulary: SpanishVocabulary,
                reading: SpanishReading,
                writing: SpanishWriting,
                listening: SpanishListening,
                grammar: SpanishGrammar
            };
        }
        return null;
    };

    // Helper to randomly select items from an array
    const getRandomItems = (arr: any, count: number | undefined) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const handleStartTest = async () => {
        if (!session) {
            toast.error("Você precisa estar logado.");
            return;
        }
        const testsRef = collection(db, "users", session.user.id, "Placement");
        const querySnapshot = await getDocs(testsRef);

        // Verifica se há testes incompletos
        const fetchedTests = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const abilitiesCompleted = data.abilitiesCompleted || {};
            const abilitiesScore = data.abilitiesScore || {};

            return {
                id: doc.id,
                completed: Object.values(abilitiesCompleted).every(v => v === true),
                totalScore: Object.values(abilitiesScore).reduce((acc: number, score: any) =>
                    acc + (Number(score) || 0), 0),
                abilitiesScore, // Include abilitiesScore here
                abilitiesCompleted,
                createdAt: data.createdAt?.seconds || 0,
            };
        });

        // Encontrar um teste incompleto
        const incompleteTest = fetchedTests.find(test => !test.completed);

        if (incompleteTest) {
            setCurrentTestId(incompleteTest.id);
            toast("Redirecionando para continuar...", {
                position: "bottom-center",
                style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "1rem",
                }
            });
            setShowTest(true);
            return;
        }

        // Criar um novo teste
        const databases = getDatabase();
        if (!databases) {
            toast.error("Idioma não suportado.");
            return;
        }

        const newTestId = uuidv4();
        const placementDocRef = doc(db, "users", session.user.id, "Placement", newTestId);

        // Format current date as "YYYY-MM-DD"
        const currentDate = new Date();
        const currentDateFormatted =
            `${currentDate.getDate().toString().padStart(2, '0')}
            /${(currentDate.getMonth() + 1).toString().padStart(2, '0')}
            /${currentDate.getFullYear()}`;

        // --- Test Customization Logic ---
        let difficultyLevels = [1, 2, 3, 4, 5, 6]; // Default difficulty levels
        let numQuestionsPerSkill = 6; // Default number of questions per skill

        if (tests.length > 0) {
            const lastTest = fetchedTests.sort((a, b) => b.createdAt - a.createdAt)[0]; // Get latest test
            const lastTestScores = lastTest.abilitiesScore;
            //let avgScore = Object.values(lastTestScores).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            let avgScore = Object.values(lastTestScores).reduce((a: number, b: any) => a + (Number(b) || 0), 0) / Object.keys(lastTestScores).length;
            console.log("Média:", avgScore)
            
            if (avgScore <= 30) {
                // Very Low Score: Beginner Level Adjustment, Shorter Test
                difficultyLevels = [1, 1, 1, 2, 2, 2];
                numQuestionsPerSkill = 4;
            } else if (avgScore <= 50) {
                // Low Score: Lower Intermediate Level Adjustment, Slightly Shorter Test
                difficultyLevels = [1, 2, 2, 3, 3, 3];
                numQuestionsPerSkill = 5;
            } else if (avgScore <= 75) {
                // Medium Score: Intermediate Level Adjustment (Default), Default Length
                difficultyLevels = [1, 2, 3, 4, 5, 6]; // Explicit for clarity
                numQuestionsPerSkill = 6; // Explicit for clarity
            } else if (avgScore <= 90) {
                // High Score: Upper Intermediate Level Adjustment, Slightly Longer Test
                difficultyLevels = [4, 5, 5, 6, 6, 6];
                numQuestionsPerSkill = 7;
            } else {
                // Very High Score: Advanced Level Adjustment, Longer Test
                difficultyLevels = [5, 5, 6, 6, 6, 6];
                numQuestionsPerSkill = 8;
            }
        }

        const selectQuestions = (items: any[], difficulties: number[], count: number) => { // Modified to accept 'count'
            const selected = [];
            for (let i = 0; i < count; i++) { // Loop to select 'count' number of questions
                const difficulty = difficulties[i % difficulties.length]; // Cycle through difficulties if needed, or adjust logic
                const pool = items.filter(item => parseInt(item.difficulty) === difficulty);
                if (pool.length === 0) {
                    const fallbackPool = items.filter(item => parseInt(item.difficulty) <= difficulty + 1 && parseInt(item.difficulty) >= difficulty - 1);
                    if (fallbackPool.length > 0) {
                        selected.push(getRandomItems(fallbackPool, 1)[0]);
                    } else {
                        throw new Error(`Missing difficulty or near difficulty ${difficulty} questions`);
                    }
                } else {
                    selected.push(getRandomItems(pool, 1)[0]);
                }
            }
            return selected;
        };

        // Customized question selection with adjusted difficultyLevels and numQuestionsPerSkill
        const speakingQuestions = selectQuestions(databases.speaking, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill
        const listeningQuestions = selectQuestions(databases.listening, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill
        const readingQuestions = selectQuestions(databases.reading, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill
        const writingQuestions = selectQuestions(databases.writing, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill

        // Vocabulary: keep default difficulty distribution, adjust count
        const vocabularyQuestions = ['better_translation', 'context_translation', 'true_or_false']
            .flatMap(type => {
                const typeQuestions = databases.vocabulary.filter(item => item.type === type);
                return selectQuestions(typeQuestions, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill
            });

        // Grammar: keep default difficulty distribution, adjust count
        const grammarQuestions = ['multiple-choice', 'tense-aspect', 'true_or_false']
        .flatMap(type => {
            const typeQuestions = databases.grammar.filter(item => item.type === type);
            return selectQuestions(typeQuestions, difficultyLevels, numQuestionsPerSkill); // Pass numQuestionsPerSkill
        });

        // Build test object
        const placementTest = {
            id: newTestId,
            createdAt: serverTimestamp(),
            date: currentDateFormatted,
            speaking: speakingQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            listening: listeningQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            reading: readingQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            writing: writingQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            vocabulary: vocabularyQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            grammar: grammarQuestions.map(q => ({ question: q, answer: null, completed: false, score: null })),
            
            abilitiesScore: {
                speakingScore: null,
                listeningScore: null,
                readingScore: null,
                writingScore: null,
                vocabularyScore: null,
                grammarScore: null
            },
            abilitiesCompleted: {
                speakingCompleted: false,
                listeningCompleted: false,
                readingCompleted: false,
                writingCompleted: false,
                vocabularyCompleted: false,
                grammarCompleted: false
            }
        };

        // Save the placement test to Firestore
        try {
            await setDoc(placementDocRef, placementTest);
            toast("Iniciando...", {
                position: "bottom-center",
                style: {
                    borderRadius: "10px",
                    background: "#1fc84f",
                    color: "#fff",
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "1rem",
                }
            });
            setCurrentTestId(newTestId)
            setShowTest(true);
        } catch (error) {
            console.error("Erro ao criar o teste:", error);
            toast.error("Erro ao criar o teste. Tente novamente.");
        }
    };

    return (
        <div className='flex flex-col items-center justify-center p-4 w-full h-full'>
            <Toaster />

            {/* Animate view transition between Test List and Placement Test */}
            <AnimatePresence mode="wait">
                {!showTest ? (
                    <motion.div
                        key="testList"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className='lg:flex lg:flex-row md:flex md:flex-col flex flex-col items-center justify-center w-full h-full gap-4 text-fluency-text-light dark:text-fluency-text-dark p-6 rounded-md'
                    >
                        <div className="relative bg-fluency-gray-100 dark:bg-fluency-pages-dark w-full lg:h-[75vh] md:h-full h-full flex flex-col items-center justify-between rounded-md border-white border p-8">
                            <div className="absolute top-4 right-4 font-bold text-sm">
                                <CiCircleQuestion onClick={() => setIsExplanationOpen(true)} className='w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer' />
                            </div>
                            <p id="text-gradient" className="font-bold text-[2rem] text-center lg:mb-0 md:mb-2 mb-4">Hey, {session?.user.name}!</p>
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-center font-semibold text-lg">
                                    Vamos fazer um nivelamento e entender melhor como podemos melhorar seu {language === 'Ingles' ? 'Inglês' : 'Espanhol'}!
                                </p>
                                <p className="text-center font-semibold text-lg mt-4">
                                    Seu nível é: <Badges level={determineCEFRLevel(tests[0]?.totalScore || 0)} />
                                </p>
                            </div>
                            {shouldShowButton ? (
                                <button
                                    onClick={handleStartTest}
                                    id='background-body'
                                    className='lg:mt-0 md:mt-2 mt-4 text-white flex flex-row items-center gap-2 p-2 px-4 rounded-md border-white hover:bg-white hover:font-bold ease-in-out duration-300 transition-all'
                                >
                                    {hasIncompleteTest ? "Continuar" : "Começar"} <VscDebugStart className="w-4 h-auto" />
                                </button>
                            ) : (
                                <p className='text-center lg:mt-0 md:mt-2 mt-4'>Sem testes para fazer por enquanto 😴</p>
                            )}
                        </div>

                        <div className="relative bg-fluency-gray-100 dark:bg-fluency-pages-dark w-full h-[75vh] flex flex-col items-center justify-between rounded-md border-white border p-8">
                            <div className="absolute top-4 right-4 font-bold text-sm">
                                <CiCircleQuestion onClick={() => setIsProgressOpen(true)} className='w-6 h-6 hover:text-indigo-600 duration-300 ease-in-out transition-all cursor-pointer' />
                            </div>
                            <div className="flex flex-col text-center w-full">
                                <p id="text-gradient" className="font-bold text-[2rem] mb-4">Seu progresso:</p>
                                <div className='flex flex-col gap-2 justify-start h-[50vh] overflow-y-auto'>
                                    <AnimatePresence>
                                        {tests.map((test, index) => {
                                            const isCurrentTest = !test.completed && Object.values(test.abilitiesCompleted).some(v => v === false);
                                            return (
                                                <motion.div
                                                    key={test.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    onClick={() => {
                                                        if (test.completed) { // Condition to check if test is completed
                                                            setModalId(test.id);
                                                            setIsModalOpen(true);
                                                        } else {
                                                            toast("Teste incompleto. Complete-o para ver os detalhes.", {
                                                              position: "bottom-center",
                                                              style: {
                                                                  borderRadius: "10px",
                                                                  background: "#FA3D2E",
                                                                  color: "#fff",
                                                                  textAlign: "center",
                                                                  padding: "10px",
                                                                  fontSize: "1rem",
                                                              }
                                                          });
                                                        }
                                                    }}
                                                    className={`lg:flex lg:flex-row md:flex md:flex-col flex flex-col lg:gap-0 md:gap-2 gap-3 justify-between items-center rounded-md p-2 px-4 cursor-pointer bg-fluency-pages-light hover:bg-fluency-gray-200 dark:bg-fluency-bg-dark dark:hover:bg-fluency-gray-500 duration-300 ease-in-out transition-all ${!test.completed ? 'opacity-70 cursor-not-allowed' : ''}`} //Visual cue for incomplete tests
                                                >
                                                    <p className='font-bold'>
                                                        {test.completed ? "Finalizado em" : isCurrentTest ? "Iniciado em" : "Iniciado em"} {test.date}
                                                    </p>
                                                    <span className={`px-3 py-2 font-bold rounded-md ${test.completed ? "bg-green-500" : isCurrentTest ? "bg-yellow-500" : "bg-red-500"}`}>
                                                        {test.completed ? "Finalizado" : isCurrentTest ? "Em Progresso" : "Não Finalizado"}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="placementTest"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                    >
                        <PlacementTest
                            setShowTest={setShowTest}
                            testId={currentTestId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {isModalOpen && (
                <DetailsModal modalId={modalId} onClose={() => setIsModalOpen(false)} id={undefined} />
            )}

            {isExplanationOpen && (
                <Levels onClose={() => setIsExplanationOpen(false)} />
            )}

            {isProgressOpen && (
                <div className="fixed inset-0 bg-gray-400 bg-opacity-65 flex justify-center items-center z-50">
                    <div className="text-fluency-text-light dark:text-fluency-text-dark bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg w-fit overflow-hidden m-8">
                        <div className="flex justify-between items-center py-3 px-6 bg-fluency-gray-100 dark:bg-fluency-gray-800">
                            <h2 className="text-xl font-semibold">
                                Relatório de progresso
                            </h2>
                            <IoClose onClick={() => setIsProgressOpen(false)} className="text-indigo-500 hover:text-indigo-600 cursor-pointer w-7 h-7 ease-in-out duration-300" />
                        </div>
                        <div className="p-6">
                            Clique no dia que deseja ver um relatório detalhado do seu teste.
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}