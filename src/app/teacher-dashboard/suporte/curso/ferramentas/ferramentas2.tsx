export default function Ferramentas2(){
    return(
        <div>
            <div className='w-full flex flex-col items-center rounded-md p-4 my-4 bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='text-2xl font-bold py-2'>Perguntas</p>
                <div className="lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start px-4">
                    <p className='w-fit p-6'>Preparamos um resumo em vídeo para te ajudar com esse assunto. Também é um vídeo curto, não se preocupa!</p>
                    <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/znTaPMDQ3r8?si=RJ_xv9DdpYha8_j-" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            </div>

            <div className='w-full flex flex-col items-center rounded-md p-4 my-4 bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                    <p className='text-2xl font-bold py-2'>Prática</p>
                <div className="lg:flex lg:flex-row-reverse md:flex md:flex-col flex flex-col gap-1 justify-between items-start px-4">
                    <p className='w-fit p-6'>Preparamos um resumo em vídeo para te ajudar com esse assunto. Também é um vídeo curto, não se preocupa!</p>
                    <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/3-tNLLsYffY?si=xRP3PfWQ_4uqv5_m" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )
}