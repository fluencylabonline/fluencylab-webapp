import React from 'react';
import { motion } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";

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
    <div className="min-h-[90vh] p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div className="w-full md:max-w-md">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
              Meus Decks
            </h1>
            <div className="relative">
              <FluencyInput
                type="text"
                placeholder="Buscar meus decks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-4 pl-12 rounded-xl bg-gray-800 border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-gray-400"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <FluencyButton 
              onClick={openGlobalDecksModal}
              variant="glass"
              className="flex-1 min-w-[160px] py-3 px-6 rounded-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Decks Globais
              </span>
            </FluencyButton>
            <FluencyButton 
              onClick={openModal}
              variant="purple"
              className="flex-1 min-w-[160px] py-3 px-6 rounded-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Criar/Gerenciar
              </span>
            </FluencyButton>
          </div>
        </motion.div>

        {/* Deck Grid */}
        {filteredUserDecks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 rounded-2xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm"
          >
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-300">Nenhum deck encontrado</h3>
              <p className="mt-2 text-gray-400">
                {searchTerm 
                  ? "Tente ajustar sua busca ou criar um novo deck." 
                  : "Crie seu primeiro deck ou explore os decks globais!"}
              </p>
              <div className="mt-6">
                <FluencyButton 
                  onClick={openModal}
                  variant="purple"
                  className="mx-auto px-8 py-3 rounded-xl"
                >
                  Criar Novo Deck
                </FluencyButton>
              </div>
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
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                  y: -5,
                  borderColor: '#22c55e',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)'
                }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-semibold text-cyan-100 truncate">
                      {deck.name}
                    </h3>
                    <span className="flex-shrink-0 flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-full text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      {deck.cardsToReviewCount || 0}
                    </span>
                  </div>
                  
                  {deck.tags && deck.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {deck.tags.slice(0, 3).map((tag: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => (
                        <span 
                          key={index} 
                          className="text-xs bg-gradient-to-r from-gray-700 to-gray-600 px-2 py-1 rounded-md text-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      {deck.tags.length > 3 && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded-md text-gray-400">
                          +{deck.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="px-5 pb-5">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FluencyButton 
                      onClick={() => selectDeck(deck.id)}
                      variant="confirm"
                      className="w-full py-3 rounded-xl"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m-2.828-9.9a9 9 0 012.728-2.728" />
                        </svg>
                        Praticar
                      </span>
                    </FluencyButton>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeckList;