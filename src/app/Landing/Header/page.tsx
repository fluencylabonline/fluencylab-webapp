'use client';

//NextImports
import Link from 'next/link'

//Notification
import toast, { Toaster } from 'react-hot-toast';
const notify = () => toast('Here is your toast.');

export default function Header(){
    return(
        <div>

            <Link href={'/signin'} >Login Page</Link>
            <button onClick={notify}>Make me a toast</button>
            <Toaster />

        </div>
    );
}