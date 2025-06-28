'use client';
import React, { useEffect, useState } from 'react';

//Firebase
import { doc, collection, addDoc, getDocs, getDoc, updateDoc, onSnapshot, deleteDoc, query } from 'firebase/firestore';
import { db, storage } from '@/app/firebase';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

//Notification
import { toast, Toaster } from 'react-hot-toast';

//Icons
import { FaUserCircle } from 'react-icons/fa';
import { FaReplyAll } from "react-icons/fa";
import { TbLocationQuestion } from "react-icons/tb";
import { IoClose, IoNotificationsCircle } from "react-icons/io5";
import { BsFillSendCheckFill } from "react-icons/bs";
import { MdOutlineDeleteSweep } from 'react-icons/md';

//Next
import { useSession } from 'next-auth/react';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyButton from '../../ui/Components/Button/button';

interface Question {
    id: string;
    userId: string;
    name: any;
    email: string;
    tags: string[];
    pergunta: string;
    dia: string;
    descricao: string;
    userProfilePic: string;
    date: string; 
    numAnswers: number; 
    read: boolean;
}

interface Reply {
    userId: any;
    name: any;
    email: string;
    replyText: string;
    dia: string;
    userProfilePic: any;
}

export default function Forum() {
    const { data: session } = useSession();
    const userIDSession = session?.user.id;
    const userEmailSession = session?.user.email;
    const userNameSession = session?.user.name;
    const userRoleSession = session?.user.role;

    const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
    useEffect(() => {
        if (userIDSession) {
            const profilePictureRef = ref(storage, `profilePictures/${userIDSession}`);
            getDownloadURL(profilePictureRef)
                .then((url) => {
                    setProfilePictureURL(url);
                    console.log(profilePictureURL)
                })
                .catch((error) => {
                    console.error('Error fetching profile picture URL:', error);
                    setProfilePictureURL(null);
                });
        }
    }, [userIDSession, profilePictureURL]);
    
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'QuestionTags'), (snapshot) => {
            const loadedTags = snapshot.docs.map((doc) => doc.data().tag);
            setTags(loadedTags);
        });
    
        return () => unsubscribe();
    }, []);
    

    const [pergunta, setPergunta] = useState<string>('');
    const [descricao, setDescricao] = useState<string>('');

    const getCurrentDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleQuestionUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent the default form submission behavior

        try {
            if (userIDSession) {
                // Assuming you have a Firestore collection called 'users' storing user profiles
                const userDoc = await getDoc(doc(db, 'users', userIDSession));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const name = userData.name || 'Desconhecido'; // Use 'Unknown' if name is not available
                    
                    const selectedTags = Array.from(
                        document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
                    ).map((checkbox) => checkbox.value);
                    
                    const questionsCollectionRef = collection(db, 'Questions');
                    await addDoc(questionsCollectionRef, {
                        userId: userIDSession,
                        name: name,
                        email: userEmailSession,
                        pergunta: pergunta,
                        descricao: descricao,
                        tags: selectedTags, // Include selected tags
                        dia: getCurrentDate(),
                    });
                    toast.success('Pergunta enviada!', {
                        position: "top-center",
                      });
                      
                    // Clear the form fields after submission
                    setPergunta('');
                    setDescricao('');
                    setIsModalOpen(false);
                    setSelectedTags([]);
                } else {
                    console.error('User profile not found');
                }
            } else {
                console.error('No user logged in');
            }
        } catch (error) {
            console.error('Error adding question: ', error);
            toast.error('Erro ao adicionar pergunta!', {
                position: "top-center",
              });
        }
    };
    


    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Questions'), (snapshot) => {
            const loadedQuestions = snapshot.docs.map((doc) => {
                const data = doc.data() as Question;
                return {
                    ...data,
                    id: doc.id,
                };
            });
            setQuestions(loadedQuestions);
        });
    
        return () => unsubscribe();
    }, []);

    const [questions, setQuestions] = useState<Question[]>([]);
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Questions'));
                const loadedQuestions = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const data = doc.data() as Question;
                    const storage = getStorage();
                    const userProfilePicRef = ref(storage, `profilePictures/${data.userId}`);
                    const userProfilePicUrl = await getDownloadURL(userProfilePicRef);
                    
                    // Fetch answers for the question
                    const answersQuerySnapshot = await getDocs(collection(db, `Questions/${doc.id}/Answers`));
                    const numAnswers = answersQuerySnapshot.docs.length;
                    
                    return {
                        id: doc.id,
                        userId: data.userId,
                        name: data.name,
                        email: data.email,
                        tags: data.tags,
                        pergunta: data.pergunta,
                        dia: data.dia,
                        descricao: data.descricao,
                        userProfilePic: userProfilePicUrl,
                        date: data.date,
                        numAnswers: numAnswers,
                        read: data.read,
                    };
                }));
                setQuestions(loadedQuestions);
            } catch (error) {
                console.error('Error fetching questions: ', error);
            }
        };
        
        fetchQuestions();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsModalOpen(true);
      };

    const closeModal = () => {
        setIsModalOpen(false);
        setPergunta('');
        setDescricao('');
        setSelectedTags([]);
    };

    const [isQuestionOpen, setIsQuestionOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const openQuestionModal = (question: Question) => { 
        setSelectedQuestion(question);
        setIsQuestionOpen(true);
    };
    
    const closeQuestionModal = () => {
        setSelectedQuestion(null);
        setIsQuestionOpen(false);
    };

    const [replyText, setReplyText] = useState('');
    const [openReply, setOpenReply] = useState(false);
    const sendReply = async (replyText: string) => {
        if (!selectedQuestion) {
            console.error('Selected question is null.');
            return;
        }
    
        try {
            // Construct the reply object
            const reply: Reply = {
                userId: userIDSession,
                name: userNameSession,
                email: userEmailSession || '',
                replyText: replyText,
                dia: new Date().toISOString(), // Add the current date
                userProfilePic: profilePictureURL, // Include the user's profile picture URL
            };
    
            // Add the reply to the "Answers" subcollection of the selected question
            await addDoc(collection(db, `Questions/${selectedQuestion.id}/Answers`), reply);
    
            // Close the reply section
            setOpenReply(false);
    
            // Clear the reply textarea
            setReplyText('');
            toast.success('Resposta adicionada!', {
                position: "top-center",
              });
        } catch (error) {
            console.error('Error adding reply: ', error);
            toast.error('Erro ao responder!', {
                position: "top-center",
              });
        }
    };
    
    //SEE ANSWERS
    const [answers, setAnswers] = useState<Reply[]>([]);
    useEffect(() => {
        const fetchAnswers = async () => {
            if (selectedQuestion) {
                const unsubscribeAnswers = onSnapshot(collection(db, `Questions/${selectedQuestion.id}/Answers`), (snapshot) => {
                    const loadedAnswers = snapshot.docs.map((doc) => doc.data() as Reply);
                    setAnswers(loadedAnswers);
                });
                return () => unsubscribeAnswers();
            }};
        fetchAnswers();
    }, [selectedQuestion]);

    // Botão de mostrar resposta ou ocultar
    const [showAnswers, setShowAnswers] = useState(false); 
    const [searchQuery, setSearchQuery] = useState('');
    
    // Function to handle changes to the search query
    const handleSearchQueryChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearchQuery(event.target.value);
    };

    //NOTIFICATION BELL AND READ AND UNREAD
    const [newQuestions, setNewQuestions] = useState<Question[]>([]);
    const [badgeCount, setBadgeCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'Questions'), (snapshot) => {
            const newQuestionsData: Question[] = [];
            let unreadCount = 0; // Initialize unread count
    
            snapshot.forEach((doc) => {
                const questionData = { id: doc.id, ...doc.data() } as Question;
                newQuestionsData.push(questionData);
    
                // Check if question is unread, if so, increment unreadCount
                if (!questionData.read) {
                    unreadCount++;
                }
            });
    
            setNewQuestions(newQuestionsData);
            setBadgeCount(unreadCount);
        });
    
        return () => unsubscribe();
    }, []);
    
    const toggleDropdown = () => {
        setShowDropdown((prevState) => !prevState);
    };

    const markAsRead = async (questionId: string) => {
        await updateDoc(doc(db, 'Questions', questionId), { read: true });
    };

    const markAsUnread = async (questionId: string) => {
        await updateDoc(doc(db, 'Questions', questionId ), { read: false });
    };

    //TAGS SELECTION, VIEWING AND CREATING TAGS
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const loadTags = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'QuestionTags'));
                const loadedTags = querySnapshot.docs.map((doc) => doc.data().tag);
                setTags(loadedTags);
            } catch (error) {
                console.error('Error loading tags: ', error);
            }
        };

        loadTags();
    }, []);

    const handleTagSelection = (tag: string) => {
        if (selectedTags.includes(tag)) {
            // If the tag is already selected, remove it from the selected tags list
            setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag));
        } else if (selectedTags.length < 3) {
            // If the tag is not selected and the maximum number of tags is not reached, add it to the selected tags list
            setSelectedTags([...selectedTags, tag]);
        
        } else {
            // Optionally, you can show a message or notification indicating that the maximum number of tags has been reached
            console.log('Maximum number of tags reached');
            toast.error('Selecione no máximo 3 tags!', {
                position: "top-center",
            });
        }
    };
    
    const handleQuestionTags = async () => {
        if (searchTerm.trim() !== '') {
            const questionTagsCollectionRef = collection(db, 'QuestionTags');
            try {
                await addDoc(questionTagsCollectionRef, { tag: searchTerm.trim() });
                console.log('Tag added successfully');
                toast.success('Tag criada!', {
                    position: "top-center",
                  });
                setTags([...tags, searchTerm.trim()]); // Add the new tag to the list of tags
                searchTerm.trim() == '';
            } catch (error) {
                console.error('Error adding tag: ', error);
                toast.error('Erro ao criar tag!', {
                    position: "top-center",
                  });
            }
        }
    };
    
    const filteredOptions = tags.filter(tag => 
        tag && (searchTerm || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );    

    const visibleTags = filteredOptions.slice(0, 3);
    
    const formatDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0'); // Get actual hours
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Get actual minutes
    
        return `${day}/${month}/${year} às ${hours}h:${minutes}`;
    };

    const formattedDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const [isDeleteSure, setIsDeleteSure] = useState(false);

    const openDelete = () => {
    setIsDeleteSure(true);
    };

    const closeDelete = () => {
    setIsDeleteSure(false);
    };
    
    const handleDeleteQuestion = async (questionId: string) => {
        try {
            // Delete the question document
            await deleteDoc(doc(db, 'Questions', questionId));
            console.log('Question deleted successfully');
            toast.error('Pergunta deletada!', {
                position: "top-center",
              });
    
            // Delete the associated answers
            const answersQuerySnapshot = await getDocs(query(collection(db, `Questions/${questionId}/Answers`)));
            answersQuerySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
                console.log('Answer deleted successfully');
            });
        } catch (error) {
            console.error('Error deleting question: ', error);
        }
    };
    
    const handleToggleQuestions = () => {
        setIsUserQuestions(!isUserQuestions);
    };
    
    const [isUserQuestions, setIsUserQuestions] = useState(false); // Toggle between all questions and user's questions
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    
    // Update useEffect to filter questions based on user's role and ID
    useEffect(() => {
        const filtered = questions.filter((question) => {
            // Filter by question text
            const includesPergunta = question.pergunta.toLowerCase().includes(searchQuery.toLowerCase());
            // Filter by tags
            const includesTag = question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            // Check if the user is viewing their own questions
            const isUserQuestion = question.userId === userIDSession;
            // Return true if the question matches the search query and is either a user's question or all questions are requested
            return (isUserQuestions && isUserQuestion || !isUserQuestions) && (includesPergunta || includesTag);
        });
        setFilteredQuestions(filtered);
    }, [questions, searchQuery, isUserQuestions, userIDSession]);


    const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
            const status: { [key: string]: boolean } = {};
            snapshot.forEach(doc => {
                const userData = doc.data();
                status[doc.id] = userData.status || false;
            });
            setOnlineUsers(status);
        });
    
        return () => unsubscribe();
    }, []);
    
    // Function to determine badge color based on user's online status
    const getBadgeColor = (userId: string | number) => {
        return onlineUsers[userId] ? 'bg-fluency-green-500' : 'bg-fluency-red-500';
    };
    
    
    return (
        <div className="flex flex-col overflow-x-hidden overflow-y-hidden h-[92vh] px-6">
                <div className="w-full flex flex-row gap-4 items-center justify-around px-4 pt-4">
                    <div className="w-full relative mx-auto text-fluency-gray-600">
                        <FluencyInput
                            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                            type="search"
                            name="search"
                            placeholder="Procure pelo nome ou tag"
                            value={searchQuery}
                            onChange={handleSearchQueryChange}
                        />
                        <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
                            <svg
                                className="text-gray-600 h-4 w-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                version="1.1"
                                id="Capa_1"
                                x="0px"
                                y="0px"
                                viewBox="0 0 56.966 56.966"
                                width="512px"
                                height="512px"
                            >
                                <path
                                    d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-row gap-4 items-center">
                        <button onClick={openModal} className="bg-yellow-400 hover:bg-yellow-500 focus:bg-fluency-darker-blue text-white rounded-lg px-2 py-2 font-semibold relative ease-in-out duration-300 flex flex-row gap-1 items-center"><TbLocationQuestion />Pergunte</button>
                        <div className="hidden" onClick={toggleDropdown}>
                            {badgeCount > 0 ? (
                                <IoNotificationsCircle className="text-red-400 hover:text-red-500 transition-all ease-in-out duration-300 h-10 w-10 cursor-pointer" />
                            ) : <IoNotificationsCircle  className="text-green-400 hover:text-green-500 transition-all ease-in-out duration-300 h-10 w-10 cursor-pointer" />}
                            {badgeCount > 0 ? (
                                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-[0.5rem]">{badgeCount}</span>
                            ) : <span className="absolute top-0 right-0 bg-green-500 text-white rounded-full px-2 py-1 text-[0.5rem]">0</span>}
                            {showDropdown && (
                                <div className="z-50 absolute top-10 right-0 bg-white border border-gray-300 rounded-md shadow-md p-2 w-80">
                                    <ul className="divide-y divide-gray-200 flex flex-col gap-2">
                                        {newQuestions.map((question, index) => (
                                            <li key={index} className="p-2 bg-slate-200 rounded-md flex flex-row items-center justify-between">
                                                <span className={question.read ? 'text-gray-400' : ''}>{question.pergunta}</span>
                                                {!question.read && <button className='p-1 px-2 bg-slate-300 rounded-md text-sm font-medium hover:bg-slate-400 duration-300 ease-in-out' onClick={() => markAsRead(question.id)}>Lido</button>}
                                                {question.read && <button className='p-1 px-2 bg-slate-300 rounded-md text-sm font-medium hover:bg-slate-400 duration-300 ease-in-out' onClick={() => markAsUnread(question.id)}>Não lido</button>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            <div className="p-5 overflow-y-scroll">
                    <div className="flex flex-col gap-3 items-center">
                        <div className='flex flex-row gap-3 border-b-2 border-fluency-blue-400 dark:border-fluency-blue-100'>
                            <button
                                onClick={handleToggleQuestions}
                                className={` hover:text-fluency-blue-700 ease-in-out transition-all duration-100 border-fluency-blue-400 dark:border-fluency-blue-100 px-2 py-2 font-semibold ${
                                    !isUserQuestions ? 'border-b-4 border-fluency-blue-400 dark:border-fluency-blue-100 text-fluency-blue-600 font-bold' : ''
                                }`}
                            >
                                Perguntas
                            </button>
                            <button
                                onClick={handleToggleQuestions}
                                className={`ease-in-out transition-all duration-100 border-fluency-blue-400 dark:border-fluency-blue-100 px-2 py-2 font-semibold ${
                                    isUserQuestions ? 'border-b-4 text-fluency-blue-600 font-bold' : ''
                                }`}
                            >
                                Suas perguntas
                            </button>
                            
                        </div>
                        {filteredQuestions.map((question, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col gap-2 p-3 lg:w-[35rem] md:w-[25rem] sm:w-72 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl cursor-pointer"
                                >
                                    <div className="lg:flex lg:flex-row lg:items-start flex flex-col items-center justify-between">
                                        <div className="flex flex-row items-start gap-1 mr-2">
                                            <div className="relative inline-block w-10 h-10">
                                            {question.userProfilePic ? (
                                                    <img
                                                        src={question.userProfilePic}
                                                        className="object-cover w-full h-full rounded-full"
                                                        alt="Profile"
                                                    />
                                                ) : (
                                                    <FaUserCircle className="w-full h-full rounded-full" />
                                                )}
                                                <span className={`absolute animate-pulse top-0 right-0 w-3 h-3 border-2 border-white rounded-full ${getBadgeColor(question.userId)}`}></span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {question.name}
                                                </span>
                                                <span className="text-xs font-semithin">
                                                    {question.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end ml-2">
                                            <span className="relative text-xs font-medium">
                                                {formattedDate(question.dia)}
                                            </span>
                                            <span className="flex flex-row gap-2 text-xs font-medium">
                                                Respostas: 
                                                <p className={`text-xs ${question.numAnswers === 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}`}>
                                                    {question.numAnswers}
                                                </p>
                                            </span>
                                        </div>
                                    </div>
                                    <span className="lg:text-lg lg:text-left text-sm text-center p-1 px-3 w-full">
                                        {question.pergunta}
                                    </span>
                                    <div className="lg:flex lg:flex-row lg:items-start flex flex-col items-center gap-1 justify-between">
                                        <div className="dark:text-fluency-gray-900 text-fluency-gray-50 bg-fluency-orange-600 dark:bg-fluency-orange-400 hover:bg-fluency-orange-500 hover:dark:bg-fluency-orange-500 duration-300 ease-in-out p-2 rounded-md flex flex-wrap gap-1 text-xs font-semibold items-center">
                                            Tags: 
                                            {question.tags.map((tag, index) => (
                                                <p key={index}>{tag};</p>
                                            ))}
                                        </div>

                                        {userRoleSession === 'admin' && (
                                            <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="dark:text-fluency-gray-900 text-fluency-gray-50  bg-fluency-red-600 dark:bg-fluency-red-400 hover:bg-fluency-red-500 hover:dark:bg-fluency-red-500 p-2 rounded-md flex flex-row gap-1 items-center text-xs font-semibold duration-300 ease-in-out"
                                        >
                                            <MdOutlineDeleteSweep className='text-sm'  /> Deletar
                                        </button>
                                        )}

                                        <button
                                            onClick={() => openQuestionModal(question)}
                                            className="dark:text-fluency-gray-900 text-fluency-gray-50  bg-fluency-orange-600 dark:bg-fluency-orange-400 hover:bg-fluency-orange-500 hover:dark:bg-fluency-orange-500 p-2 rounded-md flex flex-row gap-1 items-center text-xs font-semibold duration-300 ease-in-out"
                                        >
                                            <FaReplyAll /> Responder
                                        </button>
                                                                               
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

            {isModalOpen && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-fluency-gray-400 opacity-80"></div>
                    </div>

                    <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all lg:w-[30rem] md:w-max w-min h-full p-5">
                        <div className="flex flex-col items-center justify-center">
                            <form onSubmit={handleQuestionUser}  className="mt-3 lg:text-left md:text-left text-center sm:mt-0 p-4">
                            <button
                                onClick={closeModal}
                                className="absolute top-0 left-0 mt-2 ml-2 text-gray-500"
                            >
                                <span className="sr-only">Fechar</span>
                                <IoClose className="w-7 h-7 hover:text-blue-600 ease-in-out duration-300" />
                            </button>
                            
                            <h3 className="text-lg leading-6 font-medium mb-2">
                                Pergunta que a gente responde!
                            </h3>
                            <div className="mt-2 flex flex-col items-center gap-2">
                                <FluencyInput
                                    type="text"
                                    placeholder="Coloca aqui o que precisa de ajuda"
                                    className="border rounded-md px-3 py-2 lg:w-[25rem] md:w-[25rem] w-min h-full focus:outline-none"
                                    value={pergunta}
                                    onChange={(e) => setPergunta(e.target.value)}
                                    required
                                />
                                <textarea
                                    placeholder="Aqui vão os detalhes"
                                    className="dark:bg-fluency-pages-dark border rounded-md px-3 py-2 lg:w-[25rem] md:w-[25rem] w-min h-[7rem] mb-2 focus:outline-none"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                />
                                <div className="mt-2 p-2 text-white dark:text-black bg-fluency-orange-600 dark:bg-fluency-orange-400 rounded-lg flex flex-row justify-center">
                                    <span className='font-semibold text-sm'>Selecionadas: {selectedTags.join(', ')}</span>
                                </div>
                                <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center w-full gap-2">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Procurar etiquetas..."
                                        className="dark:bg-fluency-pages-dark border border-gray-300 focus:outline-none rounded-md px-3 py-2 mb-2"
                                    />
                                    <div className="flex flex-wrap gap-1" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        {visibleTags.map((tag, index) => (
                                            <label key={index} className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTags.includes(tag)}
                                                    onChange={() => handleTagSelection(tag)}
                                                    value={tag}
                                                    className="form-checkbox h-5 w-5 text-yellow-500"
                                                />
                                                <span className="ml-2 text-sm text-black dark:text-white">{tag}</span>
                                            </label>
                                        ))}
                                        {/* Option to create new tag */}
                                        {searchTerm && !filteredOptions.includes(searchTerm) && (
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTags.includes(searchTerm)}
                                                    onChange={() => handleTagSelection(searchTerm)}
                                                    className="form-checkbox h-5 w-5 text-yellow-500"
                                                />
                                        </label>
                                        )}
                                        {searchTerm.trim() !== '' && !tags.includes(searchTerm.trim()) && (
                                            <span onClick={handleQuestionTags} className="ml-2 text-sm text-black dark:text-white bg-fluency-orange-600 dark:bg-fluency-orange-400 p-1 rounded-md cursor-pointer">{`Criar etiqueta "${searchTerm.trim()}"`}</span>)}
                                    </div>
                                </div>

                                <FluencyButton type="submit" variant='warning' className='w-full'>
                                    <BsFillSendCheckFill /> Enviar pergunta
                                </FluencyButton>
                            </div>
                            
                            </form>
                        </div>
                    </div>
                </div>
            </div>}


            {/* Modal */}
            {isQuestionOpen && 
            <div className="fixed z-50 inset-0 overflow-y-hidden">
                <div className="flex items-center justify-center p-8">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-fluency-gray-400 opacity-80"></div>
                    </div>
                    <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-screen h-[90vh]">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <button onClick={closeQuestionModal} className="absolute top-0 right-0 mt-2 mr-2 text-gray-500">
                                    <span className="sr-only">Fechar</span>
                                    <IoClose className="w-10 h-10 hover:text-blue-600 ease-in-out duration-300" />
                                </button>
                                {selectedQuestion && (
                                    <div className="mt-4 px-5 rounded-md overflow-y-scroll h-[89vh]">
                                        {/* Render user profile, name, email, question, description, date, and tags */}
                                        <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col-reverse gap-2 mt-3 lg:justify-between md:justify-between justify-center items-center">
                                            {/* Render user profile */}
                                            <div className="flex flex-row gap-2 items-center">
                                                {/* Render user profile picture */}
                                                <div className="relative inline-block w-16 h-16">
                                                    {selectedQuestion.userProfilePic ? (
                                                        <img
                                                            src={selectedQuestion.userProfilePic}
                                                            className="object-cover w-full h-full rounded-full"
                                                            alt="Profile"
                                                        />
                                                    ) : (
                                                        <FaUserCircle className="w-full h-full rounded-full" />
                                                    )}                                                
                                                </div>
                                                {/* Render user name and email */}
                                                <div className="flex flex-col items-start">
                                                    <span className="text-md font-medium">{selectedQuestion.name}</span>
                                                    <span className="text-sm font-light">{selectedQuestion.email}</span>
                                                </div>
                                            </div>
                                            {/* Render question date */}
                                            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-1 mr-12">
                                                <span className="text-sm font-medium">Criado em:</span>
                                                <span className="text-sm font-medium">{formatDate(selectedQuestion.dia)}</span>
                                            </div>
                                        </div>
                                        {/* Render question and tags */}
                                        <div className="bg-fluency-blue-100 dark:bg-fluency-gray-600 p-3 rounded-md mt-3 flex flex-col gap-2">
                                            <h3 className="text-xl leading-6 font-medium">
                                                {selectedQuestion.pergunta}
                                            </h3>
                                            <span className="p-1">
                                                {selectedQuestion.descricao}
                                            </span>
                                            <div className="flex flex-row gap-2 text-xs font-medium">
                                                Tags: {selectedQuestion.tags.join(', ')}
                                            </div>

                                            {/* Reply textarea */}
                                            <div className="mt-1">
                                                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full border py-2 border-gray-300 dark:border-gray-800 bg-white dark:bg-black h-24 px-2 rounded-lg text-sm focus:outline-none" placeholder="Escreva a sua resposta aqui..."></textarea>
                                            </div>

                                            <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-center gap-2'>
                                            <FluencyButton variant='confirm'
                                                onClick={() => sendReply(replyText)} 
                                                className='w-fit'
                                                disabled={!replyText.trim()} // Disable the button if input is empty or contains only whitespace
                                            >
                                                Responder
                                            </FluencyButton>
                                                <FluencyButton variant='gray' onClick={() => setShowAnswers(!showAnswers)} className='w-fit'>
                                                {showAnswers ? `Ocultar respostas (${answers.length})` : `Mostrar respostas (${answers.length})`}</FluencyButton>                                            
                                            </div>
                                            {showAnswers && (
                                            <div className='p-2'>
                                                <h4 className="text-lg font-semibold">Respostas:</h4>
                                                {answers.length > 0 ? (
                                                    <ul className='flex flex-col p-2 gap-2'>
                                                        {answers.map((answer, index) => (
                                                            <li key={index}>
                                                                <div className='flex flex-col gap-1 items-start bg-fluency-gray-100 dark:bg-fluency-gray-700 p-2 rounded-lg'>
                                                                    <div className="flex items-center gap-2">
                                                                            {answer.userProfilePic ? (
                                                                                <img
                                                                                    src={answer.userProfilePic}
                                                                                    className="object-cover w-9 h-9 rounded-full"
                                                                                    alt="Profile"
                                                                                />
                                                                            ) : (
                                                                                <FaUserCircle className="w-9 h-9 rounded-full" />
                                                                            )}                                                                        
                                                                            <div className='flex flex-col items-start'>
                                                                            <span className="font-semibold">{answer.name}</span>
                                                                            <span className="font-light text-xs">{formatDate(answer.dia)}</span>
                                                                        </div>
                                                                    </div>
                                                                        <span className='ml-3 p-3'>{answer.replyText}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>Sem respostas ainda</p>
                                                )}
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {isDeleteSure && 
                <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-white rounded-lg flex flex-col items-center overflow-hidden shadow-xl transform transition-all w-[30rem] h-full p-5">                        
                            <div className="mt-3 text-center p-4">
                                <h3 className="text-lg text-center leading-6 font-medium text-gray-900 mb-2">
                                    Tem certeza de que deseja excluir a pergunta?
                                </h3>                             
                            </div>
                            <div className='flex flex-row items-center gap-2'>
                                <button className="bg-gray-300 hover:bg-gray-400 focus:bg-gray-400 text-gray-700 rounded-lg px-2 py-2 font-semibold relative ease-in-out duration-300 flex flex-row gap-1 items-center justify-center">
                                    Sim, tenho certeza!
                                </button>
                                <button onClick={closeDelete} className="bg-red-500 hover:bg-red-600 focus:bg-red-700 text-white rounded-lg px-2 py-2 font-semibold relative ease-in-out duration-300 flex flex-row gap-1 items-center justify-center">
                                    Não tenho, cancelar
                                </button>
                            </div>                                                      
                        </div>
                    </div>
                </div>}

            <Toaster />
        </div>
    );
}
