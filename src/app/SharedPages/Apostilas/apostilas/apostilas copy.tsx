'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { DocumentData, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { v4 as uuidv4 } from 'uuid';

import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { TbBookDownload } from "react-icons/tb";
import { getDownloadURL, ref } from "firebase/storage";
import { useSession } from 'next-auth/react';

import { MdCardTravel } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import {Tabs, Tab} from "@nextui-org/tabs";


interface Notebook {
    title: string;
    workbook: string;
    content: string;
    unit: number;
    docID: string;
}

interface Slide {
    title: string;
    link: string;
}

export default function ApostilasCreation() {
    const { data: session } = useSession();

    const [criarLicao, setCriarLicao] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [nomeLicao, setNomeLicao] = useState('');
    const [workbook, setWorkbook] = useState('');
    const [unit, setUnit] = useState<number>(0);
    const [selectedLanguage, setSelectedLanguage] = useState('');

    const [firststeps, setFirststeps] = useState(true);
    const [thebasics, setThebasics] = useState(false);
    const [allyouneedtoknow, setAllyouneedtoknow] = useState(false);
    const [traveling, setTraveling] = useState(false);
    const [instrumentalEnglish, setInstrumentalEnglish] = useState(false);
    const [kids, setKids] = useState(false);
    const [slidesClass, setSlidesClass] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<(Notebook | Slide)[]>([]);

    const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);
    const [filteredSlides, setFilteredSlides] = useState<Slide[]>([]);

    const [criarSlide, setCriarSlide] = useState(false);
    const [slideTitle, setSlideTitle] = useState('');
    const [slideLink, setSlideLink] = useState('');
    const [isForKids, setIsForKids] = useState(false);

    function openModalSlide() {
        setCriarSlide(true);
    }
    
    function closeModalSlide() {
        setCriarSlide(false);
    }

    function openModalLicao() {
        setCriarLicao(true);
    }
    
    function closeModalLicao() {
        setCriarLicao(false);
    }

    useEffect(() => {
        const fetchNotebooks = async () => {
            const notebooksData: Notebook[] = [];
            const workbookCollections = ['First Steps', 'The Basics', 'All you need to know', 'Traveling', 'Instrumental'];

            for (const wb of workbookCollections) {
                const q = query(
                    collection(db, `Notebooks/${wb}/Lessons`),
                );
                const querySnapshot = await getDocs(q);
                const notebooksFromWb = querySnapshot.docs.map(doc => ({ ...doc.data(), docID: doc.id }) as Notebook);
                notebooksData.push(...notebooksFromWb);
            }

            setNotebooks(notebooksData);
        };

        const fetchSlides = async () => {
            try {
                const slidesRef = collection(db, 'Slides');
                const slidesKidsRef = collection(db, 'SlidesKids');
        
                // Fetch slides from both collections
                const slidesSnapshot = await getDocs(slidesRef);
                const slidesKidsSnapshot = await getDocs(slidesKidsRef);
        
                // Map documents to Slide objects
                const slidesData = slidesSnapshot.docs.map(doc => ({ ...doc.data() }) as Slide);
                const slidesKidsData = slidesKidsSnapshot.docs.map(doc => ({ ...doc.data() }) as Slide);
        
                // Combine both arrays
                const combinedSlides = [...slidesData, ...slidesKidsData];
        
                // Set the state with the combined data
                setSlides(combinedSlides);
            } catch (error) {
                console.error('Error fetching slides:', error);
            }
        };
        

        fetchNotebooks();
        fetchSlides();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filteredNotebooks = notebooks.filter(notebook =>
            notebook.title && notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const filteredSlides = slides.filter(slide =>
            slide.title && slide.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredNotebooks(filteredNotebooks);
        setFilteredSlides(filteredSlides);

        setSearchResults([...filteredNotebooks, ...filteredSlides]);
    }, [searchTerm, notebooks, slides]);

    function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
    }

    async function createNotebook() {
        try {
            if (!nomeLicao || !workbook || unit === 0) {
                toast.error("Preencha todos os campos obrigatórios!");
                return;
            }
    
            const newNotebook: Notebook = {
                docID: uuidv4(),
                title: nomeLicao,
                workbook: workbook,
                content: '',
                unit: unit,
            };
    
            // Firestore Path:
            // Apostilas (collection) -> English (subcollection) -> Workbooks (collection)
            // -> {workbook} (document) -> Lessons (subcollection)
            const lessonsCollectionRef = collection(
                db,
                `Apostilas/English/Workbooks/${workbook}/Lessons`
            );
    
            // Add the new lesson into the Lessons subcollection
            await addDoc(lessonsCollectionRef, newNotebook);
    
            // Update local state with the new lesson
            setNotebooks([...notebooks, newNotebook]);
            closeModalLicao();
    
            toast.success('Lição criada com sucesso!', { position: "top-center" });
        } catch (error) {
            console.error('Error creating notebook:', error);
            toast.error('Erro ao criar lição.');
        }
    }
    

    async function createSlide() {
        try {
            const newSlide = {
                title: slideTitle,
                link: slideLink
            };
            const collectionName = isForKids ? 'SlidesKids' : 'Slides'; // Determine the collection
            await addDoc(collection(db, collectionName), newSlide);
            setSlideTitle('');
            setSlideLink('');
            setIsForKids(false); // Reset the isForKids state
            closeModalSlide();
            toast.success('Slide criado com sucesso!', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error creating slide:', error);
        }
    }

 return (
    <div className="p-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
    <div className="flex flex-row gap-1 items-center py-2 w-full"> 
        <FluencyInput 
        className="w-fit" 
        placeholder="Procure por uma lição aqui" 
        value={searchTerm}
        onChange={handleSearchTermChange}/>
        <select className="ease-in-out duration-300 pl-3 py-2 rounded-lg border-2 font-medium border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800">
            <option>Inglês</option>
            <option>Espanhol</option>
        </select>
        {session?.user.role === 'admin' && <FluencyButton className="w-48"  onClick={openModalLicao}>Criar lição</FluencyButton>}
        {session?.user.role === 'admin' && <FluencyButton variant="warning" className="w-48" onClick={openModalSlide}>Criar Slide</FluencyButton>}

    </div>

    {/*The tabs here should have the Workbooks as titles depending on the selected language */}
    <Tabs aria-label="Options" radius="lg" color="primary" 
        classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-fluency-blue-500 rounded-t-lg",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-white px-4 font-bold"
        }}>
            <Tab key="First" title="First Steps"></Tab>
            <Tab key="Second" title="The Basics"></Tab>
            <Tab key="Third" title="All you need"></Tab>
            <Tab key="Fourth" title="Travelling"></Tab>
    </Tabs>

    {criarLicao && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center justify-center">
                            
                            <FluencyCloseButton onClick={closeModalLicao}/>
                            
                              <h3 className="text-lg leading-6 font-medium  mb-2">
                                 Criar uma lição                      
                              </h3>

                              <div className="mt-2 flex flex-col items-center gap-3 p-4">
                                <select 
                                    onChange={(e) => setSelectedLanguage(e.target.value)} 
                                    value={selectedLanguage} 
                                    className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                    >   
                                    <option value="">Selecione um idioma</option>
                                    <option value="English">Inglês</option>
                                    <option value="Spanish">Espanhol</option>
                                    <option value="Portuguese">Português</option>
                                </select>


                              <FluencyInput 
                                    placeholder="Nome da Lição" 
                                    onChange={(e) => setNomeLicao(e.target.value)}
                                    value={nomeLicao}
                                />
                                <select onChange={(e) => setWorkbook(e.target.value)} value={workbook} className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
>
                                    <option value="">Selecione uma categoria</option>
                                    <option value="First Steps">First Steps</option>
                                    <option value="First Steps2">First Steps - Updated</option>
                                    <option value="The Basics">The Basics</option>
                                    <option value="Traveling">Traveling</option>
                                    <option value="Instrumental">Instrumental</option>
                                    <option value="Kids">Kids</option>
                                </select>

                                <select onChange={(e) => setUnit(parseInt(e.target.value, 10))} value={unit} className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800">
                                    <option value="">Selecione uma unidade</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                </select>
                                <div className="flex justify-center">
                                  <FluencyButton variant='confirm' onClick={createNotebook}>Criar</FluencyButton>
                                  <FluencyButton variant='gray' onClick={closeModalLicao}>Cancelar</FluencyButton>
                                </div>
                              </div>
                        </div>
                    </div>
                </div>
            </div>}

            {criarSlide  && 
            <div className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen">
                    
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                        <div className="flex flex-col items-center justify-center">
                            
                            <FluencyCloseButton onClick={closeModalSlide}/>
                            
                              <h3 className="text-lg leading-6 font-medium  mb-2">
                                  Criar Slide                     
                              </h3>
                              <div className="mt-2 flex flex-col items-center gap-3 p-4">

                                <FluencyInput 
                                type="text" 
                                placeholder="Título do Slide" 
                                value={slideTitle} 
                                onChange={(e) => setSlideTitle(e.target.value)} 
                                required/>

                                <FluencyInput 
                                type="text" 
                                placeholder="Link do Slide" 
                                value={slideLink} 
                                onChange={(e) => setSlideLink(e.target.value)} 
                                required/>

                                <div className="flex items-center mb-4">
                                    <input 
                                        type="checkbox" 
                                        checked={isForKids}
                                        onChange={(e) => setIsForKids(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label className="text-fluency-orange-500 font-bold">Lição Kids</label>
                                </div>

                                <div className="flex justify-center">
                                  <FluencyButton variant='confirm' onClick={createSlide}>Salvar</FluencyButton>
                                  <FluencyButton variant='gray' onClick={closeModalSlide}>Cancelar</FluencyButton>
                                </div>
                              </div>
                        </div>
                    </div>
                </div>
            </div>}


       <Toaster />
  </div>
);
}
