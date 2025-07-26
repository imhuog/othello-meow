import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { BOARD_THEMES } from '../types';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">🎨</span>
        <span className="hidden sm:inline text-white font-medium">Theme</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Theme selector */}
            <motion.div
              className="absolute right-0 top-full mt-2 bg-gray-800 rounded-xl p-4 shadow-2xl z-50 min-w-[280px]"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-white font-semibold mb-3 text-center">🎨 Chọn theme bàn cờ</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {BOARD_THEMES.map((theme, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      ${currentTheme.name === theme.name
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Theme preview */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{theme.emoji}</span>
                      <span className="text-white text-sm font-medium truncate">
                        {theme.name}
                      </span>
                    </div>
                    
                    {/* Mini board preview */}
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: 16 }, (_, i) => {
                        const isLight = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
                        const colorClass = isLight ? theme.light : theme.dark;
                        return (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-sm ${colorClass.replace('bg-', 'bg-')} border border-gray-600/30`}
                          />
                        );
                      })}
                    </div>

                    {/* Selected indicator */}
                    {currentTheme.name === theme.name && (
                      <motion.div
                        className="absolute top-1 right-1 text-yellow-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 text-center">
                <p className="text-gray-400 text-xs">
                  Theme hiện tại: {currentTheme.emoji} {currentTheme.name}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
