'use client';
import React from 'react';
import { useEffect, useState } from 'react';

import {   
    getDoc,
    collection,
    getDocs,
    doc,} from 'firebase/firestore';
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


export default function CadernoID(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const [studentData, setStudentData] = useState<Aluno | null>(null);
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Use the extracted ID to fetch student data
                const studentDoc = await getDoc(doc(db, `users/${id}`));
                if (studentDoc.exists()) {
                  const studentData = studentDoc.data() as Aluno;
                  setStudentData(studentData);
                } else {
              }
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentData();
    }, [id]);

    //Notebooks Creation
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


    const [searchQuery, setSearchQuery] = useState<string>('');
    const filteredNotebooks = notebooks.filter((notebook) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            notebook.title.toLowerCase().includes(searchLower) ||
            notebook.description.toLowerCase().includes(searchLower)
        );
    });

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as 'asc' | 'desc');
    };

    const sortedNotebooks = [...filteredNotebooks].sort((a, b) => {
        if (sortOrder === 'asc') {
            return notebooks.indexOf(a) - notebooks.indexOf(b);
        } else {
            return notebooks.indexOf(b) - notebooks.indexOf(a);
        }
    });

    
      const storage = getStorage();
      const [slides, setSlides] = useState<{ name: string; url: string; }[]>([]);
      useEffect(() => {
          const fetchSlides = async () => {
              try {
                  // Assuming `id` represents the student's ID
                  const materialsRef = ref(storage, `${id}/materiais/slides`);
                  const slideList = await listAll(materialsRef);
                  const slideUrls = await Promise.all(
                      slideList.items.map(async (item) => {
                          const downloadUrl = await getDownloadURL(item);
                          return { name: item.name, url: downloadUrl };
                      })
                  );
                  setSlides(slideUrls);
              } catch (error) {
                  console.error('Error fetching PowerPoint slides:', error);
              }
          };
  
          fetchSlides();
      }, [id, storage]);
  
      const generatePDF = async (content: string, title: string) => {
        // Create a temporary element to hold the HTML content
        const tempElement = document.createElement('div');
        tempElement.innerHTML = content;
        document.body.appendChild(tempElement);
    
        // Use html2canvas to convert the HTML content to a canvas
        const canvas = await html2canvas(tempElement);
        const imgData = canvas.toDataURL('image/png');
    
        // Create a jsPDF instance with A4 size
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
    
        // Define margins
        const marginLeft = 10;
        const marginTop = 10;
        const pdfWidth = 210 - 2 * marginLeft;
        const pdfHeight = 297 - 2 * marginTop;
    
        // Get the image properties
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
        // Add the image to the PDF with margins
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, imgWidth, imgHeight);
        pdf.save(`${title}.pdf`);
    
        // Remove the temporary element
        document.body.removeChild(tempElement);
    };
    

    return(
        <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 flex flex-col gap-4 pb-4 mt-3'>
            <div className='flex flex-col items-center w-full gap-2'>
                <h1 className='text-3xl font-bold'>Aulas</h1>
                <div className='lg:flex lg:flex-row md:flex md:flex-row flex flex-col justify-around gap-4 items-center w-full'>
                    <FluencyInput placeholder='Procure por uma aula específica...' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}/>
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
                    
                    {slides.map((slide) => (
                        <li key={slide.name} className='bg-fluency-blue-100 hover:bg-fluency-gray-100 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 duration-300 ease-in-out transition-all p-2 px-6 rounded-md flex flex-row items-center justify-between gap-4 w-full'>
                            <a href={slide.url} target="_blank" rel="noopener noreferrer" className='hover:text-fluency-blue-700 hover:font-bold duration-200 ease-out transition-all cursor-pointer'>
                            <Link key={slide.url} href={{ pathname: `/student-dashboard/caderno/${encodeURIComponent(slide.name)}`, query: { slide: slide.url } }} passHref>

                                <p className='text-md'>{slide.name}</p>
                                <p className='text-sm'>PowerPoint Slide</p>
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