import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/app/firebase';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { MdOutlineDarkMode } from 'react-icons/md';
import { PiSunDimDuotone } from 'react-icons/pi';
import Square from '../../../../../public/images/avatar/Ativo 16.png';
import Image from 'next/image';
import { useRouter } from "next/navigation";

type AvatarProps = {
    isCollapsed: boolean;
};

export default function Avatar({ isCollapsed }: AvatarProps) {
    const { data: session } = useSession();

    const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
    const [name, setName] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        if (session) {
            const { user } = session;
            const { name } = user; // Include id here
    
            setName(name || '');
    
            if (user.role) {
                setRole(user.role);
            }
    
            // Fetch profile picture URL from Firebase Storage
            const profilePictureRef = ref(storage, `profilePictures/${user.id}`);
            getDownloadURL(profilePictureRef)
                .then((url) => {
                    setProfilePictureURL(url);
                })
                .catch(() => {
                    setProfilePictureURL(null);
                });
        }
    }, [session]);

    const [isChecked, setIsChecked] = useState(true);

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('isDarkMode');
        setIsChecked(storedDarkMode === 'true');
    }, []);

    const handleCheckboxChange = () => {
        setIsChecked((prevChecked) => {
        const newChecked = !prevChecked;
        localStorage.setItem('isDarkMode', newChecked.toString());
        document.body.classList.toggle('dark', newChecked);
        return newChecked;
        });
    }; 
    
    function handleLogout() {
        signOut({ callbackUrl: '/signin' })
    }

    const router = useRouter();
    const userRole = session?.user.role;

    const handleAvatarClick = () => {
    if (userRole === 'teacher') {
        router.push('/teacher-dashboard/perfil');
    } else if (userRole === 'student') {
        router.push('/student-dashboard/perfil');
    } else if (userRole === 'admin') {
        router.push('/admin-dashboard/perfil');
    } else {
        router.push('perfil'); // default route if role is not defined or doesn't match
    }
    };
      
    return (
        <div>
            {isCollapsed ? (
                <div onClick={handleAvatarClick} className='justify-center items-center'>
                    {profilePictureURL ? (
                        <div className="cursor-pointer relative inline-block">
                            <img src={profilePictureURL} className="object-cover w-12 h-12 rounded-full" alt="Profile" />
                            <span className="absolute top-0 right-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                        </div>
                    ) : (
                        <div className="bg-gray-200 dark:bg-fluency-gray-800 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out mx-auto">
                            <div><FaUserCircle className='icon w-12 h-12 rounded-full'/></div>
                        </div>
                    )}
                </div>
            ) : (
                <div className='bg-fluency-blue-200 hover:bg-fluency-blue-300 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-[13.7rem] rounded-xl flex flex-col items-start justify-between overflow-visible'>
                    <div onClick={handleAvatarClick} className='w-[4.4rem] h-[4.4rem] rounded-full bg-fluency-bg-light shadow-md dark:bg-fluency-pages-dark items-center justify-center flex relative bottom-4 left-3'>
                    {profilePictureURL ? (
                        <div className="cursor-pointer relative inline-block">
                            <img src={profilePictureURL} className="object-cover min-w-[4.4rem] max-w-[4.4rem] h-[4.4rem] rounded-full" alt="Profile" />
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                        </div>
                    ):(
                        <FaUserCircle className='icon w-12 h-12 rounded-full'/>
                    )}
                    </div>
                    <div className='flex flex-col items-start relative bottom-3 left-3'>
                        <p className='text-lg font-bold z-10'>{name}</p>
                        <p className='text-xs relative bottom-2'>
                            {role === 'admin' ? 'Coordenador' : 
                            role === 'student' ? 'Aluno' :
                            role === 'teacher' ? 'Professor' :
                            (role?.charAt(0).toUpperCase() + role?.slice(1))}
                        </p>                    
                    </div>
                    <div className='flex flex-row gap-1 absolute top-2 right-3'>
                        <div className='bg-fluency-bg-light dark:bg-fluency-pages-dark rounded-lg items-center justify-center flex p-2'>
                            {isChecked ? (
                                <MdOutlineDarkMode onClick={handleCheckboxChange} className='w-4 h-4 text-purple-500 hover:text-purple-600 duration-300 ease-in-out transition-all'/>
                            ):(
                                <PiSunDimDuotone onClick={handleCheckboxChange} className='w-4 h-4 text-orange-500 hover:text-orange-600 duration-300 ease-in-out transition-all'/>
                            )}
                        </div>
                        <div className=' bg-fluency-bg-light dark:bg-fluency-pages-dark rounded-lg items-center justify-center flex p-2'>
                            <FiLogOut onClick={handleLogout} className='w-4 h-4 text-gray-500 hover:text-gray-600 duration-300 ease-in-out transition-all'/>
                        </div>
                    </div>
                    <Image className='w-14 absolute bottom-1 right-8' src={Square} alt="Profile" />
                </div>
            )}
        </div>
    );
}
