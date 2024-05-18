'use client';
import { useState } from "react";
import { FaKey, FaLink, FaRegCircleUser, FaUser } from "react-icons/fa6";
import { TbUserEdit } from "react-icons/tb";

import { toast, Toaster } from 'react-hot-toast';

export default function CreateProfessor(){
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [link, setLink] = useState('');

      
      
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

            <div className="w-full px-3 mb-4 mt-4">
                <button
                        className="block w-full max-w-xs mx-auto px-3 py-3 font-semibold rounded-lg border border-fluency-blue-500 hover:border-fluency-blue-600 bg-fluency-blue-500 text-fluency-text-dark hover:bg-fluency-blue-600 focus:bg-fluency-blue-700 transition-all ease-in-out duration-100  dark:bg-transparent dark:text-fluency-blue-500 dark:hover:text-white dark:hover:bg-fluency-blue-500 hover:dark:border-fluency-blue-500"
                        disabled={isLoading}
                >
                    {isLoading ? 'Cadastrando...' : 'Criar Usuário'}
                </button>
            </div>
            <Toaster />
        </>
    );
}