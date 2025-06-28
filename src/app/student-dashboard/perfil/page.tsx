"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import router from "next/router";
import { collection, doc, DocumentData, onSnapshot } from "firebase/firestore";
import { sendPasswordResetEmail, updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

// Icons from react-icons
import { GrStatusGood } from "react-icons/gr";
import { RiErrorWarningLine } from "react-icons/ri";
import { IoExitOutline, IoLockClosedOutline } from "react-icons/io5";
import { MdCreditCard, MdPix } from "react-icons/md";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai";

// Mock QR Code imports
import QrCode from "../../../../public/images/perfil/cobrar.jpg";
import QrCode2 from "../../../../public/images/perfil/QRDeise.jpg";

import { db, auth } from "@/app/firebase";
import FluencyButton from "@/app/ui/Components/Button/button";
import Badges from "@/app/SharedPages/Placement/Components/Badges/Badges";
import { motion, AnimatePresence, stagger, useAnimate } from "framer-motion";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import StudentNextClassCard from "@/app/ui/Components/Calendar/StudentNextClassCard";
import Tour from "@/app/ui/Components/JoyRide/FluencyTour";
import UnlockedAchievementsDisplay from "@/app/ui/Components/Achievements/components/UnlockedAchievementsDisplay ";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function Perfil() {
  const { data: session, status } = useSession();
  const [scope, animate] = useAnimate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [CNPJ, setCNPJ] = useState("");
  const [meioPagamento, setMeioPagamento] = useState("");
  const [mensalidade, setMensalidade] = useState("");
  const [contratoFoiAssinado, setContratoFoiAssinado] = useState<{
    signed: boolean;
    logs: any[];
  }>({ signed: false, logs: [] });
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(
    null
  );
  const [nivelamentoPermitido, setNivelamentoPermitido] = useState(true);
  const [resetPassword, setResetPassword] = useState(false);
  const [tests, setTests] = useState<
    {
      date: string;
      completed: boolean;
      totalScore: number;
      abilitiesCompleted: Record<string, boolean>;
      id: string;
      createdAt: any;
    }[]
  >([]);

  const user = session?.user as SessionUser | undefined;

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!user?.id) return;

    const profileRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCNPJ(data.CNPJ || "");
          setMeioPagamento(data.meioPagamento || "pix");
          setMensalidade(data.mensalidade || "");
          const contratos = data.ContratosAssinados;
            setContratoFoiAssinado(
              contratos && typeof contratos.signed === 'boolean' ? contratos : { signed: false, logs: [] }
            );

          setNivelamentoPermitido(data.NivelamentoPermitido !== false);
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

  const handleProfilePictureChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
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
        toast.success("Foto atualizada!", { position: "top-center" });
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast.error("Erro ao atualizar foto!");
      }
    }
  };

  useEffect(() => {
    if (!session) return;
    const testsRef = collection(db, "users", session.user.id, "Placement");
    const unsubscribe = onSnapshot(testsRef, (querySnapshot) => {
      const fetchedTests = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const abilitiesCompleted = data.abilitiesCompleted || {};
        const abilitiesScore = data.abilitiesScore || {};

        return {
          date: data.date,
          completed: Object.values(abilitiesCompleted).every((v) => v === true),
          totalScore: Object.values(abilitiesScore).reduce(
            (acc: number, score: any) => acc + (Number(score) || 0),
            0
          ),
          abilitiesCompleted,
          id: doc.id,
          createdAt: data.createdAt?.seconds || 0,
        };
      });

      const sortedTests = fetchedTests.sort(
        (a, b) => b.createdAt - a.createdAt
      );
      setTests(sortedTests);
    });

    return () => unsubscribe();
  }, [session]);

  // Animation trigger
  useEffect(() => {
    animate("div", { opacity: 1, y: 0 }, { delay: stagger(0.1) });
  }, [animate]);

  const determineCEFRLevel = (score: number): number => {
    if (score >= 90) return 5;
    if (score >= 75) return 4;
    if (score >= 60) return 3;
    if (score >= 45) return 2;
    if (score >= 30) return 1;
    return 0;
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

  const handleCopyCNPJ = () => {
    if (!CNPJ) return;
    navigator.clipboard.writeText(CNPJ);
    toast.success("CNPJ copiado para a área de transferência!");
  };

  const getStatusUI = (
    condition: boolean,
    pendingText: string,
    completedText: string,
    link: string
  ) => {
    const baseClasses =
      "flex flex-row gap-2 w-full rounded-md text-white font-bold p-3 items-center justify-between";
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

  const tourSteps = [
    {
      target: ".tour-profile-info",
      title: "Seu Perfil",
      content:
        "Aqui estão suas informações pessoais. Você pode ver seu nome, email e status de aluno.",
      placement: "bottom" as const,
      disableBeacon: true,
    },
    {
      target: ".tour-badges",
      title: "Seus Badges",
      content:
        "Mostre suas conquistas! Seus badges refletem seu progresso no aprendizado.",
      placement: "right" as const,
    },
    {
      target: ".tour-next-class",
      title: "Próxima Aula",
      content: "Veja aqui quando será sua próxima aula com seu professor.",
      placement: "top" as const,
    },
    {
      target: ".tour-progress",
      title: "Progresso",
      content: "Acompanhe seu progresso geral e pendências importantes.",
      placement: "left" as const,
    },
    {
      target: ".tour-quick-actions",
      title: "Ações Rápidas",
      content: "Redefina sua senha ou execute outras ações importantes aqui.",
      placement: "top" as const,
    },
    {
      target: ".tour-payment",
      title: "Pagamentos",
      content: "Gerencie seu método de pagamento e faça seus pagamentos aqui.",
      placement: "top" as const,
    },
  ];

  return (
    <div
      ref={scope}
      className="flex flex-col w-full p-2 px-4 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark min-h-[90vh]"
    >
      <Tour
        steps={tourSteps}
        pageKey="student-profile"
        userId={session?.user.id || undefined}
        delay={1000}
        onTourEnd={() => console.log("Student profile tour completed")}
      />

      <div className="w-full overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
          <div className="xl:col-span-2 flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg tour-profile-info"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div whileHover={{ scale: 1.03 }} className="relative">
                  {profilePictureURL ? (
                    <Image
                      onClick={() =>
                        document
                          .getElementById("profile-picture-input")
                          ?.click()
                      }
                      src={profilePictureURL}
                      alt="Foto de Perfil"
                      width={96}
                      height={96}
                      priority
                      className="w-24 h-24 object-cover rounded-xl bg-fluency-blue-200 dark:bg-fluency-gray-500 flex items-center justify-center shadow-inner cursor-pointer"
                    />
                  ) : (
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 1],
                        boxShadow: [
                          "0 4px 6px rgba(0,0,0,0.1)",
                          "0 7px 10px rgba(59, 130, 246, 0.3)",
                          "0 4px 6px rgba(0,0,0,0.1)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 rounded-xl bg-fluency-blue-200 dark:bg-fluency-gray-500 flex items-center justify-center shadow-inner"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        id="profile-picture-input"
                      />
                      <span
                        onClick={() =>
                          document
                            .getElementById("profile-picture-input")
                            ?.click()
                        }
                        className="text-3xl font-bold text-fluency-blue-600 dark:text-fluency-blue-100 cursor-pointer"
                      >
                        {userInitials}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {user.name}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary"
                  >
                    {user.email}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center sm:justify-start gap-2 mt-2"
                  >
                    <span className="px-3 py-1 bg-fluency-blue-100 dark:bg-fluency-gray-700 text-sm font-semibold rounded-md">
                      Aluno
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
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

            <div className="lg:flex lg:flex-row md:flex md:flex-row flex flex-col items-start gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 px-4 rounded-lg tour-badges w-full h-full"
              >
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold mb-2 text-gray-800 dark:text-white"
                >
                  Fluência
                </motion.h3>
                <Badges level={determineCEFRLevel(tests[0]?.totalScore || 0)} />
              </motion.div>
              <Link className="w-full h-full" href={'conquistas'}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 px-4 rounded-lg w-full h-full"
              >
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold mb-2 text-gray-800 dark:text-white"
                >
                  Badges
                </motion.h3>
                <UnlockedAchievementsDisplay
                  maxDisplay={2}
                  recentDays={7}
                  compact={true}
                  showDescriptions={false}
                />
              </motion.div>
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-3 px-4 rounded-lg tour-next-class"
            >
              <StudentNextClassCard />
            </motion.div>
          </div>

          {/* Status Section */}
          <div className="xl:col-span-1 flex flex-col gap-2">
            {/* Progress Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg tour-progress"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Progresso
              </motion.h3>
              <div className="space-y-2">
                {getStatusUI(
                  contratoFoiAssinado?.signed,
                  "Contrato Pendente",
                  "Contrato Assinado",
                  "contrato"
                )}
                {getStatusUI(
                  !nivelamentoPermitido,
                  "Nivelamento Pendente",
                  "Nivelamento Completo",
                  "nivelamento"
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-6 rounded-lg tour-quick-actions"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Ações Rápidas
              </motion.h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setResetPassword(true)}
                  className="flex flex-wrap items-center w-full gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-fluency-gray-800 transition-colors"
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className="p-2 bg-fluency-blue-100 dark:bg-fluency-gray-900 rounded-lg"
                  >
                    <IoLockClosedOutline
                      size={20}
                      className="text-fluency-blue-600 dark:text-fluency-blue-300"
                    />
                  </motion.div>
                  <span className="text-sm font-medium">Redefinir Senha</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Payment Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              className="bg-fluency-pages-light dark:bg-fluency-pages-dark p-7 rounded-lg tour-payment"
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-semibold mb-4 text-gray-800 dark:text-white"
              >
                Método de Pagamento
              </motion.h3>
              <div className="space-y-4">
                {meioPagamento === "cartao" && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={
                      mensalidade === "165"
                        ? "https://mpago.la/1oT7aAq"
                        : "https://mpago.la/1oLPP4R"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700 transition-colors shadow-sm"
                  >
                    <motion.div
                      whileHover={{ rotate: -10 }}
                      className="p-3 bg-fluency-blue-100 dark:bg-fluency-gray-900 rounded-lg"
                    >
                      <MdCreditCard
                        size={24}
                        className="text-fluency-blue-600 dark:text-fluency-blue-300"
                      />
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">
                        Cartão de Crédito
                      </p>
                      <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary">
                        R$ {mensalidade},00/mês
                      </p>
                    </div>
                  </motion.a>
                )}

                {meioPagamento === "pix" && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyCNPJ}
                    className="cursor-pointer p-4 rounded-xl bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-700 transition-colors shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        className="p-3 bg-fluency-blue-100 dark:bg-fluency-gray-900 rounded-lg"
                      >
                        <MdPix
                          size={24}
                          className="text-fluency-blue-600 dark:text-fluency-blue-300"
                        />
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Chave PIX (CNPJ)
                        </p>
                        <p className="text-sm text-fluency-text-secondary dark:text-fluency-text-dark-secondary mb-2">
                          {CNPJ === "47.603.142/0001-07"
                            ? "Matheus Fernandes"
                            : CNPJ === "55.450.653/0001-64"
                            ? "Deise Laiane"
                            : "Entre em contato"}
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center gap-2 bg-fluency-blue-50 dark:bg-fluency-gray-900 p-2 rounded-lg"
                        >
                          <span className="text-sm font-mono">{CNPJ}</span>
                          <button className="ml-auto px-3 py-1 text-xs bg-fluency-blue-100 dark:bg-fluency-gray-800 rounded-md hover:bg-fluency-blue-200 dark:hover:bg-fluency-gray-700 transition-colors">
                            Copiar
                          </button>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex justify-center mt-4"
                        >
                          {CNPJ === "47.603.142/0001-07" && (
                            <Image
                              src={QrCode}
                              alt="QR Code Pix"
                              width={140}
                              height={140}
                              className="rounded-lg border p-2 bg-white"
                            />
                          )}
                          {CNPJ === "55.450.653/0001-64" && (
                            <Image
                              src={QrCode2}
                              alt="QR Code Pix"
                              width={140}
                              height={140}
                              className="rounded-lg border p-2 bg-white"
                            />
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
              transition={{ type: "spring", damping: 25 }}
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
                  <FluencyButton
                    variant="confirm"
                    onClick={handlePasswordReset}
                  >
                    Enviar Link
                  </FluencyButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
