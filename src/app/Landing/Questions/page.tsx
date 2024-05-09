'use client';
import React, { useState } from "react";

interface AccordionItemProps {
  header: string;
  text: string;
}

function Questions() {
  return (
    <section id="faq" className="flex flex-col items-center relative z-20 overflow-hidden bg-transparent dark:bg-transparent pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]">
      <div className="container mx-auto">

        <div className="text-center max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12">
          <div>
            <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider bg-fluency-red-500 hover:bg-fluency-red-600 text-fluency-text-dark uppercase rounded-full">
              Tem alguma dúvida?
            </p>
          </div>
          <h2 className="w-xl mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">
            <span className="relative inline-block">
              <svg viewBox="0 0 51 24" className="absolute top-0 left-0 hidden w-32 -mt-8 -ml-20 text-fluency-red-500 d lg:w-32 lg:-ml-28 lg:-mt-10 sm:block">
                <defs>
                  <pattern id="247432cb-6e6c-4bec-9766-564ed7c230dc" x="0" y="0" width=".135" height=".30">
                    <circle cx="1" cy="1" r=".7"></circle>
                  </pattern>
                </defs>
                <rect fill="url(#247432cb-6e6c-4bec-9766-564ed7c230dc)" width="52" height="24"></rect>
              </svg>
            </span>
            Algumas perguntas frequentes que podem ser úteis
          </h2>
        </div>

        <div className="lg:-mx-4 flex flex-wrap sm:mx-1">
          <div className="w-full px-4 lg:w-1/2">
            <AccordionItem
              header="Como eu sei o meu nível no idioma?"
              text="Nós oferecemos um nivelamento que vai te ajudar a encontrar seu atual nível no idioma e como pode progredir partindo dele."
            />
            <AccordionItem
              header="Posso fazer aula individual ou apenas em grupos?"
              text="No geral, preferimos que o aluno faça aulas individuais. Assim, oferecemos um serviço muito mais personalizado e direcionado. Mesmo assim, aceitamos aulas de duplas dependendo do caso."
            />
            <AccordionItem
              header="Quais idiomas oferecem?"
              text="Por enquanto, temos aula de Língua Inglesa, Espanhola e Língua Brasileira de Sinais (LIBRAS)."
            />
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <AccordionItem
              header="Preciso comprar o material para as aulas?"
              text="Não, todo o material necessário vai ser providenciado para você sem custo durante as aulas."
            />
            <AccordionItem
              header="Como funcionam os horários?"
              text="Nós oferecemos horários bem flexíveis que cobrem praticamente todas as rotinas e horários. Tudo depende da disponibilidade do aluno."
            />
            <AccordionItem
              header="Como vai ser a primeira aula?"
              text="A primeira lição vai envolver uma introdução ao seu professor e à plataforma. O alinhamento de objetivos e planos, um nivelamento espefício, e além disso, o professor vai se adequar às suas preferências de estudo."
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-[-1]">
        <svg
          width="1440"
          height="886"
          viewBox="0 0 1440 886"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.5"
            d="M193.307 -273.321L1480.87 1014.24L1121.85 1373.26C1121.85 1373.26 731.745 983.231 478.513 729.927C225.976 477.317 -165.714 85.6993 -165.714 85.6993L193.307 -273.321Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="1308.65"
              y1="1142.58"
              x2="602.827"
              y2="-418.681"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#3056D3" stopOpacity="0.36" />
              <stop offset="1" stopColor="#F5F2FD" stopOpacity="0" />
              <stop offset="1" stopColor="#F5F2FD" stopOpacity="0.096144" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};


const AccordionItem: React.FC<AccordionItemProps> = ({ header, text }) => {
  const [active, setActive] = useState(false);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setActive(!active);
  };

  return (
    <div className="mb-8 w-full rounded-lg bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark p-4 shadow-[0px_20px_95px_0px_rgba(201,203,204,0.30)] dark:shadow-[0px_20px_95px_0px_rgba(0,0,0,0.30)] sm:p-8 lg:px-6 xl:px-8">
      <button
        className={`faq-btn flex w-full text-left`}
        onClick={handleToggle}
      >
        <div className="mr-5 flex h-10 w-full max-w-[40px] items-center justify-center rounded-lg text-primary bg-fluency-gray-100 dark:bg-fluency-bg-light">
          <svg
            className={`fill-primary stroke-primary duration-200 ease-in-out ${
              active ? "rotate-180" : ""
            }`}
            width="17"
            height="10"
            viewBox="0 0 17 10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.28687 8.43257L7.28679 8.43265L7.29496 8.43985C7.62576 8.73124 8.02464 8.86001 8.41472 8.86001C8.83092 8.86001 9.22376 8.69083 9.53447 8.41713L9.53454 8.41721L9.54184 8.41052L15.7631 2.70784L15.7691 2.70231L15.7749 2.69659C16.0981 2.38028 16.1985 1.80579 15.7981 1.41393C15.4803 1.1028 14.9167 1.00854 14.5249 1.38489L8.41472 7.00806L2.29995 1.38063L2.29151 1.37286L2.28271 1.36548C1.93092 1.07036 1.38469 1.06804 1.03129 1.41393L1.01755 1.42738L1.00488 1.44184C0.69687 1.79355 0.695778 2.34549 1.0545 2.69659L1.05999 2.70196L1.06565 2.70717L7.28687 8.43257Z"
              fill=""
              stroke=""
            />
          </svg>
        </div>

        <div className="w-full">
          <h4 className="mt-1 text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark">
            {header}
          </h4>
        </div>
      </button>

      <div
        className={`pl-[62px] duration-500 ease-in-out ${
          active ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden transition-all duration-400`}
      >
        <p className="py-3 text-base leading-relaxed text-fluency-text-light dark:text-fluency-text-dark">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Questions;