import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useSocket } from '../contexts/SocketContext';
import ThemeSelector from './ThemeSelector';

const GameInfo: React.FC = () => {
  const { gameState, roomId, newGame, startGame, isAIGame, aiDifficulty } = useGame();
  const { socket } = useSocket();
  const [showRules, setShowRules] = useState(false);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === socket?.id);
  const isHost = gameState.players[0]?.id === socket?.id;
  const canStartGame = gameState.gameStatus === 'waiting' && gameState.players.length === 2;
  const isGameFinished = gameState.gameStatus === 'finished';

  const getWinner = () => {
    if (gameState.scores[1] > gameState.scores[2]) {
      return { player: gameState.players[0], score: gameState.scores[1] };
    } else if (gameState.scores[2] > gameState.scores[1]) {
      return { player: gameState.players[1], score: gameState.scores[2] };
    }
    return null; // Tie
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(link);
    // Toast notification handled in context
  };

  return (
    <div className="space-y-6">
      {/* Room Info */}
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {isAIGame ? `🤖 Chơi với AI ${aiDifficulty?.toUpperCase()}` : '🎮 Thông tin phòng'}
          </h2>
          <ThemeSelector />
        </div>

        {!isAIGame && roomId && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300">Mã phòng:</span>
              <code className="bg-black/30 px-3 py-1 rounded text-yellow-400 font-mono text-lg">
                {roomId}
              </code>
              <button
                onClick={copyRoomLink}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm transition-colors"
              >
                📋 Copy link
              </button>
            </div>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {gameState.players.map((player, index) => (
            <motion.div
              key={player.id}
              className={`
                p-4 rounded-lg border-2 transition-all duration-300
                ${gameState.currentPlayer === index + 1 && gameState.gameStatus === 'playing'
                  ? 'border-yellow-400 bg-yellow-400/20 shadow-lg'
                  : 'border-gray-600 bg-gray-700/30'
                }
              `}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{player.emoji}</span>
                  <div>
                    <div className="font-semibold text-white">
                      {player.name}
                      {player.id === socket?.id && (
                        <span className="ml-2 text-xs bg-green-500 px-2 py-1 rounded-full">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Người chơi {index + 1}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {gameState.scores[index + 1]}
                  </div>
                  <div className="text-xs text-gray-400">điểm</div>
                </div>
              </div>
              
              {gameState.gameStatus === 'waiting' && (
                <div className="mt-2 text-center">
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${player.isReady 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-gray-200'
                    }
                  `}>
                    {player.isReady ? '✅ Sẵn sàng' : '⏳ Chờ...'}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Game Status */}
        <div className="mt-6 text-center">
          {gameState.gameStatus === 'waiting' && (
            <div className="space-y-3">
              <p className="text-gray-300">
                {gameState.players.length === 1 
                  ? '⏳ Đang chờ người chơi thứ 2...'
                  : '🎯 Cả hai người chơi đã vào phòng!'
                }
              </p>
              
              {canStartGame && isHost && (
                <motion.button
                  onClick={startGame}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚀 Bắt đầu game!
                </motion.button>
              )}
              
              {canStartGame && !isHost && (
                <motion.button
                  onClick={startGame}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✅ Tôi đã sẵn sàng!
                </motion.button>
              )}
            </div>
          )}

          {gameState.gameStatus === 'playing' && (
            <div className="text-green-400 font-semibold">
              🎮 Game đang diễn ra...
            </div>
          )}

          {isGameFinished && (
            <motion.div
              className="space-y-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {(() => {
                const winner = getWinner();
                if (winner) {
                  return (
                    <div className="p-6 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl border-2 border-yellow-400">
                      <div className="text-4xl mb-2">🏆</div>
                      <div className="text-xl font-bold text-yellow-400 mb-2">
                        {winner.player.name} thắng!
                      </div>
                      <div className="text-gray-300">
                        Điểm số: {winner.score} - {winner === getWinner() ? gameState.scores[2] : gameState.scores[1]}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-6 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl border-2 border-blue-400">
                      <div className="text-4xl mb-2">🤝</div>
                      <div className="text-xl font-bold text-blue-400 mb-2">
                        Hòa!
                      </div>
                      <div className="text-gray-300">
                        Điểm số: {gameState.scores[1]} - {gameState.scores[2]}
                      </div>
                    </div>
                  );
                }
              })()}
            </motion.div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <motion.button
            onClick={newGame}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Ván mới
          </motion.button>

          <motion.button
            onClick={() => setShowRules(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📋 Luật chơi
          </motion.button>

          <motion.button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Về menu
          </motion.button>
        </div>
      </motion.div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">📋 Luật chơi Othello</h3>
                <button
                  onClick={() => setShowRules(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-gray-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">🎯 Mục tiêu:</h4>
                  <p>Chiếm được nhiều ô trên bàn cờ nhất có thể bằng cách lật quân của đối thủ.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">🎮 Cách chơi:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hai người chơi luân phiên đặt quân trên bàn cờ 8x8</li>
                    <li>Người chơi 1 (⚫) đi trước, người chơi 2 (⚪) đi sau</li>
                    <li>Mỗi nước đi phải "kẹp" ít nhất một quân đối thủ</li>
                    <li>Tất cả quân bị "kẹp" sẽ được lật thành màu của mình</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">📏 Quy tắc "kẹp":</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quân mới đặt và quân cùng màu tạo thành một "đường thẳng"</li>
                    <li>Giữa chúng phải có ít nhất một quân đối thủ</li>
                    <li>Có thể kẹp theo 8 hướng: ngang, dọc, chéo</li>
                    <li>Một nước đi có thể kẹp nhiều hướng cùng lúc</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">⏰ Giới hạn thời gian:</h4>
                  <p>Mỗi người chơi có 30 giây để suy nghĩ mỗi nước đi. Hết thời gian sẽ bị bỏ lượt.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">🏁 Kết thúc game:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Game kết thúc khi cả hai người không thể đi nước nào</li>
                    <li>Người có nhiều quân hơn sẽ thắng</li>
                    <li>Nếu bằng điểm thì là hòa</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">🤖 Chế độ AI:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Dễ:</strong> AI đi ngẫu nhiên</li>
                    <li><strong>Trung bình:</strong> AI ưu tiên góc và cạnh</li>
                    <li><strong>Khó:</strong> AI sử dụng thuật toán đánh giá vị trí</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowRules(false)}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Đã hiểu!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameInfo;
