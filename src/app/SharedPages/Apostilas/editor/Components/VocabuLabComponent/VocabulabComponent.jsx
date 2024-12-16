import React from 'react';
import { useState } from 'react';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import PropTypes from 'prop-types';
import Image from 'next/image';

import HeaderImage from '../../../../../../../public/images/apostila/vocabulab.png';
import ExampleImage from '../../../../../../../public/images/apostila/wordscomand.png';
import ChemistryImage from '../../../../../../../public/images/apostila/potion.png';
import PotionMiddle from '../../../../../../../public/images/apostila/potionmiddle.png';
import TeacherImage from '../../../../../../../public/images/apostila/teacher.png';
import TipImage from '../../../../../../../public/images/apostila/tip.png';

const VocabLabComponent = ({ node }) => {
  const { sentences1, words, sentences2 } = node.attrs;

  // Convert sentences and words into arrays
  const firstSentences = sentences1 ? sentences1.split('\n') : [];
  const wordList = words ? words.split(',') : [];
  const secondSentences = sentences2 ? sentences2.split('\n') : [];

  return (
    <NodeViewWrapper className="react-component">
      <div className="flex flex-col bg-white dark:bg-gray-800 text-black dark:text-white p-4">
        
        {/* Title Vocabulab */}
        <div className="flex justify-center relative -top-10 w-full h-fit">
          <Image src={HeaderImage} alt="Vocab Lab Title" className="w-[18rem] h-auto !rounded-none" />
        </div>

        {/* Section 1: Image and sentences to practice */}
        <div className="w-full h-fit flex flex-row justify-center items-center gap-4 mb-6">
          <Image src={ExampleImage} alt="Example Image" className="w-20 h-auto !rounded-none" />
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
          {firstSentences.map((sentence, index) => (
            <p key={index} className="text-lg font-semibold whitespace-nowrap">
              {sentence}
            </p>
          ))}
        </div>
        </div>

        <div className='relative top-10 left-[14rem] flex flex-row items-end justify-center bg-fluency-gray-100 dark:bg-fluency-gray-700 text-black dark:text-white w-[70%] h-[5rem] rounded-3xl mb-20'>
          <div className='flex flex-row justify-between items-end'>
            <p className='text-md text-start w-full font-semibold ml-8 mb-4'>Agora podem treinar primeiro as frases acima!</p>
            <Image src={TeacherImage} alt="Teacher" className='w-[7rem] h-auto relative -bottom-[0.65rem] !rounded-none' />
          </div>
        </div>

        {/* Section 2: Words with Hover Audio */}
        <div className="flex flex-row items-center relative -left-20 bg-fluency-gray-100 rounded-r-2xl overflow-visible h-[16.5rem] mb-8">
          
            <Image src={ChemistryImage} alt="Chemistry Icon" className="w-[16.5rem] h-auto !rounded-none" />
          
          <div className='flex flex-col items-center justify-center gap-4'>
          <p className='font-bold text-xl mb-4'>Word Bank</p>
          <div className="grid grid-cols-3 gap-x-20 gap-y-8 mb-2">
            {wordList.map((word, index) => (
              <SpeakWord key={index} word={word.trim()} />
            ))}
          </div>
          </div>
        </div>

        <div className='flex flex-row items-center justify-center bg-fluency-gray-100 dark:bg-fluency-gray-700 text-black dark:text-white w-full h-min rounded-3xl px-4 mb-8'>
          <div className='w-full flex flex-row justify-between items-center'>
            <Image src={TipImage} alt="Teacher" className='w-[13%] h-auto !rounded-none' />
            <p className='p-7 text-md text-start w-full max-w-[95%] font-semibold'>Para conseguir lembrar e falar bem as palavras pronuncie cada uma com bastante convicção. Não precisa ter vergonha!</p>
          </div>
        </div>


        {/* Section 3: Two-column sentences with image in the middle */}
        <div className="p-4">
          <div className='flex flex-col items-center justify-center'>
            <p className='font-bold text-xl mb-5 p-4'>Agora é sua vez de praticar!</p>
            <div className='flex flex-row w-fit justify-evenly gap-12'>
              {/* First Column */}
              <div className="flex-1 flex flex-col gap-2 px-4">
                {secondSentences
                  .filter((_, index) => index % 2 === 0) // Take even-indexed sentences
                  .map((sentence, index) => (
                    <p key={`left-${index}`} className="text-lg font-semibold whitespace-nowrap">
                      {sentence}
                    </p>
                  ))}
              </div>

              {/* Center Image */}
              <Image
                src={PotionMiddle}
                alt="Center Image"
                className="w-20 h-20 !rounded-none"
              />

              {/* Second Column */}
              <div className="flex-1 flex flex-col gap-2 px-4">
                {secondSentences
                  .filter((_, index) => index % 2 !== 0) // Take odd-indexed sentences
                  .map((sentence, index) => (
                    <p key={`right-${index}`} className="text-lg font-semibold whitespace-nowrap">
                      {sentence}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>


        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

VocabLabComponent.propTypes = {
  node: PropTypes.shape({
    attrs: PropTypes.shape({
      sentences1: PropTypes.string.isRequired,
      words: PropTypes.string.isRequired,
      sentences2: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default VocabLabComponent;


const SpeakWord = ({ word }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const speak = () => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;

      // Ensure voices are loaded
      const voices = synth.getVoices();
      if (voices.length === 0) {
        console.warn("No voices are available. Speech synthesis might not work properly.");
        return;
      }

      // Create an utterance
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';

      // Select an appropriate voice
      const voice = voices.find((v) => v.lang === 'en-US') || voices[0];
      utterance.voice = voice;

      // Speak the word
      synth.cancel(); // Cancel any ongoing speech to prevent overlap
      synth.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in your browser.');
    }
  };

  return (
        <div
            className="relative inline-block cursor-pointer group"
            onMouseEnter={() => {
              setShowTooltip(true);
            }}
            onMouseLeave={() => setShowTooltip(false)}
            >
            {/* Tooltip */}
            {showTooltip && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
              Clique para ouvir
            </div>
            )}

            {/* Word */}
            <span
              onClick={speak}
              className="cursor-pointer hover:text-blue-600 transition duration-200 font-bold"
            >
              {word}
            </span>
        </div>
  );
};

SpeakWord.propTypes = {
  word: PropTypes.string.isRequired,
};
