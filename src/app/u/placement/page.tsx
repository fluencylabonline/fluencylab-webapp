'use client'
import React, { useState, useEffect } from 'react';
import LanguageSelection from './components/LanguageSelection';
import AbilityCard from './components/AbilityCard';
import QuestionModal from './components/QuestionModal';
import Results from './components/Results';
import { database } from './database';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import Link from 'next/link';
import { BsArrowLeft } from 'react-icons/bs';

const abilities = ["vocabulary", "reading", "listening", "speaking", "grammar"];
const abilityTranslations: { [key: string]: string } = {
  vocabulary: 'Vocabulário',
  reading: 'Leitura',
  listening: 'Audição',
  speaking: 'Conversação',
  grammar: 'Gramática',
};


const testResultsKey = 'placementTestResults';
const abilityProgressKey = 'abilityProgress';
const abilityQuestionProgressKey = 'abilityQuestionProgress';
const userAnswersKey = 'userAnswers';
const selectedLanguageKey = 'selectedLanguage';
const lastTestDateKey = 'lastTestDate';

export default function HomePage() {
  // Estados do teste
  const [language, setLanguage] = useState<string | null>(null);
  const [currentAbilityIndex, setCurrentAbilityIndex] = useState(0);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [abilityResults, setAbilityResults] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: { userAnswer: string | null; isCorrect: boolean; difficulty: number; skipped: boolean } }>({});
  const [abilityQuestionProgress, setAbilityQuestionProgress] = useState<{ [ability: string]: number }>({});

  // Controle do teste diário
  const [testBlocked, setTestBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  // Estado que guarda a data atual (formato YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Estado para o modo escuro
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
  const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
      const storedDarkMode = localStorage.getItem('isDarkMode');
      return storedDarkMode ? storedDarkMode === 'true' : true;
    }
    return true;
  });

  // Atualiza o modo escuro
  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('isDarkMode', isChecked.toString());
      document.body.classList.toggle('dark', isChecked);
    }
  }, [isChecked, isLocalStorageAvailable]);

  // Calcula o tempo restante até a meia-noite
  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Verifica se o teste deve estar bloqueado com base na data armazenada
  const checkTestBlocked = () => {
    const lastTestDate = localStorage.getItem(lastTestDateKey);
    const today = new Date().toISOString().split('T')[0];
    // Se não houver data ou a data salva for menor que hoje, o teste pode ser feito
    if (!lastTestDate || lastTestDate < today) {
      return false;
    }
    return true;
  };

  // Reseta os dados do teste, inclusive removendo os placementTestResults
  const resetDailyTest = () => {
    localStorage.removeItem(lastTestDateKey);
    localStorage.removeItem(testResultsKey);
    localStorage.removeItem(selectedLanguageKey);
    setTestCompleted(false);
    setAbilityResults([]);
    setUserAnswers({});
    setCurrentAbilityIndex(0);
    setCurrentQuestionIndex(0);
    setAbilityQuestionProgress({});
  };

  // Atualiza o estado currentDate a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      setCurrentDate(today);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sempre que currentDate mudar, verifica se o teste deve ser resetado
  useEffect(() => {
    const lastTestDate = localStorage.getItem(lastTestDateKey);
    if (lastTestDate && lastTestDate < currentDate) {
      resetDailyTest();
      setTestBlocked(false);
    }
  }, [currentDate]);

  // Carrega dados salvos e verifica o bloqueio inicial
  useEffect(() => {
    const savedResults = localStorage.getItem(testResultsKey);
    if (savedResults) {
      setAbilityResults(JSON.parse(savedResults));
      setTestCompleted(true);
    }
    const savedAbilityProgress = localStorage.getItem(abilityProgressKey);
    if (savedAbilityProgress) {
      setCurrentAbilityIndex(parseInt(savedAbilityProgress, 10));
    }
    const savedAbilityQuestionProgress = localStorage.getItem(abilityQuestionProgressKey);
    if (savedAbilityQuestionProgress) {
      setAbilityQuestionProgress(JSON.parse(savedAbilityQuestionProgress));
    }
    const savedUserAnswers = localStorage.getItem(userAnswersKey);
    if (savedUserAnswers) {
      setUserAnswers(JSON.parse(savedUserAnswers));
    }
    const savedLanguage = localStorage.getItem(selectedLanguageKey);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    const blocked = checkTestBlocked();
    setTestBlocked(blocked);
    if (blocked) {
      setTimeLeft(getTimeUntilMidnight());
    }
  }, []);

  // Sincroniza os dados no localStorage
  useEffect(() => {
    if (language) {
      localStorage.setItem(selectedLanguageKey, language);
    } else {
      localStorage.removeItem(selectedLanguageKey);
    }
    if (testCompleted) {
      localStorage.setItem(testResultsKey, JSON.stringify(abilityResults));
    } else {
      localStorage.removeItem(testResultsKey);
    }
    localStorage.setItem(abilityProgressKey, currentAbilityIndex.toString());
    localStorage.setItem(abilityQuestionProgressKey, JSON.stringify(abilityQuestionProgress));
    localStorage.setItem(userAnswersKey, JSON.stringify(userAnswers));
  }, [language, testCompleted, abilityResults, currentAbilityIndex, abilityQuestionProgress, userAnswers]);

  // Atualiza o contador regressivo se o teste estiver bloqueado
  useEffect(() => {
    if (testBlocked) {
      const timer = setInterval(() => {
        setTimeLeft(getTimeUntilMidnight());
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [testBlocked]);

  // Função para lidar com a seleção de idioma
  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setTestCompleted(false);
    setAbilityResults([]);
    setUserAnswers({});
    setCurrentAbilityIndex(0);
    setCurrentQuestionIndex(0);
    setAbilityQuestionProgress({});
    localStorage.removeItem(testResultsKey);
    localStorage.removeItem(abilityProgressKey);
    localStorage.removeItem(abilityQuestionProgressKey);
    localStorage.removeItem(userAnswersKey);
    localStorage.removeItem(selectedLanguageKey);
  };

  // Inicia o teste se não estiver bloqueado
  const startAbilityTest = () => {
    if (testBlocked) return;
    setIsQuestionModalOpen(true);
    const savedQuestionIndex = abilityQuestionProgress[abilities[currentAbilityIndex]] || 0;
    setCurrentQuestionIndex(savedQuestionIndex);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
  };

  const handleAnswer = (
    questionId: string,
    userAnswer: string | null,
    isCorrect: boolean,
    difficulty: number,
    questionIndex: number,
    skipped: boolean
  ) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: { userAnswer, isCorrect, difficulty, skipped }
    }));
  };

  const goToNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextQuestionIndex);
    setAbilityQuestionProgress(prev => ({
      ...prev,
      [abilities[currentAbilityIndex]]: nextQuestionIndex
    }));
    if (
      nextQuestionIndex >=
      database[language as 'en' | 'es'][abilities[currentAbilityIndex] as keyof typeof database.en].length
    ) {
      finishAbilityTest();
    }
  };

  const skipQuestion = () => {
    goToNextQuestion();
  };

  const finishAbilityTest = () => {
    setIsQuestionModalOpen(false);
    calculateAbilityResult();
    if (currentAbilityIndex < abilities.length - 1) {
      const nextAbilityIndex = currentAbilityIndex + 1;
      setCurrentAbilityIndex(nextAbilityIndex);
      setCurrentQuestionIndex(0);
      setAbilityQuestionProgress(prev => ({
        ...prev,
        [abilities[nextAbilityIndex]]: 0
      }));
      localStorage.setItem(abilityProgressKey, nextAbilityIndex.toString());
    } else {
      setTestCompleted(true);
      localStorage.removeItem(abilityProgressKey);
      localStorage.removeItem(abilityQuestionProgressKey);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(lastTestDateKey, today);
      setTestBlocked(true);
      setTimeLeft(getTimeUntilMidnight());
    }
  };

  const restartTest = () => {
    setLanguage(null);
    setTestCompleted(false);
    setAbilityResults([]);
    setUserAnswers({});
    setCurrentAbilityIndex(0);
    setCurrentQuestionIndex(0);
    setAbilityQuestionProgress({});
    localStorage.removeItem(testResultsKey);
    localStorage.removeItem(abilityProgressKey);
    localStorage.removeItem(abilityQuestionProgressKey);
    localStorage.removeItem(userAnswersKey);
    localStorage.removeItem(selectedLanguageKey);
  };

  const calculateAbilityResult = () => {
    const abilityName = abilities[currentAbilityIndex];
    const questionsForAbility = database[language as 'en' | 'es'][abilityName as keyof typeof database.en];
    let score = 0;
    let correctAnswersCount = 0;
    let totalQuestions = 0;
    questionsForAbility.forEach(question => {
      if (userAnswers[question.id]) {
        totalQuestions++;
        if (userAnswers[question.id].isCorrect) {
          correctAnswersCount++;
          score += question.difficulty;
        }
      }
    });
    let level = "A1";
    if (score > 5) level = "A2";
    if (score > 10) level = "B1";
    if (score > 15) level = "B2";
    if (score > 20) level = "C1";
    if (score >= 25) level = "C2";
    setAbilityResults(prev => [
      ...prev,
      { ability: abilityName, score, level, correctAnswers: correctAnswersCount, totalQuestions }
    ]);
  };

  return (
    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark flex flex-col h-[100vh] w-full overflow-y-auto">
      {/* Cabeçalho */}
      <div className="flex flex-row w-full justify-between items-center px-3 pt-1">
        <Link href="/">
          <button className="text-fluency-text-light dark:text-fluency-text-dark hover:dark:text-fluency-blue-500 hover:text-fluency-blue-500 ease-in-out duration-300 flex justify-center">
            <BsArrowLeft className="lg:w-9 lg:h-9 w-9 h-9" />
          </button>
        </Link>
        <div>
          <ToggleDarkMode />
        </div>
      </div>
      {/* Conteúdo principal */}
      <div className="flex flex-col items-center justify-start w-full h-full">
        { !language ? (
          <LanguageSelection onLanguageSelect={handleLanguageSelect} />
        ) : (
          <>
            {!testBlocked && (
            <div className='flex flex-col items-center justify-center gap-8'>
                <h1 className="text-3xl font-bold text-center">Nivelamento - {language.toUpperCase()}</h1>
                <div className="flex flex-row flex-wrap items-center justify-center gap-6">
                  {abilities.map((ability, index) => {
                    const translatedAbility = abilityTranslations[ability] || ability;
                    return (
                      <AbilityCard
                      key={ability}
                      ability={translatedAbility.charAt(0).toUpperCase() + translatedAbility.slice(1)}
                      isCompleted={index < currentAbilityIndex}
                      isDisabled={index > currentAbilityIndex || testBlocked}
                      onClick={startAbilityTest}
                      />
                    );
                  })}
                </div>
            </div>)}
            {testBlocked && (
              <div className="flex flex-col items-center">
                <Results results={abilityResults} timeLeft={timeLeft} />
              </div>
            )}
          </>
        )}
      </div>
      {/* Modal de perguntas */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={closeQuestionModal}
        questions={
          language
            ? database[language as 'en' | 'es'][
                abilities[currentAbilityIndex] as keyof typeof database.en
              ]
            : []
        }
        ability={
          abilityTranslations[abilities[currentAbilityIndex]] ||
          abilities[currentAbilityIndex]
        } // Use translation here
        currentQuestionIndex={currentQuestionIndex}
        onAnswer={handleAnswer}
        onNextQuestion={goToNextQuestion}
        onSkipQuestion={skipQuestion}
        isLastQuestion={
          language
            ? currentQuestionIndex ===
              database[language as 'en' | 'es'][
                abilities[currentAbilityIndex] as keyof typeof database.en
              ].length -
              1
            : false
        }
        language={language || ''}
      />
    </div>
  );
}
