'use client';
import { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

interface LessonDoc {
    id: string;
    data: DocumentData;
    unit: string;
  }
  
  interface GroupedLessonDocs {
    unit: string;
    docs: LessonDoc[];
  }
  
export default function TheBasics(){
  const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocs[]>([]); // Store the fetched documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const lessonsRef = collection(db, 'Notebooks', 'The Basics', 'Lessons');
        const lessonsSnapshot: QuerySnapshot<DocumentData> = await getDocs(lessonsRef);
        const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          unit: doc.data().unit || 'Uncategorized', // Assuming there's a 'unit' field in your documents
        }));
  
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
          unit,
          docs: groupedByUnit[unit],
        }));
  
        setLessonDocs(groupedLessonDocs);
      } catch (error) {
        console.error('Error fetching documents: ', error);
      }
    };
  
    fetchDocs();
  }, []);
  

    return(
        <div>
            {lessonDocs.map((group, index) => (
                <div key={index}>
                    <h2>Unit: {group.unit}</h2>
                    {group.docs.map((lesson, lessonIndex) => (
                    <div key={lessonIndex}>
                        <h3>{lesson.data.title}</h3>
                    </div>
                    ))}
                </div>
            ))}
        </div>
    )
}