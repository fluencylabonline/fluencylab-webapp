'use client';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

import MobileSidebar from '@/app/ui/Dashboard/mobilesidebar';
import Sidebar from "@/app/ui/Dashboard/sidebar";
import Header from '@/app/ui/Dashboard/header'; // Using the unified Header
import RedirectinAnimation from '../ui/Animations/RedirectinAnimation';

// Icons
import { MdOndemandVideo} from "react-icons/md"
import { PiCertificateBold, PiChalkboardTeacherFill, PiStudentFill } from 'react-icons/pi';
import { TbFileReport, TbPigMoney } from 'react-icons/tb';
import { LuBookCopy } from 'react-icons/lu';
import { FiUserPlus } from 'react-icons/fi';

//Firebase
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

//Context
import { PomodoroProvider, usePomodoro } from '../context/PomodoroContext';
import PomodoroClock from '../ui/TipTap/Components/Pomodoro';
import { CallProvider, useCallContext } from '../context/CallContext';
import VideoHome from '../SharedPages/Video/VideoHome';
import { Toaster } from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';

interface ISidebarItem {
  name: string;
  path: string;
  icon: any;
}

function LayoutContent({
  isMobile,
  isSidebarCollapsed,
  sidebarProps,
  menuItems,
  children,
}: {
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  sidebarProps: any;
  menuItems: ISidebarItem[];
  children: React.ReactNode;
}) {
  const { isPomodoroVisible } = usePomodoro();
  const { callData, setCallData } = useCallContext();
  
  return (
    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark'>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg",
        }}
      />
      
      {isMobile ? (
        <div>
          <MobileSidebar isSidebarCollapsed={false} {...sidebarProps} menuItems={menuItems} />
          <div className={`p-1 min-h-screen overflow-y-hidden transition-all duration-300 ease-in-out`}>
            {/* Use unified Header with mobile toggle */}
            <Header 
              isMobile 
              toggleSidebar={sidebarProps.toggleMenu} 
            />
            {isPomodoroVisible && <PomodoroClock />}
            {children}
          </div>
        </div>
      ) : (
        <div>
          <Sidebar {...sidebarProps} menuItems={menuItems} />
          <div
            className={`p-1 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "ml-[4rem]" : "ml-[14.5rem] pl-3"
            }`}
          >
            {/* Use unified Header with desktop toggle */}
            <Header 
              toggleSidebar={sidebarProps.toggleSidebar} 
              isMobile={false} 
            />
            {isPomodoroVisible && <PomodoroClock />}
            {callData?.callId && <VideoHome />}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  useEffect(() => {
    const updateUserStatus = async (status: string) => {
      if (session) {
        const { user } = session;
        const userDocRef = doc(db, 'users', user.id);

        try {
          await updateDoc(userDocRef, { status });
          console.log(`User status updated to ${status}`);
        } catch (error) {
          console.error(`Error updating user status to ${status}:`, error);
        }
      }
    };

    const handleBeforeUnload = () => {
      updateUserStatus('offline');
    };

    updateUserStatus('online');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

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
    toggleSidebar,
    toggleMenu,
    isMobile,
  };

  const menuItems: ISidebarItem[] = [
    {
      name: "Alunos",
      path: "/admin-dashboard/alunos",
      icon: <GraduationCap className="h-6 w-6"/>,
    },
    {
      name: "Professores",
      path: "/admin-dashboard/professores",
      icon: <PiChalkboardTeacherFill className="h-6 w-6"/>,
    },
    {
      name: "Financeiro",
      path: "/admin-dashboard/finances",
      icon: <TbPigMoney className="h-6 w-6"/>,
    },
    {
      name: "Criar Usuário",
      path: "/admin-dashboard/criar-usuario",
      icon: <FiUserPlus className="h-6 w-6"/>,
    },
    {
      name: "Emitir Certificado",
      path: "/admin-dashboard/certificados",
      icon: <PiCertificateBold  className="h-6 w-6"/>,
    },
    {
      name: "Apostilas",
      path: "/admin-dashboard/material",
      icon: <LuBookCopy  className="h-6 w-6"/>,
    },
    {
      name: "Cursos",
      path: "/admin-dashboard/cursos",
      icon: <MdOndemandVideo className="h-6 w-6"/>,
    },
    {
      name: "Relatórios",
      path: "/admin-dashboard/aula-teste",
      icon: <TbFileReport  className="h-6 w-6"/>,
    },
  ];

  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [session]);

  if (!session || session.user.role !== 'admin') {
    return showAnimation ? <RedirectinAnimation /> : null;
  }

  return (
    <CallProvider>
      <PomodoroProvider>
        <LayoutContent
          isMobile={isMobile}
          isSidebarCollapsed={isSidebarCollapsed}
          sidebarProps={sidebarProps}
          menuItems={menuItems}
        >
          {children}
        </LayoutContent>
      </PomodoroProvider>
    </CallProvider>
  );
}