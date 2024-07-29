'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';

//Firebase
import { addDoc, collection, deleteDoc, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { ref, getDownloadURL, uploadBytes, getStorage } from 'firebase/storage';
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
import { FaUserCircle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

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
  
      
    const [name, setName] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setName(docSnap.data().name);
                      setUserName(docSnap.data().userName);
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

    const [notificacao, setNotificacao] = useState(false);
    const openNotificacao = () => {
      setNotificacao(true);
    };
  
    const closeNotificacao = () => {
      setNotificacao(false);
      setNotificationContent('');
      setSendTo({
        professors: false,
        students: false,
        coordinators: false,
      });
      setStatus({
        notice: false,
        information: false,
        tip: false,
      });
    };
  
    const [notificationContent, setNotificationContent] = useState('');
    const [sendTo, setSendTo] = useState({
      professors: false,
      students: false,
      coordinators: false,
    });
    const [status, setStatus] = useState({
      notice: false,
      information: false,
      tip: false,
    });
  
    const handleNotificationSubmit = async () => {
      try {
        const notificationData = {
          content: notificationContent,
          sendTo,
          status,
          createdAt: new Date(),
        };
    
        await addDoc(collection(db, 'Notificacoes'), notificationData);
        toast.success('Notificação criada com sucesso!');
        
        // Reset fields
        setNotificationContent('');
        setSendTo({
          professors: false,
          students: false,
          coordinators: false,
        });
        setStatus({
          notice: false,
          information: false,
          tip: false,
        });
    
        closeNotificacao(); // Close the modal
      } catch (error) {
        console.error('Erro ao criar notificação:', error);
        toast.error('Erro ao criar notificação. Por favor, tente novamente mais tarde.');
      }
    };
    
    const handleStatusChange = (statusType: 'notice' | 'information' | 'tip') => {
      setStatus({
        notice: statusType === 'notice',
        information: statusType === 'information',
        tip: statusType === 'tip',
      });
    };    

    const [notifications, setNotifications] = useState<any[]>([]);
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'Notificacoes'));
          const fetchedNotifications = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(fetchedNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
  
      fetchNotifications();
    }, []);
  
    // Map notification status to colors
    const statusColors = {
      notice: 'text-white bg-yellow-500 dark:bg-yellow-700 hover:bg-yellow-600 hover:dark:bg-yellow-800 duration-300 easy-in-out transition-all',
      information: 'text-white bg-blue-400 dark:bg-blue-700 hover:bg-blue-600 hover:dark:bg-blue-800 duration-300 easy-in-out transition-all',
      tip: 'text-white bg-green-500 dark:bg-green-700 hover:bg-green-600 hover:dark:bg-green-800 duration-300 easy-in-out transition-all'
    };
  
    const getBackgroundColor = (status: any) => {
      if (status.notice) return statusColors.notice;
      if (status.information) return statusColors.information;
      if (status.tip) return statusColors.tip;
      return 'bg-white'; // Default color if no status matches
    };

      // Add delete notification function
    const handleDeleteNotification = async (notificationId: string) => {
      try {
        await deleteDoc(doc(db, 'Notificacoes', notificationId));
        toast.success('Notificação deletada com sucesso!');
        // Update local state to remove deleted notification
        setNotifications(notifications.filter(notification => notification.id !== notificationId));
      } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        toast.error('Erro ao deletar notificação. Por favor, tente novamente mais tarde.');
      }
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
                  <p><strong>Login:</strong> {userName}</p>

                  <div className="mt-6 text-center lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-2 justify-center">
                        <FluencyButton variant='danger' onClick={openResetPassword}>Redefinir senha</FluencyButton>  
                        <FluencyButton variant='gray' onClick={openNotificacao}>Criar Aviso</FluencyButton>
                  </div>
                </div>
            </div>  
          </div>

            <div className='bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 overflow-hidden overflow-y-scroll ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col lg:items-center md:items-center items-center gap-1 w-full lg:mt-0 mt-2'>
                <p className='font-bold text-lg pb-2'>Notificações</p>
                <div className='w-full'>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className={`flex flex-row items-start w-full justify-between p-3 mb-2 rounded-lg ${getBackgroundColor(notification.status)}`}>
                        <div>
                          <p>{notification.content}</p>
                          <p><strong>Enviado para:</strong> {notification.sendTo.professors ? 'Professores' : ''} {notification.sendTo.students ? 'Alunos' : ''} {notification.sendTo.coordinators ? 'Coordenadores' : ''}</p>
                        </div>
                          <button onClick={() => handleDeleteNotification(notification.id)} className='p-1 px-2'><MdDelete className='w-6 h-auto text-white hover:text-red-400 duration-200 ease-in-out transition-all'/></button>                        
                      </div>
                    ))
                  ) : (
                    <p>Nenhuma notificação para mostrar.</p>
                  )}
                </div>
            </div>
                 
        </div>

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

            {notificacao && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit sm:w-[40vw] h-full p-5">
                        <div className="flex flex-col items-center justify-center w-full">
                            
                            <FluencyCloseButton onClick={closeNotificacao}/>
                            
                              <h3 className="text-lg leading-6 font-medium  mb-2">
                                  Crie notificações aqui                       
                              </h3>

                              <div className="mt-2 flex flex-col items-center gap-3 p-4 w-full">
                               
                                <div className='flex flex-col items-start gap-2 w-full'>
                                  <div className='flex flex-col items-start gap-1 w-full'>
                                    <p className='font-bold text-sm'>Conteúdo</p>
                                    <textarea
                                      placeholder='Escreva aqui...'
                                      value={notificationContent}
                                      onChange={(e) => setNotificationContent(e.target.value)}
                                      className="p-2 rounded-md outline-none w-full bg-fluency-pages-light dark:bg-fluency-pages-dark"
                                      rows={5}
                                    />
                                  </div>

                                  <div className='flex flex-col items-start gap-1'>
                                    <p className='font-bold text-sm'>Enviar para</p>
                                    <div className='flex flex-row gap-1 items-center'>
                                      <input type='checkbox' 
                                      checked={sendTo.professors}
                                      onChange={() => setSendTo({ ...sendTo, professors: !sendTo.professors })}
                                      /> Professores
                                    </div>

                                    <div className='flex flex-row gap-1 items-center'>
                                      <input type='checkbox' 
                                      checked={sendTo.students}
                                      onChange={() => setSendTo({ ...sendTo, students: !sendTo.students })}
                                      /> Alunos
                                    </div>

                                    <div className='flex flex-row gap-1 items-center'>
                                      <input type='checkbox' checked={sendTo.coordinators}
                                        onChange={() => setSendTo({ ...sendTo, coordinators: !sendTo.coordinators })}
                                      /> Coordenadores
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-start my-2">
                                    <p className='font-bold text-sm mb-1'>Tipo de notificação</p>
                                    <label>
                                      <input
                                        type="radio"
                                        name="status"
                                        checked={status.notice}
                                        onChange={() => handleStatusChange('notice')}
                                      />
                                      Aviso
                                    </label>
                                    <label>
                                      <input
                                        type="radio"
                                        name="status"
                                        checked={status.information}
                                        onChange={() => handleStatusChange('information')}
                                      />
                                      Informação
                                    </label>
                                    <label>
                                      <input
                                        type="radio"
                                        name="status"
                                        checked={status.tip}
                                        onChange={() => handleStatusChange('tip')}
                                      />
                                      Dica
                                    </label>
                                  </div>

                                </div>

                                <div className="flex justify-center">
                                  <FluencyButton variant='confirm' onClick={handleNotificationSubmit}>Enviar</FluencyButton>
                                  <FluencyButton variant='gray' onClick={closeNotificacao}>Cancelar</FluencyButton>
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
