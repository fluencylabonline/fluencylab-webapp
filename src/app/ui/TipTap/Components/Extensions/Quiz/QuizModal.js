// QuizModal.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { Toaster, toast } from 'react-hot-toast';
import FluencyButton from '@/app/ui/Components/Button/button';

const QuizModal = ({ isOpen, onClose, editor }) => {
  const [decks, setDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');

  useEffect(() => {
    const loadDecks = async () => {
      if (!isOpen) return;

      try {
        const decksQuery = collection(db, 'Quizzes');
        const decksSnapshot = await getDocs(decksQuery);

        const decksData = decksSnapshot.docs.map(doc => {
          const data = doc.data();

          // Validate and provide fallbacks for missing fields
          return {
            id: doc.id,
            deckTitle: data.deckTitle || `Quiz ${doc.id}`, // Fallback for missing title
            deckDescription: data.deckDescription || 'Sem descrição',
            tags: Array.isArray(data.tags) ? data.tags : [], // Ensure tags is always an array
            questions: Array.isArray(data.questions) ? data.questions : [],
          };
        });

        setDecks(decksData);
      } catch (error) {
        console.error('Error loading quiz decks:', error);
        toast.error('Failed to load quiz decks');
      }
    };

    loadDecks();
  }, [isOpen]);

  const handleDeckSelect = (deckId) => {
    editor.commands.insertContent({
      type: 'quiz',
      attrs: { deckId },
    });
    onClose();
  };

  // Get all unique tags
  const getAllTags = () => {
    const allTags = new Set();
    decks.forEach((deck) => {
      deck.tags?.forEach((tag) => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const filteredDecks = decks.filter(deck => {
    const deckTitle = deck.deckTitle.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    const tags = deck.tags.map(tag => tag.toLowerCase());

    const matchesSearch = deckTitle.includes(searchTermLower) ||
      tags.some(tag => tag.includes(searchTermLower));
    
    const matchesTag = selectedTagFilter === '' || 
      (deck.tags && deck.tags.includes(selectedTagFilter));

    return matchesSearch && matchesTag;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full z-50">
          <h2 className="text-xl font-bold mb-4">Selecione um Quiz</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Procurar quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700"
            />
            
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="px-3 py-2 border rounded bg-white dark:bg-gray-700"
            >
              <option value="">Todas as tags</option>
              {getAllTags().map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredDecks.length > 0 ? (
              filteredDecks.map(deck => (
                <div
                  key={deck.id}
                  className="p-3 mb-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border"
                  onClick={() => handleDeckSelect(deck.id)}
                >
                  <h3 className="font-semibold">{deck.deckTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {deck.deckDescription}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                      {deck.questions.length} perguntas
                    </span>
                    {deck.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {deck.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 dark:bg-green-800 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {deck.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{deck.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum quiz encontrado</p>
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
      <Toaster />
    </div>
  );
};

export default QuizModal;

