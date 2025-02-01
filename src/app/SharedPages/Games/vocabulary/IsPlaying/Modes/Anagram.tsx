import { AnimatePresence, motion } from "framer-motion"; // Import Framer Motion
import FluencyButton from '@/app/ui/Components/Button/button';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { db } from '@/app/firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

interface AnagramProps {
  gameID: any;
}

const Anagram = ({ gameID }: AnagramProps) => {
  const [currentWord, setCurrentWord] = useState<string>(''); // Current word for the game
  const [currentImageURL, setCurrentImageURL] = useState<string>(''); // Image URL for the current word
  const [scrambledWord, setScrambledWord] = useState<string[]>([]); // Scrambled version of the word
  const [blankSpaces, setBlankSpaces] = useState<string[]>([]); // Holds the current state of blank spaces
  const [completed, setCompleted] = useState(false); // Track if the word is completed
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current word index
  const [wordsLeft, setWordsLeft] = useState<number>(0); // Track how many words are left
  const [gameFinished, setGameFinished] = useState(false); // Track if the game is finished
  const [hasScrambled, setHasScrambled] = useState(false); 
  const [vocabData, setVocabData] = useState<any[]>([]); 
  const params = new URLSearchParams(window.location.search);
  const singleplayer = params.get('aloneGameID');
  const [isSingleplayer, setIsSingleplayer] = useState(false)

  useEffect(() => {
    setIsSingleplayer(!!singleplayer);
  }, [singleplayer]);

  // Fetch all vocab data for singleplayer mode
  useEffect(() => {
    if (isSingleplayer && singleplayer) {
      const docRef = doc(db, 'VocabularyGame', singleplayer); // Reference to the specific document

      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const vocabData = data?.vocabularies || [];

          if (vocabData.length > 0) {
            // Store all vocab data locally
            setVocabData(vocabData);

            // Set the first word and its associated image
            const currentWordData = vocabData[0];
            const currentWord = currentWordData.vocab;

            // Scramble the word locally
            const scrambledWord = scrambleWordLocally(currentWord);
            const blankSpaces = Array(currentWord.length).fill('');

            // Update the state with the current word, image URL, scrambled word, and blank spaces
            setCurrentWord(currentWord);
            setCurrentImageURL(currentWordData.imageURL);
            setScrambledWord(scrambledWord.split(''));
            setBlankSpaces(blankSpaces);

            // Set words left to the total number of vocabularies
            setWordsLeft(vocabData.length);
          }
        } else {
          console.log("Ops")
        }
      });

      return () => unsubscribe();
    }
  }, [isSingleplayer, singleplayer]);
  
  const scrambleWordLocally = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  useEffect(() => {
    const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const vocabData = data?.vocabularydata;
        const syncedIndex = data?.currentIndex ?? 0;
  
        if (vocabData && vocabData.length > 0) {
          setCurrentIndex(syncedIndex); // Sync the current index across users
          const currentWordData = vocabData[syncedIndex];
          setCurrentWord(currentWordData.vocab);
          setCurrentImageURL(currentWordData.imageURL);
  
          // Check if scrambled word exists in Firestore
          if (currentWordData.scrambledWord) {
            setScrambledWord(currentWordData.scrambledWord.split(''));
          } else {
            // If scrambled word does not exist, scramble and save it
            scrambleWord(currentWordData.vocab, syncedIndex).then(scrambled => {
              setScrambledWord(scrambled.split(''));
            });
          }
  
          setBlankSpaces(currentWordData.blankSpaces || Array(currentWordData.vocab.length).fill(''));
          setWordsLeft(vocabData.length - syncedIndex);
        }
      } else {
        console.log("Ops")
      }
    });
  
    return () => unsubscribe();
  }, [gameID, currentIndex, hasScrambled]);
  

  // Scramble the word
  const scrambleWord = async (word: string, currentIndex: number) => {
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    // Save scrambled word to Firestore
    const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
    const docSnap = await getDoc(docRef);
    const vocabData = docSnap.data()?.vocabularydata;
  
    if (vocabData) {
      const updatedVocabularyData = [...vocabData];
      updatedVocabularyData[currentIndex] = {
        ...updatedVocabularyData[currentIndex],
        scrambledWord: scrambled, // Save scrambled word
      };
  
      await updateDoc(docRef, {
        vocabularydata: updatedVocabularyData,
      });
    }
  
    return scrambled;
  };
  
  const handleNextWord = async () => {
    const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
    const docSnap = await getDoc(docRef);
    const vocabData = docSnap.data()?.vocabularydata;
  
    if (vocabData && currentIndex + 1 < vocabData.length) {
      const nextIndex = currentIndex + 1;
      await updateDoc(docRef, {
        currentIndex: nextIndex, // Sync the new currentIndex to Firestore
      });
  
      // After moving to the next word, reset scrambled state
      const currentWordData = vocabData[nextIndex];
      setBlankSpaces(currentWordData.blankSpaces || Array(currentWordData.vocab.length).fill(''));
  
      // Reset scrambling flag when moving to the next word
      setHasScrambled(false); // Now reset this flag so it can scramble again
    } else {
      setGameFinished(true); // Locally mark the game as finished
    }
  };  
  
  const handleLetterClick = async (letter: string) => {
    // Find the first empty blank space
    const blankIndex = blankSpaces.indexOf('');
  
    if (blankIndex !== -1) {
      const updatedBlankSpaces = [...blankSpaces];
      updatedBlankSpaces[blankIndex] = letter; // Fill the blank space with the letter
      setBlankSpaces(updatedBlankSpaces);
  
      // Update the Firebase document with the new blank spaces
      const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
      const docSnap = await getDoc(docRef);
      const vocabData = docSnap.data()?.vocabularydata;
  
      if (vocabData) {
        const updatedVocabularyData = [...vocabData]; // Clone the array to preserve other words
        updatedVocabularyData[currentIndex] = {
          ...updatedVocabularyData[currentIndex],
          blankSpaces: updatedBlankSpaces,
        };
  
        await updateDoc(docRef, {
          vocabularydata: updatedVocabularyData, // Update the entire vocabularydata array
        });
      }
  
      // Check if the word is completed
      if (updatedBlankSpaces.join('') === currentWord) {
        setCompleted(true);
        
        toast.custom(
          <div
            style={{
              borderRadius: '16px',
              background: '#22c55e',
              color: '#fff',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
            }}
          >
            👏 Isso aí! Palavra correta!
          </div>
        );
  
        // Close the toast after 1 second (1000ms)
        setTimeout(() => {
          toast.dismiss();
        }, 1000);

        const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
        const docSnap = await getDoc(docRef);
        const vocabData = docSnap.data()?.vocabularydata;
  
        if (vocabData) {
          const updatedVocabularyData = [...vocabData]; // Clone the array to preserve other words
          updatedVocabularyData[currentIndex] = {
            ...updatedVocabularyData[currentIndex],
            completed: true, // Mark the word as completed
          };
  
          await updateDoc(docRef, {
            vocabularydata: updatedVocabularyData, // Update the entire vocabularydata array
          });
  
        }
      }
    }
  };  

  const handlePlacedLetterClick = async (index: number) => {
    const updatedBlankSpaces = [...blankSpaces];
    updatedBlankSpaces[index] = ''; // Remove the letter from the blank space
    setBlankSpaces(updatedBlankSpaces); // Update local state
  
    // Update the Firestore document with the new blank spaces
    const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
    const docSnap = await getDoc(docRef);
    const vocabData = docSnap.data()?.vocabularydata;
  
    if (vocabData) {
      const updatedVocabularyData = [...vocabData]; // Clone the array to preserve other words
      updatedVocabularyData[currentIndex] = {
        ...updatedVocabularyData[currentIndex],
        blankSpaces: updatedBlankSpaces, // Update blank spaces
      };
  
      // Save the updated blankSpaces to Firestore
      await updateDoc(docRef, {
        vocabularydata: updatedVocabularyData, // Update the entire vocabularydata array
      });
    }
  };  

  // Handle resetting the game
  const handleResetGame = async () => {
    // Get the Firestore document reference
    const docRef = doc(db, 'games', gameID, 'modes', 'anagram');
    
    // Fetch the current document data
    const docSnap = await getDoc(docRef);
    const vocabData = docSnap.data()?.vocabularydata;

    if (vocabData) {
      const updatedVocabularyData = vocabData.map((wordData: any) => ({
        vocab: wordData.vocab,
        imageURL: wordData.imageURL, // Keep the vocab and imageURL
        blankSpaces: Array(wordData.vocab.length).fill(''), // Reset blankSpaces to empty
        completed: false, // Reset completed flag
      }));

      // Update the Firestore document with the reset data
      await updateDoc(docRef, {
        vocabularydata: updatedVocabularyData,
        currentIndex: 0,
      });

      // Reset local state
      setCurrentIndex(0);
      setGameFinished(false);
      setScrambledWord([]);
      setBlankSpaces([]);
      setCompleted(false);
      setHasScrambled(false);
    }
  };

  // Handle next word locally
  const handleNextWordLocally = () => {
    if (currentIndex + 1 < vocabData.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      const nextWordData = vocabData[nextIndex];
      const scrambled = scrambleWordLocally(nextWordData.vocab);

      const blankSpaces = Array(nextWordData.vocab.length).fill('');
      setCurrentWord(nextWordData.vocab);
      setScrambledWord(scrambled.split(''));
      setCurrentImageURL(nextWordData.imageURL);
      setBlankSpaces(blankSpaces);

      setWordsLeft(vocabData.length - nextIndex);
    } else {
      setGameFinished(true); // Mark the game as finished when all words are completed
    }
  };

  const handlePlacedLetterClickLocally = (index: number) => {
    // Create a copy of the blankSpaces array
    const updatedBlankSpaces = [...blankSpaces];
  
    // Reset the clicked letter's position to an empty string
    updatedBlankSpaces[index] = '';
  
    // Update the blankSpaces state with the new state
    setBlankSpaces(updatedBlankSpaces);
  
    // Check if the word is completed (if all blank spaces are filled and the word matches)
    if (updatedBlankSpaces.join('') === currentWord) {
      setCompleted(true);
    } else {
      setCompleted(false);
    }
  
  };

  const resetGameLocally = () => {
    // Reset local state for a fresh start
    setCurrentIndex(0);
    setGameFinished(false);
    setCompleted(false);
    setHasScrambled(false);
    setScrambledWord([]);
    setBlankSpaces([]);
  
    // Only reset game if vocabData is available and not empty
    if (vocabData.length > 0) {
      // Reset the first word
      const firstWordData = vocabData[0];
      const scrambled = scrambleWordLocally(firstWordData.vocab);
      setCurrentWord(firstWordData.vocab);
      setScrambledWord(scrambled.split(''));
      setBlankSpaces(Array(firstWordData.vocab.length).fill(''));
    } else {
      toast.error('No words available for the game!');
    }
  };
  
   // Animation variants
   const letterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "tween",  // Changed to tween for smoother movement
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.15 // Letters appear one after another
      } 
    }
  };

  const blankChildVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "tween",
        duration: 0.3,  // Slightly longer duration
        ease: [0.25, 0.1, 0.25, 1]  // Custom cubic bezier for smooth rise
      }
    }
  };
  
  const imageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0 }
  };

  return (
    <div className='w-full flex flex-col items-center justify-center gap-4'>
      <div>
        <p className='font-bold text-sm'>Faltam {wordsLeft} palavras para completar!</p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentImageURL + currentIndex}
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentImageURL && (
            <Image
              priority
              width={500}
              height={500}
              src={currentImageURL}
              alt={`Image related to ${currentWord}`}
              className="w-[15rem] h-auto rounded-lg"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord} // Ensures reanimation on word change
          className="flex flex-wrap items-center gap-2 font-bold justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {scrambledWord.map((letter, index) => (
            <motion.button
              key={`scrambled-${index}-${letter}`}
              onClick={() => handleLetterClick(letter)}
              className="text-2xl cursor-pointer px-4 py-3 min-w-[2.5rem] min-h-[2.5rem] bg-gray-300 hover:bg-fluency-gray-200 transition-all text-black rounded"
              variants={letterVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {letter}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="flex flex-wrap items-center gap-2 font-bold justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {blankSpaces.map((letter, index) => (
            <motion.button
              key={`blank-${index}-${letter}`}
              onClick={() => isSingleplayer ? handlePlacedLetterClickLocally(index) : handlePlacedLetterClick(index)}
              className={`text-xl cursor-pointer px-4 py-3 min-w-[2.5rem] min-h-[2.5rem] rounded`}
              variants={blankChildVariants}
              animate={
                blankSpaces.join('') === currentWord ? "correct" :
                blankSpaces.every(space => space !== '') ? "wrong" : ""
              }
              whileHover={{ scale: letter ? 1.1 : 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200 }}
              layout
              style={{
                backgroundColor: 
                  blankSpaces.join('') === currentWord ? '#4CAF50' :
                  blankSpaces.every(space => space !== '') ? '#F44336' :
                  '#DE5916'
              }}
            >
              {letter || '_'}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {!isSingleplayer && (
        <div>
          {completed && !gameFinished && blankSpaces.join('') === currentWord && (
            <div>
              <FluencyButton
                onClick={handleNextWord}
                variant='confirm'
              >
                Próxima
              </FluencyButton>
            </div>
          )}
          {gameFinished && (
            <div>
              <FluencyButton
                onClick={handleResetGame}
                variant='purple'
              >
                Jogar novamente
              </FluencyButton>
            </div>
          )}
        </div>
      )}

      {isSingleplayer && (
        <div>
        {completed && !gameFinished && blankSpaces.join('') === currentWord && (
          <div>
            <FluencyButton onClick={handleNextWordLocally} variant='confirm'>
              Próxima
            </FluencyButton>
          </div>
        )}
        {gameFinished && (
          <div>
            <FluencyButton onClick={resetGameLocally} variant='purple'>
              Jogar novamente
            </FluencyButton>
          </div>
        )}
        </div>
      )}
    </div>

  );
};

export default Anagram;