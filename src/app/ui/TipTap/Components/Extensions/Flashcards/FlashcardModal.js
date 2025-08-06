// FlashcardModal.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { Toaster, toast } from 'react-hot-toast';
import FluencyButton from '@/app/ui/Components/Button/button';

const FlashcardModal = ({ isOpen, onClose, editor }) => {
  const [decks, setDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDecks = async () => {
      if (!isOpen) return;

      try {
        const decksQuery = collection(db, 'Flashcards');
        const decksSnapshot = await getDocs(decksQuery);

        const decksData = decksSnapshot.docs.map(doc => {
          const data = doc.data();

          // Validate and provide fallbacks for missing fields
          return {
            id: doc.id,
            name: data.name || `Deck ${doc.id}`, // Fallback for missing name
            tags: Array.isArray(data.tags) ? data.tags : [], // Ensure tags is always an array
          };
        });

        setDecks(decksData);
      } catch (error) {
        console.error('Error loading decks:', error);
        toast.error('Failed to load decks');
      }
    };

    loadDecks();
  }, [isOpen]);

  const handleDeckSelect = (deckId) => {
    editor.commands.insertContent({
      type: 'flashcard',
      attrs: { deckId },
    });
    onClose();
  };

  const filteredDecks = decks.filter(deck => {
    const deckName = deck.name.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    const tags = deck.tags.map(tag => tag.toLowerCase());

    return (
      deckName.includes(searchTermLower) ||
      tags.some(tag => tag.includes(searchTermLower))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full z-50">
          <h2 className="text-xl font-bold mb-4">Selecione um Deck</h2>

          <input
            type="text"
            placeholder="Procurar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700"
          />

          <div className="max-h-96 overflow-y-auto">
            {filteredDecks.length > 0 ? (
              filteredDecks.map(deck => (
                <div
                  key={deck.id}
                  className="p-3 mb-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleDeckSelect(deck.id)}
                >
                  <h3 className="font-semibold">{deck.name}</h3>
                  {deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {deck.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No decks found</p>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <FluencyButton
              onClick={onClose}
              variant="gray"
            >
              Cancelar
            </FluencyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardModal;