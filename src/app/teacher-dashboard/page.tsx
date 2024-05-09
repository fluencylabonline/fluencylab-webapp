'use client'
import { signOut } from 'next-auth/react';
import { useRouter } from "next/navigation";

export default function TeacherDashboard(){
    const router = useRouter();
    function handleLogout() {
        signOut();
        router.push('/');
      }

    return(
        <div>
            TeacherDashboard
            <button onClick={handleLogout}>
                Sair
            </button>
        </div>
    )
}