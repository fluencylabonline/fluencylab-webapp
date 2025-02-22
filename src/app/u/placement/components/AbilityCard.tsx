// components/AbilityCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AbilityCardProps {
    ability: string;
    onClick: () => void;
    isCompleted: boolean;
    isDisabled: boolean;
}

const AbilityCard: React.FC<AbilityCardProps> = ({ ability, onClick, isCompleted, isDisabled }) => {

    return (
        <motion.div
            className={`text-center flex flex-col justify-center items-center p-4 rounded-lg cursor-pointer w-48 h-72 bg-fluency-gray-100 dark:bg-fluency-pages-dark duration-300 ease-in-out transition-all ${isDisabled || isCompleted ? 'text-gray-400 dark:text-gray-700 opacity-80 cursor-not-allowed' : 'text-2xl text-indigo-500 dark:text-indigo-600 bg-gray-300 dark:bg-fluency-bg-dark'}`}
            onClick={isDisabled ? undefined : onClick}
            whileHover={!isDisabled && !isCompleted ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            layout
        >
            {!isCompleted && !isDisabled ? (
                <p
                    className="text-xl font-bold"
                >
                    {ability}
                </p>
            ):(
                <p
                    className="text-xl font-semibold"
                >
                    {ability}
                </p>
            )}

             {isCompleted && (
                <div className="mt-4 text-green-600 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 inline-block mr-2">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 011.06-1.06L12 11.06l6.97-6.97a.75.75 0 011.06 0z" clipRule="evenodd" />
                    </svg>
                    Feito!
                </div>
            )}

        </motion.div>
    );
};

export default AbilityCard;