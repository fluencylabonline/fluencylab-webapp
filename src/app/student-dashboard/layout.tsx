'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

import MobileHeader from '@/app/ui/Dashboard/mobileheader';
import MobileSidebar from '@/app/ui/Dashboard/mobilesidebar';
import Sidebar from "@/app/ui/Dashboard/sidebar";
import Header from '@/app/ui/Dashboard/header';
import RedirectinAnimation from '../ui/Animations/RedirectinAnimation';

// Icons
import { PiStudentFill } from 'react-icons/pi';
import { LuGamepad2 } from 'react-icons/lu';
import { IoChatbubblesOutline } from 'react-icons/io5';

interface ISidebarItem {
  name: string;
  path: string;
  icon: any;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin')
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMenuHidden, setIsMenuHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMenu = () => {
    setIsMenuHidden(!isMenuHidden);
  };

  const sidebarProps = {
    isCollapsed: isSidebarCollapsed,
    isMenuHidden: isMenuHidden,
    toggleSidebar: toggleSidebar,
    toggleMenu: toggleMenu,
    isMobile: isMobile,
  };

  const menuItems: ISidebarItem[] = [
    {
      name: "Alunos",
      path: "/student-dashboard/caderno",
      icon: <PiStudentFill className="h-6 w-6"/>,
    },
    {
      name: "Prática",
      path: "/student-dashboard/pratica",
      icon: <LuGamepad2 className="h-6 w-6"/>,
    },
    {
      name: "Remarcar Aula",
      path: "/student-dashboard/remarcacao",
      icon: <IoChatbubblesOutline className="h-6 w-6"/>,
    },
  ];

  if (!session || session.user.role !== "student") {
    return <RedirectinAnimation />;
  }

  return (
    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark'>
      {isMobile ? (
        <div>
          <div>
            <MobileSidebar isSidebarCollapsed={false} {...sidebarProps} menuItems={menuItems}/>
          </div>

          <div className={`p-1 min-h-screen overflow-y-hidden transition-all duration-300 ease-in-out`}>
            <MobileHeader {...sidebarProps} />
            {children}
          </div>
        </div>
      ) : (
        <div>
          <div>
            <Sidebar {...sidebarProps} menuItems={menuItems}/>
          </div>

          <div
            className={`p-1 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'ml-[5rem]' : 'ml-[14.5rem] pl-4'
            }`}
          >
            <Header {...sidebarProps} />
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
