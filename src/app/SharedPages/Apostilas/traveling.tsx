'use client';
import { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";

interface LessonDoc {
    id: string;
    data: DocumentData;
    unit: number;
    title: string;
    workbook: string;
}

interface GroupedLessonDocs {
    unit: number;
    docs: LessonDoc[];
}

export default function Traveling() {
    const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocs[]>([]); // Store the fetched documents

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const lessonsRef = collection(db, 'Notebooks', 'Traveling', 'Lessons');
                const lessonsSnapshot: QuerySnapshot<DocumentData> = await getDocs(lessonsRef);
                const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                    unit: doc.data().unit || 'Uncategorized',
                    title: doc.data().title,
                    workbook: doc.data().workbook,
                }));

                // Sort documents by the number extracted from their title
                fetchedLessonDocs.sort((a, b) => {
                    const numberA = extractNumberFromTitle(a.title);
                    const numberB = extractNumberFromTitle(b.title);
                    return numberA - numberB;
                });

                // Group documents by unit
                const groupedByUnit: { [key: string]: LessonDoc[] } = fetchedLessonDocs.reduce((acc: { [key: string]: LessonDoc[] }, doc: LessonDoc) => {
                    const unit = doc.unit;
                    if (!acc[unit]) {
                        acc[unit] = [];
                    }
                    acc[unit].push(doc);
                    return acc;
                }, {});

                // Transform grouped object into an array
                const groupedLessonDocs: GroupedLessonDocs[] = Object.keys(groupedByUnit).map(unit => ({
                    unit: parseInt(unit, 10),
                    docs: groupedByUnit[unit],
                }));

                setLessonDocs(groupedLessonDocs);
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }
        };

        fetchDocs();
    }, []);

    // Helper function to extract number from title
    const extractNumberFromTitle = (title: string): number => {
        const match = title.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    return (
        <div className="flex flex-col items-start gap-4 w-full">
            {lessonDocs.map((group, index) => (
                <div key={index} className="w-full">
                    <h2 className="text-xl font-bold mb-2">Unidade {group.unit}</h2>
                    <div className="flex flex-wrap gap-3">
                        {group.docs.map((lesson, lessonIndex) => (
                            <div
                                id='apostilas-background'
                                className="flex flex-col items-center justify-center text-center w-28 h-40 bg-fluency-bg-light dark:bg-fluency-bg-dark p-4 rounded-sm"
                                key={lessonIndex}
                            >
                                <Link key={lesson.id} href={{ pathname: `apostilas/${encodeURIComponent(lesson.title)}`, query: { workbook: lesson.workbook, lesson: lesson.id } }}>
                                    <p className="font-bold text-sm hover:text-fluency-blue-500 duration-300 ease-in-out cursor-pointer">
                                        {lesson.data.title}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
