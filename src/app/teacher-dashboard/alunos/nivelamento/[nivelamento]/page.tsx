'use client';
import { useEffect, useState } from "react";
import FluencyButton from "@/app/ui/Components/Button/button";
import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, DocumentData, getDoc, query, orderBy, limit } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import LoadingAnimation from "@/app/ui/Animations/LoadingAnimation";
import XLSX from 'xlsx-js-style';
import FluencyCloseButton from "@/app/ui/Components/ModalComponents/closeModal";

interface NivelData {
    data: string;
    pontos: string;
}

interface MergedNivelData {
    data: string;
    Vocabulario?: string;
    Frases?: string;
    Compreensao?: string;
    'Verdadeiro ou Falso'?: string;
}

interface Nivel2Data {
    timeStamp: string;
    score: string;
}

interface HistoryItem {
    word: string;
    userAnswer: string;
}

interface Nivel3Data {
    data: string;
    pontos: string;
    history: HistoryItem[];
    randomDocument: string;
}

const nivel1Subcollections: (keyof MergedNivelData)[] = ["Vocabulario", "Frases", "Compreensao", "Verdadeiro ou Falso"]; // Updated collection name

const dataKeyMapping: { [key: string]: string } = {
    Vocabulario: 'Vocabulário',
    Frases: 'Frases',
    Compreensao: 'Compreensão',
    'Verdadeiro ou Falso': 'Verdadeiro ou Falso', // Updated collection name
};

const scoreLabel = 'Pontuação';
const pontosLabel = 'Pontuação';

