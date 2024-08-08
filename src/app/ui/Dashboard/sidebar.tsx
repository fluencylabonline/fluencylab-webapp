'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image"
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

interface ISidebarItem {
  name: string;
  path: string;
  icon: any;
}

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  menuItems: any;
};

//IMAGES
import Logo from '../../../../public/images/brand/logo.png';
import Avatar  from '@/app/ui/Components/Avatar/avatar'
import { BsFillDoorOpenFill } from 'react-icons/bs';
import { db } from '@/app/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { MdOndemandVideo } from 'react-icons/md';
import Link from 'next/link';

export default function Sidebar({ isCollapsed, toggleSidebar, menuItems }: SidebarProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState('');
  const { data: session } = useSession();
  const userId = session?.user.id;
  const userRole = session?.user.role; // Assuming role is available in session.user.role

  const handleItemClick = (path: string) => {
    router.push(path);
    setSelectedItem(path);
  };

  const handleAvatarClick = () => {
    if (userRole === 'teacher') {
      router.push('/teacher-dashboard/perfil');
    } else if (userRole === 'student') {
      router.push('/student-dashboard/perfil');
    } else if (userRole === 'admin') {
      router.push('/admin-dashboard/perfil');
    } else {
      router.push('perfil'); // default route if role is not defined or doesn't match
    }
  };
  
  const handleAulas = () => {
    router.push('aulas-gravadas');
  }

  async function handleLogout() {
    // Sign out the user
    await signOut({ callbackUrl: '/signin' });

    // Update user status to offline in Firestore
    if (session) {
      const updateUserStatus = async () => {
        const { user } = session;
        const userDocRef = doc(db, 'users', user.id);

        try {
          // Update the status field to 'online'
          await updateDoc(userDocRef, {
            status: 'offline'
          });
          console.log('User status updated to offline');
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      };

      updateUserStatus();
    }
  }

  const [classes, setClasses] = useState('');
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (session && session.user && session.user.id) {
        try {
          const profile = doc(db, 'users', session.user.id);
          const docSnap = await getDoc(profile);
          if (docSnap.exists()) {
            setClasses(docSnap.data().classes);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching document: ", error);
        }
      }
    };

    fetchUserInfo();
  }, [session]);

  
  return (
    <aside className={`fixed inset-y-0 left-0 bg-fluency-pages-light dark:bg-fluency-pages-dark shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : ''}`}>
        <div className="flex flex-col items-center space-y-10 w-full">
            <div onClick={toggleSidebar} className={`flex justify-center items-center p-3 text-center ${isCollapsed ? '' : 'gap-3 px-4'}`}>
                {isCollapsed ? (
                ''
                ):(
                <div>
                    <Image
                        className="h-auto w-40 mr-1"
                        src={Logo}
                        alt="FluencyLab"
                        priority
                        />
                </div>
                )}

                <button className="relative cursor-pointer group focus:outline-none">
                    <div className={`flex flex-col justify-between w-8 h-[22px] transform transition-all duration-300 origin-center ${!isCollapsed ? '' : 'translate-x-0'}`}>
                        <div className={`bg-fluency-blue-600 h-[3.6px] w-8 rounded transform origin-left ${!isCollapsed ? 'rotate-[42deg] w-2/3' : ''} transition-all duration-300 delay-150`}></div>
                        <div className={`bg-fluency-blue-600 h-[3.1px] w-8 rounded transform ${!isCollapsed ? 'opacity-0' : 'translate-x-0'} transition-all duration-300`}></div>
                        <div className={`bg-fluency-blue-600 h-[3.6px] w-8 rounded transform origin-left ${!isCollapsed ? '-rotate-[42deg] w-2/3' : ''} transition-all duration-300 delay-150`}></div>
                    </div>
                </button>
            </div>

            <div className="flex flex-col gap-2 items-center">
              {menuItems.map((item: ISidebarItem, index: number) => (
                <div
                  key={index}
                  className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-2  ${selectedItem === item.path ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400 bg-fluency-blue-200 dark:bg-fluency-blue-500 rounded-md px-4' : ' hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}                   
                  onClick={() => handleItemClick(item.path)}
                >
                  {item.icon}
                  {isCollapsed ? '' : <span>{item.name}</span>}
                </div>
              ))}
              

              {classes && (
                <>
                  {isCollapsed ? (
                      <div onClick={handleAulas} className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}>
                        <MdOndemandVideo className='w-6 h-6'/>
                      </div>
                  ) : (
                      <div onClick={handleAulas} className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}>
                        <MdOndemandVideo className='w-6 h-6'/> Aulas Gravadas
                      </div>
                  )}
                </>
              )}


              <div>
                {isCollapsed ? (
                  <div className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`} onClick={handleLogout}>
                    <BsFillDoorOpenFill className='w-6 h-6'/>
                  </div>
                ) : (
                  <div className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`} onClick={handleLogout}>
                    <BsFillDoorOpenFill className='w-6 h-6'/> Sair
                  </div>
                )}
              </div>

            <div className='fixed bottom-2' onClick={handleAvatarClick}>
              <Avatar isCollapsed={isCollapsed} />
            </div>
          </div>

      </div>
    </aside>
  );
}
