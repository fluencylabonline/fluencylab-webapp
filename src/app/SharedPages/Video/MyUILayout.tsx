'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  CallingState,
  StreamTheme,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  Avatar
} from "@stream-io/video-react-sdk";
import { useCall } from '@stream-io/video-react-bindings';
import FluencyButton from '@/app/ui/Components/Button/button';
import { useCallContext } from '@/app/context/CallContext';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { db } from '@/app/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { MdCallEnd } from 'react-icons/md';
import { LuPictureInPicture } from 'react-icons/lu';
import { ParticipantsGrid } from './ParticipantsGrid';
import { ParticipantsGridPiP } from './ParticipantsGridPiP';
import { BiCamera, BiCameraOff, BiMicrophone, BiMicrophoneOff } from 'react-icons/bi';

// Common container and notch classes for responsiveness
const containerClasses =
  "fixed top-0 right-0 bottom-0 w-full max-w-sm z-[9999] rounded-l-2xl overflow-y-auto bg-slate-200 dark:bg-fluency-pages-dark shadow-lg shadow-gray-400 dark:shadow-fluency-gray-800 p-4";
const notchClasses =
  "absolute left-2 top-1/2 transform -translate-y-1/2 w-[5px] h-12 bg-gray-400 dark:bg-gray-200 rounded-full mx-auto mb-4 cursor-grab";

interface JoinUIProps {
  role: "teacher" | "student";
  onJoin: () => Promise<void>;
  joinLabel: string;
}

  export const showCanceledCallToast = (): void => {
    toast("Cancelada", {
      position: "bottom-center",
      style: {
        borderRadius: "10px",
        background: "#DEBE16",
        color: "#fff",
        textAlign: "center",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: 'bold'
      },
    });
  };

  export const showJoinedCallToast = (): void => {
    toast("Bem-vindo!", {
      position: "bottom-center",
      style: {
        borderRadius: "10px",
        background: "#1fc84f",
        color: "#fff",
        textAlign: "center",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: 'bold'
      },
    });
  };

  export const showLeftCallToast = (): void => {
    toast("Até mais!", {
      position: "bottom-center",
      style: {
        borderRadius: "10px",
        background: "#3F51B5",
        color: "#fff",
        textAlign: "center",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: 'bold'
      },
    });
  };

  export const showEndedCallToast = (): void => {
    toast("Chamada encerrada", {
      position: "bottom-center",
      style: {
        borderRadius: "10px",
        background: "#FA3D2E",
        color: "#fff",
        textAlign: "center",
        padding: "10px",
        fontSize: "1rem",
        fontWeight: 'bold'
      },
    });
  };

