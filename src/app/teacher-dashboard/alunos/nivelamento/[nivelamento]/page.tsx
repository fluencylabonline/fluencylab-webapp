'use client';
import { useEffect, useState } from "react";

import FluencyButton from "@/app/ui/Components/Button/button";

import { db } from "@/app/firebase";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";

interface NivelData {
    data: string;
    pontos: string;
}

const nivel1Subcollections = ["Vocabulario", "Frases", "Compreensao", "Verdadeiro-e-Falso"];

export default function NivelamentoTeacher(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const [nivelData, setNivelData] = useState<{ [key: string]: NivelData[] }>({});
    const [nivel2Data, setNivel2Data] = useState<{ analysis: string; score: string; userText: string, timeStamp: string }[]>([]);
    const [nivel3Data, setNivel3Data] = useState<NivelData[]>([]);

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
                subcollectionDocsSnapshot.forEach((doc) => {
                    const data = doc.data().data.toDate().toDateString(); // Convert Timestamp to string
                    const pontos = doc.data().pontos.toString(); // Convert pontos to string
                    subcollectionDataArray.push({ data, pontos });
                });

                newNivelData[subcollection] = subcollectionDataArray;
            }

            setNivelData(newNivelData);

            // Fetch Nivel-2 data
            const nivel2Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-2', 'Escrita');
            const nivel2DocsSnapshot = await getDocs(nivel2Ref);

            const nivel2DataArray: { analysis: string; score: string; userText: string; timeStamp: string }[] = [];
            nivel2DocsSnapshot.forEach((doc) => {
                const { analysis, score, userText, timeStamp } = doc.data();
                nivel2DataArray.push({ analysis, score, userText, timeStamp });
            });
            setNivel2Data(nivel2DataArray);

            // Fetch Nivel-3 data
            const nivel3Ref = collection(db, 'users', userId, 'Nivelamento', 'Nivel-3', 'Audicao');
            const nivel3DocsSnapshot = await getDocs(nivel3Ref);

            const nivel3DataArray: NivelData[] = [];
            nivel3DocsSnapshot.forEach((doc) => {
                const data = doc.data().data.toDate().toDateString(); // Convert Timestamp to string
                const pontos = doc.data().pontos.toString(); // Convert pontos to string
                nivel3DataArray.push({ data, pontos });
            });
            setNivel3Data(nivel3DataArray);
        } catch (error) {
            console.error('Error fetching nivelamento data:', error);
        }
    }
    
    function handleNivelamento(){
        if(!id){
            return null;
        }
        try {
            const userRef = doc(db, 'users', id);
            setDoc(userRef, { NivelamentoPermitido: false }, { merge: true });
        } catch (error) {
            console.error('Error updating NivelamentoPermitido field:', error);
        }
    }

    return(
        <div>

        <div>
            <h2>Nivel-1</h2>
            <ul>
            {Object.entries(nivelData).map(([subcollection, data]) => (
                <div key={subcollection}>
                    <h2>{subcollection}</h2>
                    <ul>
                        {data.map((nivel, index) => (
                            <li key={index}>
                                <span>{nivel.data}</span>
                                <span>{nivel.pontos}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            </ul>
            </div>
        <div>
            <h2>Nivel-2</h2>
            <ul>
                {nivel2Data.map((nivel, index) => (
                    <li key={index}>
                        <span>Analysis: {nivel.timeStamp}</span>
                        <span>Score: {nivel.score}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <h2>Nivel-3</h2>
            <ul>
                {nivel3Data.map((nivel, index) => (
                    <li key={index}>
                        <span>{nivel.data}</span>
                        <span>{nivel.pontos}</span>
                    </li>
                ))}
            </ul>
        </div>
        <FluencyButton variant="confirm" onClick={handleNivelamento}>Refazer nivelamento</FluencyButton>
    </div>
    )
}