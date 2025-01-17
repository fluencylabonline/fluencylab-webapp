'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { toast, Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import ClassDateItem from '../Components/ClassesItem';

interface ClassDate {
  date: Date;
  status: string;
}

const monthMap: Record<string, string> = {
    January: 'Janeiro',
    February: 'Fevereiro',
    March: 'Março',
    April: 'Abril',
    May: 'Maio',
    June: 'Junho',
    July: 'Julho',
    August: 'Agosto',
    September: 'Setembro',
    October: 'Outubro',
    November: 'Novembro',
    December: 'Dezembro',
  };
  
  const monthMapReverse: Record<string, string> = Object.fromEntries(
    Object.entries(monthMap).map(([en, pt]) => [pt, en])
  );
  
const monthsPT = Object.values(monthMap);

const AlunosAulas: React.FC<{ id: any }> = ({ id }) => {
  const { data: session } = useSession();
  const [classDatesWithStatus, setClassDatesWithStatus] = useState<ClassDate[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(monthMap[new Date().toLocaleString('en-US', { month: 'long' })]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAllDates, setShowAllDates] = useState(false);

  // Fetch only the necessary data for the given ID
  const fetchData = useCallback(async () => {
    try {
      const userRef = doc(db, `users/${id}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const classesData = userData.Classes || {};
        const classDates: ClassDate[] = [];

        // Extract dates and statuses
        for (const yearKey of Object.keys(classesData)) {
          for (const monthKey of Object.keys(classesData[yearKey])) {
            const monthIndex = monthsPT.indexOf(monthMap[monthKey]); // Map Portuguese month to index
            for (const dayKey of Object.keys(classesData[yearKey][monthKey])) {
              const date = new Date(parseInt(yearKey), monthIndex, parseInt(dayKey));
              const status = classesData[yearKey][monthKey][dayKey];
              classDates.push({ date, status });
            }
          }
        }

        setClassDatesWithStatus(classDates);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [id]);

  const handleClassStatus = async (date: Date, action: string) => {
    try {
      const year = date.getFullYear();
      const month = monthMapReverse[selectedMonth]; // Convert Portuguese month to English
      const day = date.getDate().toString();

      const userRef = doc(db, `users/${id}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const classes = userDoc.data()?.Classes || {};
        classes[year] = classes[year] || {};
        classes[year][month] = classes[year][month] || {};
        classes[year][month][day] = action;

        await updateDoc(userRef, { Classes: classes });

        setClassDatesWithStatus((prevDates) =>
          prevDates.map((classDate) =>
            classDate.date.getTime() === date.getTime()
              ? { ...classDate, status: action }
              : classDate
          )
        );

        toast.success('Status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating class status:', error);
      toast.error('Failed to update status.');
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  return (
    <div className="flex flex-col items-center justify-center p-2 py-4 w-max h-[30vh] overflow-y-scroll">
      <p className="font-bold text-xl mb-3">Aulas de {selectedMonth} de {selectedYear}</p>
      {classDatesWithStatus
        .filter((classDate) => {
          const dateMonthPT = monthMap[classDate.date.toLocaleString('en-US', { month: 'long' })];
          const dateYear = classDate.date.getFullYear();
          return (
            dateMonthPT === selectedMonth &&
            dateYear === selectedYear &&
            classDate.status !== 'Modificada'
          );
        })
        .slice(0, showAllDates ? classDatesWithStatus.length : 10)
        .map((classDate, index) => (
          <ClassDateItem
            key={index}
            date={classDate.date}
            status={classDate.status}
            onDone={() => handleClassStatus(classDate.date, 'Feita')}
            onCancel={() => handleClassStatus(classDate.date, 'Cancelada')}
            onDelete={() => handleClassStatus(classDate.date, 'Modificada')}
          />
        ))}
      <Toaster />
    </div>
  );
};

export default AlunosAulas;
