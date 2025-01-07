'use client';
import React, { ChangeEvent, useEffect, useState } from 'react';
//Firebase
import { collection, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
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
import Image from "next/image";
import QrCode from '../../../../public/images/perfil/cobrar.jpg';
import QrCode2 from '../../../../public/images/perfil/QRDeise.jpg';

//Notification
import { toast, Toaster } from 'react-hot-toast';

//Icons
import { GrStatusGood } from 'react-icons/gr';
import { FaUserCircle } from 'react-icons/fa';
import { RiErrorWarningLine } from 'react-icons/ri';
import Link from 'next/link';
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
          await toast.promise(
            // Upload the new profile picture
            uploadBytes(storageRef, file),
            {
              loading: 'Uploading...',
              success: 'Profile picture uploaded successfully!',
              error: 'Error uploading profile picture',
            }
          );
    
          // Get the download URL of the uploaded picture
          const downloadURL = await getDownloadURL(storageRef);
    
          // Update the user's profile with the new picture URL
          if (auth.currentUser) {
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
    const [meioPagamento, setMeioPagamento] = useState('');
    const [CNPJ, setCNPJ] = useState('');
    const [userName, setUserName] = useState('');
    const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
    //false == nao

    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setName(docSnap.data().name);
                      setCNPJ(docSnap.data().CNPJ);                      
                      setUserName(docSnap.data().userName);
                      setContratoFoiAssinado(docSnap.data().ContratoAssinado || { signed: false, logs: [] });
                      setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                      setMeioPagamento(docSnap.data().meioPagamento);
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

    const [contratoFoiAssinado, setContratoFoiAssinado] = useState<{ 
      signed: boolean; 
      logs: { logID: string; signedAt: string; segundaParteAssinou: boolean }[] 
  } | null>(null);

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
      notice: 'font-semibold text-white bg-fluency-yellow-600 dark:bg-fluency-yellow-700 hover:bg-fluency-yellow-500 hover:dark:bg-fluency-yellow-800 duration-300 easy-in-out transition-all',
      information: 'font-semibold text-white bg-fluency-blue-600 dark:bg-fluency-blue-700 hover:bg-fluency-blue-500 hover:dark:bg-fluency-blue-800 duration-300 easy-in-out transition-all',
      tip: 'font-semibold text-white bg-fluency-green-700 dark:bg-fluency-green-800 hover:bg-fluency-green-600 hover:dark:bg-fluency-green-800 duration-300 easy-in-out transition-all'
    };
  
    const getBackgroundColor = (status: any) => {
      if (status.notice) return statusColors.notice;
      if (status.information) return statusColors.information;
      if (status.tip) return statusColors.tip;
      return 'bg-white'; // Default color if no status matches
    };

    const getFilteredNotifications = () => {
      if (!session?.user) return notifications;
      const { role } = session.user;
      if (role === 'teacher') {
        return notifications.filter(notification => notification.sendTo.professors);
      }
      if (role === 'student') {
        return notifications.filter(notification => notification.sendTo.students);
      }
      return notifications;
    };
    
    return (
    <div className="flex flex-col items-center lg:pr-2 md:pr-2 pt-3 px-4 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">                   
        <div className='fade-in fade-out w-full lg:flex lg:flex-row gap-4 md:flex md:flex-col sm:flex sm:flex-col overflow-y-auto h-[90vh]'>
          <div className="lg:flex lg:flex-col lg:items-stretch w-full gap-4">
            <div className="bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 rounded-lg lg:flex lg:flex-row lg:items-center md:flex md:flex-row md:justify-center flex flex-col md:items-center items-center gap-2">
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
                  </div>
                </div>
            </div> 
            
            
            <div className='flex flex-col sm:flex-row w-full h-full justify-around gap-4'>
              <div className="lg:mt-0 md:mt-2 mt-2 bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-2 rounded-lg lg:flex lg:flex-col lg:items-center md:flex md:flex-row md:justify-center flex flex-col md:items-center items-center gap-2">
                <p className='flex flex-row justify-center p-1 font-semibold text-lg'>Infomações de Pagamento</p>
                <div className='p-4 flex flex-col gap-4'>
                  {meioPagamento === 'cartao' ? 
                  (<div><p>Se tiver dúvidas sobre o pagamento, entre em contato.</p></div>)
                  :
                  (<div>
                  <p className='text-justify'>Você pode fazer a tranferência para as seguintes chaves PIX ou simplesmente usar o QR Code:</p>
                  <div className='flex flex-col items-center gap-1 w-full justify-around'>
                    <div>
                      <p>CNPJ: <span className='font-bold'>{CNPJ}</span></p>    
                      <p>
                        Nome: 
                        <span className="font-bold">
                          {CNPJ === '47.603.142/0001-07'
                            ? "Matheus Fernandes"
                            : CNPJ === '55.450.653/0001-64'
                            ? "Deise Laiane"
                            : "Entre em contato"}
                        </span>
                      </p>
                    </div>
                    <div>
                      {CNPJ === '55.450.653/0001-64' && (
                        <Image
                        className="object-cover w-24 h-24 mb-2"
                        src={QrCode2}
                        alt="FluencyLab"
                      />
                      )}
                      {CNPJ === '47.603.142/0001-07' && (
                        <Image
                        className="object-cover w-24 h-24 mb-2"
                        src={QrCode}
                        alt="FluencyLab"
                      />
                      )}
                    </div>
                  </div>
                  </div>)}
                </div>
              </div>

              <div className='lg:flex lg:flex-row lg:items-stretch flex flex-col items-stretch justify-center w-full gap-4 lg:mt-0 mt-2'>
                <div className=' text-sm w-full bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col lg:items-center md:items-center items-center gap-1'>
                  <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Check-list:</h1>
                  {contratoFoiAssinado?.signed ? (
                    <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-green-700 text-white font-bold p-3 items-center justify-between'>
                        <Link className='flex flex-row w-full justify-between items-center' href={'contrato'}>Contrato assinado e válido <GrStatusGood className='w-6 h-auto' /></Link>    
                    </div>
                    ) : (
                    <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-yellow-700 text-white font-bold p-3 items-center justify-between'>
                      <Link className='flex flex-row w-full justify-between items-center' href={'contrato'}>Contrato não assinado ainda <RiErrorWarningLine className='w-6 h-auto' /></Link>    
                    </div>
                  )}

                  {nivelamentoPermitido === false ? 
                  (
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-green-700 text-white font-bold p-3 items-center justify-between'>
                      <div className='flex flex-row w-full justify-between items-center'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
                  </div>
                  ):(
                  <div className='flex flex-row gap-2 w-full rounded-md bg-fluency-orange-700 text-white font-bold p-3 items-center justify-between'>
                      <Link className='flex flex-row w-full justify-between items-center' href={'nivelamento'}>Fazer nivelamento <PiExam className='w-6 h-auto' /></Link>    
                  </div>
                  )}
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
            </div>

          <div className='bg-fluency-pages-light hover:bg-fluency-blue-100 dark:bg-fluency-pages-dark hover:dark:bg-fluency-gray-900 overflow-hidden overflow-y-scroll ease-in-out transition-all duration-300 p-3 rounded-lg flex flex-col lg:items-start md:items-center items-center gap-1 w-full lg:mt-0 mt-2'>
            <h1 className='flex flex-row justify-center p-1 font-semibold text-lg'>Notificações</h1>
            <div className='w-full'>
              {getFilteredNotifications().length > 0 ? (
                getFilteredNotifications().map(notification => (
                  <div key={notification.id} className={`flex flex-row items-start w-full justify-between p-3 mb-1 rounded-lg ${getBackgroundColor(notification.status)}`}>
                      <p>{notification.content}</p>                
                  </div>
                ))
              ) : (
                <p>Nenhuma notificação nova para mostrar.</p>
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

        <Toaster />

      </div>
    );
}

export default Perfil;
