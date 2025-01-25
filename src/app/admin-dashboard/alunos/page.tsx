'use client';
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Contratos from './Contratos';
import Lista from './Lista';

export default function Students() {
  const [selectedOption, setSelectedOption] = useState('lista');
  return (
    <div className="h-[85vh] flex flex-col items-start pr-3 bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark">     

      <select
          className='font-bold text-xl outline-none bg-fluency-bg-light dark:bg-fluency-bg-dark text-fluency-text-light dark:text-fluency-text-dark px-5 py-3 rounded-md'
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="juridico">Jurídico</option>
        <option className="bg-fluency-pages-light dark:text-fluency-gray-100 dark:bg-fluency-pages-dark p-2 rounded-md px-3" value="lista">Lista</option>
      </select>

      {selectedOption === 'juridico' && (<Contratos />)}
      {selectedOption === 'lista' && (<Lista />)}

    <Toaster />
  </div>
  );
}