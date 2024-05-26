'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";

import FluencyButton from "./ui/Components/Button/button";


export default function NotFound(){
    const router = useRouter();

    const handleGoBack = () => {
        router.back(); // This will navigate to the previous page in the browser's history
    };

    return(
        <section className="w-screen h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark flex items-center justify-center">
            <div className="flex items-center px-6 py-12">
                <div>
                    <p className="text-sm font-medium text-blue-500 dark:text-blue-400">404 error</p>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">Página não encontrada</h1>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">Desculpe, a página que está procurando não existe ou foi movida.</p>

                    <div className="flex items-center mt-6 gap-x-3">
                        <FluencyButton onClick={handleGoBack}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:rotate-180">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                            </svg>

                            <span>Voltar</span>
                        </FluencyButton>

                        <Link href={'/'}>
                            <FluencyButton>
                                Página Inicial
                            </FluencyButton>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}