'use client';
import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { useSession } from 'next-auth/react';
import { db } from '@/app/firebase';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Modal from './Components/ModalPlacement';
import { BiArrowBack } from 'react-icons/bi';
import { motion } from 'framer-motion';
import FluencyButton from '@/app/ui/Components/Button/button';
// Components
import CategoryCard from './Components/CategoryCard';
import { SpeakingPlacement } from './Components/Modes/SpeakingPlacement';
import VocabularyPlacement from './Components/Modes/VocabularyPlacement';
import { ReadingPlacement } from './Components/Modes/ReadingPlacement';
import WritingPlacement from './Components/Modes/WritingPlacement';
import { ListeningPlacement } from './Components/Modes/ListeningPlacement';

import GrammarPlacement from './Components/Modes/GrammarPlacement';

const abilities = ['speaking', 'listening', 'reading', 'writing', 'vocabulary', 'grammar'];

const PlacementTest = ({ testId, setShowTest }: { testId: string | null, setShowTest: any }) => {
  const { data: session } = useSession();
  const [userId, setUserId] = useState('');
  const [language, setLanguage] = useState('');
  const [activeTest, setActiveTest] = useState<any>(null);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [completedAbilities, setCompletedAbilities] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const instructionsShownRef = useRef(false); // useRef to track if instructions have been shown

  const openModal = (ability: string) => {
    if (isAbilityAvailable(ability) && !activeTest?.abilitiesCompleted?.[`${ability}Completed`]) {
      setSelectedAbility(ability);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
      setLanguage(session.user.idioma);
    }
  }, [session]);

  useEffect(() => {
    if (!userId || !testId) return;

    const placementRef = collection(db, 'users', userId, 'Placement');
    const q = query(placementRef, where('__name__', '==', testId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const activeTestData = snapshot.docs[0].data();
        setActiveTest(activeTestData);

        const completed = abilities.filter(
          (ability) => activeTestData.abilitiesCompleted?.[`${ability}Completed`] === true
        );
        setCompletedAbilities(completed);

        if (completed.length === 0 && !instructionsShownRef.current) { // Check ref and isFirstTime
          setIsFirstTime(true);
          setShowInstructions(true);
          instructionsShownRef.current = true; // Set ref to true after showing instructions once
        } else {
          setIsFirstTime(false); // Ensure isFirstTime is false after initial check
        }
      }
    });

    return () => unsubscribe();
  }, [userId, testId]);

  const isAbilityAvailable = (ability: string) => {
    const index = abilities.indexOf(ability);
    return index === 0 || completedAbilities.includes(abilities[index - 1]);
  };

  const progressPercentage = (completedAbilities.length / abilities.length) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    },
  };

  return (
    <div className="p-6">

      <div className='flex flex-row items-center gap-2 mb-4'>
        <BiArrowBack onClick={() => setShowTest(false)} className='cursor-pointer w-7 h-7 text-indigo-500 dark:text-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-800 duration-300 ease-in-out transition-all' />
        <h1 className="text-2xl font-bold">Habilidades:</h1>
      </div>

      <div className="w-full bg-gray-300 rounded-[3.5px] h-2.5 mb-4 overflow-hidden">
        <motion.div
          className="bg-indigo-600 h-2.5"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: 'spring', duration: 1.5 }}
        />
      </div>

      <motion.div
        className="flex flex-row flex-wrap items-center justify-center gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {abilities.map((ability, index) => {
          const completed = activeTest?.abilitiesCompleted?.[`${ability}Completed`] ?? false;
          const score = activeTest?.abilitiesScore?.[`${ability}Score`] ?? 0;
          const isDisabled = !isAbilityAvailable(ability) || completed;
          const necessaryAbility = isDisabled && index > 0 ? abilities[index - 1] : undefined; // Determine necessaryAbility

          return (
            <motion.div key={index} variants={childVariants}>
              <CategoryCard
                category={ability}
                progress={score}
                isSelected={selectedAbility === ability}
                onSelect={() => openModal(ability)}
                disabled={isDisabled}
                necessaryAbility={necessaryAbility} // Pass necessaryAbility prop
              />
            </motion.div>
          );
        })}
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedAbility}>
        {selectedAbility === 'speaking' && (
          <SpeakingPlacement language={language} onClose={() => setSelectedAbility(null)} testId={testId} />
        )}

        {selectedAbility === 'listening' && isAbilityAvailable('listening') && (
          <ListeningPlacement language={language} onClose={() => setSelectedAbility(null)} testId={testId} />
        )}

        {selectedAbility === 'reading' && isAbilityAvailable('reading') && (
          <ReadingPlacement language={language} onClose={() => setSelectedAbility(null)} testId={testId} />
        )}

        {selectedAbility === 'writing' && isAbilityAvailable('writing') && (
          <WritingPlacement language={language} onClose={() => setSelectedAbility(null)} testId={testId} />
        )}

        {selectedAbility === 'vocabulary' && isAbilityAvailable('vocabulary') && (
          <VocabularyPlacement onClose={() => setSelectedAbility(null)} testId={testId} />
        )}

        {selectedAbility === 'grammar' && isAbilityAvailable('grammar') && (
          <GrammarPlacement onClose={() => setSelectedAbility(null)} testId={testId} />
        )}
      </Modal>

      <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="Instruções">
        <div className="lg:w-[50vw] md:w-[65vw] w-[70vw] flex flex-col items-center">
          <p className="text-gray-700 dark:text-gray-300 text-justify p-4 mb-4">
            Bem-vindo! Este teste avaliará suas habilidades em diferentes áreas do idioma.
            Você deve começar pela primeira habilidade disponível e avançar conforme completa cada uma.
            <br/>Escolha um momento calmo e tranquilo para fazer o teste, não responda com pressa e leia atentamente cada enunciado, isso vai te dar um resultado mais realista.
            <br/>Boa sorte!
          </p>
          <FluencyButton
            onClick={() => setShowInstructions(false)}
            variant='purple'
          >
            Começar
          </FluencyButton>
        </div>
      </Modal>

    </div>
  );
};

export default PlacementTest;