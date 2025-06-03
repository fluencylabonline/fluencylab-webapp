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
import { CgMenuLeft } from 'react-icons/cg';

type HeaderProps = {
  toggleSidebar: () => void;
  isMobile?: boolean;
};

export default function Header({ toggleSidebar, isMobile = false }: HeaderProps) {
  const pathname = usePathname();
  const baseDashboardPath = pathname.split('/')[1];
  const cleanedPathname = pathname.replace(`/${baseDashboardPath}`, 'Home');
  const segments = cleanedPathname.split('/').filter(segment => segment !== '');
  
  const capitalizeFirstLetter = (str: string) => {
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const constructPath = (index: number) => {
    const pathSegments = segments.slice(0, index + 1);
    if (pathSegments[0] === 'Home') {
      pathSegments[0] = baseDashboardPath;
    }
    return `/${pathSegments.join('/')}`;
  };

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  // Animation variants
  const bottomSheetVariants = {
    hidden: { y: "100%", transition: { duration: 0.3 } },
    visible: { y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

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

  const unreadNotifications = notifications.filter(notification => notification.status === 'unread');
  const unreadCount = unreadNotifications.length;
  
  const statusColors = {
    notice: 'bg-fluency-orange-100 dark:bg-fluency-orange-900 border-l-4 border-fluency-orange-500',
    information: 'bg-fluency-blue-100 dark:bg-fluency-blue-900 border-l-4 border-fluency-blue-500',
    tip: 'bg-fluency-green-100 dark:bg-fluency-green-900 border-l-4 border-fluency-green-500'
  };

  const getNotificationStyle = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-white dark:bg-gray-700';
  };

  const { data: session } = useSession();
  const getFilteredNotifications = () => {
    if (!session?.user) return notifications;
    const { role } = session.user;
    
    if (role === 'teacher') {
      return notifications.filter(notification => notification.sendTo?.professors);
    }
    if (role === 'student') {
      return notifications.filter(notification => notification.sendTo?.students);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="w-full">
      <header className={`py-1 ${isMobile ? 'px-2' : 'px-2'}`}>
        <nav className="flex items-center justify-between w-full">
          {/* Menu button */}
          <button 
            onClick={toggleSidebar}
            className={`${isMobile ? 'block' : 'hidden'} lg:hidden md:hidden`}
            aria-label="Toggle menu"
          >
            <CgMenuLeft className="w-6 h-6 text-fluency-blue-800 dark:text-fluency-gray-100" />
          </button>

          {/* Breadcrumbs */}
          <div className={`flex-1 min-w-0 ${isMobile ? 'ml-2' : ''}`}>
            <div className="flex items-center">
              <ol className="inline-flex items-center space-x-1 md:space-x-3 overflow-x-auto whitespace-nowrap">
                {segments.map((segment, index) => (
                  <li key={index} className="inline-flex items-center">
                    {index !== 0 && (
                      <svg className="rtl:rotate-180 w-3 h-3 mr-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                      </svg>
                    )}
                    <Link href={constructPath(index)}>
                      <span className={`text-sm font-medium hover:text-fluency-blue-600 transition-colors ${
                        index === segments.length - 1 
                          ? 'text-fluency-blue-700 dark:text-fluency-blue-400 font-semibold' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {segment === 'Home' ? (
                          <HiHome className="w-4 h-4" />
                        ) : (
                          capitalizeFirstLetter(decodeURIComponent(segment))
                        )}
                      </span> 
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative ml-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <RiNotification4Line 
                className={`w-6 h-6 ${unreadCount > 0 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>   
        </nav>
      </header>

      {/* Notifications Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="backdrop"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-end z-50"
            onClick={closeModal}
          >
            <motion.div
              key="modal"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={bottomSheetVariants}
              className="bg-white dark:bg-fluency-gray-900 w-full max-w-2xl mx-auto rounded-t-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-fluency-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Notificações</h2>
                <button 
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close notifications"
                >
                  <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="max-h-[70vh] overflow-y-auto p-4">
                {filteredNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg ${getNotificationStyle(notification.status)} transition-transform hover:scale-[1.02]`}
                      >
                        <p className="text-gray-700 dark:text-gray-200">{notification.content}</p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp?.toDate()).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto bg-gray-200 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <RiNotification4Line className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação nova para mostrar.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}