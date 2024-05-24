'use client';
import React, { useState, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FaUser } from 'react-icons/fa';
import FluencyButton from '@/app/ui/Components/Button/button';

import { db } from '@/app/firebase';  // Adjust the import path as necessary
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

import ReactToPrint from 'react-to-print';

export default function Certificado() {
  const generateValidationCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const [formData, setFormData] = useState({
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

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    let validationCode = generateValidationCode();
    try {
      let uniqueCode = false;
      while (!uniqueCode) {
        const codeCheckQuery = query(collection(db, 'Certificate'), where('validationCode', '==', validationCode));
        const codeCheckSnapshot = await getDocs(codeCheckQuery);
        if (codeCheckSnapshot.empty) {
          uniqueCode = true;
        } else {
          validationCode = generateValidationCode();
        }
      }

      const certificateRef = doc(collection(db, 'Certificate'));
      await setDoc(certificateRef, { ...formData, validationCode });

      toast.success('Certificado criado com sucesso!');
      setFormData({
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

      toast.success(`Código de validação: ${validationCode}`, {
        position: "top-center",
      });

    } catch (error) {
      console.error('Erro ao adicionar documento: ', error);
      toast.error('Erro ao criar certificado');
    }
  };

  const componentRef = useRef(null);

  return (
    <div className="flex flex-col items-center lg:pr-2 md:pr-2 pr-0 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">
      <div className='fade-in fade-out w-full p-8 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-xl text-fluency-text-light dark:text-fluency-text-dark mt-4'>
        <form ref={componentRef} onSubmit={handleSubmit}>
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
                    <option value="">Selecione o curso</option>
                    <option value="Língua Inglesa">Língua Inglesa</option>
                    <option value="Língua Espanhola">Língua Espanhola</option>
                    <option value="Língua Brasileira de Sinais">Língua Brasileira de Sinais</option>
                  </select>
                </div>
              </div>

              <div className='flex flex-col items-stretch gap-2 w-full'>
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
              <FluencyButton className='w-48' variant='confirm'>Criar Certificado</FluencyButton>
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
        </form>
      </div>

      <Toaster />
    </div>
  );
}
