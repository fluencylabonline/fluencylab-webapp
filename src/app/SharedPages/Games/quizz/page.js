'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"; 
import { db } from "@/app/firebase";
import './quizstyle.css';

import { FiEdit } from "react-icons/fi";
import { MdDeleteSweep } from 'react-icons/md';
import { GiSchoolBag } from "react-icons/gi";
import { TbCardsFilled } from "react-icons/tb";
import { RxCardStackPlus } from "react-icons/rx";
import { MdOutlinePlaylistAdd, MdOutlineAddTask } from "react-icons/md";
import { FiCheck } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

import { useRouter } from 'next/navigation';
import { Tooltip } from "@nextui-org/react";
import {toast, Toaster} from "react-hot-toast";

export default function Quiz() {
    const router = useRouter();
    const { data: session } = useSession();
    const role = session?.user?.role;

    const [deckTitle, setDeckTitle] = useState('');
    const [deckDescription, setDeckDescription] = useState('');
    const [questionTitle, setQuestionTitle] = useState('');
    const [questionOption, setQuestionOption] = useState('');
    const [options, setOptions] = useState([]);
    const optionInputRef = useRef(null);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(-1);
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [editQuiz, setEditQuizz] = useState(false);

    const [students, setStudents] = useState([]);
    const [showStudentModal, setShowStudentModal] = useState(false);

    const [playQuiz, setPlayQuiz] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackColor, setFeedbackColor] = useState('');
    const [remainingTime, setRemainingTime] = useState(60); // Initial time in seconds (1 minute)
    const [score, setScore] = useState(0);

    const [createQuiz, setCreateQuizz] = useState(false);
    const [questions, setQuestions] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };
    const filteredDecks = decks.filter((deck) =>
        deck.deckTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    useEffect(() => {
        async function fetchDecks() {
            const decksCollection = collection(db, "Quizzes");
            const snapshot = await getDocs(decksCollection);
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        }
        fetchDecks();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const openPlay = params.get('openplay');
        const deckName = params.get('deckname');
        if (openPlay === 'true' && deckName) {
            const selectedDeck = decks.find(deck => deck.deckTitle === deckName);
            if (selectedDeck) {
                openPlayQuiz(selectedDeck); // Open quiz player if 'openplay' is true in URL and deck is found
            }
        }
    }, [decks]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (session) {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', session.user.id));
                const querySnapshot = await getDocs(q);
                const fetchedStudents = [];
                querySnapshot.forEach((doc) => {
                    fetchedStudents.push({ id: doc.id, ...doc.data() });
                });
                setStudents(fetchedStudents);
            }
        };
    
        fetchStudents();
    }, [session]);

    function openCreateQuiz() {
        setCreateQuizz(true);
    }

    function closeCreateQuiz() {
        setCreateQuizz(false);
        setDeckTitle('');
        setDeckDescription('');
        setQuestions([]);
        setQuestionTitle('')
        setOptions([]);
    }

    function openEditQuiz(deck) {
        setSelectedDeck(deck);
        setDeckTitle(deck.deckTitle);
        setDeckDescription(deck.deckDescription);
        setQuestions(deck.questions);
        setEditQuizz(true);
    }

    function closeEditQuiz() {
        setEditQuizz(false);
        setSelectedDeck(null);
        setDeckTitle('');
        setDeckDescription('');
        setQuestions([]);
    }

    function openPlayQuiz(deck) {
        setSelectedDeck(deck);
        setQuestions(deck.questions);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
        setRemainingTime(60); // Reset timer for each question
        setPlayQuiz(true);
        startTimer(); // Start the timer when modal opens
        
        // Update URL parameters
        const params = new URLSearchParams();
        params.set('deckname', deck.deckTitle);
        params.set('openplay', 'true');
        router.replace(`?${params.toString()}`);
    }
    
    function closePlayQuiz() {
        setPlayQuiz(false);
        setSelectedDeck(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswer(null);
        setFeedback('');
        
        // Update URL parameters
        const params = new URLSearchParams();
        params.set('deckname', '');
        params.set('openplay', 'false');
        router.replace(`?${params.toString()}`);
    }

    function openStudentModal(deckId) {
        setShowStudentModal(true);
        setSelectedDeck(decks.find(deck => deck.id === deckId));
    }
    

    function closeStudentModal() {
        setShowStudentModal(false);
    }
    
    async function handleAddDeckAsTask(studentId, deck) {
        try {
            const studentDocRef = doc(db, 'users', studentId);
            const studentDocSnapshot = await getDoc(studentDocRef);
            const studentData = studentDocSnapshot.data();
            
            if (!studentData || !studentData.tasks) {
                toast.error('Erro ao adicionar tarefa.');
                return;
            }
            
            const tasksArray = studentData.tasks.Task || [];
            const taskExists = tasksArray.some(task => task.task === `Revisar a aula de ${deck.deckTitle}`);
            
            if (taskExists) {
                toast.error('Tarefa já adicionada!');
                return;
            }
            
            const deckLink = `student-dashboard/pratica/quizz?deckname=${encodeURIComponent(deck.deckTitle)}&openplay=true`;
            const newTask = { task: `Revisar a aula de ${deck.deckTitle}`, link: deckLink, done: false };
            tasksArray.push(newTask);
            
            await updateDoc(studentDocRef, {
                tasks: { Task: tasksArray }
            });
            
            toast.success('Tarefa adicionada com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            toast.error('Erro ao adicionar tarefa.');
        }
    }
    

    function addOption() {
        if(!questionTitle){
            toast.error("Adicione um título à essa pergunta.");
            return null;
        }
        if (questionOption.trim() !== '') {
            setOptions([...options, { option: questionOption, isCorrect: false }]);
            setQuestionOption('');
            optionInputRef.current.focus();
        }
    }

    function deleteOptioninCreation(index) {
        const updatedOptions = [...options];
        updatedOptions.splice(index, 1);
        setOptions(updatedOptions);
    }

    function finishQuestion() {
        if (options.length < 2) {
            toast.error("Adicione pelo menos 2 alternativas!");
            return null
        }
        if(!deckDescription && !deckTitle){
            toast.error("Adicione título e descrição!");
            return null
        }
        if (correctOptionIndex === -1) {
            toast.error("Selecione a alternativa correta!");
            return;
        }
        if (questionTitle.trim() !== '' && options.length > 0) {
            setQuestions([...questions, { questionTitle, options }]);
            setQuestionTitle('');
            setOptions([]);
            setCorrectOptionIndex(-1);
            toast.success("Pergunta adicionada");
        } else {
            toast.error("Preencha a pergunta e alternativas");
        } 
    }

    async function handleCreateQuiz() {
        try {
            if (!deckTitle) {
                toast.error("Preencha o título do deck...");
                console.error("Deck title is required");
                return;
            }

            if (questions.length < 4) {
                toast.error("Adicione pelo menos 4 perguntas antes de criar o quiz.");
                return;
            }

            const quizRef = doc(db, "Quizzes", deckTitle);
            await setDoc(quizRef, {
                deckTitle: deckTitle,
                deckDescription: deckDescription,
                questions: questions,
            });
            toast.success("Deck criado com sucesso!");

            // Reset state after successful creation
            setDeckTitle('');
            setDeckDescription('');
            setQuestionTitle('');
            setQuestionOption('');
            setOptions([]);
            setQuestions([]);
            setCreateQuizz(false);

            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        } catch (error) {
            console.error("Error creating quiz: ", error);
        }
    }

    async function handleSaveEditQuiz() {
        try {
            if (!deckTitle || !selectedDeck) {
                toast.error("Preencha o título e descrição do deck...")
                console.error("Deck title and selected deck are required");
                return;
            }

            const quizRef = doc(db, "Quizzes", selectedDeck.id);
            await updateDoc(quizRef, {
                deckTitle: deckTitle,
                deckDescription: deckDescription,
                questions: questions,
            });

            // Reset state after successful editing
            closeEditQuiz();

            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
        } catch (error) {
            console.error("Error updating quiz: ", error);
        }
    }

    async function handleDeleteDeck(deckId) {
        try {
            await deleteDoc(doc(db, "Quizzes", deckId));
            // Refresh decks list
            const snapshot = await getDocs(collection(db, "Quizzes"));
            const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDecks(decksData);
            toast.error("Deck deletado")
        } catch (error) {
            console.error("Error deleting deck: ", error);
        }
    }

    const handleOptionChange = (index) => {
        setCorrectOptionIndex(index);
        setOptions(
            options.map((option, i) =>
                i === index ? { ...option, isCorrect: true } : { ...option, isCorrect: false }
            )
        );
    };

    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionTitle = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionEditChange = (qIndex, oIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex].option = value;
        setQuestions(updatedQuestions);
    };

    const handleOptionCorrectChange = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((option, i) =>
            i === oIndex ? { ...option, isCorrect: true } : { ...option, isCorrect: false }
        );
        setQuestions(updatedQuestions);
    };

    const deleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const deleteOption = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(updatedQuestions);
    };

    const addQuestionToEdit = () => {
        if (questionTitle.trim() !== '' && options.length > 0) {
            setQuestions([...questions, { questionTitle, options }]);
            setQuestionTitle('');
            setOptions([]);
            setCorrectOptionIndex(-1);
        }
    };

    const addOptionToQuestion = (qIndex) => {
        const updatedQuestions = [...questions];
        if (questionOption.trim() !== '') {
            updatedQuestions[qIndex].options.push({ option: questionOption, isCorrect: false });
            setQuestions(updatedQuestions);
            setQuestionOption('');
        }
    };

    const handleAnswerSelect = (selectedOption) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = currentQuestion.options.some(
            (option) => option.option === selectedOption && option.isCorrect
        );
        setUserAnswer(selectedOption);
        setFeedback(isCorrect ? "Correto!" : "Errado!");
        setFeedbackColor(isCorrect ? "green" : "red");
    
        // Update score if the answer is correct
        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }
    
        // Move to next question after 1 minute
        setTimeout(() => {
            goToNextQuestion();
        }, 60000);
    };    

    const startTimer = () => {
        let timer = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime === 0) {
                    clearInterval(timer);
                    goToNextQuestion(); // Move to next question when time's up
                    return 60; // Reset time for next question
                } else {
                    return prevTime - 1; // Decrease remaining time by 1 second
                }
            });
        }, 1000); // Update every second
    };
    
    const goToNextQuestion = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setUserAnswer(null);
        setFeedback('');
        setFeedbackColor("gray");
    };
     
    function handleKeyPress(event) {
        if (event.key === "Enter") {
            addOption();
        }
    }


