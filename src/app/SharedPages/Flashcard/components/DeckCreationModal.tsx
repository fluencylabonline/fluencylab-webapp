import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { X, Plus, Tag, FolderPlus } from 'lucide-react';

interface DeckCreationModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  newDeckName: string;
  setNewDeckName: (value: string) => void;
  createDeck: () => void;
  tags: string[];
  newTag: string;
  setNewTag: (value: string) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
  selectedDeck: string;
  handleDeckSelection: (deckId: string) => void;
  otherDecks: any[];
  children: React.ReactNode;
}

const DeckCreationModal: React.FC<DeckCreationModalProps> = ({
  isModalOpen,
  closeModal,
  newDeckName,
  setNewDeckName,
  createDeck,
  tags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  selectedDeck,
  handleDeckSelection,
  otherDecks,
  children,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, handleKeyDown]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 10);
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div 
              className={`sticky top-0 z-10 flex items-center justify-between p-6 transition-all ${
                isScrolled 
                  ? 'bg-fluency-bg-light/90 dark:bg-fluency-bg-dark/90 backdrop-blur-md border-b border-fluency-gray-200 dark:border-fluency-gray-700' 
                  : 'bg-transparent'
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                  Gerenciar Decks
                </h2>
                <p className="text-sm text-fluency-text-gray-light dark:text-fluency-text-gray-dark mt-1">
                  Crie novos decks ou gerencie os existentes
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-fluency-text-light dark:text-fluency-text-dark hover:text-fluency-blue-500 dark:hover:text-fluency-blue-300 transition-colors p-1 rounded-full hover:bg-fluency-gray-100 dark:hover:bg-fluency-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div 
              className="p-6 overflow-y-auto flex-1 custom-scrollbar"
              onScroll={handleScroll}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create New Deck Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-fluency-sections-light dark:bg-fluency-sections-dark border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <FolderPlus className="w-6 h-6 text-fluency-blue-500 dark:text-fluency-blue-300" />
                    <h3 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                      Criar Novo Deck
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-fluency-text-gray-light dark:text-fluency-text-gray-dark mb-2">
                        Nome do Novo Deck
                      </label>
                      <FluencyInput
                        type="text"
                        placeholder="Ex: Vocabulário de Negócios"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                        className="w-full py-3 px-4 bg-fluency-bg-light dark:bg-fluency-bg-dark border border-fluency-gray-200 dark:border-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
                      />
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FluencyButton 
                        onClick={createDeck} 
                        variant="confirm"
                        className="w-full py-3 rounded-xl"
                      >
                        <Plus className="mr-2" />
                        Criar Deck
                      </FluencyButton>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Manage Existing Deck Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-fluency-sections-light dark:bg-fluency-sections-dark border border-fluency-gray-200 dark:border-fluency-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Tag className="w-6 h-6 text-fluency-blue-500 dark:text-fluency-blue-300" />
                    <h3 className="text-xl font-semibold text-fluency-text-light dark:text-fluency-text-dark">
                      Gerenciar Deck Existente
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-fluency-text-gray-light dark:text-fluency-text-gray-dark mb-2">
                        Selecione um Deck
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDeck}
                          onChange={(e) => handleDeckSelection(e.target.value)}
                          className="appearance-none w-full py-3 px-4 pr-10 rounded-lg bg-fluency-bg-light dark:bg-fluency-bg-dark border border-fluency-gray-200 dark:border-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark focus:border-fluency-blue-500 focus:ring-1 focus:ring-fluency-blue-500"
                        >
                          <option value="">-- Selecione um Deck --</option>
                          {otherDecks.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                              {deck.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-fluency-text-gray-light dark:text-fluency-text-gray-dark">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {selectedDeck && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="pt-4 space-y-6"
                      >
                        <div>
                          <h4 className="text-lg font-semibold text-fluency-text-light dark:text-fluency-text-dark mb-3">
                            Tags do Deck
                          </h4>
                          
                          {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                              <AnimatePresence>
                                {tags.map((tag, index) => (
                                  <motion.span
                                    key={index}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-fluency-blue-500 dark:bg-fluency-blue-700 text-fluency-text-light px-3 py-1.5 rounded-full text-sm flex items-center shadow-md"
                                  >
                                    #{tag}
                                    <button
                                      onClick={() => removeTag(index)}
                                      className="ml-2 text-fluency-text-light hover:text-fluency-red-500 text-xs font-bold"
                                    >
                                      &#x2715;
                                    </button>
                                  </motion.span>
                                ))}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-fluency-bg-light dark:bg-fluency-bg-dark rounded-lg border border-dashed border-fluency-gray-200 dark:border-fluency-gray-700">
                              <p className="text-fluency-text-gray-light dark:text-fluency-text-gray-dark">
                                Nenhuma tag adicionada ainda
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FluencyInput
                            type="text"
                            placeholder="Adicionar nova tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="flex-grow py-2 bg-fluency-bg-light dark:bg-fluency-bg-dark border border-fluency-gray-200 dark:border-fluency-gray-700 text-fluency-text-light dark:text-fluency-text-dark"
                          />
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FluencyButton 
                              onClick={addTag}
                              variant="confirm"
                              className="py-2.5 px-4"
                            >
                              <Plus size={18} />
                            </FluencyButton>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
              
              {/* Children Content */}
              {children && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 border-t border-fluency-gray-200 dark:border-fluency-gray-700 pt-6"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeckCreationModal;