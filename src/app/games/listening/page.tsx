'use client'
import ListeningComponent from "@/app/SharedPages/Games/listening/component/listeningcomponent";
import { ToggleDarkMode } from "@/app/ui/Components/Buttons/ToggleDarkMode";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";

export default function ListeningPage(){
    return(
        
        <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark h-screen overflow-hidden overflow-y-auto">
            <div className='flex flex-row gap-3 justify-between px-4 py-2 items-center'>
                <Link href="/games">
                  <button className=" text-gray-800 dark:text-white hover:text-fluency-blue-500 dark:hover:text-fluency-blue-500 ease-in-out duration-300">
                  <BsArrowLeft className='lg:w-9 lg:h-9 w-5 h-5' />
                  </button>
                </Link>

                <p className="font-semibold text-xl">Pratica de Ouvido</p>

                <div className=''>
                  <ToggleDarkMode />
                </div>
            </div>

                <div className='m-5 flex items-center text-black dark:text-white overflow-hidden'>
                    
                    <ListeningComponent audioId={"mUzYGy4xnLlIwxumdhL0"} />

                </div>

        </div>
    )
}