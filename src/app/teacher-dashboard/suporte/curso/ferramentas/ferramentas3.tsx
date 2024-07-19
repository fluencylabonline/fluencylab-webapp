import Link from "next/link";

export default function Ferramentas3(){
    
    return(
        <div>
            <p className='text-2xl font-bold py-2 pb-4'>Métodos</p>
                <div>
                    <p className='text-xl font-bold'>Shadowing</p>
                    <p className='py-2'>
                        <strong>O que é Shadowing?</strong>
                        <br />
                        Shadowing é uma técnica de aprendizagem de línguas que envolve ouvir um áudio ou uma fala e imitá-lo simultaneamente. O objetivo é melhorar a fluência e a pronúncia ao seguir exatamente o que é ouvido, copiando a entonação, ritmo e pronúncia do falante original.
                    </p>
                    <p className='py-2'>
                        <strong>Por que é útil?</strong>
                        <br />
                        - <strong>Melhoria na Pronúncia:</strong> Ao imitar um falante nativo, você pode aprimorar a sua pronúncia e entonação.
                        <br />
                        - <strong>Aprimoramento da Fluência:</strong> A técnica ajuda a tornar o discurso mais natural e fluente.
                        <br />
                        - <strong>Desenvolvimento da Compreensão Auditiva:</strong> Melhora a capacidade de entender o idioma falado.
                        <br />
                        - <strong>Aumento da Confiança:</strong> Com a prática constante, os alunos se tornam mais confiantes em suas habilidades de fala e compreensão.
                    </p>
                    <p className='py-2'>
                        <strong>Como Usar em uma Aula?</strong>
                        <br />
                        1. <strong>Escolha do Material:</strong> Selecione um áudio ou vídeo adequado ao nível dos alunos.
                        <br />
                        2. <strong>Introdução:</strong> Explique a técnica e mostre um exemplo.
                        <br />
                        3. <strong>Exercício de Shadowing:</strong>
                            - Toque o áudio uma vez para familiarização.
                            - Toque novamente e peça aos alunos que imitem o áudio simultaneamente.
                            - Forneça feedback sobre a pronúncia e a fluência.
                        <br />
                    </p>

                        <div className='w-full lg:flex lg:flex-row md:flex md:flex-col flex flex-col gap-1 justify-between items-start my-4 p-4 rounded-md bg-fluency-gray-200 dark:bg-fluency-gray-900'>
                            <p className='w-fit p-6'>Esse vídeo vai te dar uma ideia de como pode fazer o Shadowing durante as aulas. A explicação começa no minuto 2:07.</p>
                            <iframe className='w-full rounded-md' width="720" height="275" src="https://www.youtube.com/embed/N20jOJDYyYA?si=2QyYcgsS7w8pM81k?t=126" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                        </div>
                </div>


                <div>
                    <p className='text-2xl font-bold py-2'>Fonética</p>
                    <div className="flex flex-row items-start w-full justify-around">
                        <div className="w-[65%] pr-4">
                            <p className='py-2'>
                                <strong>O que é</strong>
                                <br />
                                A fonética é o estudo dos sons da fala humana. Ela investiga como os sons são produzidos, transmitidos e percebidos. A fonética nos ajuda a entender como os diferentes sons são feitos e como eles são representados por meio do Alfabeto Fonético Internacional (IPA). É uma área importante para compreender a pronúncia correta de palavras em diferentes idiomas.
                                <br />
                            </p>
                        </div>
                        <iframe className='aspect-video w-[60%] rounded-md' src="https://drive.google.com/file/d/1wqdPh66EFJu8pnLeYGdIMIdDYKRl_zqq/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <p className='py-2 mt-6'>
                        <strong>Para que serve</strong>
                        <br />
                        A compreensão básica da fonética e do Alfabeto Fonético Internacional (IPA) pode ser extremamente útil para um professor de idiomas ao lidar com um aluno que tem problemas de pronúncia.
                        <br />
                        Além disso, o conhecimento da fonética permite que o professor explique a posição correta dos órgãos articulatórios (como a língua, os lábios, etc.) para produzir os sons corretos. Isso pode ajudar o aluno a ajustar sua articulação e melhorar sua pronúncia ao imitar os movimentos corretos dos órgãos articulatórios.
                        <br />
                        Em resumo, a fonética e o IPA fornecem ferramentas essenciais para o professor de idiomas ajudar os alunos a superar problemas de pronúncia, identificar sons específicos e fornecer orientação precisa para melhorar a pronúncia correta.
                        <br />
                    </p>
                    <div className="flex flex-col items-center justify-center">
                        <iframe className='aspect-video w-[65%] rounded-md' src="https://drive.google.com/file/d/1rn8kW_6gaZb2bDnzQVxxFFAkERRAYMum/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>


                    <p className='py-2 ml-4 mt-6'>
                        <strong>Como sons são feitos</strong>
                        <br />
                        <strong>Os órgãos da fala</strong>
                        <br />
                        <strong>Língua:</strong> A língua desempenha um papel fundamental na produção dos sons da fala. Ela é responsável por articular os diferentes sons consonantais, como p, b, t, d, entre outros. Além disso, a língua também é responsável por posicionar-se em diferentes pontos da boca para produzir as vogais.
                        <br />
                        <strong>Lábios:</strong> Os lábios são utilizados na produção de diversos sons da fala, como os sons das letras p, b e m. Eles são responsáveis por bloquear e liberar o fluxo de ar para criar diferentes articulações sonoras.
                        <br />
                        <strong>Dentes:</strong> Os dentes também desempenham um papel importante na fala, principalmente na produção de alguns sons consonantais, como os sons das letras t, d, s e z. Eles são utilizados para restringir o fluxo de ar durante a articulação desses sons.
                        <br />
                        <strong>Garganta:</strong> A garganta, ou mais especificamente as cordas vocais, é responsável pela produção dos sons vocálicos. Ela regula a passagem do ar e vibra para produzir diferentes tons e frequências.
                        <br />
                        Esses órgãos articulatórios trabalham em conjunto para criar os diferentes sons da fala e são essenciais para a produção correta dos sons das palavras.
                    </p>
                    <p className='py-2'>
                        <strong>Consoantes</strong>
                        <br />
                        Consoantes são sons que produzimos ao bloquear ou restringir o fluxo de ar através da boca. Esses sons são feitos quando os órgãos articulatórios, como a língua, os lábios ou a garganta, entram em contato ou se aproximam um do outro. Por exemplo, ao pronunciar a letra p, bloqueamos o fluxo de ar com os lábios e depois o liberamos. Já ao pronunciar a letra s, restringimos o fluxo de ar passando-o entre a língua e os dentes. As consoantes nos ajudam a formar diferentes palavras e têm um papel importante na nossa comunicação diária.
                    </p>
                    <p className='py-2'>
                        <strong>Vogais</strong>
                        <br />
                        As vogais são sons que produzimos ao deixar o fluxo de ar passar livremente através da boca, sem bloqueá-lo ou restringi-lo. Ao pronunciar vogais, a língua, os lábios e a garganta ficam relaxados e não entram em contato um com o outro. Diferentemente das consoantes, que envolvem bloquear ou restringir o fluxo de ar, as vogais são sons abertos e claros.
                        <br />
                        Por exemplo, ao pronunciar a vogal a, a boca fica aberta e a língua fica relaxada no fundo da boca. Ao pronunciar a vogal e, a boca fica um pouco mais fechada e a língua se move um pouco para a frente. Já ao pronunciar a vogal i, a boca fica mais fechada e a língua se eleva no palato. Cada vogal tem uma posição diferente da língua e dos lábios, o que resulta em sons distintos.
                        <br />
                    </p>
                    <div className="flex flex-col items-center justify-center">
                        <iframe className='aspect-video w-[65%] rounded-md my-2' src="https://drive.google.com/file/d/1ogeAKsFf6UQQqQZtT8hbnA9_QlF43uge/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <p className='py-2 mt-6'>
                        <strong>IPA</strong>
                        <br />
                        O Alfabeto Fonético Internacional (IPA) é um sistema de símbolos que representa os sons da fala humana, sendo utilizado para transcrever foneticamente palavras de diferentes idiomas. Ele auxilia na compreensão e descrição precisa dos sons articulados na pronúncia correta das palavras.
                        <br />
                    </p>
                    <div className="flex flex-col items-center justify-center">
                        <iframe className='aspect-video w-[65%] rounded-md' src="https://drive.google.com/file/d/1jx8tJRN0_RXekJwCm7BZ_uRoynGCSaD9/preview" title="Nivelamento" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <button className='text-white font-bold py-2 px-3 rounded-md mt-6 bg-fluency-red-500 hover:bg-fluency-red-600 duration-300 ease-in-out transition-all'>
                        <a href={'https://drive.google.com/drive/folders/1x0F-b9JobcKZeljYCOscMFKIZwRn_6Fe?usp=drive_link'} target='_blank' rel='noopener noreferrer'>Documentos extras</a>
                        </button>
                    </div>
                </div>


        </div>
    )
}