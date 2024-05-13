import React, { useState, useEffect } from 'react';
import { FaBackspace } from "react-icons/fa";
import { AiOutlineEnter } from "react-icons/ai";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize); // Listen for resize events

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup the event listener
    };
  }, []);

  const handleKeyPress = (key: string) => {
    if (key === 'Enter' || key === 'Backspace') {
      onKeyPress(key);
    } else {
      onKeyPress(key);
    }
  };

  if (isMobile) {
    return (
      <div className="keyboard bg-gray-300 dark:bg-black p-3 rounded-md flex flex-col justify-center w-screen h-[27vh] items-center">
        <div className='flex flex-row items-center gap-1 my-1 justify-center'>
          {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter, index) => (
            <button 
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className={`px-3 py-3 min-w-8 min-h-23 bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300`}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className='flex flex-row items-center gap-1 my-1 justify-center'>
          {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'].map((letter, index) => (
            <button 
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className={`px-3 py-3 min-w-8 min-h-23 bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300`}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className='flex flex-row items-center gap-1 my-1 justify-center'>
          <button 
            onClick={() => onKeyPress('Enter')}
            className="px-3 py-3 min-w-8 min-h-25 flex justify-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            <AiOutlineEnter />
          </button>
          {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter, index) => (
            <button 
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className={`px-3 py-3 min-w-8 min-h-23 bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300`}
            >
              {letter}
            </button>
          ))}
          <button 
            onClick={() => onKeyPress('Backspace')}
            className="px-3 py-3 min-w-8 min-h-25 flex justify-center bg-fluency-pages-light dark:bg-fluency-pages-dark text-gray-800 dark:text-white rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            <FaBackspace />
          </button>
        </div>
      </div>
    );
  } else {
    return null; // Render nothing if not on a mobile device
  }
};

export default Keyboard;