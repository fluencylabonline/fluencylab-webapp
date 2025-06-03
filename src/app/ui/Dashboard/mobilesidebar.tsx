'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { MdOndemandVideo } from 'react-icons/md';

//IMAGES
import Logo from '../../../../public/images/brand/logo.png';
import Avatar from '@/app/ui/Components/Avatar/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

interface ISidebarItem {
  name: string;
  path: string;
  icon: any;
}

type MobileSidebarProps = {
  isMenuHidden: boolean;
  toggleMenu: () => void;
  menuItems: ISidebarItem[];
  isSidebarCollapsed: boolean;
};

export default function MobileSidebar({ 
  toggleMenu, 
  menuItems, 
  isMenuHidden, 
}: MobileSidebarProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState('');
  const { data: session } = useSession();
  const [classes, setClasses] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleItemClick = (path: string) => {
    router.push(path);
    setSelectedItem(path);
    startCloseAnimation();
  };

  const handleAulas = () => {
    router.push('cursos');
    startCloseAnimation();
  };

  const startCloseAnimation = (callback?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      toggleMenu();
      setIsClosing(false);
      callback?.();
    }, 300);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session?.user?.id) {
        try {
          const profile = doc(db, 'users', session.user.id);
          const docSnap = await getDoc(profile);
          if (docSnap.exists()) setClasses(docSnap.data().classes);
        } catch (error) {
          console.error("Error fetching document: ", error);
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (!isMenuHidden) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuHidden]);

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {!isMenuHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => startCloseAnimation()}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={!isMenuHidden ? { x: 0 } : { x: '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed inset-y-0 left-0 w-60 bg-fluency-pages-light dark:bg-fluency-gray-900 z-50 shadow-2xl ${isClosing ? 'animate-slide-out' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-fluency-gray-200 dark:border-fluency-gray-700">
            <div className="flex items-center">
              <Image
                className="h-7 w-auto"
                src={Logo}
                alt="FluencyLab"
                priority
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => startCloseAnimation()}
              className="p-2 rounded-full bg-fluency-blue-100 dark:bg-fluency-gray-700 text-fluency-blue-600 dark:text-fluency-blue-400"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 rounded-lg cursor-pointer py-3 px-4 mb-1 ${
                  selectedItem === item.path
                    ? 'bg-fluency-blue-100 dark:bg-fluency-blue-800 text-fluency-blue-600 dark:text-fluency-blue-300'
                    : 'text-fluency-text-light dark:text-fluency-text-dark hover:bg-fluency-blue-50 dark:hover:bg-fluency-gray-700'
                }`}
                onClick={() => handleItemClick(item.path)}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </motion.div>
            ))}

            {classes && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-lg cursor-pointer py-3 px-4 text-fluency-text-light dark:text-fluency-text-dark hover:bg-fluency-blue-50 dark:hover:bg-fluency-gray-700"
                onClick={handleAulas}
              >
                <MdOndemandVideo className="w-6 h-6" />
                <span className="font-medium">Cursos</span>
              </motion.div>
            )}
          </nav>

          <div className="px-2">
            <div className="fixed bottom-2">
              <Avatar isCollapsed={false} />
            </div>
          </div>
          
        </div>
      </motion.aside>
    </>
  );
}