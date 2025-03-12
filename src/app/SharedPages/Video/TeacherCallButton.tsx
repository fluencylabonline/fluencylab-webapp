'use client'
import { useCallContext } from "@/app/context/CallContext";
import FluencyButton from "@/app/ui/Components/Button/button";
import { useSession } from "next-auth/react";
import { IoVideocam } from "react-icons/io5";
interface TeacherCallButtonProps {
    student: {
      studentID: any;
    };
  }
  
export default function TeacherCallButton({ student }: TeacherCallButtonProps) {
    const { data: session } = useSession();
    const { setCallData } = useCallContext();
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
        <FluencyButton variant='purple' className='min-w-max' onClick={createCallId}>Chamada <IoVideocam /></FluencyButton>
    )
}