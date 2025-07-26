export interface Player {
  id: string;
  name: string;
  emoji: string;
  isReady: boolean;
}

export interface GameState {
  board: (number | null)[][];
  currentPlayer: number;
  players: Player[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  scores: { [key: number]: number };
  validMoves: number[][];
  timeLeft: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface ThemeColors {
  light: string;
  dark: string;
  name: string;
  emoji: string;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export const AVAILABLE_EMOJIS = [
  '😀', '😎', '🥳', '😍', '🤗', '😊', '🙂', '😄', '😆', '🤩',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🌟', '⭐', '✨', '💫', '🌈', '🔥', '💎', '👑', '🏆', '🎯',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🥭',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊', '🎳'
];

export const BOARD_THEMES: ThemeColors[] = [
  { light: 'bg-classic-light', dark: 'bg-classic-dark', name: 'Cổ điển', emoji: '🌿' },
  { light: 'bg-ocean-light', dark: 'bg-ocean-dark', name: 'Đại dương', emoji: '🌊' },
  { light: 'bg-sunset-light', dark: 'bg-sunset-dark', name: 'Hoàng hôn', emoji: '🌅' },
  { light: 'bg-forest-light', dark: 'bg-forest-dark', name: 'Rừng xanh', emoji: '🌲' },
  { light: 'bg-royal-light', dark: 'bg-royal-dark', name: 'Hoàng gia', emoji: '👑' },
  { light: 'bg-pink-light', dark: 'bg-pink-dark', name: 'Hồng pastel', emoji: '🌸' },
  { light: 'bg-mint-light', dark: 'bg-mint-dark', name: 'Bạc hà', emoji: '🍃' },
  { light: 'bg-lavender-light', dark: 'bg-lavender-dark', name: 'Lavender', emoji: '💜' },
  { light: 'bg-coral-light', dark: 'bg-coral-dark', name: 'San hô', emoji: '🐠' },
  { light: 'bg-sky-light', dark: 'bg-sky-dark', name: 'Bầu trời', emoji: '☁️' }
];
