import Image from 'next/image'
import About1 from '../../../../public/images/landing/about1.png'
import About2 from '../../../../public/images/landing/about2.png'
import About3 from '../../../../public/images/landing/about3.png'

export default function About(){
    return(
        <div id="aboutus" className="flex flex-col items-center bg-transparent dark:bg-transparent px-4 py-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="text-center max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
            <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-semibold text-fluency-text-dark bg-fluency-yellow-500 dark:bg-fluency-yellow-600 uppercase rounded-full"> VAMOS COMEÇAR! </p>
            </div>
            <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto"> Por que fazer aula com a gente </h2>
            <p className="text-base text-fluency-text-light dark:text-fluency-text-dark md:text-lg"> Vamos te mostrar apenas alguns dos motivos que você tem de pelo menos marcar umas aula teste com a gente! </p>
        </div>
        <div className="grid gap-8 row-gap-10 lg:grid-cols-3 text-center">
            {/* ABOUT 1 */}
            <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 sm:mx-auto sm:w-24 sm:h-24">
                    <Image className="h-auto w-20" src={About1} alt="FluencyLab" />
                </div>
                <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Sem demora para conversar</h6>
                <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Quando começa a fazer aula com a gente nossos professores vão te preparar para conseguir se comunicar dos níveis mais básicos até onde você quiser chegar logo nas primeiras semanas. </p>
            </div>

            {/* ABOUT 2 */}
            <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 sm:mx-auto sm:w-24 sm:h-24">
                    <Image className="h-auto w-20" src={About2} alt="FluencyLab" />
                </div>
                <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Material didático</h6>
                <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Quando começa a fazer aula com a gente nossos professores vão te preparar para conseguir se comunicar dos níveis mais básicos até onde você quiser chegar logo nas primeiras semanas. </p>
            </div>

            {/* ABOUT 3 */}
            <div className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 sm:mx-auto sm:w-24 sm:h-24">
                    <Image className="h-auto w-25" src={About3} alt="FluencyLab" />
                </div>
                <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">Aulas personalizadas</h6>
                <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200"> Quando começa a fazer aula com a gente nossos professores vão te preparar para conseguir se comunicar dos níveis mais básicos até onde você quiser chegar logo nas primeiras semanas. </p>
            </div>
        </div>
    </div>
    );
}