'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image"
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

//IMAGES
import Logo from '../../../../public/images/brand/logo.png';
import Avatar  from '@/app/ui/Components/Avatar/avatar'
import { BsFillDoorOpenFill } from 'react-icons/bs';
import { MdOndemandVideo } from 'react-icons/md';
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
    menuItems: any;
    isSidebarCollapsed: boolean
  };
  
  export default function MobileSidebar({ toggleMenu, menuItems, isMenuHidden, isSidebarCollapsed }: MobileSidebarProps) {
    const router = useRouter();
    const [selectedItem, setSelectedItem] = useState('');
    const { data: session } = useSession();
    const userId = session?.user.id;
    const userRole = session?.user.role;

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

    function handleLogout() {
      signOut({ callbackUrl: '/signin' })
    }

    const handleAulas = () => {
      router.push('aulas-gravadas');
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
    
    return(
        <aside className={`fixed inset-y-0 z-50 left-0 bg-fluency-pages-light dark:bg-fluency-pages-dark transition-all duration-300 ease-in-out w-60 ${isMenuHidden ? 'translate-x-0 shadow-xl shadow-fluency-gray-300 dark:shadow-fluency-gray-500' : '-translate-x-full '}`}>
              <div className="flex justify-center p-4 text-center border-b items-center gap-5 ml-2">
                  <Image
                    className="h-7 w-auto mr-3"
                    src={Logo}
                    alt="FluencyLab"
                    priority
                    />

                  <div onClick={toggleMenu} className='flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center translate-x-0'>
                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[42deg] translate-y-[9px] w-4 transition-all duration-300 delay-150'></div>
                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                    <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[42deg] -translate-y-[9px] w-4 transition-all duration-300 delay-150'></div>
                  </div>
              </div>
              <div className="flex flex-col gap-2 items-center mt-4">
              {menuItems.map((item: ISidebarItem, index: number) => (
                <div
                  key={index}
                  className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === item.path ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}                   
                  onClick={() => {
                    handleItemClick(item.path);
                    toggleMenu();
                }}
                >
                  {item.icon}<span>{item.name}</span>
                </div>
              ))}
              
              {classes && (
              <div onClick={() => {handleAulas(); toggleMenu();}} className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}>
                <MdOndemandVideo className='w-6 h-6'/> Aulas Gravadas
              </div>)}

              <div>
                  <div className={`mt-8 flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === 'sair' ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`} onClick={handleLogout}>
                    <BsFillDoorOpenFill className='w-6 h-6'/> Sair
                  </div>
              </div>
              <div className='fixed bottom-2' onClick={() => {handleAvatarClick(); toggleMenu()}}>
                <Avatar isCollapsed={false} />
              </div>

          </div>
        </aside>
    );
}