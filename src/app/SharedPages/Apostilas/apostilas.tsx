'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { DocumentData, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, storage } from "@/app/firebase";
import { v4 as uuidv4 } from 'uuid';
//Pages
import FirstSteps from './firststeps';
import TheBasics from './thebasics';
import AllYouNeedToKnow from './allyouneedtoknow';

import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { TbBookDownload } from "react-icons/tb";
import { getDownloadURL, ref } from "firebase/storage";
import { useSession } from 'next-auth/react';

import './apostilas.css';
import { MdCardTravel } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import Traveling from "./traveling";
import Instrumental from "./instrumental";
import Kids from "./kids";
import { FaRegCopy } from "react-icons/fa6";
import Slides from "./slides";
import FirstSteps2 from "./English/firststeps2";

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

    const [firststeps2, setFirststeps2] = useState(false);

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
            const workbookCollections = ['First Steps', 'First Steps2', 'The Basics', 'All you need to know', 'Traveling', 'Instrumental'];

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
            const newNotebook: Notebook = {
                docID: uuidv4(),
                title: nomeLicao,
                workbook: workbook,
                content: '',
                unit: unit
            };
            await addDoc(collection(db, `Notebooks/${workbook}/Lessons`), newNotebook);
            setNotebooks([...notebooks, newNotebook]);
            closeModalLicao();
            toast.success('Lição criada com sucesso!', {
                position: "top-center",
            });
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
    }

    async function handleDownloadWorkbook(workbookName: string) {
        try {
            const workbookRef = ref(storage, `Workbooks/English/${workbookName}.pdf`);
            const downloadURL = await getDownloadURL(workbookRef);
            window.open(downloadURL, '_blank');
        } catch (error) {
            toast.error("Apostila indisponível")
            console.error('Error downloading workbook:', error);
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

    const copyLinkToClipboard = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
          toast.success('Link copiado!');
        }).catch((error) => {
          console.error('Failed to copy link: ', error);
        });
      };

      const getBackgroundColor = (workbook: string) => {
        switch (workbook.toLowerCase()) {
            case 'first steps':
                return 'bg-fluency-yellow-400'; // Tailwind yellow color
            case 'the basics':
                return 'bg-fluency-orange-400'; // Tailwind red color
            case 'traveling':
                return 'bg-emerald-400';
            case 'all you need to know':
                return 'bg-indigo-400';
            default:
                return 'bg-fluency-blue-300'; // Default color
        }
    };

 return (
    <div className="p-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
        <div className="flex flex-row gap-1 items-center py-2 w-full"> 
            <FluencyInput 
            className="w-fit" 
            placeholder="Procure por uma lição aqui" 
            value={searchTerm}
            onChange={handleSearchTermChange}/>
            {session?.user.role === 'admin' && <FluencyButton className="w-48"  onClick={openModalLicao}>Criar lição</FluencyButton>}
            {session?.user.role === 'admin' && <FluencyButton variant="warning" className="w-48" onClick={openModalSlide}>Criar Slide</FluencyButton>}

        </div>

        <div className="w-full lg:flex lg:flex-row lg:items-center lg:justify-around md:flex md:flex-row md:items-center md:justify-around flex flex-col items-center justify-around p-4 border border-fluency-blue-600 dark:border-fluency-blue-900 rounded-xl">
            <button onClick={() => {
                setFirststeps2(false);
                setFirststeps(true);
                setThebasics(false);
                setAllyouneedtoknow(false);
                setTraveling(false);
                setInstrumentalEnglish(false);
                setKids(false);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                First Steps <TbBookDownload onClick={() => handleDownloadWorkbook('01 - First Steps')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>
            
            <button onClick={() => {
                setFirststeps2(false);
                setFirststeps(false);
                setThebasics(true);
                setAllyouneedtoknow(false);
                setTraveling(false);
                setInstrumentalEnglish(false);
                setKids(false);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                The Basics <TbBookDownload onClick={() => handleDownloadWorkbook('02 - The Basics')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>
            
            <button onClick={() => {
                setFirststeps2(false);                
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(true);
                setTraveling(false);
                setInstrumentalEnglish(false);
                setKids(false);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                All you need to know <TbBookDownload onClick={() => handleDownloadWorkbook('All you need to know')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>

            <button onClick={() => {
                setFirststeps2(false);                
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(false);
                setTraveling(true);
                setInstrumentalEnglish(false);
                setKids(false);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                Traveling <TbBookDownload  onClick={() => handleDownloadWorkbook('Traveling')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>

            <button onClick={() => {
                setFirststeps2(false);                
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(false);
                setTraveling(false);
                setInstrumentalEnglish(true);
                setKids(false);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                Instrumental <TbBookDownload  onClick={() => handleDownloadWorkbook('Instrumental')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>

            <button onClick={() => {
                setFirststeps2(false);                
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(false);
                setTraveling(false);
                setInstrumentalEnglish(false);
                setKids(true);
                setSlidesClass(false);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                Kids <TbBookDownload  onClick={() => handleDownloadWorkbook('Kids')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>

            <button onClick={() => {
                setFirststeps2(false);                
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(false);
                setTraveling(false);
                setInstrumentalEnglish(false);
                setKids(false);
                setSlidesClass(true);
                setSearchTerm('');
            }} 
            className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                Slides <TbBookDownload  onClick={() => handleDownloadWorkbook('Slides')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>

            {session?.user.role === 'admin' && (
                <button onClick={() => {
                    setFirststeps2(true);                
                    setFirststeps(false);
                    setThebasics(false);
                    setAllyouneedtoknow(false);
                    setTraveling(false);
                    setInstrumentalEnglish(false);
                    setKids(false);
                    setSlidesClass(false);
                    setSearchTerm('');
                }} 
                className="flex flex-row gap-2 items-center text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-md py-2 px-3">
                    First Steps II <TbBookDownload  onClick={() => handleDownloadWorkbook('Slides')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
                </button>
            )}
        </div>
        

        {searchTerm.trim() === '' ? (
        <div>
            {firststeps && 
            <div className={firststeps ? 'fade-in w-full flex flex-col mt-4' : 'fade-out'}>
                <FirstSteps />
            </div>}

            {thebasics && 
            <div className={thebasics ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <TheBasics />
            </div>}

            {allyouneedtoknow && 
            <div className={allyouneedtoknow ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <AllYouNeedToKnow />
            </div>}

            {traveling && 
            <div className={traveling ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <Traveling />
            </div>}

            {instrumentalEnglish && 
            <div className={instrumentalEnglish ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <Instrumental />
            </div>}

            {kids && 
            <div className={kids ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <Kids />
            </div>}

            {slidesClass && 
            <div className={slidesClass ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <Slides />
            </div>}

            {firststeps2 && 
            <div className={firststeps2 ? 'fade-in w-full flex flex-col mt-4 justify-center' : 'fade-out'}>
                <FirstSteps2 />
            </div>}
        </div>
        ) : (
        <div>
            <div className="flex flex-row gap-2 items-center p-4">
                <div className="w-full mt-3">
                    {searchResults.length > 0 ? (
                        <div className="flex flex-wrap gap-3 w-full">
                            {searchResults.map((result) => (
                                <div key={result.title} 
                                id='apostilas-background' 
                                className="flex flex-col items-center justify-center text-center w-32 h-44 bg-fluency-bg-light dark:bg-fluency-bg-dark p-3 rounded-sm"
>
                                    {'workbook' in result ? (
                                        <Link 
                                            key={result.docID} 
                                            href={{ 
                                                pathname: `apostilas/${encodeURIComponent(result.title)}`, 
                                                query: { 
                                                    workbook: result.workbook, 
                                                    lesson: result.docID 
                                                } 
                                            }} 
                                            passHref
                                        >
                                            <div className="flex flex-col items-center">
                                                <h3 className="font-bold dark:text-fluency-gray-100 text-sm hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500 duration-300 ease-in-out cursor-pointer">{result.title}</h3>
                                                <p className={`text-xs dark:text-fluency-bg-dark font-bold ${getBackgroundColor(result.workbook)} rounded-md w-fit px-1`}>
                                                    {result.workbook}
                                                </p>
                                            </div>
                                        </Link>

                                    ) : (
                                        <Link
                                            href={{ 
                                                pathname: `apostilas/slides/${encodeURIComponent(result.title)}`, 
                                                query: { 
                                                    slide: result.link 
                                                } 
                                            }} 
                                            passHref
                                        >
                                            <div>
                                                <h3 className="font-bold dark:text-fluency-gray-100 text-sm hover:text-fluency-orange-500 dark:hover:text-fluency-orange-500 duration-300 ease-in-out cursor-pointer">{result.title}</h3>
                                                <button 
                                                    onClick={() => copyLinkToClipboard(result.link)} 
                                                    className="text-sm flex flex-row items-center gap-1 text-fluency-orange-500 hover:text-fluency-orange-700 dark:text-white hover:dark:text-fluency-orange-500 font-bold duration-300 ease-in-out transition-all"
                                                    >
                                                    Copiar Slide <FaRegCopy />
                                                </button>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center">Nenhum resultado encontrado</p>
                    )}
                </div>



                
            </div>
        </div>
        )}


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
