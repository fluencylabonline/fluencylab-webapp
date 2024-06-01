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

interface Notebook {
    title: string;
    workbook: string;
    content: string;
    unit: number;
    docID: string;
}

export default function ApostilasCreation() {
    const [criarLicao, setCriarLicao] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [nomeLicao, setNomeLicao] = useState('');
    const [workbook, setWorkbook] = useState('');
    const [unit, setUnit] = useState<number>(0);
    
    const [firststeps, setFirststeps] = useState(true);
    const [thebasics, setThebasics] = useState(false);
    const [allyouneedtoknow, setAllyouneedtoknow] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Notebook[]>([]);

    const [filteredNotebooks, setFilteredNotebooks] = useState<Notebook[]>([]);

    function openModalLicao() {
        setCriarLicao(true);
    }
    
    function closeModalLicao() {
        setCriarLicao(false);
    }

    useEffect(() => {
        const fetchNotebooks = async () => {
            const notebooksData: Notebook[] = [];
            const workbookCollections = ['First Steps', 'The Basics', 'All you need to know'];

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

        fetchNotebooks();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filtered = notebooks.filter(notebook =>
            notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
    }, [searchTerm, notebooks]);

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
            const workbookRef = ref(storage, `workbooks/${workbookName}.pdf`);
            const downloadURL = await getDownloadURL(workbookRef);
            window.open(downloadURL, '_blank');
        } catch (error) {
            toast.error("Apostila indisponível")
            console.error('Error downloading workbook:', error);
        }
    }

 return (
    <div className="p-4 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
        <div className="flex flex-row gap-1 items-center p-4"> 
            <FluencyInput 
            className="w-full" 
            placeholder="Procure por uma lição aqui" 
            value={searchTerm}
            onChange={handleSearchTermChange}/>
            <FluencyButton className="w-full" onClick={openModalLicao}>Criar uma lição</FluencyButton>
        </div>

        <div className="lg:flex lg:flex-row lg:items-center lg:justify-center md:flex md:flex-row md:items-center md:justify-center flex flex-col items-center justify-center p-1 border border-fluency-blue-600 dark:border-fluency-blue-900 rounded-xl">
            <button onClick={() => {
                setFirststeps(true);
                setThebasics(false);
                setAllyouneedtoknow(false);
            }} 
            className="flex flex-row gap-2 items-center px-4 py-2 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:px-12">
                First Steps <TbBookDownload onClick={() => handleDownloadWorkbook('First Steps')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>
            
            <button onClick={() => {
                setFirststeps(false);
                setThebasics(true);
                setAllyouneedtoknow(false);
            }} 
            className="flex flex-row gap-2 items-center px-4 py-2 mx-4 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:mx-8 md:px-12">
                The Basics <TbBookDownload onClick={() => handleDownloadWorkbook('The Basics')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>
            
            <button onClick={() => {
                setFirststeps(false);
                setThebasics(false);
                setAllyouneedtoknow(true);
            }} 
            className="flex flex-row gap-2 items-center px-4 py-2 text-sm font-bold text-fluency-blue-600 capitalize transition-colors duration-300 md:py-3 dark:text-fluency-blue-400 dark:hover:text-fluency-text-dark focus:outline-none hover:bg-fluency-blue-600 hover:text-fluency-text-dark focus:bg-fluency-blue-700 focus:text-fluency-text-dark rounded-xl md:px-12">
                All you need to know <TbBookDownload onClick={() => handleDownloadWorkbook('All you need to know')} className="hover:text-fluency-yellow-500 duration-300 ease-in-out transition-all w-6 h-auto" />
            </button>
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
        </div>
        ) : (
        <div>
            <div className="flex flex-row gap-2 items-center p-4">
                {searchResults.map(notebook => (
                <div key={notebook.docID} className="flex flex-col items-center justify-center text-center w-28 h-40 bg-fluency-bg-light dark:bg-fluency-bg-dark p-4 rounded-sm">
                <Link key={notebook.docID} href={{ pathname: `apostilas/${encodeURIComponent(notebook.title)}`, query: { workbook: notebook.workbook, lesson: notebook.docID }}} ><p className="font-bold hover:text-fluency-blue-500 duration-300 ease-in-out cursor-pointer">{notebook.title}</p></Link>
                </div>
                ))}
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
                                    <option value="The Basics">The Basics</option>
                                    <option value="All you need to know">All you need to know</option>
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
       <Toaster />
  </div>
);
}
