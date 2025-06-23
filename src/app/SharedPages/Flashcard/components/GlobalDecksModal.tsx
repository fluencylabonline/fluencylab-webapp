import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { X, Search, Star, BookOpen, Settings } from 'lucide-react';

interface Deck {
  id: string;
  name: string;
  tags: string[];
  cardsToReviewCount?: number;
  popularity?: number;
}

interface GlobalDecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalDecks: Deck[];
  onSelectDeck: (deckId: string) => void;
  onManageDeck: (deckId: string) => void;
  onConfirmAddDeck?: (deckId: string) => Promise<void>;
}

const GlobalDecksModal: React.FC<GlobalDecksModalProps> = ({
  isOpen,
  onClose,
  globalDecks,
  onSelectDeck,
  onManageDeck,
  onConfirmAddDeck,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const filtered = globalDecks.filter(
      (deck) =>
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deck.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredDecks(filtered);
  }, [searchTerm, globalDecks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePracticeClick = (deckId: string) => {
    setSelectedDeck(deckId);
    setShowConfirmModal(true);
  };

  const confirmOtherDeckAddition = async () => {
    if (selectedDeck && onConfirmAddDeck) {
      try {
        await onConfirmAddDeck(selectedDeck);
        setShowConfirmModal(false);
        setSelectedDeck(null);
        onClose();
      } catch (error) {
        console.error("Error adding deck:", error);
      }
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedDeck(null);
  };

  return (
    <AnimatePresence>
      {/* Main Modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gray-800/50 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                  Decks Globais
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Explore e adicione decks compartilhados pela comunidade
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-700">
              <div className="relative">
                <FluencyInput
                  type="text"
                  placeholder="Buscar decks por nome ou tag..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 py-4 rounded-xl bg-gray-800/70 border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {filteredDecks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-8 max-w-md mx-auto">
                    <Search className="mx-auto h-16 w-16 text-cyan-500 p-3 bg-gray-700 rounded-full" />
                    <h3 className="mt-6 text-xl font-medium text-gray-300">
                      Nenhum deck encontrado
                    </h3>
                    <p className="mt-2 text-gray-400">
                      {searchTerm 
                        ? "Tente buscar com outros termos." 
                        : "Ainda não há decks públicos disponíveis."}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredDecks.map((deck) => (
                    <motion.div
                      key={deck.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ 
                        y: -5,
                        borderColor: '#06b6d4',
                        boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.1)'
                      }}
                      className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-5 transition-all duration-300"
                    >
                      <div className="mb-4">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-lg font-semibold text-cyan-100 mb-2">
                            {deck.name}
                          </h3>
                          
                          {deck.popularity !== undefined && (
                            <div className="flex items-center text-xs bg-gray-700 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                              {deck.popularity}
                            </div>
                          )}
                        </div>
                        
                        {deck.tags && deck.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {deck.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 text-xs rounded-md"
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
                      
                      <div className="flex gap-2">
                        <FluencyButton
                          onClick={() => handlePracticeClick(deck.id)}
                          variant="confirm"
                          className="flex-1 py-3 rounded-xl"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Praticar
                          </span>
                        </FluencyButton>
                        <FluencyButton
                          onClick={() => {
                            onManageDeck(deck.id);
                            onClose();
                          }}
                          variant="glass"
                          className="flex-1 py-3 rounded-xl"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <Settings className="w-5 h-5" />
                            Gerenciar
                          </span>
                        </FluencyButton>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <FluencyButton 
                onClick={onClose} 
                variant="danger"
                className="px-6 py-3 rounded-xl"
              >
                Fechar
              </FluencyButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-60 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30 rounded-2xl shadow-xl w-full max-w-lg"
            >
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-cyan-900/30 flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-cyan-400" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-white">
                  Adicionar Deck
                </h3>
                
                <p className="text-gray-300 mb-2">
                  Deseja adicionar o deck
                </p>
                
                <p className="text-xl font-semibold text-cyan-300 mb-6">
                  {globalDecks.find(d => d.id === selectedDeck)?.name || selectedDeck}
                </p>
                
                <p className="text-gray-400 mb-6 text-sm">
                  Este deck será adicionado aos seus decks pessoais para estudo
                </p>
                
                <div className="flex justify-center gap-3">
                  <FluencyButton
                    onClick={confirmOtherDeckAddition}
                    variant="confirm"
                    className="px-8 py-3 rounded-xl"
                  >
                    Sim, Adicionar
                  </FluencyButton>
                  
                  <FluencyButton
                    onClick={closeConfirmModal}
                    variant="glass"
                    className="px-8 py-3 rounded-xl"
                  >
                    Cancelar
                  </FluencyButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default GlobalDecksModal;