return (
<div id="firstletter">

    <div className="flex flex-row gap-8 items-center w-full p-3 px-5"> 
        <FluencyInput
            placeholder="Procurar por deck"
            className="w-full"
            value={searchQuery}
            onChange={handleSearchChange}
        />
        {role === 'teacher' && <FluencyButton className="w-full" onClick={openCreateQuiz}>Create Quizz <RxCardStackPlus className="ml-2 w-6 h-auto" /></FluencyButton>}
    </div>
    
    <div className="flex flex-col items-start gap-2 w-full">
        {filteredDecks.map(deck => (
            <div key={deck.id} className="px-4 w-full">
                <div className="bg-fluency-pages-light hover:bg-fluency-gray-200 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 rounded-md cursor-pointer flex flex-row items-center justify-between gap-2">
                    <p onClick={() => openPlayQuiz(deck)} className="cursor-pointer font-bold p-2 ml-2 flex flex-row gap-1 items-center"><TbCardsFilled className="w-6 h-auto" /> {deck.deckTitle}</p>                     
                    <p className="text-center font-semibold">Pontuação: {score[deck.id] || 0}</p>
                    {role === 'teacher' && (
                    <div className="flex flex-row items-center gap-2">
                        <Tooltip content="Editar deck" className="bg-fluency-blue-600 p-1 rounded-md font-medium text-sm text-white"><p><FiEdit onClick={() => openEditQuiz(deck)} className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-blue-500 hover:dark:text-fluency-blue-500 duration-300 ease-in-out transition-all cursor-pointer'/></p></Tooltip>
                        <Tooltip content="Adicionar como tarefa" className="bg-fluency-yellow-600 p-1 rounded-md font-medium text-sm text-white"><p><GiSchoolBag onClick={() => openStudentModal(deck.id)} className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-yellow-500 hover:dark:text-fluency-yellow-500 duration-300 ease-in-out transition-all cursor-pointer'/></p></Tooltip>
                        {role === 'admin' &&  <Tooltip content="Deletar deck" className="bg-fluency-red-600 p-1 rounded-md font-medium text-sm text-white"><p><MdDeleteSweep onClick={() => handleDeleteDeck(deck.id)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p></Tooltip>}
                    </div>
                    )}
                </div>
            </div>
        ))}
    </div>

    {playQuiz && selectedDeck && (
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-max">
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
                                <p>Pontuação: {score}</p>
                                <FluencyButton variant="warning" onClick={closePlayQuiz}>Fechar <IoClose className="w-6 h-auto" /></FluencyButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>)}

    {editQuiz && 
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5">
                <div className="flex flex-col items-center justify-center">
                    <FluencyCloseButton onClick={closeEditQuiz} />
                    <h3 className="text-lg leading-6 font-medium mb-2">Editar Quiz</h3>
                    <div className="mt-2 lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start gap-3 p-2 w-full">
                        
                        <div className="flex flex-col justify-between w-max h-[70vh] items-center">
                            <div>
                                <p>Título</p>
                                <FluencyInput value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} placeholder="Título do deck" />
                                <p>Descrição</p>
                                <FluencyInput value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)} placeholder="Descrição" />
                                
                                <p>Título da pergunta</p>
                                <FluencyInput value={questionTitle} onChange={(e) => setQuestionTitle(e.target.value)} placeholder="Pergunta aqui" />
                                    <p>Opções</p>
                                    <div className="flex flex-row gap-1">
                                        <FluencyInput value={questionOption} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Alternativa" />
                                    </div>
                                    <div className="flex flex-row gap-1 items-center justify-center my-2">
                                        <FluencyButton className="flex flex-row items-center gap-1" onClick={addOption}>Adicionar <MdOutlinePlaylistAdd className="w-6 h-auto" /></FluencyButton>
                                        <FluencyButton className="flex flex-row items-center gap-1" variant="confirm" onClick={addQuestionToEdit}>Finalizar <FiCheck className="w-6 h-auto"/></FluencyButton>
                                    </div>
                                    <ul>
                                        {options.map((option, index) => (
                                            <li key={index}>
                                                <input
                                                    type="checkbox"
                                                    checked={index === correctOptionIndex}
                                                    onChange={() => handleOptionChange(index)}
                                                />
                                                <label>{option.option}</label>
                                            </li>
                                        ))}
                                    </ul>    
                                </div>
                        </div>

                        <div className="w-full h-[70vh] overflow-hidden overflow-y-scroll rounded-lg">
                            <p>Alternativas</p>
                            {questions.map((question, qIndex) => (
                                <div key={qIndex} className="flex flex-col items-center gap-2 mb-4 bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md">
                                    <FluencyInput value={question.questionTitle} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="Pergunta aqui" />
                                    <ul className="flex flex-col gap-1 w-full">
                                        {question.options.map((option, oIndex) => (
                                            <li key={oIndex} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={() => handleOptionCorrectChange(qIndex, oIndex)}
                                                />
                                                <FluencyInput className="h-8" value={option.option} onChange={(e) => handleOptionEditChange(qIndex, oIndex, e.target.value)} />
                                                <Tooltip content="Deletar alternativa" className="bg-fluency-red-600 p-1 rounded-md font-medium text-sm text-white"><p><MdDeleteSweep onClick={() => deleteOption(qIndex, oIndex)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p></Tooltip>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex flex-row items-center gap-1 w-full">
                                        <FluencyInput className="h-8" value={questionOption} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Nova alternativa" />
                                        <FluencyButton className="h-8" onClick={() => addOptionToQuestion(qIndex)}>Adicionar <MdOutlinePlaylistAdd className="w-6 h-auto" /></FluencyButton>
                                    </div>
                                    <FluencyButton variant="danger" onClick={() => deleteQuestion(qIndex)}>Deletar Pergunta</FluencyButton>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-6">
                        <FluencyButton variant='confirm' onClick={handleSaveEditQuiz}>Salvar</FluencyButton>
                        <FluencyButton variant='gray' onClick={closeEditQuiz}>Cancelar</FluencyButton>
                    </div>

                </div>
            </div>
        </div>
    </div>}

    {createQuiz && 
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5">
                <div className="flex flex-col items-center justify-center">
                    <FluencyCloseButton onClick={closeCreateQuiz} />
                    <h3 className="text-lg leading-6 font-medium mb-2">Criar um Quiz</h3>
                    <div className="mt-2 lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start justify-around gap-3 p-4 w-full">
                        <div className="w-full">
                            <FluencyInput value={deckTitle} onChange={(e) => setDeckTitle(e.target.value)} placeholder="Título do deck" />
                            <FluencyInput value={deckDescription} onChange={(e) => setDeckDescription(e.target.value)} placeholder="Descrição" />
                            <div>
                                <FluencyInput className="w-full" value={questionTitle} onChange={(e) => setQuestionTitle(e.target.value)} placeholder="Pergunta aqui" />
                                <p>Opções</p>
                                <div className="flex flex-col gap-1">
                                    <FluencyInput ref={optionInputRef} value={questionOption} onKeyPress={handleKeyPress} onChange={(e) => setQuestionOption(e.target.value)} placeholder="Alternativa" />
                                    <div className="flex flex-row items-center justify-center gap-1 w-full">
                                    <FluencyButton className="flex flex-row items-center gap-1" onClick={addOption}>Adicionar <MdOutlinePlaylistAdd className="w-6 h-auto" /></FluencyButton>
                                    <FluencyButton className="flex flex-row items-center gap-1" variant="confirm" onClick={finishQuestion}>Finalizar <FiCheck className="w-6 h-auto"/></FluencyButton>
                                    </div>
                                </div>
                                <ul className="py-2 flex flex-col gap-1 items-start h-[25vh] overflow-hidden overflow-y-scroll">
                                    {options.map((option, index) => (
                                        <li className="bg-fluency-gray-400 text-black dark:text-white p-1 px-2 rounded-md flex flex-row gap-1 items-center w-full" key={index}>
                                            <input
                                                type="checkbox"
                                                checked={index === correctOptionIndex}
                                                onChange={() => handleOptionChange(index)}
                                            />
                                            <label className="flex flex-row gap-1 items-center justify-between w-full">
                                                {option.option}
                                                <Tooltip content="Deletar alternativa" className="bg-fluency-red-600 p-1 rounded-md font-medium text-sm text-white"><p><MdDeleteSweep onClick={() => deleteOptioninCreation(index)} className='w-auto h-6 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-red-500 hover:dark:text-fluency-red-500 duration-300 ease-in-out transition-all cursor-pointer'/></p></Tooltip>
                                                </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 w-full bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md">
                            <h4 className="text-md leading-6 font-medium">Perguntas Adicionadas</h4>
                            <ul className="flex flex-col gap-1 w-full h-[56vh] overflow-hidden overflow-y-scroll">
                                {questions.map((question, index) => (
                                    <li key={index} className="bg-gray-200 dark:bg-gray-800 p-1 rounded-md">
                                        <strong>{question.questionTitle}</strong>
                                        <ul>
                                            {question.options.map((option, i) => (
                                                <li key={i}>{option.option}</li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center mt-4">
                        <FluencyButton variant='confirm' onClick={handleCreateQuiz}>Criar Quizz</FluencyButton>
                        <FluencyButton variant='gray' onClick={closeCreateQuiz}>Cancelar</FluencyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>}

    {showStudentModal && (
    <div className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-5">
            <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-full h-full p-5">
                <FluencyCloseButton onClick={closeStudentModal} />
                <div className="flex flex-col p-4 w-full">
                    <h2 className="text-lg font-semibold mb-4">Lista dos seus Alunos</h2>
                    {students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-2 px-4 mb-2 bg-fluency-pages-light hover:bg-fluency-gray-200 dark:bg-fluency-gray-900 hover:dark:bg-fluency-gray-900 rounded-md">
                            <p>{student.name}</p>
                            <FluencyButton variant="warning" onClick={() => handleAddDeckAsTask(student.id, selectedDeck)}>Adicionar como tarefa <MdOutlineAddTask className='w-auto h-6 ml-2' /> </FluencyButton>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>)}

    <Toaster />
</div>
);}
