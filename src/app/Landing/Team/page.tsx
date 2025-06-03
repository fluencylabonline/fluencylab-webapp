"use client"; // This directive is crucial for client-side components in Next.js

import Image from "next/image";
import { motion } from "framer-motion"; // Import motion

import Team1 from "../../../../public/images/avatar/team-1.svg";
import Team2 from "../../../../public/images/avatar/team-2.svg";
import Team3 from "../../../../public/images/avatar/team-3.svg";
import Team4 from "../../../../public/images/avatar/team-4.svg";
import Team5 from "../../../../public/images/avatar/team-5.svg";
import Team9 from "../../../../public/images/avatar/team-9.svg";
import Team7 from "../../../../public/images/avatar/team-7.svg";
import Team8 from "../../../../public/images/avatar/team-8.svg";

// Define team members with their data
const teamMembers = [
  { name: "Matheus Fernandes", role: "Professor de Inglês e Libras", avatar: Team2 },
  { name: "Flora Passos", role: "Professora de Inglês", avatar: Team5 },
  { name: "Jamille Kausque", role: "Professora de Inglês", avatar: Team1 },
  { name: "Gideon", role: "Professor de Inglês", avatar: Team9 },
  { name: "Luara", role: "Professora de Inglês", avatar: Team4 },
  { name: "Giulia", role: "Professora de Inglês para crianças", avatar: Team7 },
  { name: "Deise", role: "Equipe de Apoio", avatar: Team8 },
  // Add more members as needed using Team3 for example if you have it.
];

export default function Team() {
  // Variants for the main heading and description
  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  // Variants for the team members container (for staggered animation)
  const teamContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Stagger each child's animation by 0.15 seconds
      },
    },
  };

  // Variants for individual team member cards
  const teamMemberVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    hover: {
      scale: 1.05, // Slightly larger on hover
      y: -5, // Lift up a bit
      transition: { duration: 0.2 },
    },
  };

  return (
    <div
      id="ourteam"
      className="bg-transparent dark:bg-trasnparent px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20"
    >
      {/* Animated Header Section */}
      <motion.div
        className="text-center max-w-xl mb-10 md:mx-auto sm:text-center lg:max-w-2xl md:mb-12"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }} // Animates when 50% of the header is in view, only once
      >
        <div>
          <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark uppercase rounded-full">
            Nosso time
          </p>
        </div>
        <h2 className="max-w-lg mb-6 font-sans text-3xl font-bold leading-none tracking-tight text-fluency-text-light dark:text-fluency-text-dark sm:text-4xl md:mx-auto">
          <span className="relative inline-block">
            <svg
              viewBox="0 0 52 24"
              fill="currentColor"
              className="absolute top-0 left-0 z-0 hidden w-32 -mt-8 -ml-20 text-fluency-light-blue lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
            >
              <defs>
                <pattern
                  id="247432cb-6e6c-4bec-9766-564ed7c230dc"
                  x="0"
                  y="0"
                  width=".135"
                  height=".30"
                >
                  <circle cx="1" cy="1" r=".7"></circle>
                </pattern>
              </defs>
              <rect
                fill="url(#247432cb-6e6c-4bec-9766-564ed7c230dc)"
                width="52"
                height="24"
              ></rect>
            </svg>
          </span>
          Agora vem conhecer nosso time excepcional!
        </h2>
        <p className="text-base text-fluency-text-light dark:text-fluency-text-dark md:text-lg">
          Aqui você vai encontrar pessoas dedicadas, que amam ensinar e que têm
          como objetivo tornar sua jornada o mais agradável possível.
        </p>
      </motion.div>

      {/* Animated Team Members Grid */}
      <motion.div
        className="flex flex-wrap justify-center gap-10 mx-auto lg:max-w-screen-lg md:gap-20"
        variants={teamContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }} // Animates when 30% of the container is in view, only once
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            variants={teamMemberVariants}
            whileHover="hover" // Apply hover animation
          >
            <Image
              className="object-cover w-20 h-20 mb-2 rounded-full shadow"
              src={member.avatar}
              alt={`Avatar of ${member.name}`}
            />
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-fluency-text-light dark:text-fluency-text-dark">
                {member.name}
              </p>
              <p className="text-sm text-fluency-gray-400 dark:text-fluency-gray-200">
                {member.role}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}