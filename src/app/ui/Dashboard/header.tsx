'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { RiNotification4Line } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';

type HeaderProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
};

export default function Header({ toggleSidebar }: HeaderProps) {
    const pathname = usePathname();

    // Detect the base dashboard path (e.g., teacher-dashboard, student-dashboard, admin-dashboard)
    const baseDashboardPath = pathname.split('/')[1];
    const cleanedPathname = pathname.replace(`/${baseDashboardPath}`, 'Home');
    const segments = cleanedPathname.split('/').filter(segment => segment !== '');

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

    const [notifications, setNotifications] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Bottom sheet animation variants
    const bottomSheetVariants = {
        hidden: { y: "100%", transition: { duration: 0.3 } },
        visible: { y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    };

    // Backdrop animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
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
    
    return (
        <div>
            <header className="w-full mt-1 py-1 lg:pr-2 md:pr-2 pr-0">
                <nav className="flex flex-row justify-between w-full">
                    <div onClick={toggleSidebar} className='lg:hidden md:hidden flex flex-col justify-between w-6 h-6 transform transition-all duration-300 origin-center -translate-x-4'>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[42deg] w-4 transition-all duration-300 delay-150'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[42deg] w-4 transition-all duration-300 delay-150'></div>
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
                                        <span className="cursor-pointer text-sm font-bold text-fluency-blue-700 dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500">
                                            {segment === 'Home' ? <HiHome /> : capitalizeFirstLetter(decodeURIComponent(segment))}
                                        </span>
                                    </Link>
                                </li>
                                
                            ))}
                        </ol>
                    </div>

                    <h1 className="lg:text-xl md:text-lg font-semibold mr-36 -mt-1 lg:block md:block hidden">
                        {capitalizeFirstLetter(decodeURIComponent(segments[segments.length - 1]))}
                    </h1>
                  
                    <div className='relative'>
                        <RiNotification4Line 
                            className={`w-7 h-7 ${unreadCount > 0 ? 'text-yellow-500 cursor-pointer hover:text-yellow-600 duration-300 ease-in-out transition-all' : 'text-green-500 cursor-pointer hover:text-green-600 duration-300 ease-in-out transition-all'}`}
                            onClick={() => setIsModalOpen(true)}
                        />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>   
                </nav>
            </header>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        key="backdrop"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-end z-50"
                    >
                        <motion.div
                            key="modal"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={bottomSheetVariants}
                            className="bg-white dark:bg-gray-800 w-full max-w-[80vw] min-h-[70vh] max-h-[90vh] rounded-t-2xl p-4 overflow-y-auto shadow-lg"
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={{ top: 0, bottom: 0.2 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) {
                                    closeModal();
                                }
                            }}
                        >
                            <div className="flex justify-center items-center mb-4">
                                <h1 className="text-xl font-bold">Notificações</h1>
                                <IoClose 
                                    onClick={closeModal} 
                                    className="icon cursor-pointer absolute top-0 right-4 mt-2 ml-2 transition-all text-gray-500 hover:text-blue-600 w-7 h-7 ease-in-out duration-300" 
                                />
                            </div>
                            <div className="w-full flex flex-col overflow-y-auto justify-center mt-4">
                                {getFilteredNotifications().length > 0 ? (
                                    getFilteredNotifications().map((notification) => (
                                        <div 
                                            key={notification.id} 
                                            className={`flex flex-row items-start w-[97%] justify-between p-3 mb-1 rounded-lg ${getBackgroundColor(notification.status)}`}
                                        >
                                            <p>{notification.content}</p>                
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-300">Nenhuma notificação nova para mostrar.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
