'use client';
import Link from "next/link";
import Image from "next/image"
import Lost from '../../public/images/404/perdido.gif';

import { useRouter } from "next/navigation";

import { BiHome } from "react-icons/bi";
import { BsDoorOpenFill } from "react-icons/bs";


export default function NotFound(){
    const router = useRouter();

    const handleGoBack = () => {
        router.back(); // This will navigate to the previous page in the browser's history
    };

    return(
        <section className="w-screen h-screen bg-fluency-gray-400 flex items-center justify-center">
            <div className="flex items-center px-6 py-12">
                <div>
                    <p className="text-sm font-medium text-white">404 error</p>
                    <h1 className="mt-3 text-2xl font-semibold text-white dark:text-white md:text-3xl">Página não encontrada</h1>
                    <p className="mt-4 text-xl text-white">Desculpe, a página que está procurando não existe ou foi movida.</p>

                    <div className="flex items-center mt-6 gap-x-3">
                        <button className="flex flex-row gap-2 items-center justify-center p-3 px-8 bg-fluency-gray-300 hover:bg-fluency-gray-500 duration-300 ease-in-out transition-all font-bold text-white rounded-md" onClick={handleGoBack}>
                            <BsDoorOpenFill  className="w-6 h-auto" />
                            <span>Voltar</span>
                        </button>

                        <Link href={'/'}>
                            <button className="flex flex-row gap-2 items-center justify-center p-3 px-8 bg-fluency-gray-300 hover:bg-fluency-gray-500 duration-300 ease-in-out transition-all font-bold text-white rounded-md">
                                <BiHome className="w-6 h-auto"/>
                                Página Inicial
                            </button>
                        </Link>
                    </div>
                </div>
                
            </div>
            <Image src={Lost} alt="Lost"/>
        </section>
    );
}