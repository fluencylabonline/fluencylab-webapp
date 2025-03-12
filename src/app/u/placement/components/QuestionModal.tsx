// components/QuestionModalComponent.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../types'; // Import the Question interface
import FluencyButton from '@/app/ui/Components/Button/button';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: Question[];
    ability: string;
    currentQuestionIndex: number;
    onAnswer: (questionId: string, userAnswer: string | null, isCorrect: boolean, difficulty: number, questionIndex: number, skipped: boolean) => void;
    onNextQuestion: () => void;
    onSkipQuestion: () => void;
    isLastQuestion: boolean;
    language: string;
}

const QuestionModalComponent: React.FC<QuestionModalProps> = ({
    isOpen,
    onClose,
    questions,
    ability,
    currentQuestionIndex,
    onAnswer,
    onNextQuestion,
    onSkipQuestion,
    isLastQuestion,
    language
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showNextButton, setShowNextButton] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean | null>(null);
    const [disableOptions, setDisableOptions] = useState(false);
    const [showSkipButton, setShowSkipButton] = useState(true);

    // Speech Recognition states
    const [recording, setRecording] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState('');
    const [speakingScore, setSpeakingScore] = useState<number | null>(null);
    const [recordAttempt, setRecordAttempt] = useState(0); // Track recording attempts for speaking
    const [showSpeakingNextButton, setShowSpeakingNextButton] = useState(false); // Control Next button for speaking
    const [showSpeakingSkipButton, setShowSpeakingSkipButton] = useState(true); // Control Skip button for speaking
    const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    
    // Listening attempts state
    const [listeningAttempts, setListeningAttempts] = useState(2);
    const [listeningButtonDisabled, setListeningButtonDisabled] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null); // Ref for SpeechSynthesisUtterance

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        if (isOpen) {
            setSelectedOption(null);
            setShowNextButton(false);
            setShowCorrectAnswer(null);
            setDisableOptions(false);
            setShowSkipButton(true);
            setListeningAttempts(2); // Reset listening attempts on new question
            setListeningButtonDisabled(false); // Enable listen button on new question

            // Reset speech recognition states when modal opens or question changes
            setRecording(false);
            setUserTranscript('');
            setInterimTranscript('');
            setError('');
            setSpeakingScore(null);
            setRecordAttempt(0); // Reset attempt count on new question
            setShowSpeakingNextButton(false); // Initially hide Next button for speaking
            setShowSpeakingSkipButton(true); // Initially show Skip button for speaking
        }
    }, [isOpen, currentQuestionIndex]);
    const stopSpeaking = useCallback(() => {
        if (speechSynthesisRef.current && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setListeningButtonDisabled(false); // Ensure button is re-enabled if speech is stopped manually
        }
    }, []);

    useEffect(() => {
        if (isOpen && currentQuestion?.type === 'listening' && currentQuestion.text) {
            // speakText(currentQuestion.text, language); // Removed auto speak on mount
        } else {
            stopSpeaking(); // Stop speaking if question type changes or modal closes
        }
        return stopSpeaking; // Cleanup function to stop speaking when component unmounts or re-renders
    }, [isOpen, currentQuestionIndex, currentQuestion?.type, currentQuestion?.text, language]);

    const speakText = useCallback((text: string, lang: string) => {
        stopSpeaking(); // Stop any ongoing speech before starting new one

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'en' ? 'en-US' : 'es-ES'; // Set language
        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            setError("Error reading question aloud.");
            setListeningButtonDisabled(false); // Re-enable button on error
        };
        utterance.onstart = () => {
            setListeningButtonDisabled(true); // Disable button while speaking
        };
        utterance.onend = () => {
            setListeningButtonDisabled(false); // Re-enable button after speaking finishes
        };

        // Adjust rate based on difficulty
        let rate = 1.0; // Normal speed
        if (currentQuestion.difficulty <= 2) {
            rate = 0.75;
        } else if (currentQuestion.difficulty <= 4) {
            rate = 0.85;
        }
        utterance.rate = rate;
        speechSynthesisRef.current = utterance; // Store current utterance in ref
        window.speechSynthesis.speak(utterance);
    }, [currentQuestion?.difficulty, stopSpeaking]);

    const handleOptionSelect = (option: string) => {
        if (disableOptions) return;

        setSelectedOption(option);
        setShowNextButton(true);
        setShowSkipButton(false);
        setDisableOptions(true);

        let isCorrect = false;
        if (currentQuestion.type === 'true_false') {
            isCorrect = String(currentQuestion.correctAnswer) === option;
        } else {
            isCorrect = currentQuestion.answer === option;
        }

        setShowCorrectAnswer(isCorrect);
        onAnswer(currentQuestion.id, option, isCorrect, currentQuestion.difficulty, currentQuestionIndex, false);
    };

    const handleNext = () => {
        setShowNextButton(false);
        setShowCorrectAnswer(null);
        setDisableOptions(false);
        setShowSkipButton(true);
        setUserTranscript(''); // Clear transcript for next question
        setSpeakingScore(null); // Clear speaking score
        setShowSpeakingNextButton(false); // Reset for next question
        setShowSpeakingSkipButton(true); // Reset for next question
        setRecordAttempt(0); // Reset attempt for next question
        setListeningAttempts(2); // Reset listening attempts for next question
        onNextQuestion();
    };

    const handleSkip = () => {
        setShowNextButton(false);
        setShowCorrectAnswer(null);
        setDisableOptions(false);
        setShowSkipButton(true);
        setUserTranscript(''); // Clear transcript for skipped question
        setSpeakingScore(null); // Clear speaking score
        setShowSpeakingNextButton(false); // Reset for next question
        setShowSpeakingSkipButton(true); // Reset for next question
        setRecordAttempt(0); // Reset attempt for next question
        setListeningAttempts(2); // Reset listening attempts for skipped question
        onSkipQuestion();
        onAnswer(currentQuestion.id, null, false, currentQuestion.difficulty, currentQuestionIndex, true); // null answer for skipped, isCorrect: false, skipped: true
    };
    
    const computeScore = useCallback(() => {
        if (currentQuestion.type === 'text' && currentQuestion.text) {
            // Normalize texts: lower case, trim, and remove punctuation/extra spaces.
            const normalizeText = (text: string): string => {
                return text
                    .toLowerCase()
                    .trim()
                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                    .replace(/\s{2,}/g, " ");
            };
    
            const refText = normalizeText(currentQuestion.text);
            const spokenText = normalizeText(userTranscript);
    
            // Split texts into words.
            const refWords = refText.split(" ");
            const spokenWords = spokenText.split(" ");
    
            // Compare each word in order.
            let matches = 0;
            for (let i = 0; i < refWords.length; i++) {
                if (spokenWords[i] && spokenWords[i] === refWords[i]) {
                    matches++;
                }
            }
    
            // Calculate a percentage score (100 means perfect match).
            const score = refWords.length === 0 ? 100 : (matches / refWords.length) * 100;
            const roundedScore = Math.round(score);
    
            setSpeakingScore(roundedScore);
            const isCorrect = roundedScore >= 70;
            setShowCorrectAnswer(isCorrect);
            setShowSpeakingNextButton(true);
            setShowSpeakingSkipButton(false);
            onAnswer(
                currentQuestion.id,
                userTranscript,
                isCorrect,
                currentQuestion.difficulty,
                currentQuestionIndex,
                false
            );
        }
    }, [userTranscript, currentQuestion, onAnswer, currentQuestionIndex]);
    

    // Start recording with realtime transcript updates.
    const startRecording = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        setError('');
        setRecording(true);
        setUserTranscript('');
        setInterimTranscript('');
        setSpeakingScore(null); // Reset score on new recording
        setShowSpeakingSkipButton(false); // Hide Skip during recording

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // allow longer pauses
        recognition.interimResults = true; // enable realtime results
        recognition.lang = language === 'en' ? 'en-US' : 'es-ES'; // Correct language mapping

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = "";
            let interimTranscriptLocal = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptChunk = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptChunk;
                } else {
                    interimTranscriptLocal += transcriptChunk;
                }
            }
            if (finalTranscript) {
                setUserTranscript((prev) => prev + finalTranscript + " ");
            }
            setInterimTranscript(interimTranscriptLocal);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Error in speech recognition:", event.error);
            setError("Error in speech recognition: " + event.error);
            setRecording(false);
            setShowSpeakingSkipButton(recordAttempt < 1); // Re-show Skip if attempts are left
        };

        recognition.onend = () => {
            setInterimTranscript("");
            // Auto-restart if recording is still true.
            if (recording) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Error restarting recognition:", e);
                }
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [language, recording, computeScore, recordAttempt]);

    // Stop recording manually, finalize the transcript, and compute the score.
    const stopRecording = useCallback(() => {
        setRecording(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setInterimTranscript("");
        computeScore();
        setRecordAttempt(prevAttempt => prevAttempt + 1); // Increment attempt count
        setShowSpeakingSkipButton(recordAttempt + 1 < 2); // Show Skip again if less than 2 attempts made (for the *next* attempt, hence + 1 < 2)

    }, [computeScore, recordAttempt]);

    const renderQuestionContent = () => {
        if (!currentQuestion) return <div>Loading question...</div>;

        if (currentQuestion.type === 'mcq' || currentQuestion.type === 'listening' || currentQuestion.type === 'true_false') {
            return (
                <div className="space-y-4">
                    {currentQuestion.type === 'mcq' && (<p className="font-semibold">{currentQuestion?.text}</p>)}
                    {currentQuestion.type === 'listening' && (
                        <div className="flex space-x-2 mb-2">
                            <FluencyButton
                                onClick={() => {
                                    if (listeningAttempts > 0) {
                                        speakText(currentQuestion.text || "", language);
                                        setListeningAttempts(listeningAttempts - 1);
                                    }
                                }}
                                disabled={listeningButtonDisabled || listeningAttempts <= 0}
                                variant='purple'
                            >
                                Ouvir o texto ({listeningAttempts} tentativas sobrando)
                            </FluencyButton>
                        </div>
                    )}
                    {currentQuestion.type === 'true_false' ? (
                        <p className="font-semibold">{currentQuestion.statement}</p>
                    ) : (
                        <p className="font-semibold">{currentQuestion.question}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {currentQuestion.type === 'true_false' ? (
                            <>
                                <button
                                    key="true"
                                    disabled={disableOptions}
                                    className={`p-3 rounded border ${disableOptions
                                        ? (selectedOption === 'true'
                                            ? (showCorrectAnswer ?  'bg-green-200 dark:bg-green-600 border-green-500 dark:border-green-900 font-bold' : 'bg-red-200 dark:bg-red-600 border-red-500 dark:border-red-800')
                                            : 'opacity-50 cursor-not-allowed border-gray-300')
                                        : 'hover:bg-gray-100 border-gray-300'
                                        }`}
                                    onClick={() => handleOptionSelect('true')}
                                >
                                    Verdadeiro
                                </button>
                                <button
                                    key="false"
                                    disabled={disableOptions}
                                    className={`p-3 rounded border ${disableOptions
                                        ? (selectedOption === 'false'
                                            ? (showCorrectAnswer ?  'bg-green-200 dark:bg-green-600 border-green-500 dark:border-green-900 font-bold' : 'bg-red-200 dark:bg-red-600 border-red-500 dark:border-red-800')
                                            : 'opacity-50 cursor-not-allowed border-gray-300')
                                        : 'hover:bg-gray-100 border-gray-300'
                                        }`}
                                    onClick={() => handleOptionSelect('false')}
                                >
                                    Falso
                                </button>
                            </>
                        ) : (
                            currentQuestion.options?.map((option, index) => (
                                <button
                                    key={index}
                                    disabled={disableOptions}
                                    className={`p-3 rounded border ${disableOptions
                                        ? (option === selectedOption
                                            ? (showCorrectAnswer ? 'bg-green-200 dark:bg-green-600 border-green-500 dark:border-green-900 font-bold' : 'bg-red-200 dark:bg-red-600 border-red-500 dark:border-red-800')
                                            : 'opacity-50 cursor-not-allowed border-gray-300')
                                        : 'hover:bg-gray-100 dark:hover:bg-fluency-gray-700 border-gray-300 dark:hover:border-fluency-gray-700 duration-300 ease-in-out transition-all'
                                        }`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            );
        } else if (currentQuestion.type === 'text') {
            return (
                <div className="space-y-4">
                    <p className="font-semibold">Leia em voz alta:</p>
                    <p>{currentQuestion.text}</p>

                    <div className="mt-4 flex space-x-2 ">
                        <FluencyButton
                            onClick={recording ? stopRecording : startRecording}
                            variant={recording ? 'danger' : 'purple'}
                            disabled={recordAttempt >= 2} // Disable recording after 2 attempts
                        >
                            {recording ? 'Parar' : 'Começar a falar'}
                        </FluencyButton>
                        {recordAttempt < 2 && <p className="text-gray-500">{`Tentativa ${recordAttempt + 1} de 2`}</p>}
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>


                    {interimTranscript && <div className="mt-2 italic text-gray-600">Transcrição em tempo real: {interimTranscript}</div>}
                    {userTranscript && <div className="mt-2 font-semibold">Sua fala: {userTranscript}</div>}
                    {speakingScore !== null && (
                        <div className={`mt-4 p-2 rounded ${showCorrectAnswer ? 'bg-green-200 dark:bg-green-600 border-green-500 dark:border-green-900 font-bold' : 'bg-red-200 dark:bg-red-600 border-red-500 dark:border-red-800'} border`}>
                            Pontuação: {speakingScore}% - {showCorrectAnswer ? "Mandou bem!" : "Ops. Precisa melhorar um pouco..."}
                        </div>
                    )}
                </div>
            );
        }
        return <div>Unsupported question type</div>;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg p-6 w-full max-w-lg mx-4"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <motion.div
                                className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500"
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {ability}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 5.47a.75.75 0 010 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {renderQuestionContent()}

                        {showCorrectAnswer !== null && ( // Conditionally show for MCQ and Listening
                            <div className={`mt-4 p-2 rounded ${showCorrectAnswer ? 'bg-green-100 dark:bg-green-600 border-green-500 dark:border-green-900 text-black dark:text-white font-bold' : 'bg-red-100 dark:bg-red-600 border-red-500 dark:border-red-900 text-black dark:text-white font-bold'} border`}>
                                {showCorrectAnswer ? "Correto!" : "Incorreto."}
                            </div>
                        )}


                        <div className="flex justify-end mt-6 space-x-2">
                            {showSpeakingSkipButton && currentQuestion.type === 'text' && ( // Conditionally show Skip for speaking based on state
                                <FluencyButton onClick={handleSkip} variant='warning'>
                                    Pular
                                </FluencyButton>
                            )}
                            {showSpeakingNextButton && currentQuestion.type === 'text' && ( // Conditionally show Next for speaking after recording
                                <FluencyButton onClick={handleNext} variant='purple'>
                                    {isLastQuestion ? 'Finalizar' : 'Proxima'}
                                </FluencyButton>
                            )}
                            {showSkipButton && currentQuestion.type !== 'text' && ( // Conditionally show Skip for other question types
                                <FluencyButton onClick={handleSkip} variant='warning'>
                                    Pular
                                </FluencyButton>
                            )}
                            {showNextButton && currentQuestion.type !== 'text' && ( // Conditionally show Next for other question types
                                <FluencyButton onClick={handleNext} variant='purple'>
                                    {isLastQuestion ? 'Finalizar' : 'Proxima'}
                                </FluencyButton>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuestionModalComponent;
