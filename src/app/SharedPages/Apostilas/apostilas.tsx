'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { addDoc, collection, getDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { v4 as uuidv4 } from 'uuid';
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";
import { toast, Toaster } from "react-hot-toast";
import { useSession } from 'next-auth/react';
import { Tabs, Tab } from '@nextui-org/react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import Link from 'next/link';

interface Notebook {
    title: string;
    workbook: string;
    content: string;
    unit: number;
    language: string;
    docID: string;
    link?: string;
}

interface OrganizedNotebooks {
    [language: string]: {
        [workbook: string]: Notebook[];
    };
}

export default function ApostilasCreation() {
    const { data: session } = useSession();

    // Slide state variables
    const [slideTitle, setSlideTitle] = useState('');
    const [slideLink, setSlideLink] = useState('');
    const [isForKids, setIsForKids] = useState(false);

    const [criarLicao, setCriarLicao] = useState(false);
    const [organizedNotebooks, setOrganizedNotebooks] = useState<OrganizedNotebooks>({});
    const [nomeLicao, setNomeLicao] = useState('');
    const [workbook, setWorkbook] = useState('');
    const [unit, setUnit] = useState<number>(0);
    const [language, setLanguage] = useState(''); // For creating lesson/slide
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    // Instead of a hard-coded array, we now store the workbooks in state.
    const [workbookCollectionsState, setWorkbookCollectionsState] = useState<string[]>([]);

    // 1. Fetch (or initialize) workbookCollections from Firestore
    useEffect(() => {
        async function fetchWorkbookCollections() {
            try {
                const wbDocRef = doc(db, "Apostilas", "workbookCollections");
                const wbDocSnap = await getDoc(wbDocRef);
                if (wbDocSnap.exists()) {
                    const data = wbDocSnap.data();
                    const names = data.names || [];
                    setWorkbookCollectionsState(names);
                }
            } catch (error) {
                console.error("Error fetching workbook collections:", error);
            }
        }
        fetchWorkbookCollections();
    }, []);

    // 2. "Create Workbook" button function
    async function createWorkbook() {
        const newWorkbook = prompt("Digite o nome do novo livro:");
        if (!newWorkbook) return;
        try {
            const wbDocRef = doc(db, "Apostilas", "workbookCollections");
            const wbDocSnap = await getDoc(wbDocRef);
            let updatedWorkbooks: string[];
            if (wbDocSnap.exists()) {
                const data = wbDocSnap.data();
                updatedWorkbooks = data.names || [];
                if (!updatedWorkbooks.includes(newWorkbook)) {
                    updatedWorkbooks.push(newWorkbook);
                } else {
                    toast.error("Livro já existe!");
                    return;
                }
            } else {
                updatedWorkbooks = [newWorkbook];
            }
            // Update Firestore and local state
            await setDoc(wbDocRef, { names: updatedWorkbooks });
            setWorkbookCollectionsState(updatedWorkbooks);
            toast.success("Livro criado com sucesso!");
        } catch (error) {
            console.error("Error creating workbook:", error);
            toast.error("Erro ao criar o livro.");
        }
    }

    // 3. Fetch lessons from each workbook in real time using onSnapshot
    useEffect(() => {
        if (workbookCollectionsState.length > 0) {
            const unsubscribes: (() => void)[] = [];
            // Use a Map to hold lessons for each workbook
            const notebooksMap = new Map<string, Notebook[]>();

            workbookCollectionsState.forEach(workbookName => {
                // Skip reserved names if needed
                if (workbookName === "workbookCollections") return;
                const lessonsColRef = collection(db, `Apostilas/${workbookName}/Lessons`);
                const unsubscribe = onSnapshot(lessonsColRef, (snapshot) => {
                    const notebooks: Notebook[] = [];
                    snapshot.forEach((docSnap) => {
                        const data = docSnap.data() as Notebook;
                        notebooks.push({
                            ...data,
                            workbook: workbookName,
                            docID: docSnap.id,
                        });
                    });
                    notebooksMap.set(workbookName, notebooks);

                    // Combine notebooks from all workbooks
                    const combinedNotebooks: Notebook[] = [];
                    notebooksMap.forEach((notes) => {
                        combinedNotebooks.push(...notes);
                    });

                    // Organize notebooks by language and workbook
                    const organized: OrganizedNotebooks = {};
                    combinedNotebooks.forEach((notebook) => {
                        if (!organized[notebook.language]) {
                            organized[notebook.language] = {};
                        }
                        if (!organized[notebook.language][notebook.workbook]) {
                            organized[notebook.language][notebook.workbook] = [];
                        }
                        organized[notebook.language][notebook.workbook].push(notebook);
                    });

                    // Sort lessons by title (numeric order)
                    for (const lang in organized) {
                        for (const wb in organized[lang]) {
                            organized[lang][wb].sort((a, b) =>
                                a.title.localeCompare(b.title, undefined, { numeric: true })
                            );
                        }
                    }

                    setOrganizedNotebooks(organized);
                });
                unsubscribes.push(unsubscribe);
            });

            // Cleanup subscriptions on unmount or when workbookCollectionsState changes
            return () => {
                unsubscribes.forEach(unsub => unsub());
            };
        }
    }, [workbookCollectionsState]);

    function openModalLicao() {
        setCriarLicao(true);
    }

    function closeModalLicao() {
        setCriarLicao(false);
    }

    function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
    }

    // Filter function to handle search
    const filteredNotebooks = Object.keys(organizedNotebooks[selectedLanguage] || {}).reduce(
        (result: { [workbook: string]: Notebook[] }, wb) => {
            const filteredLessons = organizedNotebooks[selectedLanguage][wb].filter((lesson) =>
                lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lesson.workbook.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredLessons.length > 0) {
                result[wb] = filteredLessons;
            }
            return result;
        },
        {} as { [workbook: string]: Notebook[] }
    );

    async function createNotebook() {
        try {
            const newNotebook: Notebook = {
                docID: uuidv4(),
                title: nomeLicao,
                workbook: workbook,
                content: '',
                unit: unit,
                language: selectedLanguage,
            };

            await addDoc(collection(db, `Apostilas/${workbook}/Lessons`), newNotebook);

            closeModalLicao();
            toast.success('Lição criada com sucesso!', { position: "top-center" });
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
    }

    function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedLanguage(event.target.value);
    }

    async function createSlide() {
        try {
            const newSlide = {
                title: slideTitle,
                link: slideLink,
                workbook: workbook, // Include workbook
                language: language, // Include language
                isForKids: isForKids,
            };

            // Add the slide to Firestore at: Apostilas > Slides > Lessons
            await addDoc(collection(db, 'Apostilas', 'Slides', 'Lessons'), newSlide);

            // Reset form fields
            setSlideTitle('');
            setSlideLink('');
            setIsForKids(false);
            setWorkbook('');
            setLanguage('');
            toast.success('Slide criado com sucesso!', { position: "top-center" });
        } catch (error) {
            console.error('Error creating slide:', error);
        }
    }

    return (
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md px-2 pt-2">
            <div className="flex flex-row gap-2 items-center w-full mb-2">
                <FluencyInput
                    className="w-fit"
                    placeholder="Procure por uma lição aqui"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                />
                {session?.user.role === 'admin' && (
                    <>
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className="ease-in-out duration-300 px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                        >
                            <option value="English">English</option>
                            <option value="Español">Español</option>
                        </select>
                        <FluencyButton className="w-48" onClick={openModalLicao}>
                            Criar lição
                        </FluencyButton>
                        {/* "Create Workbook" button */}
                        <FluencyButton className="w-48" onClick={createWorkbook}>
                            Criar livro
                        </FluencyButton>
                    </>
                )}
            </div>

            {/* Display search results as a list */}
            {searchTerm && (
                <div className="my-4">
                    <h3 className="text-xl font-semibold mb-3">Resultados:</h3>
                    <ul className="flex flex-col gap-1 font-semibold">
                        {Object.entries(filteredNotebooks).map(([wb, lessons]) =>
                            lessons.map((lesson) => (
                                <li
                                    key={lesson.docID || lesson.title}
                                    className="bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 transition-all duration-300 ease-in-out p-2 rounded-md"
                                >
                                    <Link
                                        href={
                                            lesson.workbook === 'Slides'
                                                ? { pathname: `apostilas/slides/${encodeURIComponent(lesson.title)}`, query: { slide: lesson.link } }
                                                : { pathname: `apostilas/${encodeURIComponent(lesson.title)}`, query: { workbook: lesson.workbook, lesson: lesson.docID } }
                                        }
                                        passHref
                                    >
                                        {lesson.title} - Unidade {lesson.unit} - {lesson.workbook} - {lesson.language}
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {!searchTerm && Object.keys(filteredNotebooks).length > 0 && (
                <Tabs aria-label="Workbooks" radius="lg" color="primary" classNames={{
                    tabList: "gap-4 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-fluency-gray-500 rounded-t-lg",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-white px-4 font-bold hover:text-fluency-blue-500"
                }}>
                    {Object.entries(filteredNotebooks).map(([wb, lessons]) => (
                        <Tab key={wb} title={wb}>
                            <Accordion>
                                {Array.from(new Set(lessons.map((lesson) => lesson.unit)))
                                    .sort((a, b) => a - b)
                                    .map((unit) => (
                                        <AccordionItem key={unit} title={`Unidade ${unit !== undefined ? unit : '1'}`}>
                                            <ul className="flex flex-col gap-1 font-semibold ml-2">
                                                {lessons.filter(lesson => lesson.unit === unit || (unit === undefined && lesson.unit === undefined))
                                                    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }))
                                                    .map((lesson) => (
                                                        <li
                                                            key={lesson.docID || lesson.link}
                                                            className="pl-4 bg-fluency-blue-100 dark:bg-fluency-gray-700 hover:bg-fluency-blue-200 hover:dark:bg-fluency-gray-800 transition-all duration-300 ease-in-out p-2 rounded-md"
                                                        >
                                                            <Link
                                                                href={
                                                                    lesson.workbook === 'Slides'
                                                                        ? { pathname: `apostilas/slides/${encodeURIComponent(lesson.title)}`, query: { slide: lesson.link } }
                                                                        : { pathname: `apostilas/${encodeURIComponent(lesson.title)}`, query: { workbook: lesson.workbook, lesson: lesson.docID } }
                                                                }
                                                                passHref
                                                            >
                                                                {lesson.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </AccordionItem>
                                    ))}
                            </Accordion>
                        </Tab>
                    ))}
                </Tabs>
            )}

            {criarLicao && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="fixed inset-0 transition-opacity">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark rounded-lg overflow-hidden shadow-xl transform transition-all w-fit h-full p-5">
                            <div className="flex flex-col items-center justify-center">
                                <FluencyCloseButton onClick={closeModalLicao} />

                                <h3 className="text-lg leading-6 font-medium mb-2">
                                    Criar uma lição
                                </h3>

                                <Tabs aria-label="Options" radius="lg" color="primary" classNames={{
                                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                    cursor: "w-full bg-fluency-gray-500 rounded-t-lg",
                                    tab: "max-w-fit px-0 h-12",
                                    tabContent: "group-data-[selected=true]:text-white px-4 font-bold"
                                }}>
                                    <Tab key="licao" title="Criar Lição">
                                        <div className="flex flex-col items-center gap-3 p-4 h-[20rem] w-[15rem]">
                                            <FluencyInput
                                                placeholder="Nome da Lição"
                                                onChange={(e) => setNomeLicao(e.target.value)}
                                                value={nomeLicao}
                                            />

                                            {/* Updated Workbook select dropdown */}
                                            <select
                                                onChange={(e) => setWorkbook(e.target.value)}
                                                value={workbook}
                                                className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            >
                                                <option value="">Selecione um livro</option>
                                                {workbookCollectionsState.map((workbookName, index) => (
                                                    <option key={index} value={workbookName}>
                                                        {workbookName}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                onChange={(e) => setUnit(parseInt(e.target.value, 10))}
                                                value={unit}
                                                className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            >
                                                <option value="">Selecione uma unidade</option>
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {i + 1}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                onChange={(e) => setLanguage(e.target.value)}
                                                value={language}
                                                className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            >
                                                <option value="">Selecione o idioma</option>
                                                <option value="English">English</option>
                                                <option value="Español">Español</option>
                                            </select>

                                            <div className="flex justify-center">
                                                <FluencyButton variant="confirm" onClick={createNotebook}>
                                                    Criar
                                                </FluencyButton>
                                                <FluencyButton variant='gray' onClick={closeModalLicao}>Cancelar</FluencyButton>
                                            </div>
                                        </div>
                                    </Tab>

                                    <Tab key="slide" title="Criar Slide">
                                        <div className="flex flex-col items-center gap-3 p-4 h-[20rem] w-[15rem]">
                                            <FluencyInput 
                                                type="text" 
                                                placeholder="Título do Slide" 
                                                value={slideTitle} 
                                                onChange={(e) => setSlideTitle(e.target.value)} 
                                                required
                                            />

                                            <FluencyInput 
                                                type="text" 
                                                placeholder="Link do Slide" 
                                                value={slideLink} 
                                                onChange={(e) => setSlideLink(e.target.value)} 
                                                required
                                            />

                                            <select
                                                onChange={(e) => setWorkbook(e.target.value)}
                                                value={workbook}
                                                className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            >
                                                <option value="">Selecione um livro</option>
                                                {workbookCollectionsState.map((workbookName, index) => (
                                                    <option key={index} value={workbookName}>
                                                        {workbookName}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                onChange={(e) => setLanguage(e.target.value)}
                                                value={language}
                                                className="ease-in-out duration-300 w-full px-2 py-2 rounded-lg border-2 border-fluency-gray-100 outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100 text-fluency-gray-800"
                                            >
                                                <option value="">Selecione o idioma</option>
                                                <option value="English">English</option>
                                                <option value="Español">Español</option>
                                            </select>

                                            <div className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isForKids}
                                                    onChange={(e) => setIsForKids(e.target.checked)}
                                                    className="mr-2"
                                                />
                                                <label className="text-fluency-gray-500 font-bold">Lição Kids</label>
                                            </div>

                                            <div className="flex justify-center">
                                                <FluencyButton variant="confirm" onClick={createSlide}>Criar</FluencyButton>
                                                <FluencyButton variant="gray" onClick={closeModalLicao}>Cancelar</FluencyButton>
                                            </div>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toaster />
        </div>
    );
}
