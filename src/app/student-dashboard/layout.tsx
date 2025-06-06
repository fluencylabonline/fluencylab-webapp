"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation"; // Import usePathname

import MobileSidebar from "@/app/ui/Dashboard/mobilesidebar";
import Sidebar from "@/app/ui/Dashboard/sidebar";
import Header from "@/app/ui/Dashboard/header";
import RedirectinAnimation from "../ui/Animations/RedirectinAnimation";

// Icons
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { PomodoroProvider, usePomodoro } from "../context/PomodoroContext";
import PomodoroClock from "../ui/TipTap/Components/Pomodoro";
import { CallProvider, useCallContext } from "../context/CallContext";
import VideoHome from "../SharedPages/Video/VideoHome";
import { Toaster } from "react-hot-toast";
import { CalendarRange, Dices, GraduationCap } from "lucide-react";
import ContratoNotificationModal from "../ui/Components/Contract/ContratoNotificationModal";
import { MdOndemandVideo } from "react-icons/md";

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
            <ContratoNotificationModal />
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
            <Header
              toggleSidebar={sidebarProps.toggleSidebar}
              isMobile={false}
            />
            <ContratoNotificationModal />
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

  // State to store the last time the login date was saved
  const [lastLoginSaveTime, setLastLoginSaveTime] = useState<number | null>(
    null
  );

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

  const [classes, setClasses] = useState('');
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
    
  // New useEffect for saving last login date every 15 minutes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const saveLoginDatePeriodically = async () => {
      if (session && session.user.id) {
        const currentTime = new Date().getTime();
        // Check if 15 minutes (900,000 milliseconds) have passed since the last save
        if (
          !lastLoginSaveTime ||
          currentTime - lastLoginSaveTime >= 15 * 60 * 1000
        ) {
          const userDocRef = doc(db, "users", session.user.id);
          const loginTime = new Date().toISOString(); // UTC ISO string

          try {
            await updateDoc(userDocRef, {
              lastLoginDates: arrayUnion({
                time: loginTime,
                status: "online", // Or a different status if desired for these periodic updates
              }),
            });
            setLastLoginSaveTime(currentTime); // Update the last saved time
            console.log("Last login date updated:", loginTime);
          } catch (error) {
            console.error(
              "Error updating last login date periodically:",
              error
            );
          }
        }
      }
    };

    // Set an interval to run every minute (or more frequently if needed for precision)
    // The actual update will only happen every 15 minutes due to the condition inside
    intervalId = setInterval(saveLoginDatePeriodically, 60 * 1000); // Check every minute

    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, [session, lastLoginSaveTime]); // Depend on session and lastLoginSaveTime to re-run if they change

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
    ...(classes !== '' ? [{
      name: "Cursos",
      path: "/student-dashboard/cursos",
      icon: <MdOndemandVideo className="h-6 w-6" />,
    }] : [])
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