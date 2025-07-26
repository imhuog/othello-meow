import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import Chat from '../components/Chat';

const GamePage: React.FC = () => {
  const { gameState, currentTheme } = useGame();

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">⚫⚪</div>
          <div className="text-xl">Đang tải game...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Info - Left Column */}
          <motion.div
            className="lg:col-span-1 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GameInfo />
          </motion.div>

          {/* Game Board - Center Column */}
          <motion.div
            className="lg:col-span-2 order-1 lg:order-2 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Board />
          </motion.div>
        </div>
      </div>

      {/* Chat Component */}
      <Chat />

      {/* Mobile responsive adjustments */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default GamePage;
