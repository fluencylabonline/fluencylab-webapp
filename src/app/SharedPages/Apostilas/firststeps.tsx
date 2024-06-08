'use client';
import { useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";
import { Accordion, AccordionItem } from "@nextui-org/react";

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
  
export default function FirstSteps(){
  const [lessonDocs, setLessonDocs] = useState<GroupedLessonDocs[]>([]); // Store the fetched documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const lessonsRef = collection(db, 'Notebooks', 'First Steps', 'Lessons');
        const lessonsSnapshot: QuerySnapshot<DocumentData> = await getDocs(lessonsRef);
        const fetchedLessonDocs: LessonDoc[] = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          unit: doc.data().unit || 'Uncategorized',
          title: doc.data().title,
          workbook: doc.data().workbook,
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
  

    return(
        <div className="flex flex-col items-start gap-1">
            {lessonDocs.map((group, index) => (
                <div key={index}>
                  <Accordion>
                  <AccordionItem key={index} aria-label={group.unit.toString()} title={"Unidade " + group.unit.toString()}>
                      <div className="flex flex-row gap-2 items-center">
                      {group.docs.map((lesson, lessonIndex) => (
                    <div id='apostilas-background' className="flex flex-col items-center justify-center text-center w-28 h-40 bg-fluency-bg-light dark:bg-fluency-bg-dark p-2 rounded-sm" key={lessonIndex}>
                        <Link key={lesson.id} href={{ pathname: `apostilas/${encodeURIComponent(lesson.title)}`, query: { workbook: lesson.workbook, lesson: lesson.id }}} ><p className="font-bold text-sm hover:text-fluency-blue-500 duration-300 ease-in-out cursor-pointer">{lesson.data.title}</p></Link>
                    </div>
                    ))}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </div>
            ))}
        </div>
    )
}