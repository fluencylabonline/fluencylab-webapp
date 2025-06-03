"use client";
import Link from "next/link";
import { ToggleDarkMode } from "@/app/ui/Components/Buttons/ToggleDarkMode";
import { BsArrowLeft } from "react-icons/bs";
import "./games.css";
import Image from "next/image";
import WordleImage from "../../../public/images/pratica/wordle.png";
import GuesslyImage from "../../../public/images/pratica/guessly.png";
import Listening from "../../../public/images/pratica/listening.png";
import { motion } from "framer-motion";

const games = [
  { title: "Wordle", backgroundImage: WordleImage, path: "games/wordle" },
  { title: "Guessly", backgroundImage: GuesslyImage, path: "games/guessly" },
  { title: "Listening", backgroundImage: Listening, path: "games/listening" },
];

export default function Games() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
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
  };

  return (
    <div className="p-2 overflow-y-auto flex flex-col items-center gap-2 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
      <div className="flex flex-row w-full justify-between items-center px-2">
        <Link href="/">
          <button className="flex justify-center">
            <BsArrowLeft className="lg:w-9 lg:h-9 w-9 h-9 hover:text-fluency-blue-500 ease-in-out duration-300" />
          </button>
        </Link>

        <div className="flex flex-row w-full items-center justify-around">
          <h1 className="text-fluency-text-light dark:text-fluency-text-dark lg:text-xl text-sm font-bold">
            GAMES
          </h1>
        </div>

        <div>
          <ToggleDarkMode />
        </div>
      </div>

      <div className="lg:mt-12 mt-2 p-1 flex flex-wrap items-center justify-center lg:h-min h-[90vh] overflow-y-auto gap-3">
        <motion.div
          className="flex flex-wrap gap-3 overflow-x-auto scroll-smooth hide-scrollbar py-2 px-2 tour-games-carouse"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {games.map((game, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{
                scale: 1.03,
                zIndex: 10,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex-shrink-0 w-[22rem] h-64 rounded-lg overflow-hidden relative"
            >
              <Link href={game.path}>
                <Image
                  src={game.backgroundImage}
                  alt={game.title}
                  layout="fill"
                  objectFit="cover"
                  className="object-cover absolute inset-0 transition-all duration-300 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <motion.p
                    className="text-white text-lg font-bold text-center"
                    initial={{ y: 10 }}
                    whileHover={{ y: 0 }}
                  >
                    {game.title}
                  </motion.p>
                </div>

                {/* Floating animation */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.1,
                  }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