// A reusable join UI component wrapped in a motion.div
export const JoinUI: React.FC<JoinUIProps> = ({ role, onJoin, joinLabel }) => {
    const { useCallSession } = useCallStateHooks();
    const sessionCall = useCallSession();
    const call = useCall();
    const { setCallData } = useCallContext();
    const { data: session } = useSession();
    // Cria um array de participantes únicos
    const uniqueParticipants = sessionCall?.participants.filter(
      (participant, index, self) =>
        index === self.findIndex(p => p.user.id === participant.user.id)
    ) || [];

    return (
    <StreamTheme>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event, info) => {
          if (info.offset.x > 100) {
            call?.leave();
            setCallData(null);
            showCanceledCallToast();
          }
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={containerClasses}
      >
        <div className={notchClasses} />
        <div className="flex flex-col items-center justify-center gap-6 rounded-lg p-4 h-[85%]">
          <p className="text-lg font-semibold">
            Bem-vindo, {role === "teacher" ? "Professor" : (session?.user.name)}!
          </p>
          {role === "student" && 
          (<div className="flex flex-row items-center justify-center gap-2">
            Participantes:
          </div>)}
          <div className="flex flex-wrap justify-center gap-2">
            {uniqueParticipants.map((participant, index) => {
              const key = participant.user.id ? `user-${participant.user.id}` : `index-${index}`;
              return (
                <div key={key} className="flex flex-row items-center justify-center gap-2">
                  <Avatar
                    name={participant.user.name}
                    imageSrc={participant.user.image}
                    style={{ borderRadius: "100%" }}
                  />
                  {participant.user.name && (
                    <div className="font-bold text-sm">
                      {participant.user.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <FluencyButton variant="purple" onClick={onJoin}>
              {joinLabel}
            </FluencyButton>
            <FluencyButton
                variant="danger"
                onClick={async () => {
                    try {
                    await call?.endCall();
                    } catch (error: any) {
                    // If the error indicates the call has already been left, ignore it.
                    if (error.message && error.message.includes("already been left")) {
                        console.warn("Call was already left.");
                    } else {
                        console.error("Error leaving call:", error);
                    }
                    } finally {
                        setCallData(null);
                        showCanceledCallToast();
                    }
                }}
                >
                Cancelar
            </FluencyButton>
          </div>
        </div>
      </motion.div>
    </StreamTheme>
    );
  };

export const MyUILayout: React.FC = (): JSX.Element => {
  const { data: session } = useSession();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setId(params.get("id"));
    }
  }, []);
  
  const call = useCall();
  const { callData, setCallData } = useCallContext();
  const {
    useCallCallingState,
    useLocalParticipant,
    useRemoteParticipants,
    useMicrophoneState,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const isSpeakingWhileMuted = useMicrophoneState(); 
  const [isPiP, setIsPiP] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const handleEndCall = async (): Promise<void> => {
    if (call && id) {
      try {
        await call.endCall();
        setCallData(null);
        // Update the callID in the student's Firestore document
        const studentRef = doc(db, "users", id);
        try {
          await updateDoc(studentRef, { callID: null });
          console.log("Campo callID atualizado com sucesso.");
        } catch (error) {
          console.error("Erro ao atualizar o campo callID:", error);
        }
        showEndedCallToast();
      } catch (error) {
        console.error("Error ending the call:", error);
      }
    }
  };

  const handleStudentLeaveCall = async (): Promise<void> => {
    if (call) {
      try {
        await call.leave();
        setCallData(null);
        showLeftCallToast();
      } catch (error) {
        console.error("Error leaving the call:", error);
      }
    }
  };

  const handleTeacherJoinCall = async (): Promise<void> => {
    // Prevent duplicate join attempts.
    if (callingState === CallingState.JOINED) {
      console.warn("User is already in the call.");
      return;
    }
    if (call && id) {
      try {
        call?.join({
          data: {
            settings_override: {
              limits: {
                max_duration_seconds: 3600,
              },
            },
          },
        })
        // Update the callID in the student's Firestore document.
        const studentRef = doc(db, "users", id);
        try {
          await updateDoc(studentRef, { callID: callData?.callId });
          console.log("Campo callID atualizado com sucesso.");
        } catch (error) {
          console.error("Erro ao atualizar o campo callID:", error);
        }
        showJoinedCallToast();
      } catch (error) {
        console.error("Error joining the call:", error);
      }
    }
  };
  
  const handleStudentJoinCall = async (): Promise<void> => {
    // Prevent duplicate join attempts.
    if (callingState === CallingState.JOINED) {
      console.warn("User is already in the call.");
      return;
    }
    if (call) {
      try {
        await call.join();
        showJoinedCallToast();
      } catch (error) {
        console.error("Error joining the call:", error);
      }
    }
  };

  const togglePiP = () => {
    setIsPiP((prev) => !prev);
  };

  // Full call UI wrapped in a draggable motion.div
  const callComponent = (
    <StreamTheme>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_event, info) => {
          if (info.offset.x > 100) {
            if (callingState === CallingState.JOINED) {
              togglePiP();
            } else {
              setCallData(null);
              showCanceledCallToast();
            }
          }
        }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={containerClasses}
      >
        <div className={notchClasses} />
          <div className="flex flex-col items-center justify-center gap-6 rounded-lg p-4">

            <div className="w-full flex flex-col items-center justify-center gap-4">
              <ParticipantsGrid remoteParticipants={remoteParticipants} localParticipant={localParticipant} />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 w-full absolute bottom-3">
              
              <ToggleAudioPublishingButton />
              <ToggleVideoPublishingButton />
              <ScreenShareButton />
                <button className='p-3 rounded-full bg-fluency-gray-600 dark:bg-fluency-gray-600 hover:bg-fluency-gray-700 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={togglePiP}>
                  <LuPictureInPicture className='text-indigo-600'/>
              </button>
              {session?.user.role === "student" && (
                  <button className='p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 hover:bg-fluency-gray-700 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={handleStudentLeaveCall}>
                      <MdCallEnd className='text-fluency-red-600' />
                  </button>
                )}
              {session?.user.role === "teacher" && (
                <button className='p-3 rounded-full bg-fluency-gray-600 dark:bg-fluency-gray-600 hover:bg-fluency-gray-700 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={handleEndCall}>
                  <MdCallEnd className='text-fluency-red-600'/>
                </button>
              )}
            </div>
          </div>
      </motion.div>
    </StreamTheme>
  );

  // Custom toggle functions
const handleToggleAudio = async (): Promise<void> => {
  if (call) {
    try {
      await call.microphone.toggle();
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  }
};

const handleToggleVideo = async (): Promise<void> => {
  if (call) {
    try {
      await call.camera.toggle();
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  }
};
  // PiP UI: A smaller, draggable popup constrained to the screen.
  const pipComponent = (
    <StreamTheme>
        <div ref={constraintsRef} className='fixed inset-0 pointer-events-none z-[9999]'>
          <motion.div
            ref={constraintsRef}
            drag
            dragMomentum={false}
            dragConstraints={constraintsRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-auto fixed bottom-20 right-20 w-min z-[9999] p-3 rounded-xl bg-slate-200 dark:bg-fluency-pages-dark shadow-lg shadow-gray-400 dark:shadow-fluency-gray-800"
          >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <ParticipantsGridPiP remoteParticipants={remoteParticipants} localParticipant={localParticipant} />
            </div>

            <div className="flex flex-wrap items-center justify-center w-full gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 
                         hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-700 
                         duration-300 ease-in-out transition-all"
              onClick={handleToggleAudio}
            >
              {localParticipant?.audioStream ? (
                <BiMicrophone className="text-indigo-600" />
              ) : (
                <BiMicrophoneOff className="text-red-600" />
              )}
            </motion.button>

            {/* Custom Toggle Video Button with animation */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 
                         hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-700 
                         duration-300 ease-in-out transition-all"
              onClick={handleToggleVideo}
            >
              {localParticipant?.videoStream ? (
                <BiCamera className="text-indigo-600" />
              ) : (
                <BiCameraOff className="text-red-600" />
              )}
            </motion.button>

              <button className='p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={togglePiP}>
                <LuPictureInPicture className='text-indigo-600'/>
              </button>
              {session?.user.role === "student" && (
                <button className='p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={handleStudentLeaveCall}>
                    <MdCallEnd className='text-fluency-red-600' />
                </button>
              )}
              {session?.user.role === "teacher" && (
                <button className='p-3 rounded-full bg-fluency-gray-200 dark:bg-fluency-gray-600 hover:bg-fluency-gray-300 hover:dark:bg-fluency-gray-700 duration-300 ease-in-out transition-all' onClick={handleEndCall}>
                  <MdCallEnd className='text-fluency-red-600'/>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </StreamTheme>
  );

  if (!call?.id) return <>Sem chamada ativa</>;

  return (
    <>
      {callingState !== CallingState.JOINED ? (
        session?.user.role === "teacher" ? (
          <JoinUI
            role="teacher"
            onJoin={handleTeacherJoinCall}
            joinLabel="Iniciar Aula"
          />
        ) : (
          <JoinUI
            role="student"
            onJoin={handleStudentJoinCall}
            joinLabel="Entrar na Aula"
          />
        )
      ) : isPiP ? (
        pipComponent
      ) : (
        callComponent
      )}
    </>
  );
};
