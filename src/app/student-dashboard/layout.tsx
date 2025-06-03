"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation"; // Import usePathname

import MobileSidebar from "@/app/ui/Dashboard/mobilesidebar";
import Sidebar from "@/app/ui/Dashboard/sidebar";
import Header from "@/app/ui/Dashboard/header";
import RedirectinAnimation from "../ui/Animations/RedirectinAnimation";

// Icons
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { PomodoroProvider, usePomodoro } from "../context/PomodoroContext";
import PomodoroClock from "../ui/TipTap/Components/Pomodoro";
import { CallProvider, useCallContext } from "../context/CallContext";
import VideoHome from "../SharedPages/Video/VideoHome";
import { Toaster } from "react-hot-toast";
import { CalendarRange, Dices, GraduationCap } from "lucide-react";

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
  hideLayoutElements, // New prop
}: {
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  sidebarProps: any;
  menuItems: ISidebarItem[];
  children: React.ReactNode;
  hideLayoutElements: boolean; // New prop type
}) {
  const { isPomodoroVisible } = usePomodoro();
  const { callData, setCallData } = useCallContext();

  // If hideLayoutElements is true, just render children without sidebar/header
  if (hideLayoutElements) {
    return (
      <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark min-h-screen">
        <Toaster
          position="top-center"
          toastOptions={{
            className:
              "bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg",
          }}
        />
        {/* Potentially add full-screen styling here if children don't inherently fill */}
        {isPomodoroVisible && <PomodoroClock />}
        {callData?.callId && <VideoHome />}

        <div className="w-full h-full min-h-screen">{children}</div>
      </div>
    );
  }

  return (
    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "bg-white dark:bg-fluency-gray-800 text-gray-900 dark:text-white shadow-lg",
        }}
      />
      {/* Render the sidebar and header based on the device type */}
      {isMobile ? (
        <div>
          <div>
            <MobileSidebar
              isSidebarCollapsed={false}
              {...sidebarProps}
              menuItems={menuItems}
            />
          </div>
          <div
            className={`p-1 min-h-screen overflow-y-hidden transition-all duration-300 ease-in-out`}
          >
            {/* FIX: Pass toggleMenu function from sidebarProps */}
            <Header isMobile toggleSidebar={sidebarProps.toggleMenu} />
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
              isSidebarCollapsed ? "ml-[4rem]" : "ml-[14.5rem] pl-3"
            }`}
          >
            {/* FIX: Pass toggleSidebar function from sidebarProps */}
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
      redirect("/signin");
    },
  });

  const pathname = usePathname(); // Get the current pathname

  // Define the base path that should trigger full-screen mode
  const fullScreenBasePath = "/student-dashboard/caderno/aula/";

  // Determine if layout elements should be hidden
  // This checks if the pathname starts with the fullScreenBasePath
  const hideLayoutElements = pathname.startsWith(fullScreenBasePath);

  useEffect(() => {
    const updateUserStatus = async (status: string) => {
      if (session) {
        const { user } = session;
        const userDocRef = doc(db, "users", session.user.id);
         const loginTime = new Date().toISOString(); // UTC ISO string

  try {
    await updateDoc(userDocRef, { 
      status,
      lastLoginDates: arrayUnion({ 
        time: loginTime,
        status
      })
    });
  } catch (error) {
    console.error(`Error updating user status:`, error);
  }
      }};

    const handleBeforeUnload = () => {
      updateUserStatus("offline");
    };

    updateUserStatus("online");
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // FIX: Define toggle functions properly
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMenu = () => setIsMenuHidden(!isMenuHidden);

  const sidebarProps = {
    isCollapsed: isSidebarCollapsed,
    isMenuHidden: isMenuHidden,
    toggleSidebar,
    toggleMenu,
    isMobile,
  };

  const menuItems: ISidebarItem[] = [
    {
      name: "Caderno",
      path: "/student-dashboard/caderno",
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      name: "Prática",
      path: "/student-dashboard/pratica",
      icon: <Dices className="h-6 w-6" />,
    },
    {
      name: "Remarcação",
      path: "/student-dashboard/remarcacao",
      icon: <CalendarRange className="h-6 w-6" />,
    },
  ];

  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    if (!session || session.user.role !== "student") {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [session]);

  if (!session || session.user.role !== "student") {
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
          hideLayoutElements={hideLayoutElements} // Pass the new prop
        >
          {children}
        </LayoutContent>
      </PomodoroProvider>
    </CallProvider>
  );
}
