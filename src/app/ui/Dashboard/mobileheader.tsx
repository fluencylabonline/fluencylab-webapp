'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CgMenuLeft } from 'react-icons/cg';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi';
import { db } from '@/app/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { RiNotification4Line } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { useSession } from 'next-auth/react';

type MobileHeaderProps = {
  isCollapsed: boolean;
  toggleMenu: () => void;
  isMobile: boolean;
};

export default function MobileHeader({ toggleMenu }: MobileHeaderProps) {
    const pathname = usePathname();

    // Split pathname into segments
    const baseDashboardPath = pathname.split('/')[1];
    const cleanedPathname = pathname.replace(`/${baseDashboardPath}`, 'Home');
    const segments = cleanedPathname.split('/').filter(segment => segment !== '');

    // Function to capitalize the first letter of a string
    const capitalizeFirstLetter = (str: string) => {
        return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Function to construct the full path for a given segment
    const constructPath = (index: number) => {
        const pathSegments = segments.slice(0, index + 1);
        if (pathSegments[0] === 'Home') {
            pathSegments[0] = baseDashboardPath;
        }
        const constructedPath = pathSegments.join('/');
        return `/${constructedPath}`;
    };

    const [isAnimating, setIsAnimating] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const closeModal = () => {
        setIsAnimating(true); // Trigger the slide-down animation
        setTimeout(() => {
          setIsModalOpen(false); // Close the modal after animation
          setIsAnimating(false);
        }, 300); // Match the animation duration
      };
      
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'Notificacoes'));
                const fetchedNotifications = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const unreadNotifications = notifications.filter((notification) => notification.status === 'unread');
    const unreadCount = unreadNotifications.length;
    const statusColors = {
        notice: 'font-semibold text-white bg-fluency-yellow-600 dark:bg-fluency-yellow-700 hover:bg-fluency-yellow-500 hover:dark:bg-fluency-yellow-800 duration-300 easy-in-out transition-all',
        information: 'font-semibold text-white bg-fluency-blue-600 dark:bg-fluency-blue-700 hover:bg-fluency-blue-500 hover:dark:bg-fluency-blue-800 duration-300 easy-in-out transition-all',
        tip: 'font-semibold text-white bg-fluency-green-700 dark:bg-fluency-green-800 hover:bg-fluency-green-600 hover:dark:bg-fluency-green-800 duration-300 easy-in-out transition-all'
      };

    const getBackgroundColor = (status: any) => {
        if (status.notice) return statusColors.notice;
        if (status.information) return statusColors.information;
        if (status.tip) return statusColors.tip;
        return 'bg-white'; // Default color if no status matches
      };

    const { data: session } = useSession();
    const getFilteredNotifications = () => {
        if (!session?.user) return notifications;
            const { role } = session.user;
        if (role === 'teacher') {
            return notifications.filter(notification => notification.sendTo.professors);
            }
        if (role === 'student') {
            return notifications.filter(notification => notification.sendTo.students);
            }
        return notifications;
    };

return(
    <div>
        <header className="w-full">
            <nav className="flex flex-row justify-between items-center w-full">
                <div onClick={toggleMenu} className='lg:hidden md:hidden flex'>
                    <CgMenuLeft className='w-5 h-5' />
                </div>
                <div>
                    <ol className="inline-flex items-center space-x-1">
                        {segments.map((segment, index) => (
                            <li key={index} className="inline-flex items-center">
                                {index !== 0 && (
                                    <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                    </svg>
                                )}
                                <Link href={constructPath(index)}>
                                    <span className="cursor-pointer text-xs font-bold text-fluency-blue-700 dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500">
                                        {segment === 'Home' ? <HiHome /> : capitalizeFirstLetter(decodeURIComponent(segment))}
                                    </span>
                                </Link>
                            </li>
                            
                        ))}
                    </ol>
                </div>

                <h1 className="lg:text-xl md:text-lg font-semibold mr-36 -mt-1 lg:block md:block hidden">{capitalizeFirstLetter(segments[segments.length - 1])}</h1>
                  
                <div className='relative'>
                    <RiNotification4Line 
                        className={`w-5 h-5 ${unreadCount > 0 ? 'text-yellow-500 cursor-pointer hover:text-yellow-600 duration-300 ease-in-out transition-all' : 'text-green-500 cursor-pointer hover:text-green-600 duration-300 ease-in-out transition-all'}`}
                        onClick={() => setIsModalOpen(true)}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div> 
                
            </nav>
        </header>

        {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50">
                <div
                    className={`bg-white dark:bg-gray-800 w-full min-h-[70vh] max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg transform transition-transform duration-300 ease-in-out ${
                    isAnimating ? 'animate-slideDown' : 'animate-slideUp'
                    }`}
                    >
                    <div className="flex justify-center items-center mb-4">
                        <h1 className="text-xl font-bold">Notificações</h1>
                        <IoClose onClick={closeModal} className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300" />
                    </div>
                    <div className="w-full flex flex-col overflow-y-auto justify-center mt-4">
                        {getFilteredNotifications().length > 0 ? (
                        getFilteredNotifications().map((notification) => (
                            <div key={notification.id} className={`flex flex-row items-start w-[97%] justify-between p-3 mb-1 rounded-lg ${getBackgroundColor(notification.status)}`}>
                                <p>{notification.content}</p>                
                            </div>
                            ))
                        ) : (
                        <p className="text-center text-gray-500 dark:text-gray-300">Nenhuma notificação nova para mostrar.</p>
                            )}
                    </div>
                </div>
            </div>
        )}

        </div>
    );
}