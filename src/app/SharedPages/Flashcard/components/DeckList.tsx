import React from 'react';
import { motion } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { WalletCards } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  tags: string[];
  cardsToReviewCount?: number;
}

interface DeckListProps {
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectDeck: (deckId: string) => void;
  openModal: () => void;
  decks: any[];
  openGlobalDecksModal: () => void;
}

const DeckList: React.FC<DeckListProps> = ({
  searchTerm,
  handleSearchChange,
  selectDeck,
  openModal,
  decks,
  openGlobalDecksModal,
}) => {
  const filteredUserDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fluency-blue-400 to-fluency-blue-700 mb-2">
          Meus Decks
        </h1>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-row gap-2 mb-3"
        >
          <FluencyInput
              type="text"
              placeholder="Buscar meus decks..."
              variant='glass'
              value={searchTerm}
              onChange={handleSearchChange}
          />
          <FluencyButton 
            onClick={openGlobalDecksModal}
            variant="glass"
            className='w-full'
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Outros Decks
            </span>
          </FluencyButton>
          <FluencyButton 
            onClick={openModal}
            variant="purple"
            className='w-max'
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar/Gerenciar
            </span>
          </FluencyButton>
        </motion.div>

        {/* Deck Grid */}
        {filteredUserDecks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 backdrop-blur-sm"
          >
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-800 dark:text-gray-400">Nenhum deck encontrado</h3>
              <p className="mt-2 text-gray-400">
                {searchTerm 
                  ? "Tente ajustar sua busca ou criar um novo deck." 
                  : "Explore os decks globais!"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredUserDecks.map((deck) => (
              <motion.div
                key={deck.id}
                onClick={() => selectDeck(deck.id)}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1 }}
                whileHover={{ 
                  y: -5,
                  borderColor: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)'
                }}
                className="bg-gray-300/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="p-5 flex-1">
                  <div className="flex flex-col justify-between items-start gap-2">
                    <h3 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                      {deck.name}
                    </h3>
                    <span className="flex-shrink-0 flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs">
                      <WalletCards className='w-5 h-5'/>
                      {deck.cardsToReviewCount || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
  );
};

export default DeckList;