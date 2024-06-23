'use client';
import { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase";
import { FaKey, FaLink, FaRegCircleUser, FaUser } from "react-icons/fa6";
import { TbUserEdit } from "react-icons/tb";

import { toast, Toaster } from 'react-hot-toast';
import FluencyButton from "@/app/ui/Components/Button/button";
import { LuUserPlus2 } from "react-icons/lu";

export default function CreateProfessor(){
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [link, setLink] = useState('');

    const handleProfessorCreating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a new student document
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            userName: userName,
            email: email,
            role: "teacher",
            link: link,
            courses: {
                'primeirospassos-1': false,
                'dinamicaaulas-1': false,
                'dinamicaaulas-2': false,
                'dinamicaaulas-3': false,
                'ferramentas-1': false,
                'ferramentas-2': false,
                'ferramentas-3': false,
                'ferramentas-4': false,
                'nivelamento': false,
              }
        });

        // Reset form fields after successful sign-up
        setName('');
        setUserName('');
        setEmail('');
        setLink('');

        // Sign out the user
        await auth.signOut();

        setIsLoading(false);
        
        toast.success('Professor criado com sucesso!', {
            position: "top-center",
        });
    
        } catch (error: any) { // Explicitly define the type of error
            setIsLoading(false);
    
            // Display an error message based on the error code
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Este email já está sendo usado.', {
                    position: "top-center",
                });
            } else if (error.code === 'auth/weak-password') {
                toast.error('Senha fraca, use uma mais forte.', {
                    position: "top-center",
                });
            } else {
                toast.error('Um erro aconteceu, por favor tente novamente', {
                    position: "top-center",
                });
            }
        }
    };
      
    return(
        <>
            <div className='lg:flex lg:flex-row md:flex md:flex-row sm:flex sm:flex-col gap-4 items-strecht justify-center'>
                <div className='flex flex-col items-stretch'>
                    <div className="flex -mx-3">
                    <div className="w-full px-3 mb-4">
                        <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Nome do Professor</label>
                        <div className="flex">  
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <FaUser />
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                            placeholder="Nome do Professor" 
                        />
                        </div>
                    </div>
                    </div>
                    <div className="flex -mx-3">
                    <div className="w-full px-3 mb-4">
                        <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">E-mail FluencyLab</label>
                        <div className="flex">  
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <TbUserEdit />
                        </div>
                        <input 
                            type="text" 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                            placeholder="johnsmith@fluency.lab" 
                        />
                        </div>
                    </div>
                    </div>
                    <div className="flex -mx-3">
                    <div className="w-full px-3 mb-4">
                        <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Email</label>
                        <div className="flex">  
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <FaRegCircleUser />
                        </div>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                            placeholder="johnsmith@email.com" 
                        />
                        </div>
                    </div>
                    </div>
                    </div>
                    <div className='flex flex-col items-center'>
                    <div className="flex -mx-3">
                        <div className="w-full px-3 mb-4">
                                <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Link</label>
                                <div className="flex">  
                                <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                                    <FaLink />
                                </div>
                                <input 
                                    type="text" 
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                                    placeholder="Nome" 
                                />
                                </div>
                        </div>
                    </div>
                    <div className="flex -mx-3">
                    <div className="w-full px-3 mb-4">
                        <label className="text-xs font-semibold px-1 text-fluency-text-light dark:text-fluency-gray-300">Senha</label>
                        <div className="flex">
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <FaKey />
                        </div>
                        <input 
                            type="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800" 
                            placeholder="************" 
                        />
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-3 mb-4 mt-4 flex flex-row gap-2 justify-center">
                <FluencyButton
                    disabled={isLoading}
                    onClick={handleProfessorCreating}
                >
                    {isLoading ? 'Cadastrando...' : 'Criar Professor'}
                    <LuUserPlus2 className="w-6 h-auto" />
                </FluencyButton>
            </div>

          <Toaster />
        </>
    );
}