'use client'

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CiMusicNote1, CiBookmark } from "react-icons/ci";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import Tour from '@/app/ui/Components/JoyRide/FluencyTour'; 

// Images
import WordleImage from '../../../../public/images/pratica/wordle.png';
import GuesslyImage from '../../../../public/images/pratica/guessly.png';
import FlashcardImage from '../../../../public/images/pratica/flashcards.png';
import TicTacToeImage from '../../../../public/images/pratica/tictactoe.png';
import WhatAmIImage from '../../../../public/images/pratica/whatami.png';
import QuizzImage from '../../../../public/images/pratica/quiz.png';
import Listening from '../../../../public/images/pratica/listening.png';
import Speaking from '../../../../public/images/pratica/speaking.png';
import Vocabulary from '../../../../public/images/pratica/vocabulary.png';
import PodcastImage from '../../../../public/images/pratica/podcast.jpg';
import BlogImage from '../../../../public/images/pratica/blog.jpg';
import { useSession } from "next-auth/react";

const games = [
  { title: "Wordle", backgroundImage: WordleImage, path: "pratica/wordle" },
  { title: "Flashcards", backgroundImage: FlashcardImage, path: "pratica/flashcards" },
  { title: "Guessly", backgroundImage: GuesslyImage, path: "pratica/guessly" },
  { title: "Listening", backgroundImage: Listening, path: "pratica/listening" },
  { title: "Quiz", backgroundImage: QuizzImage, path: "pratica/quizz" },
  { title: "Speaking", backgroundImage: Speaking, path: "pratica/speaking" },
  { title: "TicTacToe", backgroundImage: TicTacToeImage, path: "pratica/tictactoe" },
  { title: "Vocabulary", backgroundImage: Vocabulary, path: "pratica/vocabulary" },
  { title: "What Am I?", backgroundImage: WhatAmIImage, path: "pratica/whatami" },
];

export default function PracticePage() {
  const { data: session } = useSession();
  const id = session?.user.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const tourSteps = [
    {
      target: '.tour-podcast-blog',
      title: 'Recursos de Aprendizado',
      content: 'Aqui você encontra podcasts para praticar seu listening e artigos do blog para expandir seu vocabulário.',
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-games-carousel',
      title: 'Jogos Interativos',
      content: 'Pratique inglês de forma divertida com nossos jogos educativos! Deslize para ver mais opções.',
      placement: 'top' as const,
    }
  ];

  // Track scroll position for arrow visibility
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };
    
    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4,
        type: "spring", 
        stiffness: 120 
      } 
    }
  };

  return (
    <div className="py-2 px-4 sm:px-6">
      <Tour 
        steps={tourSteps}
        pageKey="practice"
        userId={id || undefined}
        delay={1000}
        onTourEnd={() => console.log('Practice tour completed')}
      />

      <div className="flex flex-col w-full gap-8 min-h-[89vh]">
        {/* Top Section: Podcast & Blog - Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 tour-podcast-blog">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="pratica/podcast">
              <motion.div 
                className="h-64 rounded-lg overflow-hidden relative shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image 
                  src={PodcastImage} 
                  alt="Podcasts" 
                  layout="fill"
                  objectFit="cover"
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      transition: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      } 
                    }}
                    className="mb-2"
                  >
                    <CiMusicNote1 className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold">Podcasts</h2>
                  <p className="text-sm opacity-90 mt-1">Aprenda ouvindo</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link href="pratica/blog">
              <motion.div 
                className="h-64 rounded-lg overflow-hidden relative shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image 
                  src={BlogImage} 
                  alt="Blog" 
                  layout="fill"
                  objectFit="cover"
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      transition: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      } 
                    }}
                    className="mb-2"
                  >
                    <CiBookmark className="w-8 h-8" />
                  </motion.div>
                  <h2 className="text-2xl font-bold">Blog</h2>
                  <p className="text-sm opacity-90 mt-1">Artigos diários</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Section: Games Carousel */}
        <div>
          <div className="relative">
            {/* Left Arrow */}
            {showLeftArrow && (
              <motion.button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                onClick={() => scroll('left')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronLeft className="text-gray-800" />
              </motion.button>
            )}

            {/* Games container */}
            <motion.div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar py-2 px-2 tour-games-carouse"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {games.map((game, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                    zIndex: 10
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex-shrink-0 w-64 h-64 rounded-lg overflow-hidden shadow-lg relative"
                >
                  <Link href={game.path}>
                    <Image
                      src={game.backgroundImage}
                      alt={game.title}
                      layout="fill"
                      objectFit="cover"
                      className="absolute inset-0 transition-all duration-300 ease-in-out"    
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
                        delay: index * 0.1
                      }}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Right Arrow */}
            {showRightArrow && (
              <motion.button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                onClick={() => scroll('right')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaChevronRight className="text-gray-800" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}