'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';

//Firebase
import { collection, doc, DocumentData, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { ref, getDownloadURL, getStorage, uploadBytes } from 'firebase/storage';
import { storage } from '@/app/firebase';
import { signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

//Components Imports
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

//Next Imports
import { useSession } from 'next-auth/react';

//Notification
import { toast, Toaster } from 'react-hot-toast';

//Icons
import { RiErrorWarningLine } from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import { Tooltip } from '@nextui-org/react';
import { PiExam } from 'react-icons/pi';
import { MdEditCalendar } from 'react-icons/md';
import { LuCalendarX2 } from 'react-icons/lu';

interface Time {
  id: string;
  day: string;
  hour: string;
  status?: {
    studentId: string;
    studentName: string;
  };
}


interface Student {
  id: string;
  [key: string]: any;
}

function Perfil() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Deslogado")
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    const [isChecked, setIsChecked] = useState(() => {
      if (isLocalStorageAvailable) {
        const storedDarkMode = localStorage.getItem('isDarkMode');
        return storedDarkMode ? storedDarkMode === 'true' : true;
      }
      return true; // Default to true if localStorage is not available
    });
    
    useEffect(() => {
      if (isLocalStorageAvailable) {
        localStorage.setItem('isDarkMode', isChecked.toString());
        document.body.classList.toggle('dark', isChecked);
      }
    }, [isChecked, isLocalStorageAvailable]);


    const { data: session } = useSession();

    const [cursoFeito, setCursoFeito] = useState<boolean[]>([]);
    useEffect(() => {
      const fetchUserInfo = async () => {
        if (session?.user.id) {
          try {
            const profile = doc(db, 'users', session?.user.id);
            const docSnap = await getDoc(profile);
            if (docSnap.exists()) {
              const userData = docSnap.data();
              if (userData && userData.courses) {
                // Convert object values to array of boolean values
                const coursesArray: boolean[] = Object.values(userData.courses);
                setCursoFeito(coursesArray);
              } else {
                console.log("No courses data found in the user document.");
              }
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching document: ", error);
          }
        }
      };
    
      fetchUserInfo();
    }, [session?.user.id]);
    
/*
    useEffect(() => {
      if (session) {
        const updateUserStatus = async () => {
          const { user } = session;
          const userDocRef = doc(db, 'users', user.id);
  
          try {
            // Update the status field to 'online'
            await updateDoc(userDocRef, {
              status: 'online'
            });
            console.log('User status updated to online');
          } catch (error) {
            console.error('Error updating user status:', error);
          }
        };
  
        updateUserStatus();
      }
    }, [session]); */

    const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
    useEffect(() => {
        if (session) {
            const { user } = session;
            const profilePictureRef = ref(storage, `profilePictures/${user.id}`);
            getDownloadURL(profilePictureRef)
                .then((url) => {
                    setProfilePictureURL(url);
                })
                .catch((error) => {
                    console.error('Error fetching profile picture URL:', error);
                    setProfilePictureURL(null);
                });
        }
    }, [session]);

    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [link, setLink] = useState('');
    const [calendarLink, setCalendarLink] = useState('');

    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setName(docSnap.data().name);
                      setNumber(docSnap.data().number);
                      setLink(docSnap.data().link);
                      setCalendarLink(docSnap.data().calendarLink);
                  } else {
                      console.log("No such document!");
                  }
              } catch (error) {
                  console.error("Error fetching document: ", error);
              }
          }
      };

      fetchUserInfo()
  }, [session]);

  const [profileData, setProfileData] = useState<DocumentData | null>(null);
    const handleProfilePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]; // Ensure file exists before accessing
    
        if (file && session?.user.id) {
          const storage = getStorage();
          const storageRef = ref(storage, `profilePictures/${session?.user.id}`);
    
          try {
            // Upload the new profile picture
            await uploadBytes(storageRef, file);
    
            // Get the download URL of the uploaded picture
            const downloadURL = await getDownloadURL(storageRef);
    
            // Update the user's profile with the new picture URL
            if (auth.currentUser) { // Ensure auth.currentUser is not null
              await updateProfile(auth.currentUser, {
                photoURL: downloadURL,
              });
            }
    
            // Update the profile data state if needed
            if (profileData) {
              toast.success('Foto atualizada!', {
                position: 'top-center',
              });
              setProfileData((prevData: any) => ({
                ...prevData!,
                photoURL: downloadURL,
              }));
            }
          } catch (error) {
            console.error('Error uploading profile picture:', error);
          }
        }
      };


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const openEditModal = () => {
      setIsEditModalOpen(true);
    };
  
    const closeEditModal = () => {
      setIsEditModalOpen(false);
    };
  
  
    const [isEditModalOpenTwo, setIsEditModalOpenTwo] = useState(false);
    const openEditModalTwo = () => {
      setIsEditModalOpenTwo(true);
    };
  
    const closeEditModalTwo = () => {
      setIsEditModalOpenTwo(false);
    };

    const handleSaveProfile = async () => {
      if (!session || !session.user) {
        return;
      }
      const { id } = session.user; // Get the user ID from the session
      const updatedData = {
        name,
        number,
        link,
        calendarLink,
      };

      const userDocRef = doc(db, 'users', id); // Reference to the user document in Firestore
      try {
          await setDoc(userDocRef, updatedData, { merge: true });
          toast.success('Perfil atualizado com sucesso!', {
              position: 'top-center',
              duration: 2000,
            });
          closeEditModal();
          setIsEditModalOpenTwo(false);
        } catch (error) {
          console.error('Erro ao salvar dados do perfil:', error);
          toast.error('Erro ao salvar dados do perfil! Tente colocar o link antes', {
              position: 'top-center',
            });
        }
  };
  
    const [resetPassword, setResetPassword] = useState(false);
    const openResetPassword = () => {
      setResetPassword(true);
    };
  
    const closeResetPassword = () => {
      setResetPassword(false);
    };

    const [email, setEmail] = useState('');
    const handleResetPassword = () => {
      // Ensure email is not empty
      if (!email) {
        toast.error('Por favor, insira um endereço de e-mail válido.');
        return;
      }
  
      // Send password reset email using Firebase Authentication
      sendPasswordResetEmail(auth, email)
        .then(() => {
          toast.success('Um e-mail de redefinição de senha foi enviado para o endereço fornecido.');
          closeResetPassword();
        })
        .catch((error) => {
          console.error('Erro ao enviar e-mail de redefinição de senha:', error);
          toast.error('Erro ao enviar e-mail de redefinição de senha. Por favor, tente novamente mais tarde.');
        });
    };

    const [horariosModal, setHorariosModal] = useState(false);
    const openHorariosModal = () => {
      setHorariosModal(true);
    };
  
    const closeHorariosModal = () => {
      setHorariosModal(false);
    };

  const [day, setDay] = useState<string>('Segunda');
  const [hour, setHour] = useState<string>('');
  const [times, setTimes] = useState<Time[]>([]);

  const fetchTimes = async () => {
    if (session && session.user && session.user.id) {
      const userDoc = doc(db, 'users', session.user.id);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setTimes(userData.times || []);
      }
    }
  };

  useEffect(() => {
    if (horariosModal) {
      fetchTimes();
    }
  }, [horariosModal]);

  const saveTime = async () => {
    if (session && session.user && session.user.id) {
      const userDoc = doc(db, 'users', session.user.id);
      const newTime: Time = {
        id: new Date().toISOString(),  // Generate a unique ID
        day,
        hour,
        status: { studentId: 'disponivel', studentName: '' }  // Set default status to 'disponível'
      };
      const updatedTimes = [...times, newTime];
      await updateDoc(userDoc, { times: updatedTimes });
      setTimes(updatedTimes);
      toast.success("Horário salvo!");
    }
  };
  
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
      const fetchStudents = async () => {
          if (session) {
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('role', '==', 'student'), where('professorId', '==', session.user.id));
              const querySnapshot = await getDocs(q);
              const fetchedStudents: Student[] = [];
              querySnapshot.forEach((doc) => {
                  fetchedStudents.push({ id: doc.id, ...doc.data() });
              });
              
              setStudents(fetchedStudents);
          }
      };
      fetchStudents();
  }, [session]);


  /*
  useEffect(() => {
    const syncData = async () => {
      if (session && session.user && session.user.id) {
        const db = getFirestore();
        const professorDocRef = doc(db, "users", session.user.id);
  
        // Fetch the professor's data
        const professorDocSnap = await getDoc(professorDocRef);
  
        if (professorDocSnap.exists()) {
          const professorData = professorDocSnap.data();
  
          if (professorData.role === "teacher") {
            const studentsQuery = query(
              collection(db, "users"),
              where("role", "==", "student"),
              where("professorId", "==", session.user.id)
            );
  
            // Fetch all students linked to this professor
            const studentsQuerySnapshot = await getDocs(studentsQuery);
  
            if (!studentsQuerySnapshot.empty) {
              let updatedTimes: Array<any> = [];
              let currentDate = new Date();
  
              // Collect all the days from the students' diaAula
              let studentDays: string[] = [];
  
              console.log("Initial professor times (will be replaced):", professorData.times);
  
              // Loop through all students
              studentsQuerySnapshot.forEach((docSnap) => {
                const studentData = docSnap.data();
                const studentId = docSnap.id;
                const { diaAula = [], name } = studentData;
  
                console.log(`Processing student ${name} with ID: ${studentId}`);
                console.log("Student diaAula:", diaAula);
  
                // Add the student's days to the studentDays array
                studentDays = [...studentDays, ...diaAula];
  
                diaAula.forEach((day: string) => {
                  // Create the new time slot
                  const newTimeSlot = {
                    day: day,
                    hour: "07:00",
                    id: new Date(currentDate).toISOString(),
                    status: {
                      studentId,
                      studentName: name,
                    },
                  };
  
                  // Increment the currentDate by 1 hour for the next time slot
                  currentDate.setHours(currentDate.getHours() + 1);
  
                  console.log("Adding new time slot:", newTimeSlot);
  
                  updatedTimes.push(newTimeSlot);
                });
              });
  
              // Log studentDays to ensure we have all days correctly
              console.log("All student days:", studentDays);
  
              // Add missing days if there are any, even if there are no students
              studentDays.forEach((day) => {
                const existsInTimes = updatedTimes.some((time) => time.day === day);
                if (!existsInTimes) {
                  // If the day is missing, create a new time slot for it
                  const newTimeSlot = {
                    day: day,
                    hour: "07:00",
                    id: new Date(currentDate).toISOString(),
                    status: {
                      studentId: "missing", // Placeholder ID if no student is attached
                      studentName: "Missing",
                    },
                  };
  
                  // Increment currentDate by 1 hour for the next slot
                  currentDate.setHours(currentDate.getHours() + 1);
                  updatedTimes.push(newTimeSlot);
  
                  console.log(`Added missing time slot for ${day}:`, newTimeSlot);
                }
              });
  
              console.log("Final updated times (with missing days):", updatedTimes);
  
              // Update the professor's times field in Firestore with the rebuilt times
              await updateDoc(professorDocRef, { times: updatedTimes });
              setTimes(updatedTimes); // Update the local state
  
              toast.success("Horários atualizados com os dados dos estudantes!");
            } else {
              toast.error("Nenhum estudante vinculado foi encontrado.");
            }
          }
        } else {
          toast.error("Dados do professor não encontrados.");
        }
      }
    };
  
    syncData();
  }, [session]);
  
  const updateTimeSlotStatus = async (timeId: string, studentId: string, studentName: string) => {
    if (session && session.user && session.user.id) {
      const userDocRef = doc(db, 'users', session.user.id);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
  
        // Update the times array in the professor's document
        const updatedTimes = (userData.times || []).map((time: Time) =>
          time.id === timeId ? { ...time, status: { studentId, studentName } } : time
        );
        await updateDoc(userDocRef, { times: updatedTimes });
        setTimes(updatedTimes);
  
        // Update the 'diaAula' array in the specific student's document
        if (studentId !== 'disponivel') {
          const studentDocRef = doc(db, 'users', studentId);
          const studentDocSnap = await getDoc(studentDocRef);
  
          if (studentDocSnap.exists()) {
            const studentData = studentDocSnap.data();
            const currentDiaAula = studentData.diaAula || []; // Ensure it's an array
            const dayToAdd = updatedTimes.find((time: { id: string; }) => time.id === timeId)?.day;
  
            if (dayToAdd && !currentDiaAula.includes(dayToAdd)) {
              // Append the day if it doesn't already exist in the array
              await updateDoc(studentDocRef, { diaAula: [...currentDiaAula, dayToAdd] });
            }
          } else {
            // If student document doesn't exist, create it with the diaAula array
            await setDoc(studentDocRef, { diaAula: [updatedTimes.find((time: { id: string; }) => time.id === timeId)?.day] });
          }
        }
  
        toast.success("Status atualizado e diaAula do estudante atualizado!");
      }
    }
  };
*/
  
  const updateTimeSlotStatus = async (timeId: string, studentId: string, studentName: string) => {
    if (session && session.user && session.user.id) {
      const userDocRef = doc(db, 'users', session.user.id);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedTimes = (userData.times || []).map((time: Time) => 
          time.id === timeId ? { ...time, status: { studentId, studentName } } : time
        );
        await updateDoc(userDocRef, { times: updatedTimes });
        setTimes(updatedTimes);
        toast.success("Status atualizado!");
      }
    }
  };
  
  const [editingTime, setEditingTime] = useState<Time | null>(null);
  const [studentEditingName, setStudentEditingName] = useState('')
  const editTimeSlot = (time: Time, studentName: string ) => {
    setEditingTime(time);
    setDay(time.day);
    setHour(time.hour);
    setStudentEditingName(studentName)
  };
  const saveEditedTimeSlot = async () => {
    if (session && session.user && session.user.id) {
      const userDoc = doc(db, 'users', session.user.id);
      const updatedTimes = times.map(time => 
        time.id === editingTime?.id 
          ? { ...time, day, hour } 
          : time
      );
      await updateDoc(userDoc, { times: updatedTimes });
      setTimes(updatedTimes);
      setEditingTime(null);
      toast.success("Horário atualizado!");
    }
  };
  
  const deleteTime = async (id: string) => {
    if (session && session.user && session.user.id) {
      const userDoc = doc(db, 'users', session.user.id);
      const updatedTimes = times.filter((time) => time.id !== id);
      await updateDoc(userDoc, { times: updatedTimes });
      setTimes(updatedTimes);
      toast.success("Horário deletado!");
    }
  };
  
    return (
    <div className="flex flex-col items-center lg:pr-2 md:pr-2 pt-3 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">                   
        <div className='fade-in fade-out w-full gap-4 lg:flex lg:flex-row sm:flex sm:flex-col md:flex md:flex-col overflow-y-auto'>
          
          <div className="flex flex-col items-stretch w-full h-full gap-4">
            <div className="bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-2 rounded-lg lg:flex lg:flex-row lg:items-center md:flex md:flex-row md:justify-center flex flex-col md:items-center items-center gap-2">
              <div className='lg:mb-3 mb-0'>
                <label className="relative cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out">
                  <input
                    className="absolute w-full h-full opacity-0"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                 {profilePictureURL ? (
                    <img
                      alt="Foto de Perfil"
                      src={profilePictureURL}
                      width={100}
                      className="border-full border-1 lg:w-58 lg:h-58 md:w-40 md:h-40 w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out mx-auto"
                      style={{
                      display: 'flex',
                      }}
                    />
                  ) : (
                    <div className="bg-fluency-blue-100 dark:bg-fluency-gray-700 lg:w-58 lg:h-58 md:w-40 md:h-40 w-24 h-24 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out mx-auto">
                      <div><FaUserCircle className='icon lg:w-58 lg:h-58 md:w-40 md:h-40 w-24 h-24 rounded-full'/></div>
                    </div>
                  )}
                </label>          
              </div>
         
                <div className='p-3 rounded-lg flex flex-col lg:items-start md:items-start items-center gap-1'>
                  <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Informações Pessoais</h1>
                  <p><strong>Nome:</strong> {name}</p>
                  <p className='flex flex-wrap gap-1 justify-center lg:justify-start'><strong>Email pessoal:</strong> {session?.user.email}</p>
                  <p><strong>Número:</strong> {number}</p>

                  <div className="mt-6 text-center lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 justify-center">
                        <FluencyButton variant='danger' onClick={openResetPassword}>Redefinir senha</FluencyButton>  
                        <FluencyButton onClick={openEditModal} variant='solid'>Atualizar perfil</FluencyButton>  
                    </div>
                </div>
            </div>

            <div className='flex flex-col sm:flex-row w-full h-full justify-around gap-4'>
                <div className='w-full bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col items-center gap-1'>
                  <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Sobre o professor:</h1>
                  <p className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu link:</strong> {link}</p>
                  <p className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu login:</strong> {session?.user.userName}</p>
                  <div className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu Calendário:</strong> {!calendarLink ? (
                      <div className='flex flex-row gap-1 items-center text-fluency-yellow-500'><p className='font-bold'>Link pendende </p><RiErrorWarningLine className='animate-pulse w-6 h-auto' /></div>
                  ) : (
                      <div>
                        <Tooltip className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-gray-800 dark:text-fluency-gray-50 font-semibold w-min flex flex-wrap p-2 rounded-md' content={calendarLink}>
                          Link registrado
                        </Tooltip>
                      </div>
                  )}</div>

                  <div className="mt-4 text-center flex flex-col gap-1 justify-center">
                    <FluencyButton onClick={openEditModalTwo} variant='solid'>Atualizar informações</FluencyButton>  
                    <FluencyButton onClick={openHorariosModal} variant='gray'>Atualizar horários</FluencyButton>
                  </div>
                </div> 

              <div className='w-full bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col items-center gap-1'>
                <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Check-list:</h1>
                {Array.isArray(cursoFeito) && cursoFeito.length > 0 ? (
                <div className={`flex flex-row gap-2 w-full rounded-md ${cursoFeito.every(course => course) ? 'bg-fluency-green-700' : 'bg-fluency-orange-700'} text-white font-bold p-3 items-center justify-between`}>
                  <div className='flex flex-row w-full justify-between items-center'>
                    {cursoFeito.every(course => course) ? (
                      <span className='flex flex-row items-center gap-1 w-full justify-between'>Curso de Instruções Feito! <PiExam className='w-6 h-auto' /></span>
                      ) : (
                        <a href="/teacher-dashboard/suporte/curso" className="flex flex-row items-center gap-1 w-full justify-between">
                          Fazer curso <PiExam className='w-6 h-auto' />
                        </a>
                      )}
                    </div>    
                  </div>
                ) : (
                  <div>Sem informação disponível</div>
                )}
                {link === null ? 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-orange-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Link do Meet não adicionado</p>
                  </div> 
                  : 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-green-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Link do Meet adicionado</p>  
                  </div>}

                  {number === null ? 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-orange-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Telefone não adicionado</p>
                  </div> 
                  : 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-green-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Telefone adicionado</p>  
                  </div>}

                  {profilePictureURL === null ? 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-orange-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Foto de perfil não adicionada</p>
                  </div> 
                  : 
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-green-700 text-white font-bold p-3 items-center justify-between'>
                    <p>Foto de perfil adicionada</p>  
                  </div>}
              </div> 
            </div>
          </div>

          <div className='w-full lg:mt-0 md:mt-0 mt-4 bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col items-center gap-1'>
            <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Informações importantes</h1>
          </div>
        </div>

    {isEditModalOpen && 
      <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
              
              <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                  <div className="flex flex-col items-center">
                      <FluencyCloseButton onClick={closeEditModal}/>
                      
                      <h3 className="text-lg leading-6 font-medium mb-2">
                          Atualizar Perfil
                      </h3>
                      <div className="mt-2 flex flex-col gap-3 p-4">                    
                        <FluencyInput type="text" placeholder="Nome" value={name} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setName(e.target.value)} variant='solid' />
                        <FluencyInput type="text" placeholder="Número" value={number} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setNumber(e.target.value)} variant='solid' />

                        <div className="flex w-full">                            
                          <FluencyButton variant='confirm' onClick={handleSaveProfile}>Salvar</FluencyButton>
                          <FluencyButton variant='gray' onClick={closeEditModal}>Cancelar</FluencyButton>
                        </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>}

    {isEditModalOpenTwo && 
      <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
              
              <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                  <div className="flex flex-col items-center justify-center">
                      
                      <FluencyCloseButton onClick={closeEditModalTwo}/>
                      
                        <h3 className="text-lg leading-6 font-medium  mb-2">
                            Atualizar Informações                            
                        </h3>
                        <div className="mt-2 flex flex-col items-center gap-3 p-4">
                          <FluencyInput type="text" placeholder="Link" value={link} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setLink(e.target.value)} variant='solid' />
                          <FluencyInput type="text" placeholder="Calendario Link" value={calendarLink} onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setCalendarLink(e.target.value)} variant='solid' />
                          <div className="flex justify-center">
                            <FluencyButton variant='confirm' onClick={handleSaveProfile}>Salvar</FluencyButton>
                            <FluencyButton variant='gray' onClick={closeEditModalTwo}>Cancelar</FluencyButton>
                          </div>
                        </div>
                  </div>
              </div>
          </div>
      </div>}

    {resetPassword && 
      <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
              
              <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                  <div className="flex flex-col items-center justify-center">
                      
                      <FluencyCloseButton onClick={closeResetPassword}/>
                      
                        <h3 className="text-lg leading-6 font-medium  mb-2">
                            Insira seu email pessoal                         
                        </h3>
                        <div className="mt-2 flex flex-col items-center gap-3 p-4">
                          <FluencyInput 
                          variant='solid' 
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder={session?.user.email}
                          onChange={(e) => setEmail(e.target.value)}
                          required/>
                          <div className="flex justify-center">
                            <FluencyButton variant='confirm' onClick={handleResetPassword}>Enviar</FluencyButton>
                            <FluencyButton variant='gray' onClick={closeResetPassword}>Cancelar</FluencyButton>
                          </div>
                        </div>
                  </div>
              </div>
          </div>
    </div>}

    {horariosModal && 
      <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-black dark:text-white rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full max-h-[95vh] p-5 mx-4">
              <div className="flex flex-col items-center justify-center p-2">
                <FluencyCloseButton onClick={closeHorariosModal} />
                <h3 className="text-lg leading-6 font-medium mb-2 p-2">
                  Insira seus horários
                </h3>
                <div className="mt-2 flex flex-col items-center gap-3">
                  <div className='flex flex-col sm:flex sm:flex-row items-center justify-between gap-3 bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md w-full'>
                    <div className='px-2'>
                      <p className='font-bold'>Dia</p>
                      <select className='px-2 rounded-md font-bold text-black dark:text-white py-1 bg-fluency-bg-light dark:bg-fluency-bg-dark' value={day} onChange={(e) => setDay(e.target.value)}>
                        <option>Segunda</option>
                        <option>Terça</option>
                        <option>Quarta</option>
                        <option>Quinta</option>
                        <option>Sexta</option>
                        <option>Sábado</option>
                        <option>Domingo</option>
                      </select>
                    </div>
                    <div className='px-2'>
                      <p className='font-bold'>Horário</p>
                      <input className='px-2 rounded-md font-bold text-black dark:text-white py-1 bg-fluency-bg-light dark:bg-fluency-bg-dark' type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
                    </div>
                    <button className='px-2 py-1 rounded-md bg-fluency-green-500 hover:bg-fluency-green-700 duration-300 ease-in-out transition-all font-bold text-white' onClick={saveTime}>Adicionar</button>
                  </div>

                  <div className='flex flex-col items-center justify-between gap-3 bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md w-full h-max'>
                      {!editingTime ? (
                      <>
                      <p className='font-bold'>Horários</p>
                      <ul className='p-2 flex flex-col items-center gap-4 lg:gap-2 overflow-y-auto max-h-[50vh]'>
                        {times.map((time, index) => (
                          <li className='flex flex-col lg:flex lg:flex-row items-center sm:gap-1 lg:gap-8 w-full justify-between bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-md p-2' key={index}>
                            <p className='font-semibold'>{time.day} às {time.hour}</p>
                            <select
                              className={`text-black dark:text-white py-1 bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-md font-medium ${
                                time.status?.studentId === 'disponivel' ? "text-fluency-green-500 font-semibold" : "text-black"
                                }`}
                                value={time.status?.studentId || ''}
                                onChange={(e) =>
                                  updateTimeSlotStatus(
                                    time.id,
                                    e.target.value,
                                    students.find((student) => student.id === e.target.value)?.name || ''
                                  )
                                }
                              >
                              <option value="" disabled>Selecione um aluno</option>
                              <option value="disponivel">Disponível</option>
                              {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                  {student.name}
                                </option>
                              ))}
                            </select>
                            <div className='flex flex-row items-center gap-2'>
                              <Tooltip
                                className='bg-fluency-blue-300 px-2 font-bold rounded-md'
                                content="Editar"
                              >
                                <button
                                  onClick={() =>
                                    editTimeSlot(
                                      time,
                                      time.status?.studentId && students.find((s) => s.id === time.status?.studentId)?.name
                                    )
                                  }
                                >
                                  <MdEditCalendar className='w-5 h-auto text-fluency-blue-600 hover:text-fluency-blue-800' />
                                </button>
                              </Tooltip>
                              <Tooltip
                                className='bg-fluency-red-300 px-2 font-bold rounded-md'
                                content="Deletar"
                              >
                                <button onClick={() => deleteTime(time.id)}>
                                  <LuCalendarX2 className='w-5 h-auto text-fluency-red-600 hover:text-fluency-red-800' />
                                </button>
                              </Tooltip>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                    
                    ):(
                    <>
                      <p className='font-bold'>Modificar horário de {studentEditingName}</p>
                        <div className='flex flex-col lg:flex lg:flex-row items-center justify-between gap-3 bg-fluency-pages-light dark:bg-fluency-pages-dark p-2 rounded-md w-full'>
                          <select className='px-2 rounded-md font-bold text-black dark:text-white py-1 bg-fluency-bg-light dark:bg-fluency-bg-dark' value={day} onChange={(e) => setDay(e.target.value)}>
                            <option value="">Selecione um dia</option>
                            <option>Segunda</option>
                            <option>Terça</option>
                            <option>Quarta</option>
                            <option>Quinta</option>
                            <option>Sexta</option>
                            <option>Sábado</option>
                            <option>Domingo</option>
                          </select>
                          <input 
                            type="text" 
                            value={hour} 
                            onChange={(e) => setHour(e.target.value)} 
                            placeholder="Horário" 
                            className='px-2 rounded-md font-bold text-black dark:text-white py-1 bg-fluency-bg-light dark:bg-fluency-bg-dark'
                          />
                          <div className='flex flex-row items-center gap-2'>
                            <button className='px-2 py-1 rounded-md bg-fluency-green-500 hover:bg-fluency-green-700 duration-300 ease-in-out transition-all font-bold text-white' onClick={saveEditedTimeSlot}>Salvar</button>
                            <button className='px-2 py-1 rounded-md bg-fluency-red-500 hover:bg-fluency-red-700 duration-300 ease-in-out transition-all font-bold text-white' onClick={() => setEditingTime(null)}>Cancelar</button>
                          </div>
                      </div>
                    </>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>}

        <Toaster />

      </div>
    );
}

export default Perfil;

