import React from 'react';
import { useState, useEffect } from 'react';

const TransitionAnimation = () => {
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

  return (
    <div className="fixed fade-in fade-out top-0 left-0 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark z-50">

      <div className='min-h-screen flex flex-row justify-around'> 
      <iframe className='w-auto h-auto' src="https://lottie.host/embed/540f2830-c93c-4694-8118-d0bb9aac1062/YPUBvF63A7.json"></iframe>
      </div>
    </div>
  );
};

export default TransitionAnimation;
