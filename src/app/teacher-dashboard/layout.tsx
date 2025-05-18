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
import { PiStudentFill } from 'react-icons/pi';
import { TbMessageQuestion } from 'react-icons/tb';
import { MdOndemandVideo, MdOutlineClass, MdOutlineSupportAgent } from "react-icons/md";
import { LuGamepad2 } from 'react-icons/lu';

//Firebase
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

//Context
import { PomodoroProvider, usePomodoro } from '../context/PomodoroContext';
import PomodoroClock from '../ui/TipTap/Components/Pomodoro';
import { CallProvider, useCallContext } from '../context/CallContext';
import VideoHome from '../SharedPages/Video/VideoHome';

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
  const { isPomodoroVisible } = usePomodoro();
  const { callData, setCallData } = useCallContext();
  
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
      path: "/teacher-dashboard/alunos",
      icon: <PiStudentFill className="h-6 w-6"/>,
    },
    {
      name: "Prática",
      path: "/teacher-dashboard/pratica",
      icon: <LuGamepad2 className="h-6 w-6"/>,
    },
    {
      name: "Aulas Gravadas",
      path: "/teacher-dashboard/aulas-gravadas",
      icon: <MdOndemandVideo className="h-6 w-6"/>,
    },
    {
      name: "Suporte",
      path: "/teacher-dashboard/suporte",
      icon: <MdOutlineSupportAgent className="h-6 w-6"/>,
    },
    {
      name: "Suas aulas",
      path: "/teacher-dashboard/aulas",
      icon: <MdOutlineClass className="h-6 w-6"/>,
    },
  ];

  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== 'teacher') {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [session]);

  if (!session || session.user.role !== 'teacher') {
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