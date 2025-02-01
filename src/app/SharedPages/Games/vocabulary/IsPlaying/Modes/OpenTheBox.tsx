'use client';
import { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

interface VocabularyEntry {
  imageURL: string;
  vocab: string;
  options?: string[]; // Optional for singleplayer
  clickedOption?: string | null;
  isCorrect?: boolean | null;
}

export default function OpenTheBox({ gameID }: { gameID: string }) {
  const [vocabularies, setVocabularies] = useState<VocabularyEntry[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>(new Array(8).fill(''));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSingleplayer, setIsSingleplayer] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const singleplayer = params.get('aloneGameID');

  useEffect(() => {
    setIsSingleplayer(!!singleplayer);
  }, [singleplayer]);

  // Singleplayer mode: fetch data from 'VocabularyGame'
  useEffect(() => {
    if (isSingleplayer && singleplayer) {
      const fetchVocabulary = async () => {
        const vocabRef = doc(db, 'VocabularyGame', singleplayer);
        const docSnap = await getDoc(vocabRef);
        if (docSnap.exists()) {
          const vocabData = docSnap.data()?.vocabularies || [];
          setVocabularies(vocabData);
        }
      };
      fetchVocabulary();
    }
  }, [isSingleplayer, singleplayer]);

  // Multiplayer mode: fetch data with real-time updates using onSnapshot
  useEffect(() => {
    if (!isSingleplayer) {
      const vocabRef = doc(db, 'games', gameID, 'modes', 'openthebox');
      const unsubscribe = onSnapshot(vocabRef, (docSnap) => {
        const data = docSnap.data();
        if (data) {
          setVocabularies(data.vocabularydata || []);
        }
      });
      return () => unsubscribe();
    }
  }, [gameID, isSingleplayer]);

  const generateOptions = (vocab: string): string[] => {
    const incorrectOptions = ['cat', 'dog', 'car', 'banana', 'table', 'pen'].filter(
      (option) => option !== vocab
    );
    const randomOptions = [
      vocab,
      ...incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 2),
    ];
    return randomOptions.sort(() => 0.5 - Math.random());
  };

  // Multiplayer mode: handles box click with Firebase update
  const handleBoxClick = (index: number) => {
    if (vocabularies[index].isCorrect !== null) return;
    setSelectedIndex(index);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsModalOpen(true);
      setSelectedIndex(null);
    }, 500);
  };

  // Singleplayer mode: handles box click without Firebase update
  const handleBoxClickLocally = (index: number) => {
    if (selectedWords[index]) return;
    setSelectedIndex(index);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsModalOpen(true);
      setSelectedIndex(null);
    }, 500);
  };

  // Multiplayer mode: handles option selection with Firebase update
  const handleOptionClick = async (word: string, index: number, isCorrect: boolean) => {
    const updatedVocabulary = [...vocabularies];
    updatedVocabulary[index] = {
      ...updatedVocabulary[index],
      clickedOption: word,
      isCorrect,
    };

    try {
      const vocabRef = doc(db, 'games', gameID, 'modes', 'openthebox');
      await updateDoc(vocabRef, { vocabularydata: updatedVocabulary });

      const updatedSelectedWords = [...selectedWords];
      updatedSelectedWords[index] = isCorrect ? 'correct' : 'wrong';
      setSelectedWords(updatedSelectedWords);
      setIsModalOpen(false);
      const Result = toast.custom(
        <div
          style={{
            borderRadius: '16px',
            background: isCorrect ? '#22c55e' : '#ef4444',
            color: '#fff',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          {isCorrect ? '👏 Isso aí!' : '✖ Ops!'}
        </div>
      );
      
      // Close the toast after 1 second (1000ms)
      setTimeout(() => {
        toast.dismiss(Result);
      }, 1000);
    } catch (error) {
      toast.error('Algo deu errado!');
    }
  };

  // Singleplayer mode: handles option selection without Firebase update
  const handleOptionClickLocally = (word: string, index: number) => {
    const isCorrect = word === vocabularies[currentIndex!].vocab;
    const updatedSelectedWords = [...selectedWords];
    updatedSelectedWords[index] = isCorrect ? 'correct' : 'wrong';
    setSelectedWords(updatedSelectedWords);
    setIsModalOpen(false);

    const Result = toast.custom(
      <div
        style={{
          borderRadius: '16px',
          background: isCorrect ? '#22c55e' : '#ef4444',
          color: '#fff',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        {isCorrect ? '👏 Isso aí!' : '✖ Ops!'}
      </div>
    );
    
    // Close the toast after 1 second (1000ms)
    setTimeout(() => {
      toast.dismiss(Result);
    }, 1000);

  };

  return (
    <div className="flex justify-center mt-8">
      <div className="lg:w-[50%] md:w-full w-full flex flex-row flex-wrap gap-4 justify-center items-center">
        {vocabularies.map((vocab, index) => (
          <motion.div
            key={index}
            className="w-32 h-32 flex items-center justify-center font-bold text-2xl rounded-sm cursor-pointer shadow-md"
            onClick={() => (isSingleplayer ? handleBoxClickLocally(index) : handleBoxClick(index))}
            aria-disabled={vocabularies[index]?.isCorrect !== null}
            initial={{ scale: 1 }}
            whileTap={{ scale: 1.1 }}
            animate={{
              backgroundColor: isSingleplayer
                ? selectedWords[index] === 'correct'
                  ? '#22c55e' // Correct in singleplayer
                  : selectedWords[index] === 'wrong'
                  ? '#ef4444' // Wrong in singleplayer
                  : '#d1d5db' // Default in singleplayer
                : vocabularies[index]?.isCorrect === true
                ? '#22c55e' // Correct in multiplayer
                : vocabularies[index]?.isCorrect === false
                ? '#ef4444' // Wrong in multiplayer
                : '#d1d5db', // Default in multiplayer
              color: isSingleplayer
                ? selectedWords[index] !== '' // Singleplayer text color
                  ? '#fff'
                  : '#000'
                : vocabularies[index]?.isCorrect !== null // Multiplayer text color
                ? '#fff'
                : '#000',
              rotateX: selectedIndex === index ? 180 : 0,
              scale: selectedIndex === index ? 1.2 : 1,
              transition: { duration: 0.5, ease: 'easeInOut' },
            }}
          >
            {index + 1}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isModalOpen && currentIndex !== null && (
          <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 opacity-55"></div>
            <motion.div
              key={currentIndex}
              className="z-50 w-fit h-[50%] bg-fluency-pages-light dark:bg-fluency-pages-dark p-8 px-16 rounded-md"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="flex flex-row items-center justify-center gap-8">
                <motion.div
                  key={vocabularies[currentIndex].imageURL}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={vocabularies[currentIndex].imageURL}
                    alt={`Image for ${vocabularies[currentIndex].vocab}`}
                    width={300}
                    height={300}
                    className="rounded-lg w-52 h-auto shadow-lg"
                  />
                </motion.div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <h3 className="text-xl font-bold mb-3 text-fluency-orange-500">What is this?</h3>
                  {isSingleplayer
                    ? generateOptions(vocabularies[currentIndex].vocab).map((option, optionIndex) => {
                        return (
                          <motion.button
                            key={optionIndex}
                            className="px-4 py-2 text-lg font-semibold hover:text-fluency-orange-500 rounded-md bg-gray-300 dark:bg-fluency-gray-700 hover:dark:bg-gray-950 hover:bg-gray-700/25 w-full duration-300 ease-in-out transition-all"
                            onClick={() => handleOptionClickLocally(option, currentIndex!)}
                            disabled={selectedWords[currentIndex!] !== ''}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {option}
                          </motion.button>
                        );
                    })
                    : // Multiplayer: Fetch options from Firebase
                      vocabularies[currentIndex]?.options?.map((option, optionIndex) => {
                        const isCorrect = option === vocabularies[currentIndex]?.vocab;
                        return (
                          <motion.button
                            key={optionIndex}
                            className="px-4 py-2 text-lg font-semibold hover:text-fluency-orange-500 rounded-md bg-gray-300 dark:bg-fluency-gray-700 hover:dark:bg-gray-950 hover:bg-gray-700/25 w-full duration-300 ease-in-out transition-all"
                            onClick={() => handleOptionClick(option, currentIndex!, isCorrect)}
                            disabled={selectedWords[currentIndex!] !== ''}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {option}
                          </motion.button>
                        );
                      })
                  }
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
