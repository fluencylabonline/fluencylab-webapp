// components/LanguageSelection.tsx
import FluencyButton from '@/app/ui/Components/Button/button';
import { ToggleDarkMode } from '@/app/ui/Components/Buttons/ToggleDarkMode';
import Link from 'next/link';
import { useState } from 'react';
import { BsArrowLeft } from 'react-icons/bs';

type Language = 'en' | 'es'; // Add more languages here in the future
interface LanguageSelectionProps {
    onLanguageSelect: (lang: Language) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageSelect }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = event.target.value as Language;
        setSelectedLanguage(lang);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (selectedLanguage) {
            onLanguageSelect(selectedLanguage);
        } else {
            alert("Please select a language.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="shadow-md w-full h-full text-center flex flex-col items-center justify-center space-y-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Escolha um idioma</h2>

            <select
                id="language"
                className="w-xl px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-fluency-blue-500 dark:bg-fluency-pages-dark dark:border-fluency-gray-500 dark:text-fluency-gray-100"
                value={selectedLanguage || ''}
                onChange={handleLanguageChange}
            >
                <option value="">Selecione um idioma</option>
                <option value="en">Inglês</option>
                <option value="es">Espanhol</option>
            </select>
            <FluencyButton className='!mr-0' type="submit" variant='purple' disabled={!selectedLanguage}>
                Começar Nivelamento
            </FluencyButton>
        </form>
    );
};

export default LanguageSelection;