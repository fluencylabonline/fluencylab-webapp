"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaUsers,
  FaClock,
  FaHeart,
  FaHandsHelping,
  FaBookOpen,
  FaEye,
  FaHandPaper,
} from "react-icons/fa";
import { GiHandOk } from "react-icons/gi";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
  hover: {
    scale: 1.01,
    transition: { duration: 0.1 },
  },
};

export default function LibrasCoursePage() {
  const [scrollY, setScrollY] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Criar mensagem para WhatsApp
    const message = `Olá! Gostaria de saber mais sobre o curso de Libras.\n\nNome: ${formData.name}\nEmail: ${formData.email}\nTelefone: ${formData.phone}\n`;
    const whatsappUrl = `https://wa.me/5586999535791?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    setIsModalOpen(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const benefits = [
    {
      icon: <FaHandsHelping className="text-3xl text-fluency-orange-600" />,
      title: "Comunicação Inclusiva",
      description:
        "Aprenda a se comunicar com a comunidade surda e promova a inclusão social em todos os ambientes.",
    },
    {
      icon: <FaBookOpen className="text-3xl text-fluency-orange-600" />,
      title: "Metodologia Visual",
      description:
        "Ensino focado na comunicação visual e gestual, respeitando a cultura e identidade surda.",
    },
    {
      icon: <FaClock className="text-3xl text-fluency-orange-600" />,
      title: "Horários Flexíveis",
      description:
        "Aulas adaptadas à sua disponibilidade, com professores especializados.",
    },
    {
      icon: <FaHeart className="text-3xl text-fluency-orange-600" />,
      title: "Impacto Social",
      description:
        "Contribua para uma sociedade mais inclusiva e quebre barreiras de comunicação.",
    },
    {
      icon: <FaEye className="text-3xl text-fluency-orange-600" />,
      title: "Percepção Visual",
      description:
        "Desenvolva sua percepção visual e expressão corporal para uma comunicação efetiva.",
    },
    {
      icon: <GiHandOk className="text-3xl text-fluency-orange-600" />,
      title: "Prática Constante",
      description:
        "Exercícios práticos e interação com a comunidade surda para fixação do aprendizado.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Introdução à Libras",
      description:
        "Conheça a história, cultura surda e os fundamentos básicos da Língua Brasileira de Sinais.",
    },
    {
      step: "02",
      title: "Primeira conversa",
      description:
        "Domine o alfabeto manual, números e sinais básicos para comunicação inicial.",
    },
    {
      step: "03",
      title: "Vocabulário Prático",
      description:
        "Aprenda sinais do cotidiano, família, trabalho e situações sociais importantes.",
    },
    {
      step: "04",
      title: "Conversação Fluente",
      description:
        "Pratique diálogos complexos e desenvolva fluência na comunicação em Libras.",
    },
    {
      step: "05",
      title: "Especificidades",
      description:
        "Aprenda sinais específicos para situações cotidianas, como trabalho, saúde e educação.",
    },
  ];

  return (
    <div className="min-h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Video with Parallax */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            willChange: "transform",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover scale-110"
          >
            <source src="/videos/libras.webm" type="video/webm" />
            {/* Fallback for browsers that don't support webm */}
            <div className="w-full h-full bg-gradient-to-br from-fluency-orange-500 to-fluency-purple-500"></div>
          </video>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FaHandPaper className="text-lg" />
              Curso de Libras Certificado
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Aprenda <span className="text-fluency-orange-300">Libras</span>
              <br />e promova a{" "}
              <span className="text-fluency-orange-300">Inclusão</span>
            </motion.h1>

            <motion.p
              className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Domine a Língua Brasileira de Sinais e abra portas para uma
              comunicação mais inclusiva. Professores especializados,
              metodologia visual e impacto social garantido.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button
                onClick={() => {
                  const element = document.getElementById("comeco");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:text-fluency-orange-500 duration-300 transition-all ease-in-out px-6 py-4 rounded-full text-sm font-medium mb-6"
              >
                Saber mais!
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <motion.section
        id="comeco"
        className="py-20 px-4 bg-fluency-pages-light/20 dark:bg-fluency-pages-dark"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-6">
              Por que aprender{" "}
              <span className="text-fluency-orange-600">Libras?</span>
            </h2>
            <p className="text-xl text-fluency-gray-600 dark:text-fluency-gray-300 max-w-3xl mx-auto">
              Descubra os benefícios de dominar a Língua Brasileira de Sinais e
              como isso pode transformar vidas.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-slate-300/20 dark:bg-slate-800/20 p-8 rounded-2xl border border-fluency-gray-200 dark:border-fluency-orange-700 hover:border-fluency-orange-500 dark:hover:border-fluency-orange-400 transition-all duration-300"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="mb-6">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-fluency-orange-950 dark:text-fluency-text-dark mb-4">
                  {benefit.title}
                </h3>
                <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="py-20 px-4 bg-white dark:bg-fluency-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-6">
              Como funciona nosso{" "}
              <span className="text-fluency-orange-600">método?</span>
            </h2>
            <p className="text-xl text-fluency-gray-600 dark:text-fluency-gray-300 max-w-3xl mx-auto">
              Um processo estruturado e eficiente para você dominar Libras do
              básico ao avançado.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-8"
            variants={staggerContainer}
          >
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                variants={cardVariants}
              >
                <div className="w-16 h-16 bg-fluency-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-4">
                  {step.title}
                </h3>
                <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                  {step.description}
                </p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-fluency-orange-200 dark:bg-fluency-orange-800 transform translate-x-4"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Social Impact Section */}
      <motion.section
        className="py-20 px-4 bg-fluency-pages-light dark:bg-fluency-pages-dark"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-6">
              O <span className="text-fluency-orange-600">impacto</span> que
              você pode gerar
            </h2>
            <p className="text-xl text-fluency-gray-600 dark:text-fluency-gray-300 max-w-3xl mx-auto">
              Aprender Libras vai além do conhecimento pessoal - é sobre
              transformar a sociedade.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            <motion.div
              className="bg-gray-100/90 dark:bg-slate-800/20 p-8 rounded-2xl border border-fluency-gray-200 dark:border-fluency-gray-700 text-center"
              variants={cardVariants}
            >
              <div className="w-16 h-16 bg-fluency-orange-100 dark:bg-fluency-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-2xl text-fluency-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-4">
                10+ milhões
              </h3>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                de pessoas surdas no Brasil que podem se beneficiar da sua
                comunicação inclusiva
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-100/90 dark:bg-slate-800/20 p-8 rounded-2xl border border-fluency-gray-200 dark:border-fluency-gray-700 text-center"
              variants={cardVariants}
            >
              <div className="w-16 h-16 bg-fluency-orange-100 dark:bg-fluency-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGraduationCap className="text-2xl text-fluency-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-4">
                Oportunidades
              </h3>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                profissionais em educação, saúde, serviços públicos e empresas
                inclusivas
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-100/90 dark:bg-slate-800/20 p-8 rounded-2xl border border-fluency-gray-200 dark:border-fluency-gray-700 text-center"
              variants={cardVariants}
            >
              <div className="w-16 h-16 bg-fluency-orange-100 dark:bg-fluency-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-2xl text-fluency-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark mb-4">
                Transformação
              </h3>
              <p className="text-fluency-gray-600 dark:text-fluency-gray-300">
                social real através da quebra de barreiras de comunicação e
                promoção da inclusão
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-gray-200/70"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
            variants={fadeInUp}
          >
            Pronto para fazer a diferença?
          </motion.h2>
          <motion.p className="text-xl text-gray-700 mb-8" variants={fadeInUp}>
            Entre em contato conosco e descubra como você pode aprender Libras e
            contribuir para uma sociedade mais inclusiva!
          </motion.p>
          <motion.div variants={fadeInUp}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-500/70 hover:bg-amber-600 backdrop-blur-sm text-white hover:text-white duration-300 transition-all ease-in-out px-6 py-4 rounded-full text-sm font-medium mb-6"
            >
              Marcar minha aula!
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Modal de Contato */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-fluency-gray-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-fluency-text-light dark:text-fluency-text-dark">
                Entre em Contato
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-fluency-gray-500 hover:text-fluency-gray-700 dark:text-fluency-gray-400 dark:hover:text-fluency-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-lg focus:ring-2 focus:ring-fluency-orange-500 focus:border-transparent bg-white dark:bg-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-lg focus:ring-2 focus:ring-fluency-orange-500 focus:border-transparent bg-white dark:bg-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fluency-text-light dark:text-fluency-text-dark mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-fluency-gray-300 dark:border-fluency-gray-600 rounded-lg focus:ring-2 focus:ring-fluency-orange-500 focus:border-transparent bg-white dark:bg-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <button
                type="submit"
                className="flex flex-col justify-end gap-2 bg-amber-500/50 backdrop-blur-sm text-white hover:text-fluency-amber-500 duration-300 transition-all ease-in-out px-6 py-4 rounded-full text-sm font-medium mb-6"
              >
                Enviar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
