'use client'
import { useCallContext } from "@/app/context/CallContext";
import FluencyButton from "@/app/ui/Components/Button/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase"; // Ajuste o caminho conforme necessário
import { IoVideocam } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface StudentCallButtonProps {
  student: {
    studentID: any;
  };
}

export default function StudentCallButton({ student }: StudentCallButtonProps) {
  const { data: session } = useSession();
  const { setCallData } = useCallContext();
  const [firebaseCallId, setFirebaseCallId] = useState<any | null>(null);

  useEffect(() => {
    if (!session) {
      console.error("Sessão não inicializada");
      return;
    }
    // Ajuste o caminho se necessário: pode ser session.user.id ou student.studentID
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
  }, [session, session?.user.id]);

  const createCallId = () => {
    const currentUserId = session?.user.professorId;
    if (!currentUserId) return;
    const newCallId = generateCallId(currentUserId, student.studentID);
    setCallData({ callId: newCallId });
    console.log('CallID Novo:', newCallId);
  };

  function generateCallId(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('-');
  }

  return (
    <FluencyButton
      variant={`${firebaseCallId ? 'confirm' : 'purple'}`}
      className='min-w-max'
      onClick={createCallId}
      disabled={!firebaseCallId} 
    >
      <AnimatePresence mode="wait">
        {firebaseCallId ? (
          <motion.span
            key="em-andamento"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
          >
            Em andamento
          </motion.span>
        ) : (
          <motion.span
            key="chamada"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
          >
            Chamada
          </motion.span>
        )}
      </AnimatePresence>{" "}
      {firebaseCallId ? (
        <motion.div
          className="ml-2"
          style={{ display: 'inline-block' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <IoVideocam />
        </motion.div>
      ) : (
        <motion.div
          className="ml-2"
          style={{ display: 'inline-block' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <IoVideocam />
        </motion.div>
      )}
    </FluencyButton>
  );
}
