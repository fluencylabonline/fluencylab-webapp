import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { Tag, Plus, X } from 'lucide-react';

interface TagManagementProps {
  tags: string[];
  newTag: string;
  setNewTag: (value: string) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
  selectedDeck: string;
}

const TagManagement: React.FC<TagManagementProps> = ({
  tags,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  selectedDeck,
}) => {
  if (!selectedDeck) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Gerenciar Tags</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-300 mb-3">Tags do Deck</h4>
          
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
                    className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white px-3 py-1.5 rounded-full text-sm flex items-center shadow-md"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(index)}
                      className="ml-2 text-white hover:text-gray-300 text-xs font-bold"
                    >
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
              <p className="text-gray-400">Nenhuma tag adicionada ainda</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <FluencyInput
            type="text"
            placeholder="Adicionar nova tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-grow py-2 bg-gray-800/70 border-gray-700"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FluencyButton 
              onClick={addTag}
              variant="purple"
              className="py-2.5 px-4"
            >
              <Plus size={18} />
            </FluencyButton>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TagManagement;