export default function NivelamentoTeacher() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const [nivelamentoPermitido, setNivelamentoPermitido] = useState<boolean | null>(null);
    const [nivelData, setNivelData] = useState<{ [key: string]: NivelData[] }>({});
    const [mergedNivel1Data, setMergedNivel1Data] = useState<MergedNivelData[]>([]);
    const [nivel2Data, setNivel2Data] = useState<Nivel2Data[]>([]);
    const [nivel3Data, setNivel3Data] = useState<Nivel3Data[]>([]);
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryDelay = 3000;
    const [nivel2Analysis, setNivel2Analysis] = useState<string | null>(null);
    const [nivel2Text, setNivel2Text] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>('');
    
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (id) {
                try {
                    const profile = doc(db, 'users', id);
                    const docSnap = await getDoc(profile);
                    if (docSnap.exists()) {
                        setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                        setUserName(docSnap.data().name);
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document: ", error);
                }
            }
        };

        fetchUserInfo();
    }, [id]);

    useEffect(() => {
        if (id && nivelamentoPermitido !== null) {
            setLoading(true);
            fetchNivelamentoData(id).finally(() => setLoading(false));
        }
    }, [id, nivelamentoPermitido]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        if (loading && retryCount < maxRetries) {
            timeoutId = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                console.log(`Retrying data fetch attempt ${retryCount + 1}`);
                if (id) fetchNivelamentoData(id);
            }, retryDelay);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId); // Clean up timeout on component unmount or when retryCount changes
        };
    }, [loading, retryCount, id]);

    async function fetchNivelamentoData(userId: string) {
        try {
            const newNivelData: { [key: string]: NivelData[] } = {};
            for (const subcollection of nivel1Subcollections) {
                const subcollectionRef = collection(db, 'users', userId, 'Nivelamento', 'Nivel-1', subcollection);
                const subcollectionDocsSnapshot = await getDocs(subcollectionRef);
                const subcollectionDataArray: NivelData[] = [];
                subcollectionDocsSnapshot.forEach((doc: DocumentData) => {
                    const data = formatDate(doc.data().data.toDate()); // Convert Timestamp to formatted string
                    const pontos = doc.data().pontos.toString(); // Convert pontos to string
                    subcollectionDataArray.push({ data, pontos });
                });

                newNivelData[subcollection] = subcollectionDataArray;
            }

            setNivelData(newNivelData);

            const mergedData = mergeNivel1Data(newNivelData);
            setMergedNivel1Data(mergedData);

            const nivel2Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-2', 'Escrita');
            const nivel2DocsSnapshot = await getDocs(nivel2Ref);

            const nivel2DataArray: Nivel2Data[] = [];
            let analysisString: string | null = null;
            let textString: string | null = null;
            nivel2DocsSnapshot.forEach((doc: DocumentData) => {
                const timeStamp = formatDate(doc.data().data.toDate()); // Convert Timestamp to formatted string
                const score = doc.data().score.toString(); // Convert score to string
                
                if (doc.data().analysis || doc.data().userText) {
                    analysisString = doc.data().analysis; 
                    textString = doc.data().userText;// Store the analysis string
                }

                nivel2DataArray.push({ timeStamp, score });
            });
            if (analysisString || textString) {
                setNivel2Analysis(analysisString);
                setNivel2Text(textString); // You would need to create this state
            }

            setNivel2Data(nivel2DataArray);

             const nivel3Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-3', 'Audicao');
             const nivel3DocsSnapshot = await getDocs(nivel3Ref);
             const nivel3DataArray: Nivel3Data[] = [];

             nivel3DocsSnapshot.forEach((doc: DocumentData) => {
                 const data = formatDate(doc.data().data.toDate());
                 const pontos = doc.data().pontos.toString();
                 const randomDocument = doc.data().randomDocument.toString();
                 nivel3DataArray.push({
                     data, pontos, randomDocument,
                     history: []
                 });
             });
 
             setNivel3Data(nivel3DataArray);

        } catch (error) {
            console.error('Error fetching nivelamento data:', error);
        }
    }

    function mergeNivel1Data(data: { [key: string]: NivelData[] }): MergedNivelData[] {
        const mergedDataMap: { [key: string]: MergedNivelData } = {};
        nivel1Subcollections.forEach(subcollection => {
            data[subcollection]?.forEach(item => {
                if (!mergedDataMap[item.data]) {
                    mergedDataMap[item.data] = { data: item.data };
                }
                mergedDataMap[item.data][subcollection] = item.pontos;
            });
        });

        return Object.values(mergedDataMap);
    }

    function handleNivelamento() {
        if (id) {
            try {
                const userRef = doc(db, 'users', id);
                setDoc(userRef, { NivelamentoPermitido: true }, { merge: true });
            } catch (error) {
                console.error('Error updating NivelamentoPermitido field:', error);
            }
        }
    }
    
    function convertHtmlToText(htmlString: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        return doc.body.textContent || "";
    }
  
    function formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    async function fetchQuizHistory(userId: any) {
        const subcollections = ["Vocabulario", "Frases", "Compreensao", "Verdadeiro ou Falso"];
        let allData: any[] = [];
    
        for (const subcollection of subcollections) {
            // Query to get the most recent entry based on the 'data' field
            const subcollectionRef = collection(db, 'users', userId, 'Nivelamento', 'Nivel-1', subcollection);
            const recentQuery = query(subcollectionRef, orderBy('data', 'desc'), limit(1));
            const subcollectionDocsSnapshot = await getDocs(recentQuery);
    
            subcollectionDocsSnapshot.forEach((doc) => {
                const data = doc.data();
                const history = data.history || [];
                const formattedDate = data.data.toDate().toLocaleDateString(); // Ensure date is formatted
    
                history.forEach((entry: any) => {
                    allData.push({
                        subcollection,
                        ...entry,
                        pontos: data.pontos,
                        data: formattedDate // Use the formatted date
                    });
                });
            });
        }
    
        return allData;
    }

    async function fetchNivel2Data(userId: any) {
        const nivel2Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-2', 'Escrita');
        const recentQuery = query(nivel2Ref, orderBy('data', 'desc'), limit(1));
        const nivel2DocsSnapshot = await getDocs(recentQuery);
    
        const nivel2DataArray: any[] = [];
        let analysisString: string | null = null;
        let textString: string | null = null;
    
        nivel2DocsSnapshot.forEach((doc: DocumentData) => {
            const data = doc.data();
            const timeStamp = formatDate(data.data.toDate());
            const score = data.score.toString();
    
            if (data.analysis || data.userText) {
                analysisString = convertHtmlToText(data.analysis); // Convert analysisString to plain text
                textString = data.userText;
            }
    
            nivel2DataArray.push({ timeStamp, score, analysis: analysisString, text: textString });
        });
    
        return nivel2DataArray;
    }

    async function fetchNivel3Data(userId: any) {
        const nivel3Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-3', 'Audicao');
        const recentQuery = query(nivel3Ref, orderBy('data', 'desc'), limit(1));
        const nivel3DocsSnapshot = await getDocs(recentQuery);
    
        const nivel3DataArray: Nivel3Data[] = [];
    
        nivel3DocsSnapshot.forEach((doc: DocumentData) => {
            const data = doc.data();
            const formattedDate = formatDate(data.data.toDate());
            const pontos = data.pontos.toString();
            const randomDocument = doc.data().randomDocument.toString();

            // Extract history
            const historyData = data.history || []; // Ensure history is an array
            const history = historyData.map((item: any) => ({
                word: item.word,
                userAnswer: item.userAnswer
            }));
    
            // Push formatted data to array
            nivel3DataArray.push({
                data: formattedDate,
                pontos,
                randomDocument,
                history,
            });
        });
    
        return nivel3DataArray;
    }

    function getFormattedDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(now.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    }    

    function generateExcelFile(data: any[], nivel2Data: any[], nivel3Data: Nivel3Data[], userName: any) {
        const workbook = XLSX.utils.book_new();
    
        const analysisPointsSheet = [
            ['Como as pontuações funcionam:'],
            ['É claro que para entender bem o nível de alguém no idioma precisamos de mais do que algumas perguntas durante uma aula. Aproveite o primeiro mês de aula para testar a extensão do vocabulário, conhecimento gramatical, compreensão/expressão oral e escrita. Assim suas aulas vão ser melhor planejadas.'],
            ['Vamos testar o aluno nas seguintes habilidades: 1) vocabulário e leitura, 2) escrita, 3) audição, 4) compreensão e fala.'],
            [''],
            ['Teste de vocabulário e leitura leva em conta:'],
            ['20 de vocabulário aleatório: significado. (5 pontos)'],
            ['10 de uso em frase: fazendo a tradução. (5 pontos)'],
            ['10 de uso da mais provável: com lacunas. (5 pontos)'],
            ['5 de verdadeiro ou falso. Frases simples que ele precisa classificar. (5 pontos)'],
            [''],
            ['Teste de escrita leva em conta:'],
            ['Ordem das palavras, escrever sobre a ideia, gramática e uso natural do idioma. O aluno recebe um prompt para escrever sobre. A pontuação máxima é 5.'],
            [''],
            ['Teste de audição leva em conta:'],
            ['A compreensão do aluno do que foi dito. Vamos usar 1 áudio com espaços onde o aluno pode escrever o que foi dito.'],
            [''],
            ['Teste de compreensão e fala:'],
            ['Esse o professor vai fazer e analisar de acordo com os critérios de cada pergunta.'],
            [''],
            [''],
            ['Como pontuar:'],
            ['Teste de vocabulário e leitura leva em conta:'],
            ['0-7 pontos (A1/A2): O aluno tem dificuldades com vocabulário e leitura básicos.'],
            ['8-14 pontos (B1/B2): O aluno tem uma compreensão intermediária e uso do vocabulário e leitura.'],
            ['15-20 pontos (C1/C2): O aluno tem um domínio avançado de vocabulário e leitura.'],
            [''],
            ['Teste de escrita leva em conta:'],
            ['0-1 ponto (A1/A2): O aluno tem dificuldades significativas em escrever frases simples.'],
            ['2-3 pontos (B1/B2): O aluno consegue escrever textos claros e coerentes sobre tópicos familiares.'],
            ['4-5 pontos (C1/C2): O aluno escreve textos bem estruturados e argumentativos com vocabulário avançado.'],
            [''],
            ['Teste de audição leva em conta:'],
            ['0-3 pontos (A1/A2): O aluno tem dificuldades em entender frases e informações simples.'],
            ['4-7 pontos (B1/B2): O aluno consegue entender conversas simples e seguir tópicos familiares.'],
            ['8-10 pontos (C1/C2): O aluno entende discursos longos e complexos, mesmo em contextos desconhecidos.'],
        ];
        
        const analysisPointsWs = XLSX.utils.aoa_to_sheet(analysisPointsSheet);
        const boldCells = {
            A1: { font: { bold: true, sz: 14 } },
            A2: { alignment: { vertical: 'top', wrapText: true } },
            A3: { alignment: { vertical: 'top', wrapText: true } },
            A5: { font: { bold: true, sz: 14 } },
            A11: { font: { bold: true, sz: 14 } },
            A12: { alignment: { vertical: 'top', wrapText: true } },
            A14: { font: { bold: true, sz: 14 } },
            A17: { font: { bold: true, sz: 14 } },
            A21: { font: { bold: true, sz: 14 } },
            A27: { font: { bold: true, sz: 14 } },
            A32: { font: { bold: true, sz: 14 } },
        };

        const maxRow = 35; // Assuming 32 rows, adjust based on your data
        for (let row = 1; row <= maxRow; row++) {
            const cellRef = `A${row}`;
            if (!analysisPointsWs[cellRef]) {
                analysisPointsWs[cellRef] = {}; // Initialize the cell if it doesn't exist
            }
            analysisPointsWs[cellRef].s = {
                alignment: { horizontal: 'center', wrapText: true },
            };
        }

        for (const [cell, style] of Object.entries(boldCells)) {
            if (analysisPointsWs[cell]) {
                analysisPointsWs[cell].s = { ...analysisPointsWs[cell].s, ...style };
            }
        }

        analysisPointsWs['!cols'] = [{ wpx: 600 }];
        XLSX.utils.book_append_sheet(workbook, analysisPointsWs, 'Como analisar a pontuação');
    
        // Prepare Sheet 1: Vocabulario
        const vocabularioData = data.filter(entry => entry.subcollection === "Vocabulario").map(entry => ({
            "Palavra para traduzir": entry.word,
            "Opções": entry.options?.join(', '),
            "Resposta do Aluno": entry.selectedAnswer,
            "Pontos": entry.pontos,
        }));
        const worksheet1 = XLSX.utils.json_to_sheet(vocabularioData);
        worksheet1['!cols'] = [
            { wpx: 150 }, // Column A
            { wpx: 300 }, // Column B
            { wpx: 100 }, // Column C
            { wpx: 50 }, // Column D
            { wpx: 150 }, // Column E
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet1, "Vocabulario");
    
        // Prepare Sheet 2: Frase
        const frasesData = data.filter(entry => entry.subcollection === "Frases").map(entry => ({
            "Frase para traduzir": entry.question,
            "Resposta do Aluno": entry.answer,
            "Pontos": entry.pontos,
        }));
        const worksheet2 = XLSX.utils.json_to_sheet(frasesData);
        worksheet2['!cols'] = [
            { wpx: 200 }, // Column A
            { wpx: 200 }, // Column B
            { wpx: 50 }, // Column C
            { wpx: 150 }, // Column D
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet2, "Frase");
    
        // Prepare Sheet 3: Compreensao
        const compreensaoData = data.filter(entry => entry.subcollection === "Compreensao").map(entry => ({
            "Texto para analisar": entry.question,
            "Opções": entry.options?.join(', '),
            "Resposta do Aluno": entry.user_answer,
            "Pontos": entry.pontos,
        }));
        const worksheet3 = XLSX.utils.json_to_sheet(compreensaoData);
        worksheet3['!cols'] = [
            { wpx: 300 }, // Column A
            { wpx: 300 }, // Column B
            { wpx: 200 }, // Column C
            { wpx: 50 }, // Column D
            { wpx: 150 }, // Column E
        ];

        // Set cells A2 to A10 to wrap text
        for (let row = 2; row <= 10; row++) {
            const cellAddress = `A${row}`;
            if (!worksheet3[cellAddress]) {
                worksheet3[cellAddress] = {};
            }
            worksheet3[cellAddress].s = {
                alignment: {
                    wrapText: true
                }
            };
        }

        // Set cells B2 to B10 to wrap text
        for (let row = 2; row <= 10; row++) {
            const cellAddress = `B${row}`;
            if (!worksheet3[cellAddress]) {
                worksheet3[cellAddress] = {};
            }
            worksheet3[cellAddress].s = {
                alignment: {
                    wrapText: true
                }
            };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet3, "Compreensao");
    
        // Prepare Sheet 4: Verdadeiro ou Falso
        const verdadeiroOuFalsoData = data.filter(entry => entry.subcollection === "Verdadeiro ou Falso").map(entry => ({
            "Frase para analisar": entry.statement,
            "Resposta do Aluno": entry.selectedAnswer,
            "Pontos": entry.pontos,
        }));
        const worksheet4 = XLSX.utils.json_to_sheet(verdadeiroOuFalsoData);
        worksheet4['!cols'] = [
            { wpx: 300 }, // Column A
            { wpx: 100 }, // Column B
            { wpx: 50 }, // Column C
            { wpx: 150 }, // Column D
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet4, "VerdadeiroOuFalso");
    
        // Prepare Sheet 5: Escrita
        const escritaData = nivel2Data.map(entry => ({
            "Tópico": entry.userText,
            "Avaliação automática do texto": entry.analysis,
            "Texto do aluno": entry.text,
            "Pontos": entry.score
        }));
        const worksheet5 = XLSX.utils.json_to_sheet(escritaData);
        worksheet5['!cols'] = [
            { wpx: 400 }, // Column A
            { wpx: 400 }, // Column B
            { wpx: 100 }, // Column C
            { wpx: 100 }, // Column D
        ];

        // Set cells A2 to A10 to wrap text
        for (let row = 2; row <= 10; row++) {
            const cellAddress = `B${row}`;
            if (!worksheet5[cellAddress]) {
                worksheet5[cellAddress] = {};
            }
            worksheet5[cellAddress].s = {
                alignment: {
                    wrapText: true,
                    vertical: top,
                }
            };
        }

        // Set cells B2 to B10 to wrap text
        for (let row = 2; row <= 10; row++) {
            const cellAddress = `C${row}`;
            if (!worksheet5[cellAddress]) {
                worksheet5[cellAddress] = {};
            }
            worksheet5[cellAddress].s = {
                alignment: {
                    wrapText: true,
                }
            };
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet5, "Escrita");

        const historySheetData = nivel3Data.flatMap(entry => {
            return entry.history.map((historyItem: { word: string; userAnswer: string; }) => ({
                "Palavra do texto": historyItem.word,
                "Respostas do Aluno": historyItem.userAnswer,
                "Texto completo": entry.randomDocument,
                "Pontos": entry.pontos,
            }));
        });

        const worksheet6 = XLSX.utils.json_to_sheet(historySheetData);
    
        // Set column widths for worksheet6
        worksheet6['!cols'] = [
            { wpx: 200 }, // Column A: Palavra
            { wpx: 300 }, // Column B: Resposta do Aluno
            { wpx: 50 },  // Column C: Pontos
            { wpx: 150 }, // Column D: Data
        ];
    
        XLSX.utils.book_append_sheet(workbook, worksheet6, 'Audição');
       
        const currentDate = getFormattedDate();
        XLSX.writeFile(workbook, `${userName} - ${currentDate}.xlsx`);
    }
    
    async function handleGenerateExcel(userId: any, userName: any) {
        try {
            const nivel1Data = await fetchQuizHistory(userId);
            const nivel2Data = await fetchNivel2Data(userId);
            const nivel3Data = await fetchNivel3Data(userId);
            generateExcelFile(nivel1Data, nivel2Data, nivel3Data, userName); // Generate Excel with updated Nivel-3 data
        } catch (error) {
            console.error("Error generating Excel file:", error);
        }
    }

    return (
        <div className="p-4 mt-4 flex flex-col items-center w-full">
            {loading ? (
                <div className="flex items-center justify-center min-h-full min-w-full absolute top-[0%]">
                    <LoadingAnimation />
                </div>
            ) : (
                <>
                    <div className="min-w-full p-4 flex flex-col items-center gap-1">
                        <h2 className="text-xl font-bold">Nível 1 - Conhecimento básico</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {mergedNivel1Data.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <span>Sem informação para mostrar</span>
                                </div>
                            ) : (
                                <LineChart data={mergedNivel1Data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {nivel1Subcollections.map(subcollection => (
                                        <Line
                                            key={subcollection}
                                            type="monotone"
                                            dataKey={subcollection}
                                            stroke={getColor(subcollection)}
                                            activeDot={{ r: 8 }}
                                            name={dataKeyMapping[subcollection]}
                                        />
                                    ))}
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    <div className="min-w-full p-4 flex flex-col items-center gap-1">
                        <h2 className="text-xl font-bold">Nível 2 - Escrita</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {nivel2Data.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <span>Sem informação para mostrar</span>
                                </div>
                            ) : (
                                <LineChart data={nivel2Data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeStamp" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" name={scoreLabel} stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>

                    </div>

                    <div className="min-w-full p-4 flex flex-col items-center gap-1">
                        <h2 className="text-xl font-bold">Nível 3 - Audição</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            {nivel3Data.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <span>Sem informação para mostrar</span>
                                </div>
                            ) : (
                                <LineChart data={nivel3Data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pontos" name={pontosLabel} stroke="#82ca9d" activeDot={{ r: 8 }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                   <div className="flex flex-row items-center justify-center gap-2 mt-4">
                        <FluencyButton variant="gray" onClick={() => handleGenerateExcel(id, userName)}>Gerar relatório para {userName}</FluencyButton>
                        {nivelamentoPermitido === true ? (
                            <FluencyButton variant="warning">Aguardando Aluno Fazer Nivelamento</FluencyButton>
                        ) : (
                            <FluencyButton variant="confirm" onClick={handleNivelamento}>Refazer Nivelamento do Aluno</FluencyButton>
                        )}
                   </div>
                </>
            )}

        </div>
    );
}

function getColor(subcollection: string): string {
    switch (subcollection) {
        case 'Vocabulario':
            return '#8884d8';
        case 'Frases':
            return '#82ca9d';
        case 'Compreensao':
            return '#ffc658';
        case 'Verdadeiro-e-Falso':
            return '#ff7300';
        default:
            return '#000000';
    }
}
