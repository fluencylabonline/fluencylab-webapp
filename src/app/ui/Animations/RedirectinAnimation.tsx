'use client';
import { signOut } from 'next-auth/react';
import React from 'react';
import { useState, useEffect } from 'react';

const RedirectingPage = () => {
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

  function handleLogout() {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="fixed fade-in fade-out top-0 left-0 w-screen h-screen bg-fluency-bg-light dark:bg-fluency-bg-dark z-50">

      <div className='min-h-screen flex flex-row justify-around'> 
      <iframe className='w-auto h-auto' src="https://lottie.host/embed/4b2f2d27-585a-4a16-b560-feba3cacea6a/YSph0sSd7J.json"></iframe>
      </div>

      <button onClick={handleLogout}>Página Inicial</button>

    </div>
  );
};

export default RedirectingPage;
