import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/app/firebase';
import { FaUserCircle } from 'react-icons/fa';

type AvatarProps = {
    isCollapsed: boolean;
};

export default function Avatar({ isCollapsed }: AvatarProps) {
    const { data: session } = useSession();

    const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');

    useEffect(() => {
        if (session) {
            const { user } = session;
            const { name, email } = user; // Include id here
    
            setName(name || '');
            setEmail(email || '');
    
            if (user.role) {
                setRole(user.role);
            }
    
            // Fetch profile picture URL from Firebase Storage
            const profilePictureRef = ref(storage, `profilePictures/${user.id}`);
            getDownloadURL(profilePictureRef)
                .then((url) => {
                    setProfilePictureURL(url);
                })
                .catch((error) => {
                    console.error('Error fetching profile picture URL:', error);
                    setProfilePictureURL(null);
                });
        }
    }, [session]);
    

    return (
        <div>
            {isCollapsed ? (
                <div className='justify-center items-center'>
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
                <div className='bg-fluency-blue-200 hover:bg-fluency-blue-300 dark:bg-fluency-gray-800 hover:dark:bg-fluency-gray-900 transition-all ease-in-out duration-300 cursor-pointer font-semibold text-fluency-text-light dark:text-fluency-text-dark w-[13.5rem] rounded-xl p-3 flex flex-row items-center gap-2'>
                    <div className='flex flex-col items-center'>
                        {profilePictureURL ? (
                            <div className="cursor-pointer relative inline-block">
                                <img src={profilePictureURL} className="object-cover min-w-14 h-14 rounded-full" alt="Profile" />
                                <span className="absolute top-0 right-0 w-4 h-4 bg-fluency-green-700 border-2 border-white rounded-full"></span>
                            </div>
                        ) : (
                            <div className="bg-gray-400 dark:bg-fluency-gray-800 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out mx-auto">
                                <div><FaUserCircle className='text-fluency-bg-light icon w-14 h-14 rounded-full'/></div>
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col text-left'>
                        <p className='text-sm text-nowrap'>{name}</p>
                        <p className='text-[0.6rem] font-normal'>{email}</p>
                        <p className='text-xs'>{role?.charAt(0).toUpperCase() + role?.slice(1)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
