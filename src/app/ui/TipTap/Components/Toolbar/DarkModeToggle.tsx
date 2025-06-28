// components/Components/DarkModeToggle.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode');
    const isDark = storedDarkMode === 'true';
    setIsChecked(isDark);
    document.body.classList.toggle('dark', isDark);
  }, []);

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => {
      const newChecked = !prevChecked;
      localStorage.setItem('isDarkMode', newChecked.toString());
      document.body.classList.toggle('dark', newChecked);
      return newChecked;
    });
  };

  const Icon = isChecked ? Sun : Moon;
  const tooltipText = isChecked ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <button
      onClick={handleCheckboxChange}
      title={tooltipText}
      className="p-2 rounded-md flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-150 ease-in-out"
    >
      <Icon size={16} />
    </button>
  );
};

export default DarkModeToggle;
