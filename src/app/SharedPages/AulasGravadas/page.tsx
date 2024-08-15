'use client';
import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db, storage } from '@/app/firebase'; // Import your Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import Image from 'next/image';

import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

import { useSession } from 'next-auth/react';
import toast, { Toaster } from "react-hot-toast";

export default function AulasGravadas() {
    const [createLanguageArea, setCreateLanguageArea] = useState(false);
    const [languageName, setLanguageName] = useState('');
    const [selectedColor, setSelectedColor] = useState('blue'); // Default color
    const [languageAreas, setLanguageAreas] = useState<{ name: string, moduleCount: number, color: string, imageUrl?: string }[]>([]);
    const [image, setImage] = useState<File | null>(null); // State for image file
    const { data: session } = useSession();

    useEffect(() => {
        // Fetching the available language areas from Firestore
        fetchLanguageAreas();
    }, []);

    // Function to fetch language areas and their module counts from Firestore
    const fetchLanguageAreas = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'LanguageAreas'));
            const areas: { name: string, moduleCount: number, color: string, imageUrl?: string }[] = [];

            for (const doc of querySnapshot.docs) {
                const languageName = doc.id;
                const modulesRef = collection(db, `LanguageAreas/${languageName}/Modules`);
                const modulesSnapshot = await getCountFromServer(modulesRef);
                // Assuming there's an 'imageUrl' and 'color' field for each language area in Firestore
                const languageDoc = doc.data();
                areas.push({ 
                    name: languageName, 
                    moduleCount: modulesSnapshot.data().count, 
                    color: languageDoc.color || 'blue', // Default color
                    imageUrl: languageDoc.imageUrl
                });
            }
            setLanguageAreas(areas);
        } catch (error) {
            console.error('Error fetching language areas: ', error);
        }
    };

    // Function to handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    // Function to handle form submission for creating a language area
    const handleCreateLanguageArea = async () => {
        try {
            const languageRef = doc(db, 'LanguageAreas', languageName);

            let imageUrl = '';
            if (image) {
                // Upload the image
                const imageRef = ref(storage, `languageAreas/${languageName}/${image.name}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            await setDoc(languageRef, { color: selectedColor, imageUrl });
            setLanguageName(''); // Clear the input field after creating a language area
            setSelectedColor('blue'); // Reset to default color
            setImage(null); // Clear the image state
            closeCreateLanguageArea();
            toast.success("Curso criado!");

            // Fetch the updated language areas list
            fetchLanguageAreas();
        } catch (error) {
            console.error('Error creating language area: ', error);
        }
    };

    // Function to handle opening and closing modals
    const openCreateLanguageArea = () => setCreateLanguageArea(true);
    const closeCreateLanguageArea = () => {
        setCreateLanguageArea(false); 
        setLanguageName('');
        setImage(null); // Clear the image when closing the modal
    }

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <Toaster />

            {session?.user.role === 'admin' && (
                <div>
                    <FluencyButton variant="confirm" onClick={openCreateLanguageArea}>Criar Curso</FluencyButton>
                </div>
            )}

            {createLanguageArea && (
                <div className="fixed z-50 inset-0 overflow-y-hidden p-4">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="z-50 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-min h-min p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeCreateLanguageArea} />

                                <h3 className="text-lg leading-6 font-medium p-2 mb-2">
                                    Criar curso
                                </h3>

                                <FluencyInput
                                    type="text"
                                    placeholder="Nome do curso"
                                    value={languageName}
                                    onChange={(e) => setLanguageName(e.target.value)}
                                />

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Escolha a Cor de Fundo:</label>
                                    <select
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="px-2 py-1 mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-fluency-pages-dark"
                                    >
                                        <option value="blue">Azul</option>
                                        <option value="green">Verde</option>
                                        <option value="red">Vermelho</option>
                                        <option value="yellow">Amarelo</option>
                                        <option value="orange">Laranja</option>
                                    </select>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white">Escolha uma Imagem de Fundo:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="px-2 py-1 mt-1 block w-full border border-gray-300 dark:border-gray-800 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-fluency-pages-dark"
                                    />
                                </div>

                                <div className="flex justify-center mt-4">
                                    <FluencyButton variant="confirm" onClick={handleCreateLanguageArea}>
                                        Criar
                                    </FluencyButton>
                                    <FluencyButton variant="danger" onClick={closeCreateLanguageArea}>
                                        Cancelar
                                    </FluencyButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        {/* Render the list of language areas */}
        <div>
            <h2 className="text-xl font-semibold">Cursos</h2>
                {languageAreas.length > 0 ? (
                    <div className="lg:flex lg:flex-row md:flex md:flex-grid sm:flex sm:flex-grid justify-center mt-6 gap-4 p-4">
                        {languageAreas.map((area) => (
                            <div 
                                key={area.name} 
                                className={`group min-w-72 min-h-96 relative cursor-pointer overflow-hidden px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm rounded-lg sm:px-10 bg-fluency-${area.color}-500`}
                            >
                                <Link href={{
                                        pathname: `aulas-gravadas/${encodeURIComponent(area.name)}`,
                                        query: { languageareaName: area.name }
                                    }}>
                                    <div>
                                        <div className="relative z-20 mx-auto max-w-md">
                                            <div className="pt-10 text-base font-semibold leading-7">
                                                <p>
                                                    <div className={`z-20 text-fluency-${area.color}-500 text-4xl font-bold transition-all duration-300 group-hover:text-white`}>
                                                        {area.name}
                                                    </div>
                                                </p>
                                            </div>
                                        </div>
                                            <p className="absolute bottom-14 font-bold z-50 text-lg text-transparent group-hover:text-white duration-300 ease-in-out transition-all">Módulos: {area.moduleCount}</p>
                                            <span className={`flex flex-col justify-center items-center absolute bottom-10 z-10 h-20 w-20 rounded-full bg-fluency-${area.color}-500 transition-all duration-300 group-hover:scale-[10]`}><p className="font-bold text-3xl text-white group-hover:text-transparent duration-200 ease-in-out transition-all">{area.moduleCount}</p></span>
                                    </div>
                                </Link>
                                {area.imageUrl && (
                                    <Image 
                                        src={area.imageUrl}
                                        alt="Background" 
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
                ) : (
                    <p className="mt-2 text-gray-600 dark:text-gray-100">Nenhum curso criado ainda.</p>
                )}
            </div>
        </div>
    );
}
