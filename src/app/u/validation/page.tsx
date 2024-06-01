"use client";
import React, { useEffect, useState } from 'react';
import './validation.css';

//Firebase
import 'firebase/compat/firestore';

//Next Imports
import Image from "next/image"
import Link from 'next/link';

//Components
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';

//Images
import Logo from '../../../../public/images/brand/logo.png';

//Icons
import { GrValidate } from "react-icons/gr";
import { BsArrowLeft } from "react-icons/bs";

//Notification
import { toast, Toaster } from 'react-hot-toast';


// Define the type for certificate data
interface CertificateData {
  studentName: string;
  course: string;
  startDate: string;
  endDate: string;
  hours: number;
  frequency: number;
  grade: number;
  teacher: string;
  validationCode: string;
  topics: string;
}

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db, app } from '@/app/firebase';
  

const Validation = () => {
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
      const storedDarkMode = localStorage.getItem('isDarkMode');
      return storedDarkMode ? storedDarkMode === 'true' : true;
    }
    return true; // Default to true if localStorage is not available
  });
  
  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('isDarkMode', isChecked.toString());
      document.body.classList.toggle('dark', isChecked);
    }
  }, [isChecked, isLocalStorageAvailable]);
  
  const [validationCode, setValidationCode] = useState('');
  // Initialize certificateData with null or default value
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const db = getFirestore(app);
      const certificateRef = query(collection(db, 'Certificate'), where('validationCode', '==', validationCode));
      const querySnapshot = await getDocs(certificateRef);
      
      if (querySnapshot.empty) {
        toast.error('Certificado não encontrado. Verifique o código!', {
          position: 'bottom-center'
        });
      } else {
        querySnapshot.forEach((doc) => {
          setCertificateData(doc.data() as CertificateData);
        });
      }
      
    } catch (error) {
      console.error('Error retrieving certificate: ', error);
    }
  };

  const handleReloadForm = () => {
    setValidationCode('');
    setCertificateData(null);
  };

  return (
    <div className="p-2 flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:invert text-fluency-text-light dark:text-fluency-text-dark">
            
      <div className='flex flex-row w-full justify-between items-center px-2'>
            <Link href="/">
              <button className="dark:invert text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 ease-in-out duration-300 flex justify-center">
                <BsArrowLeft className='lg:w-9 lg:h-9 w-9 h-9' />
              </button>
            </Link>

          <div className='dark:invert'>
            <ToggleDarkMode />
          </div>
      </div>
      {!certificateData && (
        <form onSubmit={handleSubmit} className="centered-form gap-5">
          <label className='block uppercase tracking-wide text-gray-700 font-bold mb-2'>
            Código de Validação:
            <input className='bg-gray-400 appearance-none border-2 border-gray-400 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-fluency-bg-light focus:border-zinc-500 ease-in-out duration-700' type="text" placeholder='Número do certificado' value={validationCode} onChange={handleChange} required />
          </label>
          <button type="submit" className='gap-2 leading-6 inline-flex items-center px-4 py-3 dark:invert bg-fluency-green-500 hover:bg-fluency-green-600 ease-in-out duration-300 text-fluency-text-dark text-xl font-medium rounded-md'><GrValidate />Verificar Certificado</button>
        </form>
      )}

      {certificateData && (
        <div className='infocertificados'>

          <div>
            <Image src={Logo} alt="FluencyLab Marca" className='w-30 h-30'/>
          </div>

          <h2>Informações sobre Certificado</h2>
          <div className='infonome'>
            <p><strong>Nome:</strong> {certificateData.studentName}</p>
            <p><strong>Curso:</strong> {certificateData.course}</p>
            <p><strong>Período:</strong> {certificateData.startDate} à {certificateData.endDate}</p>

            <div className='infohoras'>
              <p><strong>Horas:</strong> {certificateData.hours}h</p>
              <p><strong>Frequência:</strong> {certificateData.frequency}%</p>
              <p><strong>Nota:</strong> {certificateData.grade}.0</p>
            </div>

            <p><strong>Coordenador de Curso:</strong> {certificateData.teacher}</p>
            <p><strong>Código de Validação:</strong> {certificateData.validationCode}</p>

            <div className='infoconteudo'>
              <p><strong>Conteúdo:</strong> {certificateData.topics}</p>
            </div>
          </div>

          <button className='dark:invert leading-6 inline-flex items-center px-2 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md' onClick={handleReloadForm}>Verificar Outro Certificado</button>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default Validation;
