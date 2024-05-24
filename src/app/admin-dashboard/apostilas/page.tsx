'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

interface Notebook {
    title: string;
    workbook: string;
    content: string;
}

export default function Apostilas() {
    const [criarLicao, setCriarLicao] = useState(false);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [nomeLicao, setNomeLicao] = useState('');
    const [workbook, setWorkbook] = useState('');

    function openModalLicao() {
        setCriarLicao(true);
    }
    
    function closeModalLicao() {
        setCriarLicao(false);
    }

    async function createNotebook() {
        try {
            const newNotebook: Notebook = {
                title: nomeLicao,
                workbook: workbook,
                content: ''
            };
            await addDoc(collection(db, `Notebooks/${workbook}/Lessons`), newNotebook);
            setNotebooks([...notebooks, newNotebook]);
            closeModalLicao();
        } catch (error) {
            console.error('Error creating notebook:', error);
        }
    }

    useEffect(() => {
        const fetchNotebooks = async () => {
            try {
                const notebookList: Notebook[] = [];
                const workbooksSnapshot = await getDocs(collection(db, 'Notebooks'));
                
                console.log("Fetched workbooks:", workbooksSnapshot.docs.map(doc => doc.id));
                
                for (const workbookDoc of workbooksSnapshot.docs) {
                    const workbookId = workbookDoc.id;
                    const lessonsSnapshot = await getDocs(collection(db, `Notebooks/${workbookId}/Lessons`));

                    console.log(`Fetched lessons for workbook ${workbookId}:`, lessonsSnapshot.docs.map(doc => doc.id));
                    
                    lessonsSnapshot.forEach((lessonDoc) => {
                        const lessonData = lessonDoc.data();
                        const notebook: Notebook = {
                            title: lessonData.title || '',
                            workbook: workbookId,
                            content: lessonData.content || '',
                        };
                        notebookList.push(notebook);
                    });
                }

                console.log("Final notebook list:", notebookList);
                setNotebooks(notebookList);
            } catch (error) {
                console.error('Error fetching notebooks:', error);
            }
        };

        fetchNotebooks();
    }, []);

    return (
        <div>
            <FluencyInput placeholder="Procure por uma lição" />

            <FluencyButton onClick={openModalLicao}>Criar uma lição</FluencyButton>
            <div>
                {notebooks.map((notebook, index) => (
                    <div key={index}>
                        <h3>{notebook.title}</h3>
                        <p>{notebook.workbook}</p>
                        <p>{notebook.content}</p>
                    </div>
                ))}
            </div>
            
            {criarLicao && 
            <div>
                <FluencyInput 
                    placeholder="Nome da Lição" 
                    onChange={(e) => setNomeLicao(e.target.value)}
                    value={nomeLicao}
                />
                <select onChange={(e) => setWorkbook(e.target.value)} value={workbook}>
                    <option value="">Selecione uma categoria</option>
                    <option value="First Steps">First Steps</option>
                    <option value="The Basics">The Basics</option>
                    <option value="All you need to know">All you need to know</option>
                </select>
                <button onClick={createNotebook}>Criar</button>
                <button onClick={closeModalLicao}>Fechar</button>
            </div>
            }

            
        </div>
    );
}
