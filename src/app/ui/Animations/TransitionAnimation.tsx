import React from 'react';
import { useState, useEffect } from 'react';
import './animation.css'

const sentences = [
  "Procurando seus cadernos.",
  "Reunindo os melhores materiais.",
  "Carregando os jogos para praticar.",
  "Preparando área de estudo.",
];

const TransitionAnimation = () => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [fade, setFade] = useState(true);

  {/*PERSIST DARK MODE*/}
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
      const storedDarkMode = localStorage.getItem('isDarkMode');
      return storedDarkMode ? storedDarkMode === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('isDarkMode', isChecked.toString());
      document.body.classList.toggle('dark', isChecked);
    }
  }, [isChecked, isLocalStorageAvailable]);

  useEffect(() => {
    const fadeOutTimeout = setTimeout(() => setFade(false), 2500); // 3 seconds to fade out
    const fadeInTimeout = setTimeout(() => {
      setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % sentences.length);
      setFade(true);
    }, 3000); // Wait for 0.5 second after fade out before starting fade in

    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(fadeInTimeout);
    };
  }, [currentSentenceIndex]);

  return (
    <div className="fixed fade-in fade-out top-0 left-0 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark z-50">

      <div className='min-h-screen flex flex-row justify-around'> 
      
      {/*
      <iframe className='w-auto h-auto' src="https://lottie.host/embed/540f2830-c93c-4694-8118-d0bb9aac1062/YPUBvF63A7.json"></iframe>
      */}

      <video className='w-[15%] min-h-screen' controls={false} loop autoPlay>
        <source src="https://firebasestorage.googleapis.com/v0/b/fluencylab-webapp.appspot.com/o/anima%C3%A7%C3%B5es%2Fbrand-animation-1.webm?alt=media&token=ab840307-4c27-4dd5-9830-d0bd8aa6f2c8" type="video/webm" />
      </video>

      <div className={`text-container ${fade ? 'fade-in' : 'fade-out'}`}>
        <p className='font-medium text-black dark:text-white '>{sentences[currentSentenceIndex]}</p>
      </div>
      </div>

      

    </div>
  );
};

export default TransitionAnimation;
