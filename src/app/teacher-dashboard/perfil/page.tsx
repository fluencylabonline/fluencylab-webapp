'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';

//Firebase
import { doc, DocumentData, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { ref, getDownloadURL, getStorage, uploadBytes } from 'firebase/storage';
import { storage } from '@/app/firebase';
import { signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';

//Components Imports
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';
import FluencyCloseButton from '@/app/ui/Components/ModalComponents/closeModal';

//Next Imports
import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { useSession } from 'next-auth/react';

//Notification
import { toast, Toaster } from 'react-hot-toast';

//Icons
import { RiErrorWarningLine } from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';
import { Link, Tooltip } from '@nextui-org/react';
import { PiExam } from 'react-icons/pi';

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
              console.log("User Data:", userData);
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
    }, [session]);

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

    return (
    <div className="flex flex-col items-center lg:pr-2 md:pr-2 pt-3 px-4 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">                   
        <div className='fade-in fade-out w-full lg:flex lg:flex-row gap-4 md:flex md:flex-col sm:flex sm:flex-col overflow-y-auto h-[90vh]'>
          <div className="lg:flex lg:flex-col lg:items-stretch w-full gap-4">
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
                  <p className='flex flex-wrap gap-1 justify-start'><strong>Email pessoal:</strong> {session?.user.email}</p>
                  <p><strong>Número:</strong> {number}</p>

                  <div className="mt-6 text-center lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 justify-center">
                        <FluencyButton variant='danger' onClick={openResetPassword}>Redefinir senha</FluencyButton>  
                        <FluencyButton onClick={openEditModal} variant='solid'>Atualizar perfil</FluencyButton>  
                    </div>
                </div>
            </div>


            <div className='lg:flex lg:flex-row lg:items-stretch flex flex-col items-stretch w-full gap-4 lg:mt-0 mt-2'>
              <div className='bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col lg:items-center md:items-center items-center gap-1'>
                <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Sobre o professor:</h1>
                <p className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu link:</strong> {link}</p>
                <p className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu login:</strong> {session?.user.userName}</p>
                <div className='flex flex-wrap gap-1 items-center justify-start'><strong>Seu Calendário:</strong> {!calendarLink ? (
                    <div className='flex flex-row gap-1 items-center text-fluency-yellow-500'><p className='font-bold'>Link pendende </p><RiErrorWarningLine className='animate-pulse w-6 h-auto' /></div>
                ) : (
                    <div><Tooltip className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-gray-800 dark:text-fluency-gray-50 font-semibold w-min flex flex-wrap p-2 rounded-md' content={calendarLink} >Link registrado</Tooltip></div>
                )}</div>

                <div className="mt-4 text-center flex flex-col justify-center">
                  <FluencyButton onClick={openEditModalTwo} variant='solid'>Atualizar informações</FluencyButton>  
                </div>
              </div>
            </div>   
          </div>

            <div className='bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 overflow-hidden overflow-y-scroll ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col lg:items-start md:items-center items-center gap-1 w-full lg:mt-0 mt-2'>
              <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Notificações</h1>
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
                  <div>No data available</div>
                )}
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

        <Toaster />

      </div>
    );
}

export default Perfil;

