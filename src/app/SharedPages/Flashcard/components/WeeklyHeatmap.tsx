import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface ReviewLog {
  id: string;
  deckId: string;
  cardId: string;
  rating: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

interface DayData {
  date: string;
  count: number;
  level: number;
}

const WeeklyHeatmap: React.FC = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId) {
      fetchWeeklyData();
    }
  }, [currentUserId]);

  const fetchWeeklyData = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      
      // Generate array of last 7 days
      const days: DayData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        days.push({
          date: date.toISOString().split('T')[0],
          count: 0,
          level: 0
        });
      }

      // Fetch review logs from last 7 days
      const reviewLogsQuery = query(
        collection(db, 'users', currentUserId, 'reviewLogs'),
        where('timestamp', '>=', sevenDaysAgo.toISOString()),
        orderBy('timestamp', 'desc')
      );

      const reviewLogsSnapshot = await getDocs(reviewLogsQuery);
      const reviewLogs = reviewLogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReviewLog[];

      // Count reviews per day
      reviewLogs.forEach(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        const dayIndex = days.findIndex(day => day.date === logDate);
        if (dayIndex !== -1) {
          days[dayIndex].count++;
        }
      });

      // Calculate intensity levels (0-4)
      const maxCount = Math.max(...days.map(day => day.count));
      days.forEach(day => {
        if (day.count === 0) {
          day.level = 0;
        } else if (maxCount <= 5) {
          day.level = Math.min(4, Math.ceil((day.count / maxCount) * 4));
        } else {
          day.level = Math.min(4, Math.ceil((day.count / 20) * 4));
        }
      });

      setWeekData(days);
      setTotalReviews(reviewLogs.length);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (level: number): string => {
    const colors = [
      'bg-gradient-to-br from-gray-800 to-gray-700', // 0 - no activity
      'bg-gradient-to-br from-green-900/80 to-emerald-900/70', // 1 - low
      'bg-gradient-to-br from-green-800/80 to-emerald-800/70', // 2 - medium-low
      'bg-gradient-to-br from-green-700/80 to-emerald-700/70', // 3 - medium-high
      'bg-gradient-to-br from-green-600/80 to-emerald-600/70', // 4 - high
    ];
    return colors[level] || colors[0];
  };

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  const getFormattedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-6 shadow-xl border border-fluency-gray-200 dark:border-fluency-gray-500"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300">
            Atividade Semanal
          </h3>
          <div className="bg-gray-700 rounded-full px-3 py-1 text-xs font-medium">
            <div className="h-4 w-12 bg-gray-600 rounded animate-pulse"></div>
          </div>
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
      className="w-full h-full bg-fluency-pages-light dark:bg-fluency-pages-dark rounded-lg p-4 shadow-xl border border-fluency-gray-200 dark:border-fluency-gray-500"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fluency-blue-400 to-fluency-blue-700">
          Atividade Semanal
        </h1>
        <div className="bg-fluency-blue-300 dark:bg-fluency-blue-500 rounded-full px-3 py-1 text-xs text-white font-bold">
          {totalReviews} revisões
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {weekData.map((day, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center"
              onMouseEnter={() => setHoveredDay(day.date)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="text-xs text-gray-400 mb-1 font-medium">
                {getDayName(day.date)}
              </div>
              
              <motion.div
                className={`relative w-8 h-8 md:w-10 md:h-10 rounded-lg ${getIntensityColor(day.level)} border border-gray-700 flex items-center justify-center transition-all duration-300 shadow-md`}
                whileHover={{ scale: 1.1 }}
              >
                {day.count > 0 && (
                  <span className={`text-xs font-bold ${
                    day.level > 2 ? 'text-white' : 'text-gray-300'
                  }`}>
                    {day.count}
                  </span>
                )}
                
                {/* Hover tooltip */}
                {hoveredDay === day.date && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl z-10"
                  >
                    <div className="font-medium text-white">
                      {getFormattedDate(day.date)}
                    </div>
                    <div className="text-white font-bold truncate">
                      {day.count} {day.count === 1 ? 'revisão' : 'revisões'}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <div className="text-[10px] text-gray-500 mt-1">
                {getFormattedDate(day.date)}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-col items-center space-y-3 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-800 dark:text-gray-400">Intensidade de revisões</div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-xs text-gray-800 dark:text-gray-400">Menos</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-4 h-4 md:w-5 md:h-5 rounded-sm ${getIntensityColor(level)} border border-gray-700`}
              />
            ))}
            <span className="text-xs text-gray-800 dark:text-gray-400">Mais</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm pt-4 border-t border-gray-700">
          <div className="bg-gray-600/15 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-gray-800 dark:text-gray-400 text-xs mb-1">Dias ativos</div>
            <div className="text-xl font-bold text-indigo-400">
              {weekData.filter(day => day.count > 0).length}<span className="text-sm text-gray-800 dark:text-gray-400">/7</span>
            </div>
          </div>
          
          <div className="bg-gray-600/15 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-gray-800 dark:text-gray-400 text-xs mb-1">Média diária</div>
            <div className="text-xl font-bold text-emerald-400">
              {Math.round(totalReviews / 7)}<span className="text-sm text-gray-800 dark:text-gray-400"> revisões</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyHeatmap;