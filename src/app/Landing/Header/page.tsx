"use client";

import "@/app/Landing/Header/Header.css";

//React Imports
import React, { useState, useEffect } from "react";

//Next Imports
import Link from "next/link";
import Image from "next/image";

//Images Imports
import Logo from "../../../../public/images/brand/logo.png";
import LandingHeaderImage from "../../../../public/images/landing/new-landing-header-image.png";
import SemiCircle from "../../../../public/images/landing/semi-circle.png";
import SmallLogo from "../../../../public/images/brand/icon-brand.png";

//Components Imports
import { ToggleDarkMode } from "@/app/ui/Components/Buttons/ToggleDarkMode";
import { Dialog, DialogPanel } from "@headlessui/react";
import { TbLogin2 } from "react-icons/tb";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { WhatsAppButton } from "@/app/ui/Components/Buttons/WhatsAppButton";
import GoogleCalendarButton from "@/app/ui/Components/Buttons/GoogleCalendarButton";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Sobre Nós", href: "#aboutus" },
  { name: "Nosso Time", href: "#ourteam" },
  { name: "Perguntas Frequentes", href: "#faq" },
  { name: "Games", href: "/games" },
  { name: "Nivelamento", href: "/u/placement" },
];

export default function Header() {
  //Sidebar functions
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateIsMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      updateIsMobile();
      window.addEventListener("resize", updateIsMobile);

      return () => {
        window.removeEventListener("resize", updateIsMobile);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };

      window.addEventListener("scroll", handleScroll);

      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const slideIn = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8 } },
  };

  const bounce = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="text-fluency-text-light mt-2 mr-3 ml-3 rounded-xl overflow-hidden h-[95vh]"
    >
      {/* Navbar */}
      <div className="absolute inset-x-0 top-0 z-10">
        {/* Desktop */}
        <motion.div
          className="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <motion.div variants={itemVariants} className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.2">
              <motion.div
                className="lg:block md:flex hidden w-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image src={SmallLogo} width={100} height={100} className="w-[2.8rem] h-auto" alt="FluencyLab Logo" />
              </motion.div>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-fluency-text-light dark:text-fluency-text-dark"
              onClick={() => setMobileMenuOpen(true)}
            >
              {/* Hamburger icon animation */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer group focus:outline-none"
              >
                <div className="flex flex-col justify-between w-6 h-6 transform transition-all duration-300 origin-center">
                  <motion.div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-blue-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150" />
                  <motion.div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-orange-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150" />
                  <motion.div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 hover:dark:bg-fluency-red-500 h-1 w-9 rounded transform origin-left transition-all duration-300 delay-150" />
                </div>
              </motion.div>
            </button>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="hidden lg:flex lg:gap-x-12"
          >
            {navigation.map((item, index) => (
              <motion.a
                key={item.name}
                variants={itemVariants}
                whileHover={{
                  y: -3,
                  color: "#f97316", // This is your yellow color
                  transition: { duration: 0.15, ease: "easeInOut" } // Set duration to 1 second
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(false)}
                id="navbarheader"
                href={item.href}
                className="font-bold border-b-4 border-transparent text-fluency-text-light dark:text-fluency-text-dark mx-1 sm:mx-1"
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="hidden lg:flex lg:flex-1 lg:justify-end lg: items-center lg: gap-4"
          >
            <motion.div variants={itemVariants}>
              <ToggleDarkMode />
            </motion.div>
            <motion.a
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/signin"
              className="gap-1 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 ease-in-out duration-300 text-fluency-text-dark text-md rounded-md"
            >
              Entrar <TbLogin2 className="w-6 h-auto" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <Dialog
              as={motion.div}
              className="lg:hidden"
              open={mobileMenuOpen}
              onClose={setMobileMenuOpen}
            >
              <div className="fixed inset-0 z-50" />
              <DialogPanel
                as={motion.div}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed inset-y-0 right-0 z-50 w-full bg-fluency-bg-light dark:bg-fluency-bg-dark px-6 py-6 sm:max-w-sm"
              >
                <div className="flex items-center justify-between">
                  <a href="#" className="-m-1.5 p-1.5">
                    <span className="sr-only">FluencyLab</span>
                    <Image
                      className="h-10 w-auto"
                      src={Logo}
                      alt="FluencyLab"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md mt-4 text-gray-900"
                  >
                    <span className="sr-only">Close menu</span>
                    <div className="relative cursor-pointer group focus:outline-none">
                      <div className="flex flex-col justify-between w-5 h-5 transform transition-all duration-300 origin-center translate-x-0">
                        <div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left rotate-[45deg] w-6 -translate-y-4 transition-all duration-300 delay-150"></div>
                        <div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 w-7 rounded transform opacity-0 translate-x-0 transition-all duration-300"></div>
                        <div className="bg-fluency-blue-800 dark:bg-fluency-gray-100 h-1 rounded transform origin-left -rotate-[45deg] w-6 transition-all duration-300 delay-150"></div>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="mt-12 flex flex-col items-center">
                  <div className="-my-6 divide-y divide-gray-500/10 flex flex-col items-center">
                    <div className="space-y-2 py-6 flex flex-col items-center gap-5">
                      {navigation.map((item) => (
                        <a
                          onClick={() => setMobileMenuOpen(false)}
                          key={item.name}
                          href={item.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-lg font-bold leading-7 text-fluency-text-light dark:text-fluency-text-dark ease-in-out duration-300"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/u/googlecalendarpage"
                          className="gap-2 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-blue-500 hover:bg-fluency-blue-600 text-fluency-text-dark ease-in-out duration-30 text-sm rounded-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                            />
                          </svg>
                          Agende uma aula grátis!
                        </Link>
                        <WhatsAppButton buttonText="ou, manda mensagem aqui" />
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <a
                          href="/signin"
                          className="gap-1 pl-5 leading-6 inline-flex items-center px-4 py-2 font-semibold bg-fluency-gray-500 dark:bg-fluency-gray-700 text-fluency-text-dark dark:text-fluency-text-dark ease-in-out duration-300 text-sm rounded-md"
                        >
                          Entrar <TbLogin2 className="w-6 h-auto" />
                        </a>
                        <ToggleDarkMode />
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </Dialog>
          )}
        </AnimatePresence>
      </div>

      {/* Landing Content */}
      <div className="relative isolate px-6 lg:px-8 bg-fluency-pages-light dark:bg-fluency-pages-dark text-fluency-text-light dark:text-fluency-text-dark">
        <div className="container flex flex-col justify-center items-center p-2 mx-auto sm:py-12 lg:py-24 lg:flex-row lg:justify-between">
          <motion.div
            variants={containerVariants}
            className="flex flex-col items-center lg:items-start text-center p-6 sm:text-center sm:content-center lg:text-left lg:text-nowrap"
          >
            {isMobile && (
              <motion.div
                variants={fadeIn}
                className="flex items-center justify-center w-60"
              >
                <Image
                  className="h-auto w-auto hover:contrast-150 ease-in-out duration-300"
                  src={Logo}
                  alt="FluencyLab"
                />
              </motion.div>
            )}

            <motion.h1
              variants={itemVariants}
              className="mt-6 mb-4 font-500 text-3xl md:text-6xl"
            >
              Uma abordagem{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-fluency-orange-500 font-medium hover:text-fluency-orange-600 ease-in-out duration-300"
              >
                única
              </motion.span>
              <br />
              para aprender <br />
              um Idioma online
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base mb-4 font-300"
            >
              Aprenda no seu próprio ritmo,
              <br />
              com o que gosta, e de onde preferir.
            </motion.p>

            {isMobile ? (
              <motion.div
                variants={containerVariants}
                className="z-50 container md:flex md:gap-2 md:flex-row md:content-center flex flex-rows gap-2 items-center mb-3"
              >
                <motion.div variants={itemVariants}>
                  <Link
                    href="/u/googlecalendarpage"
                    className="w-max cursor-pointer gap-1 leading-6 inline-flex items-center px-4 py-2 bg-fluency-blue-500 hover:bg-fluency-blue-500 ease-in-out duration-300 text-fluency-text-dark text-sm font-medium rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                      />
                    </svg>
                    <button>Agendar, ou</button>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <WhatsAppButton buttonText="Mensagem aqui" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                className="container md:flex md:gap-2 md:flex-row md:justify-center flex flex-col gap-2 items-center lg:content-center lg:flex lg:flex-row lg:justify-start"
              >
                <motion.div variants={itemVariants}>
                  <GoogleCalendarButton />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <WhatsAppButton buttonText="ou, manda mensagem aqui" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            variants={slideIn}
            className="flex items-center justify-center p-4 sm:p-1 -mt-[40%] sm:mt-0 md:h-100"
          >
            <Image
              className="object-contain h-[26rem] sm:h-80 lg:h-[27.5rem] xl:h-112 2xl:h-128"
              src={LandingHeaderImage}
              alt="FluencyLab"
              priority
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Image
            className="hidden sm:block w-[12rem] absolute bottom-6 left-[38rem]"
            src={SemiCircle}
            alt="FluencyLab"
            priority
          />
        </motion.div>
      </div>

      <motion.div
        className={`fixed bottom-4 z-[99999] ${
          isScrolled ? "right-4" : "left-1/2 transform -translate-x-1/2"
        } cursor-pointer`}
        onClick={scrollToTop}
        variants={bounce}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isScrolled ? (
          <FaArrowUp className="w-10 h-auto text-fluency-blue-500 hover:text-fluency-blue-700 duration-300 ease-in-out transition-all" />
        ) : (
          <a href="#aboutus">
            <FaArrowDown className="w-10 h-auto text-fluency-gray-500 hover:text-fluency-gray-700 duration-300 ease-in-out transition-all" />
          </a>
        )}
      </motion.div>

    </motion.div>
  );
}
