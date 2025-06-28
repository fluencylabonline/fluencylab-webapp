// hooks/useDarkMode.ts
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  const [isChecked, setIsChecked] = useState(() => {
    if (isLocalStorageAvailable) {
      const storedDarkMode = localStorage.getItem('isDarkMode');
      return storedDarkMode ? storedDarkMode === 'true' : true; // Default to true (dark mode) if not found
    }
    return true; // Default to true (dark mode) if localStorage is not available
  });

  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('isDarkMode', isChecked.toString());
      document.body.classList.toggle('dark', isChecked);
    }
  }, [isChecked, isLocalStorageAvailable]);

  return [isChecked, setIsChecked] as const; // Return as a tuple with 'as const' for better type inference
}