import Image from "next/image";
import Team1 from '../../../../public/images/avatar/team-1.svg';
import Team2 from '../../../../public/images/avatar/team-2.svg';
import Team3 from '../../../../public/images/avatar/team-3.svg';
import Team4 from '../../../../public/images/avatar/team-4.svg';
import Team5 from '../../../../public/images/avatar/team-5.svg';
import Team9 from '../../../../public/images/avatar/team-9.svg';
import Team7 from '../../../../public/images/avatar/team-7.svg';
import Team8 from '../../../../public/images/avatar/team-8.svg';

export default function Team(){
return(
        <div id="ourteam" className="bg-transparent dark:bg-trasnparent px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="text-center max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
                <div>
                <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark uppercase rounded-full">
                    Nosso time
                </p>
                </div>
                <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">
                <span className="relative inline-block">
                    <svg viewBox="0 0 52 24" fill="currentColor" className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-fluency-light-blue lg:w-32 lg:-ml-28 lg:-mt-10 sm:block">
                    <defs>
                        <pattern id="247432cb-6e6c-4bec-9766-564ed7c230dc" x="0" y="0" width=".135" height=".30">
                        <circle cx="1" cy="1" r=".7"></circle>
                        </pattern>
                    </defs>
                    <rect fill="url(#247432cb-6e6c-4bec-9766-564ed7c230dc)" width="52" height="24"></rect>
                    </svg>
                </span>
                Agora vem conhecer nosso time excepcional!
                </h2>
                <p className="text-base text-fluency-text-light dark:text-fluency-text-dark md:text-lg">
                Aqui você vai encontrar pessoas dedicadas, que amam ensinar e que têm como objetivo tornar sua jornada o mais agradável possível.
                </p>
            </div>


            <div className="flex flex-wrap justify-center gap-10 mx-auto lg:max-w-screen-lg md:gap-20">
              {/*PERSON1*/}
              <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team2}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Matheus Fernandes</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professor de Inglês e Libras</p>
                </div>
              </div>

              {/*PERSON2*/}
              <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team5}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Flora Passos</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professora de Inglês</p>
                </div>
              </div>

              {/*PERSON3*/}
              <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team1}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Jamille Kausque</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professora de Inglês</p>
                </div>
              </div>

              {/*PERSON5*/}
              <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team9}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Gideon</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professor de Inglês</p>
                </div>
              </div>

                {/*PERSON6*/}
                <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team4}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Luara</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professora de Inglês</p>
                </div>
              </div>

                {/*PERSON7*/}
                <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team7}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Giulia</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Professora de Inglês para crianças</p>
                </div>
              </div>

              {/*PERSON8*/}
              <div className="flex flex-col items-center">
                  <Image
                  className="object-cover w-20 h-20 mb-2 rounded-full shadow"
                  src={Team8}
                  alt="FluencyLab"
                  />
                <div className="flex flex-col items-center">
                  <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">Deise</p>
                  <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">Equipe de Apoio</p>
                </div>
              </div>

            </div>
            
        </div>
    );
}