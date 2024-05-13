'use client'
import React from "react";

//Icons
import { CiCircleQuestion } from "react-icons/ci";
import Image from "next/image";

import Suporte1 from '../../../../public/images/suporte/suporte1.jpg';
import Suporte2 from '../../../../public/images/suporte/suporte2.jpg';
import Suporte3 from '../../../../public/images/suporte/suporte3.jpg';
import Suporte4 from '../../../../public/images/suporte/suporte4.jpg';
import Link from "next/link";

export default function Material(){
    return(
    <div className="flex flex-wrap justify-center gap-3 p-10">

      <Link href={"material/apostilas"}>
        <div className="w-80 h-auto rounded-md overflow-hidden bg-fluency-yellow-200 dark:bg-fluency-gray-700 hover:bg-fluency-yellow-300 hover:dark:bg-fluency-gray-800 flex flex-col items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
            <Image src={Suporte1} priority alt={"Suporte"} />
            <p className="p-3 flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Guidelines</span><CiCircleQuestion className="text-2xl font-bold hover:text-fluency-gray-100 hover:dark:text-blue-500 duration-200 ease-in-out cursor-pointer"/></p>
        </div>
      </Link>

      <Link href={"material/apostilas"}>
        <div className="w-80 h-auto rounded-md overflow-hidden bg-fluency-yellow-200 dark:bg-fluency-gray-700 hover:bg-fluency-yellow-300 hover:dark:bg-fluency-gray-800 flex flex-col items-center justify-between cursor-pointer duration-200 ease-in-out transition-all">
            <Image src={Suporte2} priority alt={"Suporte"} />
            <p className="p-3 flex flex-row gap-2 items-center justify-center"><span className="text-xl font-bold">Apostilas</span><CiCircleQuestion className="text-2xl font-bold hover:text-fluency-gray-100 hover:dark:text-blue-500 duration-200 ease-in-out cursor-pointer"/></p>
        </div>
      </Link>

    </div>
    );
}