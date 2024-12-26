'use client'
import { useEffect, useState } from 'react';

//Next Imports
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

//Firebase
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import Link from 'next/link';
import { GrStatusGood } from 'react-icons/gr';
import { RiErrorWarningLine } from 'react-icons/ri';
import { FaRegCreditCard } from 'react-icons/fa';

const Pagamento: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [contratoFoiAssinado, setContratoFoiAssinado] = useState<{ 
    signed: boolean; 
    logs: { logID: string; signedAt: string; segundaParteAssinou: boolean }[] 
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
        if (session && session.user && session.user.id) {
            try {
                const profile = doc(db, 'users', session.user.id);
                const docSnap = await getDoc(profile);
                if (docSnap.exists()) {
                    setName(docSnap.data().name);        
                    setContratoFoiAssinado(docSnap.data().ContratoAssinado || { signed: false, logs: [] });
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

  useEffect(() => {
    // Redirect if the contract is not signed
    if (contratoFoiAssinado !== null && !contratoFoiAssinado.signed) {
      router.push('/student-dashboard/contrato');
    }
  }, [contratoFoiAssinado, router]);

  return (
    <div className='w-full p-2 h-[80vh] flex flex-col items-center justify-center'>
      {contratoFoiAssinado?.signed ? (
        <div className='flex flex-col gap-2 w-full rounded-md bg-fluency-gray-100 dark:bg-fluency-pages-dark text-black dark:text-white font-bold p-3 items-center justify-center'>
          <p className='text-2xl font-bold p-3'>Bem-vindo à FluencyLab, {name}</p>
          <p className='font-bold flex flex-row gap-1 items-center p-3'>Seu contrato foi assinado e está válido!<GrStatusGood className='w-6 h-auto hover:text-fluency-green-500 duration-300 ease-in-out transition-all' /></p>    
          <a
            href="https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c93808493dee0900193f576ab520a07"
            data-name="MP-payButton"
            className="flex flex-row items-center justify-center gap-2 p-3 bg-fluency-green-500 rounded-md text-white hover:bg-fluency-green-600 duration-300 ease-in-out transition-all"
          >
            <FaRegCreditCard className='w-6 h-auto' /> <p>Realizar Pagamento</p>
          </a>
        </div>
        ) : (
        <div className='flex flex-row gap-2 w-fit rounded-md bg-fluency-orange-600 text-white font-bold p-4 items-center justify-between'>
          <p className='flex flex-row w-full text-center justify-center items-center'>Contrato não assinado ainda. Redirecionando...</p>    
        </div>
      )}
    </div>    
  );
};

export default Pagamento;
