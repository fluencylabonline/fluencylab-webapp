export default function Apostilas(){
    return(
        <div className=" w-[74rem] flex flex-col gap-3 items-start overflow-y-scroll h-[75vh] bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-md">
            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 p-2 rounded-md gap-2 items-center">
                <p className="font-bold p-2 pb-3 text-2xl">Inglês</p>
                <div className="pb-2">
                    <ul className="flex flex-row overflow-y-auto gap-3 w-full h-max">
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">First Steps</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">The Basics</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">All you need to know</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Travelling</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Practice Workbook</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Financial Analysis</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Fluency Grammar</li>
                    </ul>
                </div>
            </div>

            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 p-2 rounded-md gap-2 items-center">
                <p className="font-bold p-2 pb-3 text-2xl">Espanhol</p>
                <div className="pb-2">
                    <ul className="flex flex-row overflow-y-auto gap-3 w-full h-max">
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Primeros Pasos</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Lo Basico</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Tudo que precisas saber</li>
                    </ul>
                </div>
            </div>

            <div className="bg-fluency-blue-100 dark:bg-fluency-gray-800 p-2 rounded-md gap-2 items-center">
                <p className="font-bold p-2 pb-3 text-2xl">Libras</p>
                <div className="pb-2">
                    <ul className="flex flex-row overflow-y-auto gap-3 w-full h-max">
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Primeiros Passos</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">O Básico</li>
                        <li className="w-36 h-52 text-center px-2 bg-fluency-gray-200 dark:bg-fluency-gray-600 rounded-md flex flex-col items-center justify-center font-semibold">Interpretação e Tradução</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}