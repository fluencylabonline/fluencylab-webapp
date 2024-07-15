'use client'
import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/app/firebase';

import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ClassData {
    className: string;
    classNumber: number;
    videoLink: string;
    pdfLink: string;
    videoID: string;
    pdfID: string;
    ankiLink: string;
    externalLinks: string;
    id: string;
}

export default function ModuloUm() {
    const [createClass, setCreateClass] = useState(false);
    const [className, setClassName] = useState('');
    const [classNumber, setClassNumber] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [pdfLink, setPdfLink] = useState('');
    const [videoID, setVideoID] = useState('');
    const [pdfID, setPdfID] = useState('');
    const [ankiLink, setAnkiLink] = useState('');
    const [externalLinks, setExternalLinks] = useState('');
    const [classes, setClasses] = useState<ClassData[]>([]); // Explicitly declare the type

    const { data: session } = useSession();

    useEffect(() => {
        fetchClasses(); // Fetch classes on component mount
    }, []);

    // Function to handle opening the create class modal
    const openCreateClass = () => {
        setCreateClass(true);
    };

    // Function to handle closing the create class modal
    const closeCreateClass = () => {
        setCreateClass(false);
    };

    // Function to handle form submission
    const handleSubmit = async () => {
        try {
            const moduleRef = doc(db, 'Modulos', 'Ingles');
            const newClassRef = doc(collection(moduleRef, 'Modulo-1')); // Replace with actual dynamic ID generation
            await setDoc(newClassRef, {
                className,
                classNumber,
                videoLink,
                pdfLink,
                videoID,
                pdfID,
                ankiLink,
                externalLinks
            });
            // After saving, clear form inputs and close modal
            setClassName('');
            setClassNumber('');
            setVideoLink('');
            setPdfLink('');
            setVideoID('');
            setPdfID('');
            setAnkiLink('');
            setExternalLinks('');
            closeCreateClass();
            // Fetch updated class list
            fetchClasses();
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    // Inside your fetchClasses function or where you populate classes array
    const fetchClasses = async () => {
        try {
            const moduleRef = collection(db, 'Modulos', 'Ingles', 'Modulo-1');
            const snapshot = await getDocs(moduleRef);
            const classesData = snapshot.docs.map(doc => ({
                id: doc.id, // Use Firebase document ID as id
                ...doc.data()
            })) as ClassData[];
            classesData.sort((a, b) => a.classNumber - b.classNumber);
            setClasses(classesData);
        } catch (error) {
            console.error('Error fetching classes: ', error);
        }
    };

    return (
        <div className="flex items-center justify-center p-6">

            {session?.user.role === 'teacher' && 
            <div>
                <FluencyButton onClick={openCreateClass}>Adicionar Aula</FluencyButton>
            </div>}

            <div className="flex flex-row flex-wrap items-center justify-center w-full gap-2">
                {classes.map((classData, index) => (
                    <Link key={index} href={{ pathname: `modulo-1/${encodeURIComponent(classData.className)}`, query: { id: classData.id } }} passHref
                    >
                        <div className="flex flex-col items-center justify-center font-bold h-52 w-60 text-center p-4 py-5 text-lg rounded-md bg-fluency-blue-200 dark:bg-fluency-blue-1000 hover:bg-fluency-blue-300 hover:dark:bg-fluency-blue-1100 text-fluency-text-light dark:text-fluency-text-dark duration-300 ease-in-out transition-all cursor-pointer">
                            <p>Aula - {classData.classNumber}</p>
                            <p>{classData.className}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {createClass &&
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-max h-full p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeCreateClass} />

                                <h3 className="text-lg leading-6 font-medium p-2 mb-2">
                                    Insira as Informações da aula
                                </h3>

                                <div className="mt-2 flex flex-col items-center gap-3 p-4">
                                    <FluencyInput
                                        variant='solid'
                                        placeholder="Nome da Aula"
                                        value={className}
                                        onChange={(e) => setClassName(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="Número"
                                        value={classNumber}
                                        onChange={(e) => setClassNumber(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="Video Link"
                                        value={videoLink}
                                        onChange={(e) => setVideoLink(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="Video ID"
                                        value={videoID}
                                        onChange={(e) => setVideoID(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="PDF Link"
                                        value={pdfLink}
                                        onChange={(e) => setPdfLink(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="PDF ID"
                                        value={pdfID}
                                        onChange={(e) => setPdfID(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="Anki Link"
                                        value={ankiLink}
                                        onChange={(e) => setAnkiLink(e.target.value)}
                                        required
                                    />

                                    <FluencyInput
                                        variant='solid'
                                        placeholder="External Links"
                                        value={externalLinks}
                                        onChange={(e) => setExternalLinks(e.target.value)}
                                        required
                                    />

                                    <div className="flex justify-center">
                                        <FluencyButton variant='confirm' onClick={handleSubmit}>Criar</FluencyButton>
                                        <FluencyButton variant='gray' onClick={closeCreateClass}>Cancelar</FluencyButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    )
}
