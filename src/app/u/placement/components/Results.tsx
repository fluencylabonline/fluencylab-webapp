import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LuArrowDown } from 'react-icons/lu';
import { WhatsAppButton } from '@/app/ui/Components/Buttons/WhatsAppButton';
import { Levels } from '@/app/SharedPages/Placement/Components/Badges/Levels';

interface ResultsProps {
    results: any[];
    timeLeft: any;
}

    const levelMap = {
        "A1": "Iniciante - A1",
        "A2": "Básico - A2",
        "B1": "Intermediário - B1",
        "B2": "Intermediário Avançado - B2",
        "C1": "Avançado - C1",
        "C2": "Proficiente - C2"
    };


    const badgeForLevel = { // Mapa para badges por nível
        "A1": 'Sabrina Sato',
        "A2": 'Nabote',
        "B1": 'Alcione',
        "B2": 'Richarlisson',
        "C1": 'Joel Santana',
        "C2": 'Naldo Benny'
    };


    const getImageForBadge = (badgeName: string) => {
        switch (badgeName) {
            case 'Sabrina Sato': return require('../../../../../public/images/badges/sabrinasato.png');
            case 'Nabote': return require('../../../../../public/images/badges/nabote.png');
            case 'Alcione': return require('../../../../../public/images/badges/alcione.png');
            case 'Richarlisson': return require('../../../../../public/images/badges/richarlisson.png');
            case 'Joel Santana': return require('../../../../../public/images/badges/joelsantana.png');
            case 'Naldo Benny': return require('../../../../../public/images/badges/naldobenny.png');
            default: return null;
        }
    };


    const getTextForBadge = (badgeName: string) => {
        switch (badgeName) {
            case 'Sabrina Sato': return 'Oi, Justchin! 🤸🏿';
            case 'Nabote': return 'I not alcohol 🥛';
            case 'Alcione': return 'Sometaimes is djustin love 💔';
            case 'Richarlisson': return 'I speak inglish mai friend 💅';
            case 'Joel Santana': return 'Controu the métchi ⚽';
            case 'Naldo Benny': return 'Fã do Chris Brownie 🍪';
            default: return '';
        }
    };


    const getExplanationForBadge = (badgeName: string) => {
        switch (badgeName) {
            case 'Sabrina Sato': return 'Modo Justchin ON! 🚀 Compreende o básico do básico, tipo legenda de meme e nome de comida em inglês. Prazer em te conhecer (Nice to meet you!), tudo bem? (How are you?). Vocabulário? Limitado, mas quem liga? O importante é a simpatia e a coragem de se jogar! Tipo a Sabrina no inglês, você pode não entender tudo, mas a espontaneidade e o carisma já te levam longe! 😂';
            case 'Nabote': return 'Turista Profissional! 👨‍🌾🌍 Você já não é mais um gringo perdido no Brasil! Entende frases curtinhas, tipo "One beer, please" e "Where is the bathroom?". Já saca informações simples, tipo cardápio e como perguntar as horas. Fome? Passado! Sede? Controlada! Religião? Se te perguntarem, você até arrisca! Parabéns, agora você já pode turistar sem perrengue básico, tipo o Nabote, com ele não tem situação difícil!';
            case 'Alcione': return 'A voz do Brasil no inglês! 🎤🇧🇷  Já tá cantando em inglês, hein? Calma, ainda não é Whitney Houston, mas já compreende o essencial de conversas e textos mais tranquilos sobre o dia a dia, família, hobbies... Já se vira em situações rotineiras, tipo pedir informação na rua ou entender um e-mail do trabalho. Essa confiança já te deixa pronto pra encarar um karaokê internacional e, quem sabe, até arriscar um "Garçom, aqui, nessa mesa de bar..." em inglês! 😉';
            case 'Richarlisson': return 'Richarlisson no ataque bilíngue! ⚽🕊️🗣️ Agora a coisa ficou séria! Entende as ideias principais de textos mais complexos, tipo notícia e vídeo no YouTube, e se comunica com mais desenvoltura. Até em papos mais elaborados e em diferentes situações você manda bem. Que nem o Richarlisson, quebrando barreiras no futebol e no inglês! Entrevista? Tranquilo! Pressão? Relax! O inglês já não te assusta mais, my friend! 😎';
            case 'Joel Santana': return 'Professor Joel Santana na área," Inglês is very important!" 👨‍🏫🗣️🌍 Você já é quase um mestre da comunicação!  Compreende textos longos e complexos, pega as entrelinhas e se expressa com naturalidade. Debate, palestra, filme sem legenda? Pra você é fichinha! Nesse nível, já pode dar aula, treinar a galera e inspirar geral a aprender inglês, igual o mestre Joel com suas pérolas e sabedoria! "Inglês is very important for you and your family!" 🤣';
            case 'Naldo Benny': return 'No flow do Naldo Benny, "My best friend is back!"... e o inglês também! 🎤🤝🇺🇸  Chegou no topo!  Domina o inglês como se fosse a língua nativa. Entende tudo, se comunica com precisão e naturalidade em QUALQUER situação. Reunião de negócios? Show internacional? Bate-papo informal? Você brilha em todas! Pode falar do seu "melhor amigo" em inglês, cantar rap ultra-rápido e conversar sobre física quântica sem suar frio. Parabéns, você é um verdadeiro poliglota, tipo o Naldo... no mundo da imaginação dele, hahaha! 😉';
            default: return '';
        }
    };

    const getLinkForBadge = (badgeName: string) => {
        switch (badgeName) {
            case 'Sabrina Sato': return 'https://www.youtube.com/watch?v=VcRABt1HZVc';
            case 'Nabote': return 'https://www.youtube.com/watch?v=2fgEx6g9aR8';
            case 'Alcione': return 'https://www.youtube.com/watch?v=PHLBaAryPoE';
            case 'Richarlisson': return 'https://www.youtube.com/watch?v=hEeKtJCj3hc';
            case 'Joel Santana': return 'https://www.youtube.com/watch?v=iewQ45wJ7JA';
            case 'Naldo Benny': return 'https://www.youtube.com/watch?v=VNyhdWhE67Q';
            default: return '';
        }
    };

    const calculateOverallLevel = (results: any[]) => {
        if (!results || results.length === 0) return "A1"; // Nível padrão se não houver resultados
        // Mapear os níveis para valores numéricos para calcular a média
        const levelValues = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
        let totalLevelValue = 0;

        results.forEach(result => {
            totalLevelValue += levelValues[result.level as keyof typeof levelValues] || levelValues["A1"]; // Usa A1 como padrão se o nível não for reconhecido
        });

        const averageLevelValue = totalLevelValue / results.length;
        let overallLevel = "A1";
        if (averageLevelValue > 1.5) overallLevel = "A2";
        if (averageLevelValue > 2.5) overallLevel = "B1";
        if (averageLevelValue > 3.5) overallLevel = "B2";
        if (averageLevelValue > 4.5) overallLevel = "C1";
        if (averageLevelValue > 5.5) overallLevel = "C2";
        return overallLevel;
    };

    const getBadgeDataForLevel = (overallLevel: string) => {
        const badgeName = badgeForLevel[overallLevel as keyof typeof badgeForLevel] || 'Sabrina Sato'; // 'Sabrina Sato' como padrão
        const badgeImage = getImageForBadge(badgeName);
        const badgeText = getTextForBadge(badgeName);
        const badgeExplanation = getExplanationForBadge(badgeName);
        const badgeLink = getLinkForBadge(badgeName);

        return {
            name: badgeName,
            image: badgeImage,
            level: levelMap[overallLevel as keyof typeof levelMap] || "Nível Desconhecido", // "Nível Desconhecido" como fallback
            text: badgeText,
            explanation: badgeExplanation,
            link: badgeLink,
        };
    };

