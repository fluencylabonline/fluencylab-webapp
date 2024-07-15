'use client'
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import DocumentAnimation from '@/app/ui/Animations/DocumentAnimation';
import FluencyButton from '@/app/ui/Components/Button/button';

interface ClassData {
    className: string;
    classNumber: number;
    videoLink: string;
    pdfLink: string;
    videoID: string;
    pdfID: string;
    ankiLink: string;
    externalLinks: string;
}

export default function Aulas() {
    const [classData, setClassData] = useState<ClassData | null>(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        const fetchClassData = async () => {
            if (id) {
                try {
                    const classDocRef = doc(db, 'Modulos', 'Ingles', 'Modulo-1', id); // Adjust path based on your Firestore structure
                    const classDocSnapshot = await getDoc(classDocRef);

                    if (classDocSnapshot.exists()) {
                        setClassData(classDocSnapshot.data() as ClassData);
                    } else {
                        console.log('Class not found');
                    }
                } catch (error) {
                    console.error('Error fetching class data:', error);
                } finally {
                    setLoading(false); // Update loading state after fetching
                }
            }
        };

        fetchClassData();
    }, []);

    if (!classData && loading) {
        return <DocumentAnimation />; // Display loading indicator while fetching data
    }

    if (!classData) {
        return <div>No class data found.</div>; // Handle case where class data is not found
    }

    return (
        <div className='flex flex-col gap-3 items-center w-full h-full p-4'>

                <div className='flex flex-row items-center justify-start gap-2 w-full p-4'>
                    <iframe 
                        src={`https://drive.google.com/file/d/${classData.videoID}/preview`} 
                        width="640" height="480" allow="autoplay">
                    </iframe>

                    <iframe 
                        src={`https://drive.google.com/file/d/${classData.pdfID}/preview`} 
                        width="640" height="480" allow="autoplay">
                    </iframe>
                </div>

                <div className='flex flex-row gap-2 items-center justify-center'>
                    <FluencyButton variant='gray'>
                        <a href={classData.ankiLink} target="_blank" rel="noopener noreferrer">Baixar deck de Flashcards</a>
                    </FluencyButton>
                    <FluencyButton variant='warning'>
                        <a href={classData.pdfLink} target="_blank" rel="noopener noreferrer">Baixar PDF da aula</a>
                    </FluencyButton>
                </div>

                <div className='flex flex-col items-center justify-center gap-2 mt-2'>
                    <a className='bg-fluency-blue-200 dark:bg-fluency-blue-1000 hover:bg-fluency-blue-300 hover:dark:bg-fluency-blue-1100 duration-300 ease-in-out transition-all cursor-pointer p-4 rounded-md font-bold' href={classData.externalLinks} target="_blank" rel="noopener noreferrer">Material Extra</a>
                </div>

        </div>
    );
}
