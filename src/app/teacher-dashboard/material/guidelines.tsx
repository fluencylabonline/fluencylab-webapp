import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";

export default function Guidelines(){
    return(
        <div className="w-[74rem] flex flex-col gap-3 items-start overflow-y-scroll h-[75vh] bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-md">
            <Accordion>
                <AccordionItem className='font-semibold' indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack /> )} key="1" aria-label="Critérios para aulas de idioma online individual" title="Critérios para aulas de idioma online individual">
                    <div className="px-4 py-2">
                        <h1 className="text-3xl font-bold mb-4">Como escrever relatórios</h1>
                        <p className="mb-4">Escrever relatórios é uma habilidade essencial em muitos contextos profissionais. Um relatório bem escrito é claro, objetivo e apresenta informações de forma organizada. Aqui estão algumas dicas para escrever relatórios de maneira eficaz:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Entenda a finalidade do relatório: Antes de começar a escrever, tenha uma compreensão clara do propósito do relatório. Isso ajudará você a definir o conteúdo e a estrutura adequados.</li>
                            <li>Use uma linguagem clara e concisa: Evite termos técnicos desnecessários. Use frases curtas e diretas para transmitir suas ideias de forma clara e compreensível. Tente escrever um parágrafo curto para cada aula.</li>
                        </ul>
                        <p className="mb-4">Ao seguir essas dicas, você estará no caminho certo para escrever relatórios eficazes.</p>

                        <h2 className="text-xl font-bold mb-2">Exemplo de Relatório de Aula Online</h2>
                        <p className="mb-4">Relatório - João Silva</p>

                        <div className="mb-8">
                            <p><span className="font-semibold">Horário da aula marcada:</span> Quarta às 19hrs</p>
                            <p><span className="font-semibold">Dia 4/10 às 19h -</span> Foi o primeiro dia de aula do João. Ele nunca estudou inglês antes, mas agora precisa aprender para o trabalho. Começamos com os pronomes pessoais. No início, ele estava inseguro, mas aos poucos foi se soltando. Ele gosta do Coldplay, então no futuro incluiremos suas músicas nas aulas.</p>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem className='font-semibold' indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack /> )} key="2" aria-label="Critérios para remarcação de aula online" title="Critérios para remarcação de aula online">
                    <div className="px-4 py-2">
                        <h2 className="text-xl font-bold mb-2">Critérios para remarcação de aula online</h2>
                        <p>O professor pode considerar os seguintes critérios para decidir se precisa remarcar uma aula online para um aluno:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Problemas técnicos de conexão que impeçam a realização da aula de forma satisfatória.</li>
                            <li>Conflitos de horário inesperados que impossibilitem a participação do aluno.</li>
                            <li>Questões de saúde ou emergências pessoais que tornem inviável a participação do aluno na aula.</li>
                            <li>Ausência do aluno sem aviso prévio ou justificativa adequada.</li>
                        </ul>
                        <p>É importante que o professor avalie cada caso individualmente e se comunique com o aluno para encontrar a melhor solução para ambas as partes.</p>
                        <p>Lembre-se que é responsabilidade do aluno comparecer à aula, mas também muitas semanas sem estudar podem desmotivar o aluno a ponto de desistir do curso.</p>
                    </div>
                </AccordionItem>

                <AccordionItem className='font-semibold' indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack /> )} key="3" aria-label="Se alguém perguntar sobre o nosso curso" title="Se alguém perguntar sobre o nosso curso">
                    <div className="px-4 py-2">
                        <p>Se alguém perguntar sobre o nosso curso, podemos responder com entusiasmo. Destacamos que o nosso diferencial são as aulas totalmente personalizadas às necessidades do aluno. Por ser individual, o professor consegue identificar como ajudar o aluno e qual o melhor método para ele aprender, e o aluno não se sente pressionado, aprendendo no seu ritmo.</p>
                        <p>Além disso, oferecemos suporte contínuo aos alunos, ajudando-os a alcançar seus objetivos e maximizar seu potencial. Estamos comprometidos em oferecer uma experiência educacional excepcional e ansiamos por receber novos alunos em nosso curso.</p>
                        <p>Você pode enviar essa mensagem que explica melhor como funciona o curso:</p>

                        <h2 className="text-xl font-bold mt-4 mb-2">As informações do curso para facilitar 😄</h2>
                        <p>O método é sempre personalizado para o aluno, adaptado às necessidades, ritmo e objetivos de cada um. Como exemplo, temos alunos que trabalham como programadores e desejam trabalhar para empresas estrangeiras, então as aulas são focadas nisso. Outros alunos querem morar fora e precisam aprender o inglês do dia a dia, então focamos nisso. (No caso dos que aprendem Libras, Espanhol ou Alemão, a mesma coisa, vamos personalizar nossas aulas).</p>
                        <p>O valor do curso é R$ 150,00 mensalmente, com direito a uma aula por semana com duração de 45 minutos a 1 hora. Oferecemos suporte durante todo o período do curso, tanto para tirar dúvidas como para ajudar a se organizar e estudar melhor.</p>
                        <p>O material não tem custo adicional. Tentamos tornar as aulas o mais dinâmicas possível, ajudando os alunos não só com o idioma em si, mas também em como estudar, como criar um ambiente de imersão propício para isso, e assim por diante.</p>
                        <p>Quando podemos marcar uma aula teste para você?</p>
                        <p>Caso a pessoa interessada tenha mais dúvidas ou interesse no curso, explicamos que a parte administrativa da escola poderá ajudar. Direcione-as para entrar em contato conosco.</p>
                    </div>
                </AccordionItem>

                <AccordionItem className='font-semibold' indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack /> )} key="4" aria-label="Critérios para aulas de idioma online" title="Critérios para aulas de idioma online">
                    <div className="px-4 py-2">
                        <h2 className="text-xl font-bold mb-2">Critérios para aulas de idioma online individual</h2>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Planejamento de aulas personalizado, levando em consideração as necessidades e objetivos específicos do aluno.</li>
                            <li>Utilização de recursos adequados para aulas virtuais, como plataformas de videochamada e materiais interativos.</li>
                            <li>Fornecimento de feedback contínuo ao aluno, destacando pontos fortes e áreas de melhoria.</li>
                            <li>Estabelecimento de metas realistas e mensuráveis para o progresso do aluno.</li>
                            <li>Adaptação do conteúdo e atividades de acordo com o nível de proficiência e interesse do aluno.</li>
                            <li>Estímulo à participação ativa do aluno durante as aulas, por meio de exercícios de conversação, leitura e escrita.</li>
                            <li>Promoção de um ambiente de aprendizagem positivo e encorajador, incentivando o aluno a se expressar e praticar o idioma.</li>
                            <li>Disponibilidade para esclarecer dúvidas e fornecer suporte adicional fora das aulas, por meio de e-mail ou mensagens.</li>
                            <li>Acompanhamento regular do progresso do aluno e ajuste das estratégias de ensino, se necessário.</li>
                            <li>Manutenção de uma comunicação clara e eficaz com o aluno e/ou responsáveis, para fornecer informações e atualizações sobre o desenvolvimento do aluno.</li>
                        </ul>
                        <p>Esses critérios ajudarão a garantir a eficácia e qualidade das aulas de idioma online individual.</p>
                    </div>
                </AccordionItem>

            </Accordion>
    </div>
    );
}