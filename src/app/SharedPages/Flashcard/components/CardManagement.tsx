import React from 'react';
import FluencyButton from "@/app/ui/Components/Button/button";
import FluencyInput from "@/app/ui/Components/Input/input";
import { FiEdit3 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { Tooltip } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";

interface Card {
  id: string;
  front: string;
  back: string;
}

interface CardManagementProps {
  selectedDeck: string;
  otherCards: Card[];
  newCardFront: string;
  setNewCardFront: (value: string) => void;
  newCardBack: string;
  setNewCardBack: (value: string) => void;
  addCard: () => void;
  editedCardId: string;
  editedCardFront: string;
  setEditedCardFront: (value: string) => void;
  editedCardBack: string;
  setEditedCardBack: (value: string) => void;
  updateCard: () => void;
  deleteCard: (cardId: string) => void;
  handleEditInputChange: (card: Card) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadCSV: () => void;
  isUploading: boolean;
}

const CardManagement: React.FC<CardManagementProps> = ({
  selectedDeck,
  otherCards,
  newCardFront,
  setNewCardFront,
  newCardBack,
  setNewCardBack,
  addCard,
  editedCardId,
  editedCardFront,
  setEditedCardFront,
  editedCardBack,
  setEditedCardBack,
  updateCard,
  deleteCard,
  handleEditInputChange,
  handleFileChange,
  handleUploadCSV,
  isUploading,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold text-white mb-4">
        Cartões no Deck: {selectedDeck}
      </h3>

      <Tabs aria-label="Options" color="primary" variant="bordered">
        <Tab key="manage" title="Gerenciar Cartões">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-4">
            <h4 className="text-lg font-semibold text-white mb-2">Adicionar Novo Cartão</h4>
            <FluencyInput
              type="text"
              placeholder="Frente do Cartão"
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              className="mb-2 w-full"
            />
            <FluencyInput
              type="text"
              placeholder="Verso do Cartão"
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              className="mb-2 w-full"
            />
            <FluencyButton onClick={addCard}>Adicionar Cartão</FluencyButton>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-4">
            <h4 className="text-lg font-semibold text-white mb-2">Cartões Existentes</h4>
            {otherCards.length === 0 ? (
              <p className="text-gray-400">Nenhum cartão neste deck.</p>
            ) : (
              <ul className="space-y-2">
                {otherCards.map((card) => (
                  <li
                    key={card.id}
                    className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-medium">Frente: {card.front}</p>
                      <p className="text-gray-300">Verso: {card.back}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Tooltip content="Editar">
                        <button
                          onClick={() => handleEditInputChange(card)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <FiEdit3 size={20} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Deletar">
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <MdDeleteOutline size={20} />
                        </button>
                      </Tooltip>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {editedCardId && (
              <div className="bg-gray-700 p-4 rounded-lg shadow-md mt-4">
                <h4 className="text-lg font-semibold text-white mb-2">Editar Cartão</h4>
                <FluencyInput
                  type="text"
                  placeholder="Frente do Cartão"
                  value={editedCardFront}
                  onChange={(e) => setEditedCardFront(e.target.value)}
                  className="mb-2 w-full"
                />
                <FluencyInput
                  type="text"
                  placeholder="Verso do Cartão"
                  value={editedCardBack}
                  onChange={(e) => setEditedCardBack(e.target.value)}
                  className="mb-2 w-full"
                />
                <FluencyButton onClick={updateCard}>Atualizar Cartão</FluencyButton>
              </div>
            )}
          </div>
        </Tab>
        <Tab key="csv" title="Upload CSV">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md mt-4">
            <h4 className="text-lg font-semibold text-white mb-2">Upload de Cartões via CSV</h4>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mb-4 text-white"
            />
            <FluencyButton onClick={handleUploadCSV} disabled={isUploading}>
              {isUploading ? "Enviando..." : "Upload CSV"}
            </FluencyButton>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CardManagement;


