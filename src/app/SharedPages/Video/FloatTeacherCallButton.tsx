'use client'
import { useCallContext } from "@/app/context/CallContext";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { IoVideocam } from "react-icons/io5";
import { useState } from "react";

interface FloatTeacherCallButtonProps {
  student: {
    studentID: any;
  };
}

export default function FloatTeacherCallButton({ student }: FloatTeacherCallButtonProps) {
  const { data: session } = useSession();
  const { setCallData } = useCallContext();
  const [isHovered, setIsHovered] = useState(false);

  const createCallId = () => {
    const currentUserId = session?.user.id;
    if (!currentUserId) return;
    const newCallId = generateCallId(currentUserId, student.studentID);
    setCallData({ callId: newCallId });
    console.log('CallID Novo:', newCallId)
  };

  function generateCallId(userId1: string, userId2: string) {
    return [userId1, userId2].sort().join('-');
  }

  return(
    <motion.div
      className="fixed bottom-12 lg:right-10 md:right-5 right-2 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        className="flex items-center gap-2 px-4 py-3 rounded-full overflow-hidden bg-fluency-blue-600 hover:bg-fluency-blue-700 cursor-pointer text-white shadow-lg"
        initial={{ width: 56 }}
        animate={{ width: isHovered ? 180 : 56 }}
        transition={{ type: "spring", stiffness: 500, damping: 28, duration: 0.25 }}
        onClick={createCallId}
        layout
      >
        <motion.div
          className="flex items-center justify-center rounded-full w-8 h-8"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          }}
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
          Iniciar chamada
        </motion.span>
      </motion.button>
    </motion.div>
  )
}