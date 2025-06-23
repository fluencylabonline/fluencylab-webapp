import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useSession } from 'next-auth/react';
import { 
  IoCheckmarkCircle, 
  IoWarning, 
  IoFlame, 
  IoBook,
  IoStar,
  IoStatsChart
} from 'react-icons/io5';

interface Card {
  id: string;
  front: string;
  back: string;
  interval?: number;
  dueDate?: string;
  easeFactor?: number;
  reviewCount?: number;
  deckId?: string;
}

interface ReviewLog {
  id: string;
  deckId: string;
  cardId: string;
  rating: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

interface CardWithStats extends Card {
  totalReviews: number;
  hardReviews: number;
  easyReviews: number;
  mediumReviews: number;
  difficultyScore: number;
  lastReview?: string;
  status: 'mastered' | 'learning' | 'struggling';
}

const LearningProgress: React.FC = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [masteredCards, setMasteredCards] = useState<CardWithStats[]>([]);
  const [strugglingCards, setStrugglingCards] = useState<CardWithStats[]>([]);
  const [stats, setStats] = useState({
    totalCards: 0,
    masteredCount: 0,
    strugglingCount: 0,
    learningCount: 0
  });

  useEffect(() => {
    if (currentUserId) {
      fetchLearningProgress();
    }
  }, [currentUserId]);

  const fetchLearningProgress = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      
      // Fetch all user's cards from all decks
      const decksQuery = query(collection(db, 'users', currentUserId, 'Decks'));
      const decksSnapshot = await getDocs(decksQuery);
      
      const allCards: Card[] = [];
      
      for (const deckDoc of decksSnapshot.docs) {
        const deckId = deckDoc.id;
        const cardsQuery = query(collection(db, 'users', currentUserId, 'Decks', deckId, 'cards'));
        const cardsSnapshot = await getDocs(cardsQuery);
        
        const deckCards = cardsSnapshot.docs.map(cardDoc => ({
          id: cardDoc.id,
          deckId,
          ...cardDoc.data()
        })) as Card[];
        
        allCards.push(...deckCards);
      }

      // Fetch all review logs
      const reviewLogsQuery = query(collection(db, 'users', currentUserId, 'reviewLogs'));
      const reviewLogsSnapshot = await getDocs(reviewLogsQuery);
      const reviewLogs = reviewLogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReviewLog[];

      // Calculate stats for each card
      const cardsWithStats: CardWithStats[] = allCards.map(card => {
        const cardReviews = reviewLogs.filter(log => log.cardId === card.id);
        const totalReviews = cardReviews.length;
        const hardReviews = cardReviews.filter(log => log.rating === 'hard').length;
        const mediumReviews = cardReviews.filter(log => log.rating === 'medium').length;
        const easyReviews = cardReviews.filter(log => log.rating === 'easy').length;
        
        // Calculate difficulty score (higher = more difficult)
        const difficultyScore = totalReviews > 0 ? 
          (hardReviews * 3 + mediumReviews * 2 + easyReviews * 1) / totalReviews : 0;
        
        // Determine status
        let status: 'mastered' | 'learning' | 'struggling';
        if (totalReviews >= 5 && card.easeFactor && card.easeFactor >= 2.5 && difficultyScore <= 1.5) {
          status = 'mastered';
        } else if (totalReviews >= 3 && difficultyScore >= 2.5) {
          status = 'struggling';
        } else {
          status = 'learning';
        }

        const lastReview = cardReviews.length > 0 ? 
          cardReviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp : 
          undefined;

        return {
          ...card,
          totalReviews,
          hardReviews,
          mediumReviews,
          easyReviews,
          difficultyScore,
          lastReview,
          status
        };
      });

      // Sort and filter cards
      const mastered = cardsWithStats
        .filter(card => card.status === 'mastered')
        .sort((a, b) => b.totalReviews - a.totalReviews)
        .slice(0, 10);

      const struggling = cardsWithStats
        .filter(card => card.status === 'struggling')
        .sort((a, b) => b.difficultyScore - a.difficultyScore)
        .slice(0, 10);

