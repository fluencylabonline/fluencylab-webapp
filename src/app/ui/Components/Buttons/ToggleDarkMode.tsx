import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import '../Components.css';

export function ToggleDarkMode() {
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('isDarkMode');
    setIsChecked(storedDarkMode === 'true');
  }, []);

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => {
      const newChecked = !prevChecked;
      localStorage.setItem('isDarkMode', newChecked.toString());
      document.body.classList.toggle('dark', newChecked);
      return newChecked;
    });
  };

  // Sun and Moon SVG icons
  const SunIcon = () => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      key="sun"
      initial={{ rotate: 0, scale: 0 }}
      animate={{ rotate: 360, scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </motion.svg>
  );

  const MoonIcon = () => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      key="moon"
      initial={{ rotate: -90, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </motion.svg>
  );

  return (
    <motion.button
      className="toggle-container"
      onClick={handleCheckboxChange}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="toggle-icon"
        animate={isChecked ? "sun" : "moon"}
        variants={{
          sun: { backgroundColor: "#FFD700" },
          moon: { backgroundColor: "#151c65" }
        }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isChecked ? <SunIcon /> : <MoonIcon />}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}