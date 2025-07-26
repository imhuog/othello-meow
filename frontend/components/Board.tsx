import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';

const Board: React.FC = () => {
  const { gameState, makeMove, currentTheme } = useGame();
  const { socket } = useSocket();

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === socket?.id);
  const isMyTurn = currentPlayer && gameState.players[gameState.currentPlayer - 1]?.id === socket?.id;
  const canPlay = gameState.gameStatus === 'playing' && isMyTurn;

  const handleSquareClick = (row: number, col: number) => {
    if (!canPlay) return;
    
    const isValidMove = gameState.validMoves.some(([r, c]) => r === row && c === col);
    if (isValidMove) {
      makeMove(row, col);
    }
  };

  const getPieceEmoji = (piece: number | null) => {
    if (piece === null) return null;
    const player = gameState.players[piece - 1];
    return player?.emoji || (piece === 1 ? '⚫' : '⚪');
  };

  const isValidMove = (row: number, col: number) => {
    return gameState.validMoves.some(([r, c]) => r === row && c === col);
  };

  // Column labels (A-H)
  const columnLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  // Row labels (1-8)
  const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Board container with labels */}
      <div className="relative">
        {/* Column labels (top) */}
        <div className="flex mb-2 ml-8">
          {columnLabels.map((label, index) => (
            <div
              key={label}
              className="w-10 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 md:w-12"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Row labels (left) */}
          <div className="flex flex-col mr-2">
            {rowLabels.map((label, index) => (
              <div
                key={label}
                className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-gray-600 md:h-12"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValid = isValidMove(rowIndex, colIndex);
                const squareColor = (rowIndex + colIndex) % 2 === 0 ? currentTheme.light : currentTheme.dark;
                
                return (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 relative cursor-pointer rounded-lg
                      ${squareColor} 
                      ${canPlay && isValid ? 'hover:brightness-110 hover:scale-105' : ''}
                      ${!canPlay ? 'cursor-not-allowed' : ''}
                      transition-all duration-200 flex items-center justify-center
                      border border-gray-700/30
                    `}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    whileHover={canPlay && isValid ? { scale: 1.05 } : {}}
                    whileTap={canPlay && isValid ? { scale: 0.95 } : {}}
                  >
                    {/* Valid move indicator */}
                    {canPlay && isValid && (
                      <motion.div
                        className="w-3 h-3 bg-white/60 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    {/* Game piece */}
                    {cell !== null && (
                      <motion.div
                        className="text-2xl md:text-3xl select-none"
                        initial={{ scale: 0, rotateY: 0 }}
                        animate={{ scale: 1, rotateY: 360 }}
                        transition={{
                          scale: { duration: 0.3, type: 'spring' },
                          rotateY: { duration: 0.6, ease: 'easeInOut' }
                        }}
                        key={`piece-${rowIndex}-${colIndex}-${cell}`}
                      >
                        {getPieceEmoji(cell)}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Row labels (right) - optional mirror */}
        <div className="absolute right-0 top-8 flex flex-col ml-2">
          {rowLabels.map((label, index) => (
            <div
              key={`right-${label}`}
              className="w-6 h-10 flex items-center justify-center text-sm font-semibold text-gray-600 md:h-12"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Column labels (bottom) */}
        <div className="flex mt-2 ml-8">
          {columnLabels.map((label, index) => (
            <div
              key={`bottom-${label}`}
              className="w-10 h-6 flex items-center justify-center text-sm font-semibold text-gray-600 md:w-12"
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Turn indicator */}
      {gameState.gameStatus === 'playing' && (
        <motion.div
          className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-lg font-semibold text-white mb-2">
            {isMyTurn ? (
              <span className="text-green-400">🎯 Lượt của bạn!</span>
            ) : (
              <span className="text-blue-400">⏳ Đang chờ đối thủ...</span>
            )}
          </div>
          
          {/* Timer */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-300">Thời gian:</span>
            <motion.span
              className={`text-xl font-bold ${
                gameState.timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'
              }`}
              animate={gameState.timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: gameState.timeLeft <= 10 ? Infinity : 0 }}
            >
              {gameState.timeLeft}s
            </motion.span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Board;
