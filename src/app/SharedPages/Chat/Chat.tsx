'use client'
import { db } from '@/app/firebase';
import LoadingAnimation from '@/app/ui/Animations/LoadingAnimation';
import { collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

interface Aluno {
    id: string;
    email: string;
    name: string;
    userName: string;
    teacherEmails: string[];
    professor: string;
    professorId: string;
    profilePicUrl?: string;
    status: string;
}  

export default function ChatHome(){
    const { data: session } = useSession();
    const [teacherId, setTeacherId] = useState(false);
    const [students, setStudents] = useState<Aluno[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(''); 

    const fetchData = useCallback((teacherId: string) => {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            where('role', '==', 'student'),
            where('professorId', '==', teacherId)
        );
    
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            let studentList: any[] = [];
            
            const studentDataPromises = querySnapshot.docs.map(async (doc) => {
                const studentId = doc.id;
                const storage = getStorage();
                const userProfilePicRef = ref(storage, `profilePictures/${studentId}`);
                let url: string | null = null;
                try {
                    url = await getDownloadURL(userProfilePicRef);
                } catch (error) {
                    console.log('Sem foto de perfil');
                }
                try {
                    const userDoc = await getDoc(doc.ref);
                    const userData = userDoc.data() as Aluno;
                    return {
                        id: studentId,
                        name: userData.name,
                        email: userData.email,
                        userName: userData.userName,
                        teacherEmails: userData.teacherEmails,
                        profilePicUrl: url,
                        status: userData.status,
                        showAllDates: false
                    };
                    
                } catch (error) {
                    console.error('Error fetching profile picture for student:', error);
                    return null;
                }
            });
            const studentData = await Promise.all(studentDataPromises);
            studentList = studentData.filter((data) => data !== null);
            setStudents(studentList);
        });
    
        return () => unsubscribe();
    }, [setStudents]);
    
    useEffect(() => {
        if (session && !teacherId) {
            fetchData(session.user.id);
            setTeacherId(true);
        }
    }, [session, teacherId, fetchData]);

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return(
        <div>
            {filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center h-[70vh] min-w-full z-30">
                <LoadingAnimation />
            </div>
            ):(
            <div className='flex flex-row items-center justify-between p-4 w-full h-[90vh]'>
                <div className='h-[75vh] overflow-y-auto'>
                    {filteredStudents.map((student) => (
                        <div className='flex flex-col items-start justify-start gap-2 font-bold' key={student.id}>
                            <p key={student.id}>{student.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    )
}