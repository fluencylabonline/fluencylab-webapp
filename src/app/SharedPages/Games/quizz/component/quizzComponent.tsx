'use client';
import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "@/app/firebase";
import FluencyButton from "@/app/ui/Components/Button/button";
import '../quizstyle.css';
import { FaArrowRight } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

interface QuizProps {
    deckName: string;
}

interface Option {
    option: string;
    isCorrect: boolean;
}

interface Question {
    questionTitle: string;
    options: Option[];
}

interface Deck {
    id: string;
    deckTitle: string;
    questions: Question[];
}

const Quiz: React.FC<QuizProps> = ({ deckName }) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
    const [playQuiz, setPlayQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('');
    const [remainingTime, setRemainingTime] = useState(60);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [gameStarted, setGameStarted] = useState(false); // State to track if the game has started

    useEffect(() => {
        const storedScore = localStorage.getItem('quizScore');
        if (storedScore) {
            setScore(parseInt(storedScore));
        }

        const gamePlayed = localStorage.getItem('gamePlayed');
        if (gamePlayed === 'true') {
            setGameStarted(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('quizScore', score.toString());
        localStorage.setItem('gamePlayed', gameStarted.toString());
    }, [score, gameStarted]);

    const startTimer = useCallback(() => {
        let timer = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(timer);
                    goToNextQuestion();
                    return 60;
                } else {
                    return prevTime - 1;
                }
            });
        }, 1000);
    }, []);

    const openPlayQuiz = useCallback((deck: Deck) => {
        setSelectedDeck(deck);
        setQuestions(deck.questions);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
        setRemainingTime(60);
        setPlayQuiz(true);
        setGameStarted(true);
        startTimer();
    }, [startTimer]);

    useEffect(() => {
        async function fetchDecks() {
            try {
                const decksCollection = collection(db, "Quizzes");
                const snapshot = await getDocs(decksCollection);
                const fetchedDecks: Deck[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    deckTitle: doc.data().deckTitle,
                    questions: doc.data().questions
                }));
                setDecks(fetchedDecks);
            } catch (error) {
                console.error("Error fetching decks:", error);
            }
        }
        fetchDecks();
    }, []);

    useEffect(() => {
        if (decks.length > 0 && deckName && gameStarted) { // Check if gameStarted is true
            const selected = decks.find(deck => deck.deckTitle === deckName);
            if (selected) {
                openPlayQuiz(selected);
            } else {
                console.warn(`Deck "${deckName}" not found.`);
            }
        }
    }, [decks, deckName, openPlayQuiz, gameStarted]);

    const closePlayQuiz = () => {
        setPlayQuiz(false);
        setSelectedDeck(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
        setGameStarted(false); // Reset gameStarted when closing quiz
        localStorage.removeItem('gamePlayed');
    };

    const handleAnswerSelect = (selectedOption: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = currentQuestion.options.some(
            (option) => option.option === selectedOption && option.isCorrect
        );
        setUserAnswer(selectedOption);
        setFeedback(isCorrect ? "Correto!" : "Errado!");
        setFeedbackColor(isCorrect ? "green" : "red");

        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }

        setTimeout(() => {
            goToNextQuestion();
        }, 60000);
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setUserAnswer(null);
            setFeedback('');
            setRemainingTime(60);
        } else {
            handleFinishQuiz();
        }
    };

    const handleFinishQuiz = async () => {
        closePlayQuiz();
    };

    const handleStartQuiz = () => {
        if (!playQuiz) {
            setGameStarted(true); // Set gameStarted to true when starting quiz
        }
    };

    const handlePlayAgain = () => {
        setScore(0);
        setGameStarted(false);
        localStorage.removeItem('gamePlayed');
    };

    return (
        <div id="firstletter">
            {!gameStarted && (
                <div className="flex items-center justify-center h-screen">
                    {score > 0 ? (
                        <div>
                            <p>Pontuação anterior: {score}</p>
                            <FluencyButton variant="confirm" onClick={handlePlayAgain}>Jogar Novamente</FluencyButton>
                        </div>
                    ) : (
                        <FluencyButton variant="confirm" onClick={handleStartQuiz}>Iniciar Quiz</FluencyButton>
                    )}
                </div>
            )}

            {playQuiz && selectedDeck && (
                <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden transform transition-all w-full h-max">
                    <div className="timer-bar fixed bg-fluency-green-600 top-0" style={{ width: `${(remainingTime / 60) * 100}%` }}></div>
                    <div className="flex flex-col items-center justify-center p-10">
                        {currentQuestionIndex < questions.length ? (
                            <div>
                                <h3 className="text-2xl leading-6 font-semibold mb-4">Pergunta {currentQuestionIndex + 1}</h3>
                                <p className="text-lg font-semibold">{questions[currentQuestionIndex].questionTitle}</p>
                                <ul className="flex flex-col gap-2 items-start ml-3">
                                    {questions[currentQuestionIndex].options.map((option, index) => (
                                        <li className="flex flex-row gap-1" key={index}>
                                            <input
                                                type="radio"
                                                id={option.option}
                                                name="options"
                                                value={option.option}
                                                checked={userAnswer === option.option}
                                                onChange={() => handleAnswerSelect(option.option)}
                                            />
                                            <label htmlFor={option.option}>{option.option}</label>
                                        </li>
                                    ))}
                                </ul>
                                <p className="flex flex-col justify-center items-center p-2 m-2 mt-3 rounded-md font-bold text-white" style={{ backgroundColor: feedbackColor }}>{feedback}</p>
                                <div className="flex flex-row gap-2 justify-center pt-4">
                                    <FluencyButton variant="warning" onClick={closePlayQuiz}>Fechar <IoClose className="w-6 h-auto" /></FluencyButton>
                                    <FluencyButton variant="confirm" onClick={goToNextQuestion}>Próxima <FaArrowRight className="w-6 h-auto" /></FluencyButton>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl leading-6 font-bold mb-4">Quiz completo!</h3>
                                <div className="flex flex-col gap-2 p-3 items-center">
                                    <p>Pontuação final: {score}</p>
                                    <FluencyButton variant="confirm" onClick={handlePlayAgain}>Jogar Novamente</FluencyButton>
                                    <FluencyButton variant="warning" onClick={closePlayQuiz}>Fechar <IoClose className="w-6 h-auto" /></FluencyButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Quiz;