const Results: React.FC<ResultsProps> = ({ results, timeLeft }) => {
    const overallLevel = calculateOverallLevel(results);
    const badgeData = getBadgeDataForLevel(overallLevel);
    const [isExplanationOpen, setIsExplanationOpen] = useState(false);

    return (
        <div className="bg-fluency-pages-light dark:bg-fluency-pages-dark shadow-md w-full h-full text-center rounded-lg">
            <h2 className="text-2xl font-bold mb-4 p-4">Resultados do Nivelamento FluencyLab</h2>

            <div className="gap-2 flex flex-col items-center justify-center m-4 p-4 border rounded-lg bg-gray-100 dark:bg-fluency-bg-dark">
                <div className='border-4 bg-white rounded-full w-fit p-2 mx-auto mb-2'>
                     <Image src={badgeData.image} alt={badgeData.name} width={100} height={100} className="bg-cover scale-125"  />
                </div>
                <h4 className="font-semibold text-lg">{badgeData.name} - {badgeData.level}</h4>
                <p className="text-gray-500 dark:text-gray-300 text-md mb-2">{badgeData.text}</p>
                <p className="text-md text-gray-600 dark:text-gray-400 w-[55vw]">{badgeData.explanation}</p>
                 <a
                    href={badgeData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline block"
                >
                    Ver em ação 🔗
                </a>

                <motion.a
                    href="#detalhes"
                    className="flex flex-col items-center text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                >
                    <LuArrowDown className="w-6 h-6 mt-12" />
                </motion.a>
            </div>

            <div className='flex flex-col items-center justify-center m-4 p-4 border rounded-lg bg-gray-100 dark:bg-fluency-bg-dark'>
                <p id="detalhes" className="text-lg font-bold mb-4">Aqui estão os seus resultados por habilidade. Ah, e clica <button className='text-indigo-600 hover:text-indigo-700 duration-300 ease-in-out transition-all' onClick={() => setIsExplanationOpen(true)}>aqui</button> se quiser entender melhor os níveis.</p>
                <ul className="mb-6">
                    {results.map((result, index) => {
                        const abilityMap: { [key: string]: string } = {
                            "speaking": "Fala",
                            "listening": "Compreensão Auditiva",
                            "writing": "Escrita",
                            "reading": "Leitura",
                            "vocabulary": "Vocabulário",
                            "grammar": "Gramática"
                        };

                        return (
                            <li key={index} className="mb-2">
                                <strong>{abilityMap[result.ability] || result.ability}:</strong> {levelMap[result.level as keyof typeof levelMap]} - {result.score}/{result.totalQuestions * 6}
                            </li>
                        );
                    })}
                </ul>

                <div className='flex flex-col gap-2 items-center'>
                    <p className="text-center w-[75%] mb-4 text-black dark:text-white">
                        Para melhorar o seu nível no idioma, ou fazer um teste mais completo para analisar sua escrita, sotaque e conversação. Entra em contato com a gente!
                    </p>

                    <div className='flex flex-col items-center gap-2 text-black dark:text-white'>
                        <div className='lg:flex lg:flex-row flex flex-col gap-2 items-center'>
                        <Link href="/u/googlecalendarpage" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                        Marca uma aula teste!
                        </Link>
                        <WhatsAppButton buttonText="Ou manda mensagem aqui"/>
                        </div>

                        <p>mas, se já for um de nossos alunos:</p>
                        <div>
                            <a href="/signin" className="cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 ease-in-out duration-300 text-white text-sm font-medium rounded-md">
                            Entrar <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" /></svg>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {isExplanationOpen && (
                <Levels onClose={() => setIsExplanationOpen(false)} />
            )}

        </div>
    );
};


export default Results;