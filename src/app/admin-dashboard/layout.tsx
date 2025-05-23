'use client';
import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

import MobileHeader from '@/app/ui/Dashboard/mobileheader';
import MobileSidebar from '@/app/ui/Dashboard/mobilesidebar';
import Sidebar from "@/app/ui/Dashboard/sidebar";
import Header from '@/app/ui/Dashboard/header';
import RedirectinAnimation from '../ui/Animations/RedirectinAnimation';

// Icons
import { MdOndemandVideo} from "react-icons/md"
import { PiCertificateBold, PiChalkboardTeacherFill, PiStudentFill } from 'react-icons/pi';
import { TbFileReport, TbMessageQuestion, TbPigMoney } from 'react-icons/tb';
import { LuBookCopy } from 'react-icons/lu';
import { FiUserPlus } from 'react-icons/fi';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PomodoroProvider, usePomodoro } from '../context/PomodoroContext';
import PomodoroClock from '../ui/TipTap/Components/Pomodoro';

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
  children, // Pass children directly here, not as a prop
}: {
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  sidebarProps: any;
  menuItems: ISidebarItem[];
  children: React.ReactNode; // Add children as a direct prop to LayoutContent
}) {
  const { isPomodoroVisible } = usePomodoro(); // Move the hook outside the conditional

  return (
    <div className='bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark'>
      {isMobile ? (
        <div>
          <div>
            <MobileSidebar isSidebarCollapsed={false} {...sidebarProps} menuItems={menuItems} />
          </div>
          <div className={`p-1 min-h-screen overflow-y-hidden transition-all duration-300 ease-in-out`}>
            <MobileHeader {...sidebarProps} />
            {isPomodoroVisible && <PomodoroClock />}
            {children}
          </div>
        </div>
      ) : (
        <div>
          <div>
            <Sidebar {...sidebarProps} menuItems={menuItems} />
          </div>
          <div
            className={`p-1 min-h-screen transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'ml-[5rem]' : 'ml-[14.5rem] pl-4'
            }`}
          >
            <Header {...sidebarProps} />
            {isPomodoroVisible && <PomodoroClock />}
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
      icon: <PiStudentFill className="h-6 w-6"/>,
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
      path: "/admin-dashboard/apostilas",
      icon: <LuBookCopy  className="h-6 w-6"/>,
    },
    {
      name: "Aulas Gravadas",
      path: "/admin-dashboard/aulas-gravadas",
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
    <PomodoroProvider>
      <LayoutContent
        isMobile={isMobile}
        isSidebarCollapsed={isSidebarCollapsed}
        sidebarProps={sidebarProps}
        menuItems={menuItems}
      >
        {children} {/* Render children directly here */}
      </LayoutContent>
    </PomodoroProvider>
  );
}