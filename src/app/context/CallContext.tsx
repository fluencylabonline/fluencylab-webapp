// CallContext.tsx
/*
import { createContext, useContext, useState } from 'react';

type CallData = {
  callId: string;
};

type CallContextType = {
  callData: CallData | null;
  setCallData: (data: CallData | null) => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [callData, setCallData] = useState<CallData | null>(null);
  return (
    <CallContext.Provider value={{ callData, setCallData }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCallContext must be used within a CallProvider");
  return context;
};
*/

// CallContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

type CallData = {
  callId: string;
};

type CallContextType = {
  callData: CallData | null;
  setCallData: (data: CallData | null) => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [callData, setCallData] = useState<CallData | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.role !== 'student') {
      console.log("Sessão não é de um aluno.");
      return;
    }
    // Ajuste o caminho se necessário: pode ser session.user.id ou student.studentID
    const studentRef = doc(db, 'users', session.user.id);
    const unsubscribe = onSnapshot(
      studentRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const callId = data.callId;  // Acessa o valor do campo callId
          if (callId === null) {
            setCallData(null);
          } else {
            setCallData({ callId });
          }
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

  return (
    <CallContext.Provider value={{ callData, setCallData }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCallContext must be used within a CallProvider");
  return context;
};
