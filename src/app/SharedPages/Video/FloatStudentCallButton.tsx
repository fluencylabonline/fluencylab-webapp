'use client'
import { useCallContext } from "@/app/context/CallContext";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { IoVideocam } from "react-icons/io5";
import { motion } from "framer-motion";

interface FloatStudentCallButtonProps {
  student: {
    studentID: any;
  };
}

export default function FloatStudentCallButton({ student }: FloatStudentCallButtonProps) {
  const { data: session } = useSession();
  const { setCallData } = useCallContext();
  const [firebaseCallId, setFirebaseCallId] = useState<any | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      console.error("Sessão não inicializada");
      return;
    }

    const studentRef = doc(db, 'users', session.user.id);
    const unsubscribe = onSnapshot(
      studentRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirebaseCallId(data.callID);
        } else {
          console.error("Documento do aluno não encontrado.");
        }
      },
      (error) => {
        console.error("Erro ao buscar callID:", error);
      }
    );
    return () => unsubscribe();
  }, [session?.user?.id]);

  const createCallId = () => {
    const currentUserId = session?.user?.professorId;
    if (!currentUserId) return;
    const newCallId = generateCallId(currentUserId, student.studentID);
    setCallData({ callId: newCallId });
    console.log('CallID Novo:', newCallId);
  };

  function generateCallId(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('-');
  }

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        className={`flex items-center gap-2 px-4 py-3 rounded-full overflow-hidden ${
          firebaseCallId
            ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer text-white shadow-lg'
            : 'bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30 dark:border-white/10 text-fluency-gray-800 dark:text-fluency-gray-100 hover:bg-white/30 hover:dark:bg-black/30 hover:border-white/50 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-colors duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-not-allowed'
        }`}
        initial={{ width: 56 }}
        animate={{ width: isHovered ? 180 : 56 }}
        transition={{ type: "spring", stiffness: 500, damping: 28, duration: 0.25 }}
        onClick={firebaseCallId ? createCallId : undefined}
        layout
      >
        <motion.div
          className="flex items-center justify-center rounded-full w-8 h-8"
          animate={
            firebaseCallId
              ? { 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0]
                }
              : { scale: 1, rotate: 0 }
          }
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          layout
        >
          <IoVideocam className="w-5 h-5" />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            width: isHovered ? "auto" : 0 
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="whitespace-nowrap text-sm font-medium"
        >
          {firebaseCallId ? "Clique para entrar" : "Nenhuma chamada"}
        </motion.span>
      </motion.button>
    </motion.div>
  );
}