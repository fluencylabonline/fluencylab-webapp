
'use client'
import { Accordion, AccordionItem } from "@nextui-org/react";
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";


export default function Guidelines(){
    return(
        <div className="w-full flex flex-col gap-3 items-start overflow-y-scroll h-[75vh] bg-fluency-pages-light dark:bg-fluency-pages-dark p-4 rounded-md">
            <div className="flex flex-col items-center justify-center">
                <p className="text-3xl font-bold">Nivelamento</p>
                <Accordion>
                <AccordionItem className='font-semibold' indicator={({ isOpen }) => (isOpen ? <IoIosArrowDown /> : <IoIosArrowBack /> )} key="1" aria-label="O que é nivelamento" title="O que é nivelamento">
                    <div>
                        <p className='my-2'><strong>O que é nivelamento</strong></p>
                        <p className='my-2'>Quando alguém começa a aprender um novo idioma, é importante descobrir em que ponto está sua habilidade de compreender, falar, ler e escrever naquela língua. Isso é chamado de "nivelamento". Nivelar um aluno nos ajuda a entender em qual nível de dificuldade devemos ensinar e como podemos ajudá-lo a melhorar.</p>
                        <ul className='list-disc ml-4 my-2 gap-1 text-justify'>
                            <p>Existem alguns critérios que usamos para fazer isso:</p>
                            <li><strong>Compreensão Oral e Audição:</strong> Isso significa o quanto alguém entende quando outras pessoas falam no idioma. Se você está no nível iniciante, talvez consiga entender apenas palavras ou frases simples. Mas, se estiver mais avançado, entenderá conversas mais complexas.</li>
                            <li><strong>Compreensão de Leitura:</strong> Isso envolve quão bem alguém entende o que está escrito. No começo, pode ser difícil ler até mesmo textos simples. Mas à medida que você progride, pode entender coisas como jornais ou livros.</li>
                            <li><strong>Expressão Oral:</strong> Aqui, olhamos para o quanto alguém pode falar e se fazer entender no idioma. No início, você pode apenas dizer frases básicas, mas com o tempo, poderá participar de conversas mais longas e expressar suas ideias com mais detalhes.</li>
                            <li><strong>Expressão Escrita:</strong> Isso se refere a quão bem alguém pode escrever no idioma. No começo, você pode escrever apenas algumas palavras simples ou frases curtas. Mas conforme pratica, poderá escrever textos mais longos e complexos.</li>
                            <li><strong>Conhecimento Gramatical:</strong> Aqui, olhamos para quão bem alguém entende as regras do idioma, como colocar palavras juntas corretamente e usar os tempos verbais apropriados. No início, você pode não saber muitas regras, mas à medida que aprende, será capaz de usar o idioma de forma mais precisa.</li>
                        </ul>
                    </div>

                    <div className="my-3 bg-fluency-blue-200 p-4 rounded-md">
                        Exemplo de nivelamento em vídeo
                        <Accordion>
                            <AccordionItem title="Nivelamento e Primeira aula">
                            <iframe width="560" height="315" src="https://www.youtube.com/embed/1MCTUAXHM_I?si=qa6WP9SlmTqazuXS" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                            </AccordionItem>
                        </Accordion>
                    </div>

                </AccordionItem>
                </Accordion>

                <Accordion>
                    <AccordionItem className='font-semibold' title="Classificações">
                    <ul className="list-disc ml-4 mb-4">
                        <li className="mb-2">
                            <strong>Compreensão Oral e Audição:</strong>
                            <ul className="list-disc ml-4">
                            <li className="mb-1"><strong>Iniciante (A1/A2):</strong> O aluno tem dificuldade em entender frases e expressões básicas.</li>
                            <li className="mb-1"><strong>Intermediário (B1/B2):</strong> O aluno consegue entender conversas simples e seguir tópicos familiares.</li>
                            <li><strong>Avançado (C1/C2):</strong> O aluno consegue entender discursos longos e complexos, mesmo em contextos desconhecidos.</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <strong>Compreensão de Leitura:</strong>
                            <ul className="list-disc ml-4">
                            <li className="mb-1"><strong>Iniciante (A1/A2):</strong> O aluno consegue entender textos muito simples e curtas mensagens.</li>
                            <li className="mb-1"><strong>Intermediário (B1/B2):</strong> O aluno é capaz de compreender textos mais longos e complexos, como artigos de jornais ou narrativas simples.</li>
                            <li><strong>Avançado (C1/C2):</strong> O aluno é capaz de compreender textos longos e complexos em diferentes contextos, como textos acadêmicos ou literários.</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <strong>Expressão Oral:</strong>
                            <ul className="list-disc ml-4">
                            <li className="mb-1"><strong>Iniciante (A1/A2):</strong> O aluno é capaz de produzir frases simples e expressar necessidades básicas.</li>
                            <li className="mb-1"><strong>Intermediário (B1/B2):</strong> O aluno é capaz de participar de conversas sobre tópicos familiares e descrever experiências e eventos.</li>
                            <li><strong>Avançado (C1/C2):</strong> O aluno é capaz de comunicar-se fluentemente e expressar opiniões detalhadas sobre uma ampla gama de tópicos.</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <strong>Expressão Escrita:</strong>
                            <ul className="list-disc ml-4">
                            <li className="mb-1"><strong>Iniciante (A1/A2):</strong> O aluno é capaz de escrever frases simples e mensagens curtas.</li>
                            <li className="mb-1"><strong>Intermediário (B1/B2):</strong> O aluno é capaz de escrever textos claros e coerentes sobre uma variedade de assuntos.</li>
                            <li><strong>Avançado (C1/C2):</strong> O aluno é capaz de escrever ensaios bem estruturados e argumentativos, utilizando vocabulário avançado e gramática complexa.</li>
                            </ul>
                        </li>
                        <li className="mb-2">
                            <strong>Conhecimento Gramatical:</strong>
                            <ul className="list-disc ml-4">
                            <li className="mb-1"><strong>Iniciante (A1/A2):</strong> O aluno possui um conhecimento básico de gramática, com ênfase em estruturas simples.</li>
                            <li className="mb-1"><strong>Intermediário (B1/B2):</strong> O aluno tem um conhecimento sólido de gramática, sendo capaz de aplicar regras em contextos variados.</li>
                            <li><strong>Avançado (C1/C2):</strong> O aluno demonstra proficiência em gramática, incluindo o uso correto de tempos verbais complexos e estruturas gramaticais avançadas.</li>
                            </ul>
                        </li>
                    </ul>


                    </AccordionItem>
                </Accordion>
            </div>

            <div>
                <p>Dinamica de Aula</p>
            </div>

            <div>
                <p>Métodos e Ferramentas</p>
            </div>
    </div>
    );
}