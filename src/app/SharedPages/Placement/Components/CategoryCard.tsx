import React from 'react';
import toast from 'react-hot-toast';

export interface CategoryCardProps {
  category: string;
  progress: number;
  isSelected: boolean;
  onSelect: (category: string) => void;
  disabled?: boolean;
  necessaryAbility?: string; // New prop: necessaryAbility (optional)
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, progress, onSelect, disabled, necessaryAbility, }) => {

  const translations: { [key: string]: { translation: string; emoji: string } } = {
    speaking: { translation: "Fala", emoji: "🗣️" },
    listening: { translation: "Escuta", emoji: "👂" },
    reading: { translation: "Leitura", emoji: "📖" },
    writing: { translation: "Escrita", emoji: "✍️" },
    vocabulary: { translation: "Vocabulário", emoji: "📚" },
    grammar: { translation: "Gramática", emoji: "🔠" },
  };

  const categoryData = translations[category] || {
      translation: category.charAt(0).toLocaleUpperCase() + category.slice(1),
      emoji: "",
  };

  const handleClick = () => {
    if (disabled) {
      if (necessaryAbility) {
        toast(`Disponível após finalizar o teste de ${categoryData.translation}`, {
          position: "bottom-center",
          style: {
            borderRadius: "10px",
            background: "#FA3D2E",
            color: "#fff",
            textAlign: "center",
            padding: "10px",
            fontSize: "1rem",
          }
        });
        console.log(`Disponível após finalizar o teste de ${necessaryAbility}`)
      }
      return; // Do nothing if disabled, but show toast message
    }
    onSelect(category); // Proceed with selection if not disabled
  };

  return (
    <div
      onClick={handleClick}
      className={`text-center flex flex-col justify-center items-center p-4 rounded-lg cursor-pointer w-48 h-72 bg-fluency-gray-100 dark:bg-fluency-pages-dark duration-300 ease-in-out transition-all ${disabled ? 'text-gray-400 dark:text-gray-700 opacity-50 cursor-not-allowed' : 'text-indigo-500 dark:text-indigo-600 hover:bg-fluency-gray-200 dark:hover:bg-fluency-gray-900'}`}
    >
      <p className='text-xl font-bold'>{categoryData.emoji} {categoryData.translation}</p>
      <p>Pontos: {progress} de 100</p>
    </div>
  );
};

export default CategoryCard;