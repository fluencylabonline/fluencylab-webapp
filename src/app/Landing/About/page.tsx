"use client";
import React from "react";
import Image from "next/image";
import "../Component/NewLanding.css";

import About1 from "../../../../public/images/landing/about1.png";
import About2 from "../../../../public/images/landing/about2.png";
import About3 from "../../../../public/images/landing/about3.png";

import Revisao from "../../../../public/images/landing/revisao.png";
import TaskComponent from "../Component/TaskComponent"; // Assuming this already has whileInView from previous conversation

import WordleImage from "../../../../public/images/pratica/wordle.png";
import GuesslyImage from "../../../../public/images/pratica/guessly.png";
import Listening from "../../../../public/images/pratica/listening.png";
import { VscDebugStart } from "react-icons/vsc";
import { WhatsAppButton } from "../../ui/Components/Buttons/WhatsAppButton";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const games = [
  { title: "Wordle", backgroundImage: WordleImage, path: "games/wordle" },
  { title: "Guessly", backgroundImage: GuesslyImage, path: "games/guessly" },
  { title: "Listening", backgroundImage: Listening, path: "games/listening" },
];

export default function About() {
  const router = useRouter();

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Animation variants for the games grid and its items (already defined)
  const gamesContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const gameItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        type: "spring",
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.05,
      zIndex: 1,
      transition: { duration: 0.3 },
    },
  };

  // Variants for the individual About cards (Sem demora, Material didático, Aulas personalizadas)
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger cards by 0.2 seconds
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      id="aboutus"
      className="flex flex-col items-center bg-transparent dark:bg-transparent px-4 py-6 mx-auto w-full md:px-20 lg:px-8 lg:py-6"
    >
      {/* Section 1: Main Heading and Subtitle */}
      <motion.div
        className="text-center max-w-xl mb-2 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-bold text-fluency-text-dark bg-amber-500 dark:bg-amber-500 uppercase rounded-full">
            VAMOS COMEÇAR!
          </p>
        </div>
        <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">
          Por que fazer aula com a gente?
        </h2>
        <p className="text-base text-fluency-text-light dark:text-fluency-text-dark md:text-lg">
          Vamos te mostrar apenas alguns dos motivos que você tem de pelo menos
          marcar umas aula teste com a gente!{" "}
        </p>
      </motion.div>

      {/* Section 2: "Sempre saiba o que estudar..." */}
      <motion.div
        className="flex items-center sm:items-start flex-col-reverse sm:flex-row gap-1 w-[90%] p-4 mb-4"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full">
          {/* Assuming TaskComponent already handles its own animations */}
          <TaskComponent />
        </div>
        <div className="w-full p-6 flex flex-col items-start gap-2">
          <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">
            Sempre saiba{" "}
            <strong className="text-fluency-green-600">o que</strong> estudar e{" "}
            <strong className="text-fluency-green-600">como</strong> estudar
          </h6>
          <p className="text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">
            Você deve saber que precisa estudar todos os dias. Mas provavelmente
            se sente perdido sem saber o que e nem como... Aqui você não vai ter
            esse problema. Oferecemos programações personalizadas e específicas
            que ficam de fácil acesso na nossa plataforma!
          </p>
        </div>
      </motion.div>

      {/* Section 3: "Estude de maneira divertida" */}
      <motion.div
        className="flex items-center sm:items-start flex-col sm:flex-row gap-2 w-[90%] p-4 text-black dark:text-white"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full p-6 flex flex-col items-start gap-2">
          <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">
            Estude de maneira{" "}
            <strong className="text-fluency-blue-500">divertida</strong>
          </h6>
          <p className="text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">
            Mas e se você não for muito fã de estudos e materias tradicionais?
            Fica tranquilo, também não somos. Aqui você aprende, pratica o
            idioma e até se diverte enquanto estuda.
          </p>
        </div>

        <motion.div
          variants={gamesContainerVariants} // Use the new games container variants
          initial="hidden"
          whileInView="show" // Trigger games animation on scroll
          viewport={{ once: true, amount: 0.2 }} // Adjust amount for game grid visibility
          className="w-full flex flex-col items-center gap-4 sm:flex-row"
        >
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game, index) => (
              <motion.div
                key={index}
                variants={gameItemVariants} // Use game item variants
                whileHover="hover"
                className="group relative w-64 h-64 rounded-md overflow-visible cursor-pointer"
              >
                {/* Added inner container for clipping */}
                <div
                  className="absolute inset-0 rounded-md overflow-hidden"
                  onClick={() => router.push(game.path)}
                >
                  <Image
                    src={game.backgroundImage}
                    alt={game.title}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Added group hover effect to overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 flex flex-col items-center justify-center p-4 transition-all duration-300">
                    <motion.h3
                      className="text-white text-xl font-bold text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {game.title}
                    </motion.h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Section 4: "Sistema de revisão" */}
      <motion.div
        className="flex items-center justify-center flex-col-reverse sm:flex-row w-full gap-2 sm:w-[90%] p-4 mb-4"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-[80%]">
          <Image alt="Wordle" className="w-full h-auto mt-2" src={Revisao} />
        </div>
        <div className="w-[95%] p-6 flex flex-col items-center sm:items-start gap-2">
          <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">
            Um{" "}
            <strong className="text-fluency-orange-500">
              sistema de revisão
            </strong>{" "}
            que te ajuda a lembrar tudo!
          </h6>
          <p className="w-[95%] text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">
            Você também vai contar com um sistema de revisão que te diz
            exatamente o que precisa estudar e quando fazer isso.
          </p>
        </div>
      </motion.div>

      {/* Section 5: "Entenda e acompanhe seu nível" */}
      <motion.div
        className="flex items-center justify-center flex-col sm:flex-row gap-1 w-full sm:w-[80%] p-4 mb-4"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-[95%] p-6 flex flex-col items-start gap-2">
          <h6 className="text-xl font-medium text-center sm:text-left leading-5 text-fluency-text-light dark:text-fluency-text-dark">
            <strong className="font-bold" id="gradient-text">
              Entenda e acompanhe
            </strong>{" "}
            seu nível no idioma
          </h6>
          <p className="sm:w-[95%] w-full text-md font-semibold text-center sm:text-justify text-fluency-gray-400 dark:text-fluency-gray-200">
            Ainda não sabe bem como está seu inglês? Não se preocupa, nosso
            teste vai te dar uma ideia excelente do que precisa fazer para
            alavancar seu inglês! E ele também marca seu progresso de tempos em
            tempos.
          </p>
        </div>
        <div className="w-[80%] sm:w-[55%] flex items-center text-center">
          <div
            id="background-body-new"
            className="w-[65vh] h-fit py-16 flex flex-col gap-2 items-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-white rounded-md"
          >
            <p className="font-bold text-[2rem] p-6">Bem vindo, Marcos!</p>
            <p className="px-10 text-center font-semibold text-lg">
              Vamos fazer um nivelamento e entender melhor como podemos
              melhorar seu inglês!
            </p>
            <Link
              href={"u/placement"}
              className="flex flex-row items-center gap-2 border-2 mt-6 p-2 px-4 rounded-md border-white hover:bg-white hover:text-black duration-300 hover:font-bold ease-in-out"
            >
              Começar <VscDebugStart className="w-4 h-auto" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Section 6: The three "About" cards */}
      <motion.div
        className="flex flex-col items-center"
        variants={cardContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }} // Trigger when 40% of this section is in view
      >
        <h2 className="text-center max-w-lg mt-2 mb-6 font-sans text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">
          Achou legal? Tem isso e um pouco mais
        </h2>

        <div className="grid gap-8 row-gap-10 lg:grid-cols-3 text-center">
          {/* ABOUT 1 */}
          <motion.div
            className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center"
            variants={cardItemVariants}
          >
            <div className="flex items-center justify-center w-40 h-40">
              <Image className="h-auto w-full" src={About1} alt="FluencyLab" />
            </div>
            <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">
              Sem demora para conversar
            </h6>
            <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200">
              Quando começa a fazer aula com a gente nossos professores vão te
              preparar para conseguir se comunicar dos níveis mais básicos até
              onde você quiser chegar logo nas primeiras semanas.{" "}
            </p>
          </motion.div>

          {/* ABOUT 2 */}
          <motion.div
            className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center"
            variants={cardItemVariants}
          >
            <div className="flex items-center justify-center w-40 h-40">
              <Image className="h-auto w-full" src={About2} alt="FluencyLab" />
            </div>
            <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">
              Material didático
            </h6>
            <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200">
              Nosso material é feito pensando nas suas necessidades específicas.
              Ele é sempre testado antes de ser usado em aula. E além disso, foi
              planejado com muito cuidado para que a sua aula seja o mais
              dinâmica possível.{" "}
            </p>
          </motion.div>

          {/* ABOUT 3 */}
          <motion.div
            className="flex items-center flex-col gap-1 max-w-md sm:mx-auto sm:text-center"
            variants={cardItemVariants}
          >
            <div className="flex items-center justify-center w-40 h-40">
              <Image className="h-auto w-full" src={About3} alt="FluencyLab" />
            </div>
            <h6 className="mb-3 text-xl font-bold leading-5 text-fluency-text-light dark:text-fluency-text-dark">
              Aulas personalizadas
            </h6>
            <p className="mb-3 text-sm text-fluency-gray-400 dark:text-fluency-gray-200">
              Cada aluno tem um tipo de aula diferente com a gente. Se
              necessário preparamos até material novo se isso for o que você
              precisa. Então não se preocupa. Aqui é o seu lugar!{" "}
            </p>
          </motion.div>
        </div>

        <div className="mt-8">
          <WhatsAppButton buttonText="Chama a gente 😎" />
        </div>
      </motion.div>
    </div>
  );
}