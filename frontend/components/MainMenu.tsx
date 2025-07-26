import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { AVAILABLE_EMOJIS, AIDifficulty } from '../types';
import ThemeSelector from './ThemeSelector';

const MainMenu: React.FC = () => {
  const { createRoom, joinRoom, createAIGame } = useGame();
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'ai'>('create');
  const [playerName, setPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]);
  const [roomId, setRoomId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');

  // Auto-fill room ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoom({ name: playerName.trim(), emoji: selectedEmoji });
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      joinRoom(roomId.trim().toUpperCase(), { name: playerName.trim(), emoji: selectedEmoji });
    }
  };

  const handleCreateAIGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createAIGame({ name: playerName.trim(), emoji: selectedEmoji }, selectedDifficulty);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-6xl mb-4">⚫⚪</div>
          <h1 className="text-3xl font-bold text-white mb-2">Othello Game</h1>
          <p className="text-gray-300">Trò chơi cờ lật kinh điển</p>
          
          {/* Theme selector in header */}
          <div className="flex justify-center mt-4">
            <ThemeSelector />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-black/20 p-1 mb-6">
          {[
            { key: 'create', label: '🏠 Tạo phòng', icon: '🏠' },
            { key: 'join', label: '🚀 Vào phòng', icon: '🚀' },
            { key: 'ai', label: '🤖 Chơi AI', icon: '🤖' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-lg">{tab.icon}</span>
            </button>
          ))}
        </div>

        {/* Player Setup */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-white font-semibold mb-2">
            👤 Tên của bạn:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nhập tên..."
            className="w-full px-4 py-3 bg-black/20 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition-colors"
            maxLength={20}
          />
          
          {/* Emoji Selection */}
          <div className="mt-4">
            <label className="block text-white font-semibold mb-3">
              😀 Chọn avatar:
            </label>
            <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
              {AVAILABLE_EMOJIS.map((emoji, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`
                    text-2xl p-2 rounded-lg transition-all duration-200
                    ${selectedEmoji === emoji
                      ? 'bg-blue-500 shadow-lg scale-110'
                      : 'bg-black/20 hover:bg-black/40 hover:scale-105'
                    }
                  `}
                  whileHover={{ scale: selectedEmoji === emoji ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.form
              key="create"
              onSubmit={handleCreateRoom}
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                type="submit"
                disabled={!playerName.trim()}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${playerName.trim()
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={playerName.trim() ? { scale: 1.02 } : {}}
                whileTap={playerName.trim() ? { scale: 0.98 } : {}}
              >
                🏠 Tạo phòng mới
              </motion.button>
              
              <p className="text-gray-300 text-sm text-center">
                Tạo phòng riêng và mời bạn bè cùng chơi
              </p>
            </motion.form>
          )}

          {activeTab === 'join' && (
            <motion.form
              key="join"
              onSubmit={handleJoinRoom}
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-white font-semibold mb-2">
                  🔑 Mã phòng:
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Nhập mã phòng..."
                  className="w-full px-4 py-3 bg-black/20 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none transition-colors text-center font-mono text-lg"
                  maxLength={6}
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={!playerName.trim() || !roomId.trim()}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${playerName.trim() && roomId.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={playerName.trim() && roomId.trim() ? { scale: 1.02 } : {}}
                whileTap={playerName.trim() && roomId.trim() ? { scale: 0.98 } : {}}
              >
                🚀 Vào phòng
              </motion.button>
              
              <p className="text-gray-300 text-sm text-center">
                Nhập mã phòng 6 số để tham gia game
              </p>
            </motion.form>
          )}

          {activeTab === 'ai' && (
            <motion.form
              key="ai"
              onSubmit={handleCreateAIGame}
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-white font-semibold mb-3">
                  🎯 Chọn độ khó:
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'easy', label: '😊 Dễ', desc: 'AI đi ngẫu nhiên' },
                    { value: 'medium', label: '🤔 Trung bình', desc: 'AI ưu tiên góc và cạnh' },
                    { value: 'hard', label: '😈 Khó', desc: 'AI thông minh và khó đánh bại' }
                  ].map((difficulty) => (
                    <motion.button
                      key={difficulty.value}
                      type="button"
                      onClick={() => setSelectedDifficulty(difficulty.value as AIDifficulty)}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all duration-200 border-2
                        ${selectedDifficulty === difficulty.value
                          ? 'border-yellow-400 bg-yellow-400/20 text-white'
                          : 'border-gray-600 bg-black/20 text-gray-300 hover:border-gray-500'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold">{difficulty.label}</div>
                      <div className="text-sm text-gray-400">{difficulty.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.button
                type="submit"
                disabled={!playerName.trim()}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${playerName.trim()
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={playerName.trim() ? { scale: 1.02 } : {}}
                whileTap={playerName.trim() ? { scale: 0.98 } : {}}
              >
                🤖 Chơi với AI
              </motion.button>
              
              <p className="text-gray-300 text-sm text-center">
                Thử thách bản thân với AI thông minh
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>🎮 Tạo bởi Claude AI</p>
          <p className="mt-1">Phiên bản 2.0 - Cải tiến UI/UX</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MainMenu;
