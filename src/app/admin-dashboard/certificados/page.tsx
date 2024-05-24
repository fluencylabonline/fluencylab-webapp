'use client';
import React, { useState, useRef, MutableRefObject } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FaUser } from 'react-icons/fa';
import FluencyButton from '@/app/ui/Components/Button/button';
import { montserrat, myFont } from '@/app/ui/Fonts/fonts';
import { db } from '@/app/firebase';  // Adjust the import path as necessary
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

import ReactToPrint from 'react-to-print';
import LogoOnline from '../../../../public/images/brand/logo-online.png';
import Image from 'next/image';
import './pagina.css';

interface FormData {
  studentName: string;
  teacher: string;
  startDate: string;
  endDate: string;
  course: string;
  hours: string;
  frequency: string;
  grade: string;
  topics: string;
  validationCode: string;
}

interface InnerFormProps {
  formData: FormData;
}

const InnerForm = React.forwardRef<HTMLDivElement, InnerFormProps>(({ formData }, ref) => {
  function formatDate(dateString: string): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day} de ${monthName} de ${year}`;
  }
  
  return (
    <div className={`${montserrat.className} antialiased w-full h-full text-fluency-text-light`} ref={ref}>
      <div id='pagina1' className='w-full h-screen flex flex-col items-center justify-between bg-fluency-gray-100'>
        <div className='flex flex-col items-center justify-center gap-1 relative top-12'>
          <Image className='w-[19rem] h-auto' src={LogoOnline} alt='Logo' />
            <div className='flex flex-col items-center justify-center'>
              <h1 className='text-[6rem] font-bold'>Certificado</h1>
              <h3 className='text-[1.7rem] font-semibold -mt-2'>PARA</h3>
            </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-1 mb-12'>
          <div className='w-[80%] text-center text-[5rem] p-4'>
            <p className={`${myFont.className} antialiased`}>{formData.studentName}</p>
          </div>
          <div className='w-[85%] text-center text-[1.2rem]'>
          <p>
              por ter completado o curso de {formData.course} realizado de {formatDate(formData.startDate)} até {formatDate(formData.endDate)}, 
              com carga horária total de {formData.hours} horas através da plataforma fluencylab.me
            </p>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-1 relative bottom-12'>
          <p>{formData.teacher}</p>
          <p>Coordenador de Curso</p>
        </div>
      </div>

      <div id='pagina2' className='w-full h-screen flex flex-col items-start justify-between bg-fluency-gray-100 p-12'>
        <h1 className='text-[3rem] font-bold'>Registro de Conclusão de Curso</h1>
        <div className='flex flex-row justify-around w-full text-xl'>
          <p>Aluno: {formData.studentName}</p>
          <p>Curso: {formData.course}</p>
        </div>

        <div className='flex flex-row justify-around w-full text-xl'>
          <div>
            <p>Período: {formData.startDate} - {formData.endDate}</p>
            <p>Média Final: {formData.grade}</p>
          </div>
          <div>
            Conteúdo: {formData.topics}
          </div>
        </div>

        <div className='flex flex-row justify-around w-full text-xl'>
          <p>Carga Horária: {formData.hours}</p>
          <p>Frequência: {formData.frequency}</p>
        </div>

        <div className='flex flex-row justify-around w-full text-xl'>
          <div>Validação: {formData.validationCode}</div>
          <div>Registro: {formData.validationCode}</div>
        </div>
      </div>
    </div>
  );
});

export default function Certificado() {
  const generateValidationCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    teacher: '',
    startDate: '',
    endDate: '',
    course: '',
    hours: '',
    frequency: '',
    grade: '',
    topics: '',
    validationCode: generateValidationCode(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const componentRef = useRef<HTMLDivElement>(null);

  const handleCreateCertificate = async () => {
    try {
      // Check if the validation code from the form data is unique
      let uniqueCode = false;
      while (!uniqueCode) {
        const codeCheckQuery = query(collection(db, 'Certificate'), where('validationCode', '==', formData.validationCode));
        const codeCheckSnapshot = await getDocs(codeCheckQuery);
        if (codeCheckSnapshot.empty) {
          uniqueCode = true;
        } else {
          // If the code is not unique, generate a new one and update form data
          const newValidationCode = generateValidationCode();
          setFormData({ ...formData, validationCode: newValidationCode });
        }
      }
  
      // Create certificate with the validated validation code
      const certificateRef = doc(collection(db, 'Certificate'));
      await setDoc(certificateRef, formData);
  
      // Show success message with the validated validation code
      toast.success('Certificado criado com sucesso!');
      toast.success(`Código de validação: ${formData.validationCode}`, {
        position: "top-center",
      });
  
    } catch (error) {
      console.error('Erro ao adicionar documento: ', error);
      toast.error('Erro ao criar certificado');
    }
  };
  
  
  const handleGenerateValidationCode = async () => {
    let newValidationCode = generateValidationCode();
    try {
      let uniqueCode = false;
      while (!uniqueCode) {
        const codeCheckQuery = query(collection(db, 'Certificate'), where('validationCode', '==', newValidationCode));
        const codeCheckSnapshot = await getDocs(codeCheckQuery);
        if (codeCheckSnapshot.empty) {
          uniqueCode = true;
        } else {
          newValidationCode = generateValidationCode();
        }
      }
      setFormData({ ...formData, validationCode: newValidationCode });
    } catch (error) {
      console.error('Error checking validation code uniqueness:', error);
      toast.error('Error generating validation code');
    }
  };
  
  
  return (
    <div className="mt-4 p-12 rounded-md flex flex-col items-center lg:pr-2 md:pr-2 pr-0 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
        <h1 className='flex justify-center text-xl text-center font-medium'>Registro de Conclusão de Curso</h1>
        <div className='flex flex-col gap-3 h-full'>
          <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-8 w-full mt-8'>
            <div className='flex flex-col items-stretch gap-2 w-full'>
              <h1>Informações Pessoais</h1>
              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  type="text"
                  placeholder="Nome Completo do Aluno"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Coordenador de Curso"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                  type="text"
                  name='teacher'
                />
              </div>

              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <select
                  name='course'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione o Curso</option>
                  <option value="Língua Inglesa">Língua Inglesa</option>
                  <option value="Língua Espanhola">Língua Espanhola</option>
                  <option value="Língua Brasileira de Sinais">Língua Brasileira de Sinais</option>
                </select>
              </div>
            </div>

            <div className='flex flex-col items-strech gap-2 w-full'>
              <h1>Período de Curso</h1>
              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="date"
                  name='startDate'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Data de Início"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="date"
                  name='endDate'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Data de Término"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-11 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="validationCode" // Make sure the name matches the state property
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Código de Validação"
                  value={formData.validationCode} // Bind value to the state property
                  onChange={handleChange} // Make sure to handle changes if needed
                  required
                />
                <FluencyButton variant='warning' onClick={handleGenerateValidationCode}>Gerar</FluencyButton>
              </div>

            </div>

            <div className='flex flex-col items-stretch gap-2 w-full'>
              <h1>Médias do Aluno:</h1>
              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="number"
                  name='hours'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Horas de Curso"
                  value={formData.hours}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="number"
                  name='frequency'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Frequência"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                  <FaUser />
                </div>
                <input
                  type="number"
                  name='grade'
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Média"
                  value={formData.grade}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-col mt-4">
            <h1>Conteúdo visto em aulas</h1>
            <textarea
              name='topics'
              className="w-full h-24 p-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
              placeholder="Conteúdo das Aulas"
              value={formData.topics}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-row gap-2'>
            <FluencyButton onClick={handleCreateCertificate} className='w-48' variant='confirm'>Criar Certificado</FluencyButton>

            <ReactToPrint
              trigger={() => {
                return <FluencyButton className='w-48' variant='danger'>Gerar PDF</FluencyButton>;
              }}
              content={() => componentRef.current}
              documentTitle='Certificado de Conclusão'
              pageStyle="print"
            />
          </div>
        </div>

      <div className='hidden'><InnerForm ref={componentRef} formData={formData} /></div>

      <Toaster />
    </div>
  );
}

InnerForm.displayName = 'InnerForm';