'use client';
import React from 'react';
import { useState, useEffect } from 'react';

const Payment = () => {
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
    <div className="fixed fade-in fade-out top-0 left-0 w-screen h-screen bg-transparent dark:bg-transparent z-50">
      <div className='min-h-screen flex flex-row justify-around'> 
      <iframe className='w-auto h-auto' src="https://lottie.host/embed/d9896c04-e390-44ec-9129-4835c1029ab2/77FqLlZigp.lottie"></iframe>
      </div>
    </div>
  );
};

export default Payment;
