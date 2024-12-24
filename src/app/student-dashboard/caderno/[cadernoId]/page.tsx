'use client';
import React, { useEffect, useState } from 'react';
import { getDoc, collection, getDocs, doc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import FluencyInput from '@/app/ui/Components/Input/input';
import { BsFilePdfFill } from "react-icons/bs";
import { IoFilter } from 'react-icons/io5';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Notebook {
    studentName: string;
    id: string;
    title: string;
    description: string;
    createdAt: any;
    student: string;
    content: any;
}

interface Aluno {
    tasks: any;
    overdueClassesCount: number;
    doneClassesCount: number;
    Classes: any;
    id: string;
    name: string;
    email: string;
    number: string;
    userName: string;
    mensalidade: string;
    idioma: string[];
    teacherEmails: string[];
    professorId: string;
    diaAula?: string;
    profilePicUrl?: string;
    frequencia: number;
    classDatesWithStatus: { date: Date; status: string }[];
}

interface Slide {
    name: string;
    url: string;
}

export default function CadernoID() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const [studentData, setStudentData] = useState<Aluno | null>(null);
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const studentDoc = await getDoc(doc(db, `users/${id}`));
                if (studentDoc.exists()) {
                    const studentData = studentDoc.data() as Aluno;
                    setStudentData(studentData);
                }
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentData();
    }, [id]);

    // Notebooks Creation
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    useEffect(() => {
        const fetchNotebooks = async () => {
            try {
                const notebookRef = collection(db, `users/${id}/Notebooks`);
                const snapshot = await getDocs(notebookRef);
                const notebookList: Notebook[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const notebook: Notebook = {
                        id: doc.id,
                        title: data.title || '',
                        description: data.description || '',
                        createdAt: data.createdAt || '',
                        studentName: data.studentName || '',
                        student: data.student || '',
                        content: data.content || '',
                    };
                    notebookList.push(notebook);
                });
                setNotebooks(notebookList);
            } catch (error) {
                console.error('Error fetching notebooks:', error);
            }
        };

        fetchNotebooks();
    }, [id]);

    const [slides, setSlides] = useState<Slide[]>([]);
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const slidesRef = collection(db, `users/${id}/Slides`);
                const snapshot = await getDocs(slidesRef);
                const slidesList: Slide[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    slidesList.push({ name: data.name, url: data.url });
                });
                setSlides(slidesList);
            } catch (error) {
                console.error('Error fetching slides:', error);
            }
        };
        fetchSlides();
    }, [id]);

    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredNotebooks = notebooks.filter((notebook) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            notebook.title.toLowerCase().includes(searchLower) ||
            notebook.description.toLowerCase().includes(searchLower)
        );
    });

    const filteredSlides = slides.filter((slide) => {
        const searchLower = searchQuery.toLowerCase();
        return slide.name.toLowerCase().includes(searchLower);
    });

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as 'asc' | 'desc');
    };

    const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
        // Function to convert "dd/mm/yyyy" string to a Date object
        const parseDate = (dateString: string) => {
            const [day, month, year] = dateString.split('/').map(Number);
            // Note: Month is zero-indexed in JavaScript Date (0 = January, 11 = December)
            return new Date(year, month - 1, day);
        };
    
        const dateA = parseDate(a.title);  // Convert the title string of notebook a to a Date object
        const dateB = parseDate(b.title);  // Convert the title string of notebook b to a Date object
    
        if (sortOrder === 'asc') {
            return dateA.getTime() - dateB.getTime();  // Ascending order
        } else {
            return dateB.getTime() - dateA.getTime();  // Descending order
        }
    });
    

    const styles = {
        page: {
            marginLeft: '5rem',
            marginRight: '5rem',
            color: 'black',
            backgroundColor: 'white',
        },

        columnLayout: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '3rem 0 5rem 0',
            gap: '2rem',
        },

        column: {
            display: 'flex',
            flexDirection: 'column',
        },

        spacer2: {
            height: '2rem',
        },

        fullWidth: {
            width: '100%',
        },

        marginb0: {
            marginBottom: 0,
        },
    };

    const generatePDF = async (content: string, title: string) => {
        if (content === "") {
            toast.error('Documento vazio!', {
                position: "top-center",
            });
        } else {
            try {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = content;
                tempElement.style.width = '210mm';
                tempElement.style.padding = '10mm';
                document.body.appendChild(tempElement);

                const canvas = await html2canvas(tempElement, {
                    scale: 2,
                    useCORS: true,
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let position = 10;

                pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pdfHeight - 20);

                while (position + pdfHeight <= pdf.internal.pageSize.getHeight()) {
                    position += pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pdfHeight - 20);
                }

                pdf.save(`${title}.pdf`);
                document.body.removeChild(tempElement);
            } catch (error) {
                toast.error("Erro ao gerar PDF");
                console.error('Error generating PDF:', error);
            }
        }
    };

    return (
        <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 flex flex-col gap-4 pb-4 mt-3'>
            <div className='flex flex-col items-center w-full gap-2'>
                <h1 className='text-3xl font-bold'>Aulas</h1>
                <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-around gap-4 items-center w-full'>
                    <FluencyInput placeholder='Procure por uma aula específica...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex min-w-max">
                        <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center dark:text-fluency-gray-300">
                            <IoFilter />
                        </div>
                        <select
                            className="ease-in-out duration-300 w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                            onChange={handleSortChange}
                            value={sortOrder}
                        >
                            <option value="asc">Crescente</option>
                            <option value="desc">Decrescente</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className='gap-3 flex flex-col w-full'>
                <ul className='flex flex-col rounded-md w-full gap-2'>
                    {sortedNotebooks.map((notebook) => (
                        <li key={notebook.id} className='bg-fluency-blue-100 hover:bg-fluency-blue-200 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <Link key={notebook.id} href={{ pathname: `/student-dashboard/caderno/aula/${encodeURIComponent(notebook.studentName)}`, query: { notebook: notebook.id, student: notebook.student } }} passHref>
                                <div className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                                    <p className='text-md'>{notebook.title}</p>
                                    <p className='text-sm'>{notebook.description}</p>
                                </div>
                            </Link>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>
                                    <BsFilePdfFill
                                        className='w-auto h-5 text-fluency-gray-500 dark:text-fluency-gray-200 hover:text-fluency-orange-500 hover:dark:text-fluency-orange-500 duration-300 ease-in-out transition-all cursor-pointer'
                                        onClick={() => generatePDF(notebook.content, notebook.title)}
                                    />
                                </p>
                            </div>
                        </li>
                    ))}

                    {filteredSlides.map((slide) => (
                        <li key={slide.name} className='bg-fluency-blue-100 hover:bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <a href={slide.url} target="_blank" rel="noopener noreferrer" className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                                <Link key={slide.url} href={{ pathname: `/student-dashboard/caderno/slide/${encodeURIComponent(slide.name)}`, query: { slide: slide.url } }} passHref>
                                    <p className='text-md'>{slide.name}</p>
                                    <p className='text-sm'>Slide</p>
                                </Link>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <Toaster />

        </div>
    );
}
