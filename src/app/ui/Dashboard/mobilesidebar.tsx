import Image from "next/image"
import Logo from '../../../../public/images/brand/logo.png';

interface ISidebarItem {
    name: string;
    path: string;
    icon: any;
  }

type MobileSidebarProps = {
    isMenuHidden: boolean;
    toggleMenu: () => void;
    menuItems: any;
  };
  
  export default function MobileSidebar({ toggleMenu, menuItems, isMenuHidden }: MobileSidebarProps) {
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
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[42deg] translate-y-[9px] w-5 transition-all duration-300 delay-150'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300'></div>
                        <div className='bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[42deg] -translate-y-[9px] w-5 transition-all duration-300 delay-150'></div>
                      </div>

                  </div>
        </aside>
    );
}