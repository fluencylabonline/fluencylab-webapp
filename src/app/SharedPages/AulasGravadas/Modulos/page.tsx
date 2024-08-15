'use client';
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/app/firebase';

import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

import { useSession } from 'next-auth/react';
import toast, { Toaster } from "react-hot-toast";
import Link from 'next/link';
import Image from 'next/image';

interface Module {
    moduleName: string;
    description: string;
    imageUrl?: string;
    color: string;
    id: string;
}

export default function Modulos() {
    const [createModule, setCreateModule] = useState(false);
    const [moduleName, setModuleName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [color, setColor] = useState('blue');
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Extract language area name from URL
    const params = new URLSearchParams(window.location.search);
    const languageareaName = params.get('languageareaName');

    const { data: session } = useSession();

    // Memoized function to fetch modules from Firestore
    const fetchModules = useCallback(async () => {
        if (languageareaName) {
            setLoading(true);
            try {
                const moduleCollectionRef = collection(db, 'LanguageAreas', languageareaName, 'Modules');
                const querySnapshot = await getDocs(moduleCollectionRef);
                const fetchedModules: Module[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data() as Omit<Module, 'id'>
                }));
                setModules(fetchedModules);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching modules: ", error);
                toast.error('Error fetching modules.');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [languageareaName]);

    // Fetch modules when component mounts and languageareaName changes
    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    // Function to handle opening the create module modal
    const openCreateModule = () => {
        setCreateModule(true);
    };

    // Function to handle closing the create module modal
    const closeCreateModule = () => {
        setCreateModule(false);
        setModuleName('');
        setDescription('')
    };

    // Function to handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Function to handle form submission for creating new module
    const handleCreateModule = async () => {
        try {
            if (!languageareaName) {
                toast.error("Language area not specified.");
                return;
            }

            let imageUrl = '';
            if (image) {
                // Upload the image
                const imageRef = ref(storage, `modules/${languageareaName}/${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            const moduleRef = collection(db, 'LanguageAreas', languageareaName, 'Modules');
            const newModuleRef = doc(moduleRef); // Auto-generate ID
            await setDoc(newModuleRef, {
                moduleName,
                description,
                imageUrl,
                color
            });
            
            // After saving, clear form inputs and close modal
            setModuleName('');
            setDescription('');
            setImage(null);
            setColor('blue'); // Reset to default color
            closeCreateModule();
            toast.success('Module created!');

            // Refresh the modules list
            await fetchModules();
        } catch (error) {
            console.error('Error adding module: ', error);
            toast.error('Error creating module.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <Toaster />
            
            {session?.user.role === 'admin' && (
                <div>
                    <FluencyButton variant="confirm" onClick={openCreateModule}>Criar Módulo</FluencyButton>
                </div>
            )}

            {/* Display loading indicator while data is being fetched */}
            {loading ? (
                <div className="flex items-center justify-center min-h-screen absolute bottom-0">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="lg:flex lg:flex-row md:flex md:flex-grid sm:flex sm:flex-grid justify-center mt-6 gap-2 p-4">
                    {modules.map((module) => (
                        <div 
                            key={module.id} 
                            className={`group relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10 bg-fluency-${module.color}-500`}
                        >
                            <Link 
                                href={{
                                pathname: `${languageareaName}/${encodeURIComponent(module.moduleName)}`,
                                query: { moduleID: module.id, languageareaName: languageareaName }
                                }} passHref>
                                <div>
                                    <span className={`absolute top-10 z-10 h-20 w-20 rounded-full bg-fluency-${module.color}-500 transition-all duration-300 group-hover:scale-[10]`}></span>
                                    <div className="relative z-10 mx-auto max-w-md">
                                        <span className={`grid h-20 w-20 place-items-center rounded-full bg-fluency-${module.color}-500 transition-all duration-300 group-hover:bg-fluency-${module.color}-400`}>
                                            <svg viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                                                <path d="M136,48V176H88V80H40V48a7.99993,7.99993,0,0,1,8-8H80a7.99993,7.99993,0,0,1,8,8,7.99993,7.99993,0,0,1,8-8h32A7.99993,7.99993,0,0,1,136,48Zm89.8877,149.64526-8.28223-30.90966-46.36426,12.42334,8.28223,30.90966a7.99989,7.99989,0,0,0,9.79785,5.65674l30.90967-8.28222A7.9999,7.9999,0,0,0,225.8877,197.64526ZM184.47656,43.09717a7.99994,7.99994,0,0,0-9.79785-5.657L143.769,45.72241a8.00015,8.00015,0,0,0-5.65674,9.7981l8.28223,30.90954,46.36426-12.42334Z" opacity="0.2"/>
                                                <path d="M233.61523,195.5752,192.2041,41.02637a16.0157,16.0157,0,0,0-19.5957-11.31348l-30.91016,8.28223c-.33935.09094-.66357.20923-.99219.32043A15.96591,15.96591,0,0,0,128,32H96a15.8799,15.8799,0,0,0-8,2.16492A15.8799,15.8799,0,0,0,80,32H48A16.01833,16.01833,0,0,0,32,48V208a16.01833,16.01833,0,0,0,16,16H80a15.8799,15.8799,0,0,0,8-2.16492A15.8799,15.8799,0,0,0,96,224h32a16.01833,16.01833,0,0,0,16-16V108.40283l27.7959,103.73584a15.992,15.992,0,0,0,19.5957,11.31445l30.91016-8.28222A16.01822,16.01822,0,0,0,233.61523,195.5752ZM156.19238,92.08679l30.91211-8.28259,20.71045,77.27234-30.917,8.28454ZM176.749,45.167l6.21338,23.18238-30.91113,8.28247L145.83984,53.4502ZM128,48l.00732,120H96V48ZM80,48V72H48V48ZM48,208V88H80V208Zm80,0H96V184h32.0083l.00147,24Zm90.16016-8.28418-30.90967,8.28223-6.21143-23.18189,30.918-8.28491,6.21289,23.18164Z"/>
                                            </svg>
                                        </span>
                                        <div className="space-y-6 pt-5 text-base font-semibold leading-7 text-fluency-gray-100 transition-all duration-300 group-hover:text-white/90">
                                            <p className="break-words">{module.description}</p>
                                        </div>
                                        <div className="pt-5 text-base font-semibold leading-7">
                                            <p>
                                                <div className={`text-fluency-${module.color}-600 text-3xl font-bold transition-all duration-300 group-hover:text-white`}>
                                                    {module.moduleName}
                                                </div>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            {module.imageUrl && (
                                <Image 
                                    src={module.imageUrl}
                                    alt="Module Background" 
                                    layout="fill" 
                                    objectFit="cover" 
                                    quality={100} 
                                    className="z-0 blur-xs brightness-50"
                                    priority
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {createModule && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-[40vw] h-[80vh] p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeCreateModule} />

                                <h3 className="text-lg leading-6 font-medium p-2 mb-2">
                                    Insira as Informações do Módulo
                                </h3>

                                <div className="mt-2 flex flex-col items-start gap-3 p-4 w-full">
                                    <FluencyInput
                                        type="text"
                                        placeholder="Nome do Módulo"
                                        value={moduleName}
                                        onChange={(e) => setModuleName(e.target.value)}
                                    />
                                    <textarea
                                        placeholder="Descrição"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={130}
                                        rows={4}
                                        className="w-full outline-none bg-fluency-pages-light dark:bg-fluency-pages-dark border border-gray-300 rounded p-2"
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-100">
                                        {130 - description.length} caracteres restantes
                                    </div>

                                    <div className="flex flex-row gap-2">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="border border-gray-300 rounded-md p-2"
                                        />
                                        <select 
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-600 dark:text-gray-100 border border-gray-300 rounded p-2"
                                        >
                                            <option value="orange">Orange</option>
                                            <option value="red">Red</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="yellow">Yellow</option>
                                            <option value="gray">Gray</option>
                                        </select>
                                    </div>

                                </div>

                                <div className="mt-4 flex justify-center">
                                    <FluencyButton variant="confirm" onClick={handleCreateModule}>
                                        Criar
                                    </FluencyButton>
                                    <FluencyButton variant="danger" onClick={closeCreateModule}>
                                        Cancelar
                                    </FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
