'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdOndemandVideo } from 'react-icons/md';

interface ISidebarItem {
  name: string;
  path: string;
  icon: any;
}

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  menuItems: ISidebarItem[];
};

//IMAGES
import Logo from '../../../../public/images/brand/logo.png';
import Avatar from '@/app/ui/Components/Avatar/avatar';
import { db } from '@/app/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Sidebar({ isCollapsed, toggleSidebar, menuItems }: SidebarProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState('');
  const { data: session } = useSession();
  const [classes, setClasses] = useState('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (path: string) => {
    router.push(path);
    setSelectedItem(path);
  };

  const handleAulas = () => {
    router.push('cursos');
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

  return (
    <motion.aside
      ref={sidebarRef}
      initial={{ width: isCollapsed ? 64 : 240 }}
      animate={{ 
        width: isCollapsed ? 64 : 240,
        boxShadow: "0 10px 30px -12px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 bg-fluency-pages-light dark:bg-fluency-gray-900 z-50 overflow-hidden"
    >
      <div className="flex flex-col h-full py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-8">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  className="h-auto w-40"
                  src={Logo}
                  alt="FluencyLab"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-fluency-gray-100 dark:bg-fluency-gray-700 text-fluency-gray-600 dark:text-fluency-gray-400"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </motion.button>
        </div>

        {/* Navigation Items - Fixed the icon visibility issue */}
        <nav className="flex-1 space-y-1 px-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center rounded-lg cursor-pointer py-3 px-4 transition-colors duration-200 ${
                selectedItem === item.path
                  ? 'bg-fluency-blue-100 dark:bg-fluency-blue-800 text-fluency-blue-600 dark:text-fluency-blue-300'
                  : 'text-fluency-text-light dark:text-fluency-text-dark hover:bg-fluency-gray-50 dark:hover:bg-fluency-blue-700'
              } ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => handleItemClick(item.path)}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-semibold truncate"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.div>
          ))}

          {classes && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center rounded-lg cursor-pointer py-3 px-4 text-fluency-text-light dark:text-fluency-text-dark hover:bg-fluency-blue-50 dark:hover:bg-fluency-blue-700 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              onClick={handleAulas}
            >
              <MdOndemandVideo className="w-6 h-6" />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 font-medium truncate"
                >
                  Cursos
                </motion.span>
              )}
            </motion.div>
          )}
        </nav>

        <div className="px-2 mt-auto">
          <div className="fixed bottom-2">
            <Avatar isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}