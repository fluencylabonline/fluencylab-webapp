import React from 'react';
import { motion } from 'framer-motion';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { Edit, Save } from 'lucide-react';

interface CardEditorProps {
  editedCardId: string;
  editedCardFront: string;
  setEditedCardFront: (value: string) => void;
  editedCardBack: string;
  setEditedCardBack: (value: string) => void;
  updateCard: () => void;
}

const CardEditor: React.FC<CardEditorProps> = ({
  editedCardId,
  editedCardFront,
  setEditedCardFront,
  editedCardBack,
  setEditedCardBack,
  updateCard,
}) => {
  if (!editedCardId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 mt-5 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <Edit className="w-5 h-5 text-cyan-400" />
        <h4 className="text-lg font-semibold text-white">Editar Cartão</h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Frente do Cartão
          </label>
          <FluencyInput
            type="text"
            placeholder="Texto da frente"
            value={editedCardFront}
            onChange={(e) => setEditedCardFront(e.target.value)}
            className="w-full py-3 px-4 bg-gray-800/70 border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Verso do Cartão
          </label>
          <FluencyInput
            type="text"
            placeholder="Texto do verso"
            value={editedCardBack}
            onChange={(e) => setEditedCardBack(e.target.value)}
            className="w-full py-3 px-4 bg-gray-800/70 border-gray-700"
          />
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FluencyButton 
            onClick={updateCard}
            variant="purple"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500"
          >
            <Save className="mr-2" size={18} />
            Atualizar Cartão
          </FluencyButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CardEditor;