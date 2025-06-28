'use client';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaUser, FaTimes } from 'react-icons/fa';
import FluencyButton from '@/app/ui/Components/Button/button';
import { montserrat, myFont } from '@/app/ui/Fonts/fonts';
import { db } from '@/app/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import ReactToPrint from 'react-to-print';
import LogoOnline from '../../../../public/images/brand/logo-online.png';
import Image from 'next/image';
import { IoLanguage } from 'react-icons/io5';
import { BsCalendarDate } from 'react-icons/bs';
import { TbCircleLetterA, TbNumber123 } from 'react-icons/tb';
import { MdOutlineDateRange } from 'react-icons/md';
import { GoNumber } from 'react-icons/go';
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

interface CertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData?: {
    name: string;
    course?: string;
  };
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
          <div className='w-[85%] text-center text-[2.3rem]'>
          <p>
              por ter completado o curso de {formData.course} realizado de {formatDate(formData.startDate)} até {formatDate(formData.endDate)}, 
              com carga horária total de {formData.hours} horas através da plataforma fluencylab.me
            </p>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-1 relative bottom-12'>
          <p className='text-[2rem]'>{formData.teacher}</p>
          <p className='text-2xl font-bold'>Coordenador de Curso</p>
        </div>
      </div>

      <div id='pagina2' className='w-full h-screen flex flex-col items-start justify-between bg-fluency-gray-100 p-[5rem]'>
        <h1 className='text-[5rem] font-bold'>Registro de Conclusão de Curso</h1>
        <div className='flex flex-row items-start justify-between w-full p-3 rounded-md'>
          <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Aluno: </p> <span className='text-[2.5rem]'>{formData.studentName}</span></div>
          <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Curso: </p> <span className='text-[2.5rem]'>{formData.course}</span></div>
        </div>

        <div className='flex flex-row items-start justify-between w-full p-3 rounded-md'>
          <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Período: </p> <span className='text-[2.5rem]'>{formData.startDate} - {formData.endDate}</span></div>
          <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Média Final: </p> <span className='text-[2.5rem]'>{formData.grade}</span></div>
        </div>

        <div className='flex flex-col items-start gap-2 p-3 text-wrap w-max'>
             <p className='font-bold text-[3rem]'>Conteúdo: </p> <span className='text-[2rem] w-[40%]'>{formData.topics}</span>
        </div>

        <div className='flex flex-col gap-2 justify-around w-max  p-3 rounded-md'>
        <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Carga Horária: </p> <span className='text-[2.5rem]'>{formData.hours}</span></div>
        <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Frequência: </p> <span className='text-[2.5rem]'>{formData.frequency}</span></div>
        </div>

        <div className='flex flex-row justify-between w-full p-3 rounded-md'>
          <div className='flex flex-col items-start gap-2'>
          <div className='flex flex-row items-center gap-2 p-3'><p className='font-bold text-[3rem] mr-2'>Validação: </p> <span className='text-[2.5rem]'>{formData.validationCode}</span></div>
            <p className='text-xl'>Acesse: www.fluencylab.me/u/validation</p>
          </div>
          <div className='flex flex-col items-start gap-2 relative right-[5rem] bottom-[5rem]' >
          <p className='font-bold text-3xl'>Registro:</p>
          <p>MATHEUS DE SOUZA FERNANDES</p>
          <p>COORDENADOR DE CURSO</p>
          <p>FLUENCY LAB</p>
          <p>CNPJ - 47.603.142/0001-07</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const CertificadoModal: React.FC<CertificadoModalProps> = ({ isOpen, onClose, studentData }) => {
  const generateValidationCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const [formData, setFormData] = useState<FormData>({
    studentName: studentData?.name || '',
    teacher: '',
    startDate: '',
    endDate: '',
    course: studentData?.course || '',
    hours: '',
    frequency: '',
    grade: '',
    topics: '',
    validationCode: generateValidationCode(),
  });

  // Atualiza os dados do formulário quando studentData muda
  useEffect(() => {
    if (studentData) {
      setFormData(prevData => ({
        ...prevData,
        studentName: studentData.name || prevData.studentName,
        course: studentData.course || prevData.course
      }));
    }
  }, [studentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const componentRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<ReactToPrint>(null);

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
      
      // Aciona a impressão automaticamente após criar o certificado
      if (printRef.current) {
        const printButton = document.querySelector('[data-testid="print-button"]');
        if (printButton) {
          (printButton as HTMLElement).click();
        }
      }
  
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark p-6 rounded-lg w-4/5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gerar Certificado</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className='flex flex-col gap-3 h-full'>
          <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col gap-8 w-full mt-4'>
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
                  <IoLanguage />
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
                <BsCalendarDate />
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
                <BsCalendarDate />
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
                <TbNumber123 />
                </div>
                <input
                  type="text"
                  name="validationCode"
                  className="w-full -ml-10 pl-10 pr-3 py-2 ease-in-out duration-300 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                  placeholder="Código de Validação"
                  value={formData.validationCode}
                  onChange={handleChange}
                  required
                />
                <FluencyButton variant='warning' onClick={handleGenerateValidationCode}>Gerar</FluencyButton>
              </div>
            </div>

            <div className='flex flex-col items-stretch gap-2 w-full'>
              <h1>Médias do Aluno:</h1>
              <div className="flex">
                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                <TbCircleLetterA />
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
                <MdOutlineDateRange />
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
                <GoNumber />
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

          <div className='flex flex-row gap-2 mt-4'>
            <FluencyButton onClick={handleCreateCertificate} className='w-48' variant='confirm'>Criar Certificado</FluencyButton>

            <ReactToPrint
              ref={printRef}
              trigger={() => {
                return <FluencyButton className='w-48' variant='danger' data-testid="print-button">Gerar PDF</FluencyButton>;
              }}
              content={() => componentRef.current}
              documentTitle='Certificado de Conclusão'
              pageStyle="print"
            />
          </div>
        </div>

        <div className='hidden'><InnerForm ref={componentRef} formData={formData} /></div>
      </div>
    </div>
  );
};

InnerForm.displayName = 'InnerForm';

export default CertificadoModal;

