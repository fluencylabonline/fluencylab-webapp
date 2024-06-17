'use client'
import { useSession } from "next-auth/react"
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Remarcacao(){
    const { data: session } = useSession();
    const [calendarLink, setCalendarLink] = useState('');
    useEffect(() => {
        const fetchCalendarLink = async () => {
            if (session && session.user && session.user.professorId) {
                try {
                    const professorDoc = doc(db, 'users', session.user.professorId);
                    const docSnap = await getDoc(professorDoc);
                    if (docSnap.exists()) {
                        setCalendarLink(docSnap.data().calendarLink);
                    } else {
                        console.log("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching document: ", error);
                }
            }
        };

        fetchCalendarLink();
    }, [session]);

    return(
        <div className="overflow-y-hidden p-1">
            <iframe
                src={calendarLink}
                style={{ border: '0', transition: 'opacity 0.5s ease'}}
                className={`w-full h-[90vh] overflow-x-hidden dark:bg-gray-400 rounded-md text-black dark:text-white`}
                title="Google Calendar Appointment Scheduling"
            ></iframe>
        </div>
    )
}