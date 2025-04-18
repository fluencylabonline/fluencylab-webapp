'use client';
import React from 'react';
import { useState, useEffect } from 'react';

const LoadingAnimation = () => {
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

  return (
    <div className="fixed fade-in fade-out top-0 left-0 w-screen h-screen bg-[#E6E6F8] dark:bg-[#0D0D0D] z-50">

      <div className='min-h-screen flex flex-row justify-around'> 
      <iframe className='w-auto h-auto' src="https://lottie.host/embed/0642876f-5984-458c-965d-837bd42ddb72/mrsk5b9kjh.json"></iframe>
      </div>
    </div>
  );
};

export default LoadingAnimation;
