'use client';
import { useState } from 'react';
import Link from 'next/link';

//Notifications
import { toast, Toaster } from 'react-hot-toast';

//Components
import { ToggleDarkMode } from '../ui/Components/Buttons/ToggleDarkMode';

//Firebase
import { sendPasswordResetEmail } from 'firebase/auth'; // Import getAuth and sendPasswordResetEmail
import { auth } from '@/app/firebase';

//Icons
import { BsArrowLeft } from 'react-icons/bs';
import { FaRegCircleUser } from 'react-icons/fa6';
import { FirebaseError } from 'firebase/app';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  async function handleForgotPassword() {
    try {
      await sendPasswordResetEmail(auth, email); // Use sendPasswordResetEmail with the auth instance
      toast.success('Um email de recuperação de senha foi enviado para o seu endereço de email.');
    } catch (error: any) {
      const errorMessage = (error as FirebaseError).message; // Explicitly define error as FirebaseError
      toast.error(errorMessage);
    }
  }

  return (
    <div className="p-2 flex flex-col items-center justify-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">
      <div className='absolute top-2 flex flex-row w-full justify-between items-center px-4'>
          <Link href="/">
            <button className="text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 hover:dark:text-fluency-blue-500 ease-in-out duration-300 flex justify-center">
              <BsArrowLeft className='lg:w-9 lg:h-9 w-7 h-7' />
            </button>
          </Link>

          <div>
              <h1 className='text-xl font-bold text-center px-1'>Recuperar sua senha</h1>
          </div>

          <div>
            <ToggleDarkMode />
          </div>
      </div>

      <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark rounded-xl shadow-xl overflow-hidden lg:-mt-8 mt-10">
        <div className="flex flex-col gap-4 w-full py-10 px-5 md:px-10">
          <div className="text-center mb-6">
            <h1 className="font-bold text-3xl">Vamos lá!</h1>
            <p>Por favor, informe seu e-mail para recuperarmos sua senha.</p>
          </div>
          <div className="w-full px-3 mb-2">
            <label className="text-xs font-semibold px-1">Seu email</label>
            <div className="flex">
              <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                <FaRegCircleUser />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder='Seu email aqui'
                className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 dark:bg-fluency-bg-dark dark:border-fluency-gray-500 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 ease-in-out duration-300"
              />
            </div>
          </div>
          <div className="w-full px-3 mb-5 flex flex-col items-center gap-2">
            <button
              className="cursor-pointer block w-full max-w-xs mx-auto bg-fluency-blue-500 hover:bg-fluency-blue-600 focus:bg-fluency-blue-700 ease-in-out duration-300 text-fluency-text-dark rounded-lg px-3 py-3 font-semibold"
              onClick={handleForgotPassword}
              disabled={!email}
            >
              Recuperar senha
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
