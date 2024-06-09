'use client'
import ComingSoon from "@/app/ComingSoon/coming-soon";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PiExam } from "react-icons/pi";

export default function Fala(){
  const router = useRouter();
  const { data: session } = useSession();
  
  const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
    useEffect(() => {
      const fetchUserInfo = async () => {
          if (session && session.user && session.user.id) {
              try {
                  const profile = doc(db, 'users', session.user.id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
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

    return(
        <div className='min-h-[90vh] w-full flex flex-col justify-center items-center px-12 p-8'>
            {nivelamentoPermitido === false ? 
              (
              <div className='w-max h-full rounded-md bg-fluency-green-700 text-white font-bold p-6'>
                  <div className='flex flex-row text-2xl w-full h-full gap-2 justify-center items-center p-4'>Nivelamento feito! <PiExam className='w-6 h-auto' /></div>    
              </div>
              ):(
              <div>
                    <ComingSoon />
              </div>
              )
            }
        </div>
    )
}