      setMasteredCards(mastered);
      setStrugglingCards(struggling);
      
      setStats({
        totalCards: cardsWithStats.length,
        masteredCount: cardsWithStats.filter(card => card.status === 'mastered').length,
        strugglingCount: cardsWithStats.filter(card => card.status === 'struggling').length,
        learningCount: cardsWithStats.filter(card => card.status === 'learning').length
      });

    } catch (error) {
      console.error('Error fetching learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <IoCheckmarkCircle className="w-5 h-5 text-green-400" />;
      case 'struggling':
        return <IoWarning className="w-5 h-5 text-red-400" />;
      default:
        return <IoFlame className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30';
      case 'struggling':
        return 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-700/30';
      default:
        return 'bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/30';
    }
  };

  const getDifficultyLevel = (score: number) => {
    if (score <= 1.5) return 'Fácil';
    if (score <= 2.5) return 'Médio';
    return 'Difícil';
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
      >
        <div className="flex items-center gap-3 mb-6">
          <IoStatsChart className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300">
            Progresso de Aprendizado
          </h3>
        </div>
        
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <IoStatsChart className="w-6 h-6 text-cyan-400" />
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300">
          Progresso de Aprendizado
        </h3>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-gray-800 to-gray-700 p-4 rounded-xl border border-gray-700 text-center"
        >
          <div className="flex justify-center mb-2">
            <IoBook className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalCards}</div>
          <div className="text-sm text-gray-400">Total</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-4 rounded-xl border border-green-700/30 text-center"
        >
          <div className="flex justify-center mb-2">
            <IoCheckmarkCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.masteredCount}</div>
          <div className="text-sm text-gray-400">Dominadas</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 p-4 rounded-xl border border-amber-700/30 text-center"
        >
          <div className="flex justify-center mb-2">
            <IoFlame className="w-6 h-6 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.learningCount}</div>
          <div className="text-sm text-gray-400">Aprendendo</div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-red-900/30 to-rose-900/30 p-4 rounded-xl border border-red-700/30 text-center"
        >
          <div className="flex justify-center mb-2">
            <IoWarning className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.strugglingCount}</div>
          <div className="text-sm text-gray-400">Difíceis</div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mastered Cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IoCheckmarkCircle className="w-5 h-5 text-green-400" />
            <h4 className="text-md font-semibold text-white">
              Cartões Dominados
            </h4>
          </div>
          
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
            {masteredCards.length === 0 ? (
              <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-dashed border-gray-700">
                <p className="text-gray-400">
                  Nenhum cartão dominado ainda. Continue praticando!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {masteredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${getStatusColor(card.status)} p-4 rounded-xl`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm truncate">
                          {card.front}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 text-xs bg-gray-700 px-2 py-1 rounded-full">
                            <IoStar className="text-yellow-400" />
                            {card.easeFactor?.toFixed(1)} EF
                          </div>
                          <div className="text-xs text-gray-400">
                            {card.totalReviews} revisões
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex items-center">
                        {getStatusIcon(card.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Struggling Cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IoWarning className="w-5 h-5 text-red-400" />
            <h4 className="text-md font-semibold text-white">
              Cartões Difíceis
            </h4>
          </div>
          
          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
            {strugglingCards.length === 0 ? (
              <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-dashed border-gray-700">
                <p className="text-gray-400">
                  Nenhum cartão com dificuldade identificada.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {strugglingCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${getStatusColor(card.status)} p-4 rounded-xl`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm truncate">
                          {card.front}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs bg-red-700/30 px-2 py-1 rounded-full text-red-300">
                            {card.hardReviews} difíceis
                          </div>
                          <div className="text-xs text-gray-400">
                            {getDifficultyLevel(card.difficultyScore)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex items-center">
                        {getStatusIcon(card.status)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progresso Geral</span>
          <span>{stats.totalCards > 0 ? Math.round((stats.masteredCount / stats.totalCards) * 100) : 0}% dominado</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: stats.totalCards > 0 ? `${(stats.masteredCount / stats.totalCards) * 100}%` : '0%'
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningProgress;