"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import router from "next/router";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

// Icons
import { FaChalkboardTeacher } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { RiErrorWarningLine } from "react-icons/ri";
import {
  IoExitOutline,
  IoSettingsOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { MdGroups } from "react-icons/md";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";

// Components
import FluencyButton from '@/app/ui/Components/Button/button';
import FluencyInput from '@/app/ui/Components/Input/input';

// Firebase
import { auth, db, storage } from "@/app/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function Perfil() {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const [cursoFeito, setCursoFeito] = useState<boolean[]>([]);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [link, setLink] = useState('');

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "T";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch user data
    const profileRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setNumber(data.number || '');
          setLink(data.link || '');
          
          // Convert courses to array
          if (data.courses) {
            const coursesArray: boolean[] = Object.values(data.courses);
            setCursoFeito(coursesArray);
          }
        }
      },
      (error) => {
        console.error("Error listening to real-time data:", error);
        toast.error("Erro ao carregar dados do perfil.");
      }
    );

    // Fetch profile picture
    const storage = getStorage();
    const profilePictureRef = ref(storage, `profilePictures/${user.id}`);
    getDownloadURL(profilePictureRef)
      .then((url) => setProfilePictureURL(url))
      .catch(() => setProfilePictureURL(null));

    return () => unsubscribe();
  }, [user?.id]);

  const handleProfilePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && user?.id) {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user.id}`);
      
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
        }
        
        setProfilePictureURL(downloadURL);
        toast.success('Foto atualizada!', { position: 'top-center' });
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        toast.error('Erro ao atualizar foto!');
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    try {
      const userDocRef = doc(db, 'users', user.id);
      await setDoc(userDocRef, { name, number, link }, { merge: true });
      toast.success('Perfil atualizado com sucesso!', { position: 'top-center' });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar dados do perfil:', error);
      toast.error('Erro ao salvar dados do perfil!');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error("E-mail do usuário não encontrado.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Link de redefinição enviado para seu e-mail.");
      setResetPassword(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Não foi possível enviar o e-mail.");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erro ao sair.");
      setIsLoggingOut(false);
    }
  };

  const getStatusUI = (
    condition: boolean,
    pendingText: string,
    completedText: string,
    link: string
  ) => {
    const baseClasses = "flex flex-row gap-2 w-full rounded-md text-white font-bold p-3 items-center justify-between";
    const Icon = condition ? GrStatusGood : RiErrorWarningLine;
    const bgColor = condition
      ? "bg-fluency-green-700 hover:bg-fluency-green-600"
      : "bg-fluency-red-700 hover:bg-fluency-red-600";
    const text = condition ? completedText : pendingText;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link href={link} className={`${baseClasses} ${bgColor}`}>
          <span className="flex flex-row w-full justify-between items-center">
            {text} <Icon className="w-6 h-auto" />
          </span>
        </Link>
      </motion.div>
    );
  };

  if (status === "loading" || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <AiOutlineLoading3Quarters className="text-4xl text-fluency-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark min-h-[90vh]">
      <div className="w-full overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left Column - User Info */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="relative"
                >
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    {profilePictureURL ? (
                      <Image
                        src={profilePictureURL}
                        alt="Foto de Perfil"
                        width={96}
                        height={96}
                        priority
                        className="w-24 h-24 object-cover rounded-xl bg-fluency-blue-200 dark:bg-fluency-gray-500 flex items-center justify-center shadow-inner"
                      />
                    ) : (
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.02, 1],
                          boxShadow: ["0 4px 6px rgba(0,0,0,0.1)", "0 10px 15px rgba(59, 130, 246, 0.3)", "0 4px 6px rgba(0,0,0,0.1)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-xl bg-fluency-blue-200 dark:bg-fluency-gray-500 flex items-center justify-center shadow-inner"
                      >
                        <span className="text-3xl font-bold text-fluency-blue-600 dark:text-fluency-blue-700">
                          {userInitials}
                        </span>
                      </motion.div>
                    )}
                  </label>
                </motion.div>
                
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {name}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary"
                  >
                    {user.email}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center sm:justify-start gap-2 mt-2"
                  >
                    <span className="px-3 py-1 bg-fluency-blue-100 dark:bg-fluency-gray-700 text-sm font-semibold rounded-md">
                      Professor
                    </span>
                  </motion.div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center py-3 px-4 rounded-lg text-fluency-red-500 hover:bg-fluency-red-50 dark:hover:bg-fluency-red-900/30 transition-colors"
                >
                  {isLoggingOut ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <AiOutlineLoading3Quarters className="h-6 w-6 text-fluency-red-600 dark:text-fluency-red-600" />
                    </motion.div>
                  ) : (
                    <IoExitOutline
                      size={24}
                      className="text-fluency-red-600 dark:text-fluency-red-600"
                    />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Teacher Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Informações do Professor
              </motion.h3>
              <div className="flex flex-col gap-4">
                <div className="bg-fluency-blue-50 dark:bg-fluency-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MdGroups className="text-fluency-blue-500 dark:text-fluency-blue-300 text-xl" />
                    <h4 className="font-medium">Link do Meet</h4>
                  </div>
                  <p className="mt-2 text-sm truncate">
                    {link || "Não configurado"}
                  </p>
                </div>
                
                <div className="bg-fluency-blue-50 dark:bg-fluency-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaChalkboardTeacher className="text-fluency-blue-500 dark:text-fluency-blue-300 text-xl" />
                    <h4 className="font-medium">Telefone</h4>
                  </div>
                  <p className="mt-2 text-sm">
                    {number || "Não configurado"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Status and Actions */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            {/* Status Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Progresso
              </motion.h3>
              <div className="space-y-2">
                {getStatusUI(
                  cursoFeito.every(course => course),
                  "Curso Pendente",
                  "Curso Completo",
                  "/teacher-dashboard/suporte/curso"
                )}
                {getStatusUI(
                  !!link,
                  "Link do Meet Pendente",
                  "Link do Meet Configurado",
                  "/teacher-dashboard/perfil"
                )}
                {getStatusUI(
                  !!number,
                  "Telefone Pendente",
                  "Telefone Configurado",
                  "/teacher-dashboard/perfil"
                )}
                {getStatusUI(
                  !!profilePictureURL,
                  "Foto Pendente",
                  "Foto Configurada",
                  "/teacher-dashboard/perfil"
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Ações Rápidas
              </motion.h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setResetPassword(true)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-fluency-gray-800 transition-colors"
                >
                  <motion.div 
                    className="p-2 bg-fluency-blue-100 dark:bg-fluency-gray-900 rounded-lg"
                  >
                    <IoLockClosedOutline className="text-fluency-blue-600 dark:text-fluency-blue-300 text-xl" />
                  </motion.div>
                  <span className="text-sm font-medium">Redefinir Senha</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-fluency-gray-800 transition-colors"
                >
                  <motion.div 
                    className="p-2 bg-fluency-blue-100 dark:bg-fluency-gray-900 rounded-lg"
                  >
                    <IoSettingsOutline className="text-fluency-blue-600 dark:text-fluency-blue-300 text-xl" />
                  </motion.div>
                  <span className="text-sm font-medium">Atualizar Perfil</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-fluency-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-fluency-gray-700">
                <h3 className="text-lg font-semibold">Redefinir Senha</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setResetPassword(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-fluency-gray-700 rounded-lg"
                >
                  <AiOutlineClose className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                  Enviaremos um link de redefinição para:
                  <span className="block font-medium mt-1 text-gray-900 dark:text-white">
                    {user.email}
                  </span>
                </p>
                <div className="flex gap-3 justify-center">
                  <FluencyButton
                    variant="gray"
                    onClick={() => setResetPassword(false)}
                  >
                    Cancelar
                  </FluencyButton>
                  <FluencyButton variant="confirm" onClick={handlePasswordReset}>
                    Enviar Link
                  </FluencyButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-fluency-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-fluency-gray-700">
                <h3 className="text-lg font-semibold">Atualizar Perfil</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-fluency-gray-700 rounded-lg"
                >
                  <AiOutlineClose className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <FluencyInput 
                    type="text" 
                    placeholder="Nome" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    variant='solid' 
                  />
                  <FluencyInput 
                    type="text" 
                    placeholder="Telefone" 
                    value={number} 
                    onChange={(e) => setNumber(e.target.value)} 
                    variant='solid' 
                  />
                  <FluencyInput 
                    type="text" 
                    placeholder="Link do Meet" 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    variant='solid' 
                  />
                </div>
                <div className="flex gap-3 justify-center">
                  <FluencyButton
                    variant="gray"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancelar
                  </FluencyButton>
                  <FluencyButton variant="confirm" onClick={handleSaveProfile}>
                    Salvar
                  </FluencyButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Toaster position="top-center" />
    </div>
  );
}