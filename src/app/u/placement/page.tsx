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

  const handleDontKnow = () => {
    if (!language) return;

    const abilityName = abilities[currentAbilityIndex];
    const questionsForAbility = database[language as 'en' | 'es'][abilityName as keyof typeof database.en];
    const currentQuestion = questionsForAbility[currentQuestionIndex];
    const lastQuestionIndex = questionsForAbility.length - 1;
    const lastQuestion = questionsForAbility[lastQuestionIndex];

    // 1. Mark current question as skipped
    handleAnswer(currentQuestion.id, null, false, currentQuestion.difficulty, currentQuestionIndex, true);

    // 2. Mark last question as skipped (if it's not the same as current and not already answered/skipped)
    if (currentQuestionIndex !== lastQuestionIndex && !userAnswers[lastQuestion.id]) {
        handleAnswer(lastQuestion.id, null, false, lastQuestion.difficulty, lastQuestionIndex, true);
    }

    // 3. Determine next question index or finish
    const nextQuestionIndex = currentQuestionIndex + 1;

    // Check if we should finish the ability test
    // Finish if the next index is the last question index AND the last question was just skipped by this action OR
    // Finish if the next index is beyond the last question index
    const shouldFinish = (nextQuestionIndex === lastQuestionIndex && currentQuestionIndex !== lastQuestionIndex) || nextQuestionIndex > lastQuestionIndex;

    if (shouldFinish) {
        finishAbilityTest();
    } else {
        // Go to the next question normally
        setCurrentQuestionIndex(nextQuestionIndex);
        setAbilityQuestionProgress(prev => ({
            ...prev,
            [abilityName]: nextQuestionIndex
        }));
    }
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
        let skippedCount = 0;
        let score = 0;
        let maxScore = 0;
        let totalQuestionsAnswered = 0;
        let correctAnswersCount = 0;

        questionsForAbility.forEach(question => {
            maxScore += question.difficulty; // Calcula o score máximo possível para a habilidade
            if (userAnswers[question.id]) {
                totalQuestionsAnswered++;
                if (userAnswers[question.id].skipped) {
                    skippedCount++; // Conta as questões puladas
                } else if (userAnswers[question.id].isCorrect) {
                    correctAnswersCount++;
                    score += question.difficulty; // Soma a dificuldade apenas se a resposta estiver correta e não pulada
                }
            }
        });

        // Thresholds ajustados para o score máximo de 42 (assumindo 12 questões, 2 por nível 1-6)
        let level = "A1";
        if (score > 7) level = "A2";  // > 1/6 do maxScore (42 * 1/6 = 7)
        if (score > 14) level = "B1"; // > 1/3 do maxScore (42 * 1/3 = 14)
        if (score > 21) level = "B2"; // > 1/2 do maxScore (42 * 1/2 = 21)
        if (score > 28) level = "C1"; // > 2/3 do maxScore (42 * 2/3 = 28)
        if (score > 35) level = "C2"; // > 5/6 do maxScore (42 * 5/6 = 35)

        // Ajuste de dificuldade: Se muitas questões foram puladas, limita o nível máximo.
        // Exemplo: Se mais de 4 questões foram puladas, limita o nível a B1.
        // Este threshold (4) pode ser ajustado conforme necessário.
        if (skippedCount > 4) {
            const levelValues = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
            if (levelValues[level as keyof typeof levelValues] > levelValues["B1"]) {
                level = "B1"; // Limita o nível máximo a B1 se mais de 4 questões foram puladas
            }
        }

        setAbilityResults(prev => [
            ...prev,
            { ability: abilityName, score, level, correctAnswers: correctAnswersCount, totalQuestions: questionsForAbility.length, maxScore, skippedCount } // Inclui skippedCount
        ]);
    };

  return (
    <div className="bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark flex flex-col h-screen w-full overflow-y-auto">
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
        onDontKnow={handleDontKnow} // Passa a nova função
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
