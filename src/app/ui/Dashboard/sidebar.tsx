'use client';
import React, { useState } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';

export default function Sidebar({ isCollapsed, toggleSidebar, menuItems }: SidebarProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState('');
  const { data: session } = useSession();
  const userId = session?.user.id;
  const handleItemClick = (path: string) => {
    router.push(path);
    setSelectedItem(path);
  };

  const handleAvatarClick = () => {
    router.push('perfil');
  };

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

  return (
    <aside className={`fixed inset-y-0 left-0 bg-fluency-pages-light dark:bg-fluency-pages-dark shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : ''}`}>
        <div className="flex flex-col items-center space-y-10 w-full">
            <div onClick={toggleSidebar} className={`flex justify-center items-center p-4 text-center border-b ${isCollapsed ? '' : 'gap-3 px-6'}`}>
                {isCollapsed ? (
                ''
                ):(
                <div className='mt-1'>
                    <Image
                        className="h-8 w-auto mr-3"
                        src={Logo}
                        alt="FluencyLab"
                        priority
                        />
                </div>
                )}

                <button className="relative cursor-pointer group focus:outline-none">
                    <div className={`flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center ${isCollapsed ? '' : 'translate-x-0'}`}>
                        <div className={`bg-fluency-blue-700 h-1 w-7 rounded transform origin-left ${isCollapsed ? 'rotate-[42deg] w-2/3' : ''} transition-all duration-300 delay-150`}></div>
                        <div className={`bg-fluency-blue-700 h-1 w-7 rounded transform ${isCollapsed ? 'opacity-0' : 'translate-x-0'} transition-all duration-300`}></div>
                        <div className={`bg-fluency-blue-700 h-1 w-7 rounded transform origin-left ${isCollapsed ? '-rotate-[42deg] w-2/3' : ''} transition-all duration-300 delay-150`}></div>
                    </div>
                </button>
            </div>

            <div className="flex flex-col gap-2 items-center">
              {menuItems.map((item: ISidebarItem, index: number) => (
                <div
                  key={index}
                  className={`flex cursor-pointer gap-2 justify-center font-bold text-md text-fluency-text-light dark:text-fluency-text-dark py-3  ${selectedItem === item.path ? 'font-600 text-fluency-blue-400 dark:text-fluency-blue-400' : 'hover:bg-fluency-blue-200 hover:dark:bg-fluency-blue-500 rounded-md px-4'}`}                   
                  onClick={() => handleItemClick(item.path)}
                >
                  {item.icon}
                  {isCollapsed ? '' : <span>{item.name}</span>}
                </div>
              ))}
              

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
