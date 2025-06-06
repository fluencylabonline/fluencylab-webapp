import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ContratoNotificationModal = () => {
  const { data: session, status } = useSession();
  const [showNotification, setShowNotification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [contratoFoiAssinado, setContratoFoiAssinado] = useState({
    signed: false,
    logs: []
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session, status]);

  useEffect(() => {
    if (!userId) return;

    const db = getFirestore();
    const profileRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const contratoStatus = data?.ContratosAssinados ?? { signed: false, logs: [] };
        setContratoFoiAssinado(contratoStatus);
        
        // Mostrar notificação se contrato não estiver assinado
        setShowNotification(!contratoStatus.signed);
      } else {
        // If document doesn't exist, set default values
        setContratoFoiAssinado({ signed: false, logs: [] });
        setShowNotification(true);
      }
      },
      (error) => {
        console.error('Erro ao monitorar contrato:', error);
        toast.error('Erro ao verificar status do contrato');
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (status !== 'authenticated' || !showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-35 animate-fadeIn">
      <div className="bg-fluency-orange-600 text-black p-4 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-center gap-4 items-center">
          <div className="flex items-center mb-2 md:mb-0">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <span className="font-semibold">
              Seu contrato ainda não foi assinado!
            </span>
          </div>
          
          <Link 
            href="contrato"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center"
          >
            Assinar Agora
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContratoNotificationModal;