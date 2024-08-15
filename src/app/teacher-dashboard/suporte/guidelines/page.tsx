'use client'
import FluencyButton from "@/app/ui/Components/Button/button";
import { useRef } from "react";
import {toast, Toaster} from 'react-hot-toast'

export default function Guidelines() {
    const blockquoteRef = useRef<HTMLQuoteElement >(null);

    const handleCopy = () => {
        if (blockquoteRef.current) {
            const blockquoteText = blockquoteRef.current.innerText;
            navigator.clipboard.writeText(blockquoteText)
                .then(() => {
                    toast.success("Texto copiado!");
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                });
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-2 p-8 text-black dark:text-white">
            <Toaster />
            <div className="w-full mx-auto p-6 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Critérios para remarcação de aula online</h2>
                <p className="mb-4">
                    O professor pode considerar os seguintes critérios para decidir se precisa remarcar uma aula online para um aluno:
                </p>
                <ul className="list-disc list-inside text-gray-800 dark:text-gray-100 mb-4 space-y-2">
                    <li>Problemas técnicos de conexão que impeçam a realização da aula de forma satisfatória.</li>
                    <li>Conflitos de horário inesperados que impossibilitem a participação do aluno.</li>
                    <li>Questões de saúde ou emergências pessoais que tornem inviável a participação do aluno na aula.</li>
                    <li>Ausência do aluno sem aviso prévio ou justificativa adequada.</li>
                </ul>
                <p className="mb-4">
                    É importante que o professor avalie cada caso individualmente e se comunique com o aluno para encontrar a melhor solução para ambas as partes.
                </p>
                <p>
                    Lembre-se que é responsabilidade do aluno comparecer à aula, mas também muitas semanas sem estudar podem desmotivar o aluno a ponto de desistir do curso.
                </p>
            </div>

            <div className="w-full mx-auto p-6 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Se perguntarem sobre a escola</h2>
                <p className="mb-4">
                    Se alguém perguntar sobre o nosso curso, podemos responder com entusiasmo. Destacamos que o nosso diferencial são as aulas totalmente personalizadas às necessidades do aluno. Por ser individual, o professor consegue identificar como ajudar o aluno e qual o melhor método para ele aprender, e o aluno não se sente pressionado, aprendendo no seu ritmo.
                </p>
                <p className="mb-4">
                    Além disso, oferecemos suporte contínuo aos alunos, ajudando-os a alcançar seus objetivos e maximizar seu potencial. Estamos comprometidos em oferecer uma experiência educacional excepcional e ansiamos por receber novos alunos em nosso curso.
                </p>
                <p className="  font-semibold mb-2">Você pode enviar essa mensagem que explica melhor como funciona o curso:</p>
                
                <blockquote ref={blockquoteRef} className="pl-4 border-l-4 border-fluency-blue-500 text-gray-800 dark:text-gray-100 mb-4">
                    <p className="mb-2">As informações do curso para facilitar 😄</p>
                    <p className="mb-2">
                        O método é sempre personalizado para o aluno, adaptado às necessidades, ritmo e objetivos de cada um. Como exemplo, temos alunos que trabalham como programadores e desejam trabalhar para empresas estrangeiras, então as aulas são focadas nisso. Outros alunos querem morar fora e precisam aprender o inglês do dia a dia, então focamos nisso. (No caso dos que aprendem Libras ou Espanhol, a mesma coisa, vamos personalizar nossas aulas).
                    </p>
                    <p className="mb-2">
                        O valor do curso é <span className="font-semibold">R$ 165,00</span> mensalmente, com direito a uma aula por semana com duração de 45 minutos a 1 hora. Oferecemos suporte durante todo o período do curso, tanto para tirar dúvidas como para ajudar a se organizar e estudar melhor.
                    </p>
                    <p className="mb-2">
                        O material não tem custo adicional. Tentamos tornar as aulas o mais dinâmicas possível, ajudando os alunos não só com o idioma em si, mas também em como estudar, como criar um ambiente de imersão propício para isso, e assim por diante.
                    </p>
                    <p className="mb-2">Quando podemos marcar uma aula teste para você?</p>
                </blockquote>

                <FluencyButton
                    onClick={handleCopy} variant="confirm">
                    Copiar
                </FluencyButton>

                <p className="mt-4">
                    Caso a pessoa interessada tenha mais dúvidas ou interesse no curso, explicamos que a parte administrativa da escola poderá ajudar. Direcione-as para entrar em contato conosco.
                </p>
            </div>

            <div className="w-full h-full mx-auto p-6 bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-md">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Material da Aula</h2>
                <div className="h-[50vh]">
                    <iframe className="h-full" src='https://drive.google.com/embeddedfolderview?id=1Ol6dRuL4EMp1SnyWgt8huco0jomGtt3H#grid' width="100%" height="100%" frameBorder={0}></iframe>
                </div>
            </div>

        </div>
    );
}
