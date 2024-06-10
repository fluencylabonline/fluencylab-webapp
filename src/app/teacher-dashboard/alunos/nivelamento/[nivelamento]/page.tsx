'use client';
import { useEffect, useState } from "react";

import FluencyButton from "@/app/ui/Components/Button/button";

import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, DocumentData, getDoc } from "firebase/firestore";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

interface NivelData {
    data: string;
    pontos: string;
}

interface MergedNivelData {
    data: string;
    Vocabulario?: string;
    Frases?: string;
    Compreensao?: string;
    'Verdadeiro-e-Falso'?: string;
}

interface Nivel2Data {
    timeStamp: string;
    score: string;
}

interface Nivel3Data extends NivelData {}

const nivel1Subcollections: (keyof MergedNivelData)[] = ["Vocabulario", "Frases", "Compreensao", "Verdadeiro-e-Falso"];

// Mapping object for more descriptive labels
const dataKeyMapping: { [key: string]: string } = {
    Vocabulario: 'Vocabulário',
    Frases: 'Frases',
    Compreensao: 'Compreensão',
    'Verdadeiro-e-Falso': 'Verdadeiro ou Falso',
};

const scoreLabel = 'Pontuação';
const pontosLabel = 'Pontuação';

export default function NivelamentoTeacher() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const [nivelamentoPermitido, setNivelamentoPermitido] = useState(false)
    useEffect(() => {
      const fetchUserInfo = async () => {
          if (id) {
              try {
                  const profile = doc(db, 'users', id);
                  const docSnap = await getDoc(profile);
                  if (docSnap.exists()) {
                      setNivelamentoPermitido(docSnap.data().NivelamentoPermitido);
                    } else {
                      console.log("No such document!");
                  }
              } catch (error) {
                  console.error("Error fetching document: ", error);
              }
          }
      };

      fetchUserInfo()
  }, [id]);

    const [nivelData, setNivelData] = useState<{ [key: string]: NivelData[] }>({});
    const [mergedNivel1Data, setMergedNivel1Data] = useState<MergedNivelData[]>([]);
    const [nivel2Data, setNivel2Data] = useState<Nivel2Data[]>([]);
    const [nivel3Data, setNivel3Data] = useState<Nivel3Data[]>([]);

    useEffect(() => {
        if (id) {
            fetchNivelamentoData(id);
        }
    }, [id]);

    async function fetchNivelamentoData(userId: string) {
        try {
            // Fetch Nivel-1 data
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

            // Merge data for Nivel-1 into a single dataset
            const mergedData = mergeNivel1Data(newNivelData);
            setMergedNivel1Data(mergedData);

            // Fetch Nivel-2 data
            const nivel2Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-2', 'Escrita');
            const nivel2DocsSnapshot = await getDocs(nivel2Ref);

            const nivel2DataArray: Nivel2Data[] = [];
            nivel2DocsSnapshot.forEach((doc: DocumentData) => {
                const timeStamp = formatDate(doc.data().timestamp.toDate()); // Convert Timestamp to formatted string
                const score = doc.data().score.toString(); // Convert pontos to string
                nivel2DataArray.push({ timeStamp, score });
            });
            setNivel2Data(nivel2DataArray);

            // Fetch Nivel-3 data
            const nivel3Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-3', 'Audicao');
            const nivel3DocsSnapshot = await getDocs(nivel3Ref);

            const nivel3DataArray: Nivel3Data[] = [];
            nivel3DocsSnapshot.forEach((doc: DocumentData) => {
                const data = formatDate(doc.data().data.toDate()); // Convert Timestamp to formatted string
                const pontos = doc.data().pontos.toString(); // Convert pontos to string
                nivel3DataArray.push({ data, pontos });
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
        if (!id) {
            return null;
        }
        try {
            const userRef = doc(db, 'users', id);
            setDoc(userRef, { NivelamentoPermitido: false }, { merge: true });
        } catch (error) {
            console.error('Error updating NivelamentoPermitido field:', error);
        }
    }

    function formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="p-4 mt-4 flex flex-col items-center w-full">

            <div className="p-4 flex flex-col items-center gap-1">
                <h2 className="text-xl font-bold">Nível 1 - Conhecimento básico</h2>
                <ResponsiveContainer width="100%" height={300}>
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
                </ResponsiveContainer>
            </div>

            <div className="p-4 flex flex-col items-center gap-1">
                <h2 className="text-xl font-bold">Nível 2- Escrita</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nivel2Data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeStamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" name={scoreLabel} stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="p-4 flex flex-col items-center gap-1">
                <h2 className="text-xl font-bold">Nível 3 - Audição</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nivel3Data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pontos" name={pontosLabel} stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {nivelamentoPermitido === false ? (
                <>
                    <FluencyButton className="mt-4" variant="warning">Aguardando Aluno Fazer Nivelamento</FluencyButton>
                </>
            ):(
                <>
                    <FluencyButton className="mt-4" variant="confirm" onClick={handleNivelamento}>Refazer Nivelamento do Aluno</FluencyButton>
                </>
            )}

            
        </div>
    );
}

// Utility function to assign different colors to different lines
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
