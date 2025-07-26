import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-vercel-domain.vercel.app'] 
      : ['http://localhost:3000'],
    credentials: true
  }
});

// Game state interfaces
interface Player {
  id: string;
  name: string;
  emoji: string;
  isReady: boolean;
}

interface GameState {
  board: (number | null)[][];
  currentPlayer: number;
  players: Player[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  scores: { [key: number]: number };
  validMoves: number[][];
  timeLeft: number;
  timerInterval?: NodeJS.Timeout;
}

interface Room {
  id: string;
  gameState: GameState;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

// AI difficulty levels
enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Store rooms in memory (in production, use Redis or database)
const rooms = new Map<string, Room>();

// Othello game logic
class OthelloGame {
  static DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  static createEmptyBoard(): (number | null)[][] {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Initial setup
    board[3][3] = 2; // White
    board[3][4] = 1; // Black
    board[4][3] = 1; // Black
    board[4][4] = 2; // White
    
    return board;
  }

  static getValidMoves(board: (number | null)[][], player: number): number[][] {
    const validMoves: number[][] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === null && this.canPlacePiece(board, row, col, player)) {
          validMoves.push([row, col]);
        }
      }
    }
    
    return validMoves;
  }

  static canPlacePiece(board: (number | null)[][], row: number, col: number, player: number): boolean {
    for (const [dr, dc] of this.DIRECTIONS) {
      if (this.wouldFlipInDirection(board, row, col, dr, dc, player)) {
        return true;
      }
    }
    return false;
  }

  static wouldFlipInDirection(
    board: (number | null)[][], 
    startRow: number, 
    startCol: number, 
    dr: number, 
    dc: number, 
    player: number
  ): boolean {
    const opponent = player === 1 ? 2 : 1;
    let r = startRow + dr;
    let c = startCol + dc;
    let hasOpponentPieces = false;

    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      if (board[r][c] === null) return false;
      if (board[r][c] === opponent) {
        hasOpponentPieces = true;
      } else if (board[r][c] === player) {
        return hasOpponentPieces;
      }
      r += dr;
      c += dc;
    }
    
    return false;
  }

  static makeMove(board: (number | null)[][], row: number, col: number, player: number): (number | null)[][] {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = player;

    for (const [dr, dc] of this.DIRECTIONS) {
      this.flipPiecesInDirection(newBoard, row, col, dr, dc, player);
    }

    return newBoard;
  }

  static flipPiecesInDirection(
    board: (number | null)[][], 
    startRow: number, 
    startCol: number, 
    dr: number, 
    dc: number, 
    player: number
  ): void {
    if (!this.wouldFlipInDirection(board, startRow, startCol, dr, dc, player)) return;

    const opponent = player === 1 ? 2 : 1;
    let r = startRow + dr;
    let c = startCol + dc;

    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
      board[r][c] = player;
      r += dr;
      c += dc;
    }
  }

  static calculateScores(board: (number | null)[][]): { [key: number]: number } {
    const scores = { 1: 0, 2: 0 };
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === 1) scores[1]++;
        if (board[row][col] === 2) scores[2]++;
      }
    }
    
    return scores;
  }

  static isGameOver(board: (number | null)[][]): boolean {
    const player1Moves = this.getValidMoves(board, 1);
    const player2Moves = this.getValidMoves(board, 2);
    
    return player1Moves.length === 0 && player2Moves.length === 0;
  }

  // AI logic
  static makeAIMove(board: (number | null)[][], difficulty: AIDifficulty): number[] | null {
    const validMoves = this.getValidMoves(board, 2); // AI is player 2
    if (validMoves.length === 0) return null;

    switch (difficulty) {
      case AIDifficulty.EASY:
        return this.makeRandomMove(validMoves);
      case AIDifficulty.MEDIUM:
        return this.makeMediumMove(board, validMoves);
      case AIDifficulty.HARD:
        return this.makeHardMove(board, validMoves);
      default:
        return this.makeRandomMove(validMoves);
    }
  }

  static makeRandomMove(validMoves: number[][]): number[] {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  static makeMediumMove(board: (number | null)[][], validMoves: number[][]): number[] {
    // Prioritize corners, then edges, then regular moves
    const corners = validMoves.filter(([r, c]) => 
      (r === 0 || r === 7) && (c === 0 || c === 7)
    );
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    const edges = validMoves.filter(([r, c]) => 
      r === 0 || r === 7 || c === 0 || c === 7
    );
    if (edges.length > 0) {
      return edges[Math.floor(Math.random() * edges.length)];
    }

    return this.makeRandomMove(validMoves);
  }

  static makeHardMove(board: (number | null)[][], validMoves: number[][]): number[] {
    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const [row, col] = move;
      const newBoard = this.makeMove(board, row, col, 2);
      const score = this.evaluateBoard(newBoard, 2);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  static evaluateBoard(board: (number | null)[][], player: number): number {
    const scores = this.calculateScores(board);
    const opponent = player === 1 ? 2 : 1;
    
    let score = scores[player] - scores[opponent];
    
    // Bonus for corners
    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    for (const [r, c] of corners) {
      if (board[r][c] === player) score += 25;
      if (board[r][c] === opponent) score -= 25;
    }
    
    // Bonus for edges
    for (let i = 0; i < 8; i++) {
      if (board[0][i] === player || board[7][i] === player || 
          board[i][0] === player || board[i][7] === player) {
        score += 5;
      }
      if (board[0][i] === opponent || board[7][i] === opponent || 
          board[i][0] === opponent || board[i][7] === opponent) {
        score -= 5;
      }
    }
    
    return score;
  }
}

// Helper functions
function generateRoomId(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function createInitialGameState(): GameState {
  return {
    board: OthelloGame.createEmptyBoard(),
    currentPlayer: 1,
    players: [],
    gameStatus: 'waiting',
    scores: { 1: 2, 2: 2 },
    validMoves: OthelloGame.getValidMoves(OthelloGame.createEmptyBoard(), 1),
    timeLeft: 30
  };
}

function startTimer(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.gameState.timerInterval) {
    clearInterval(room.gameState.timerInterval);
  }

  room.gameState.timeLeft = 30;
  
  room.gameState.timerInterval = setInterval(() => {
    room.gameState.timeLeft--;
    
    io.to(roomId).emit('timerUpdate', room.gameState.timeLeft);
    
    if (room.gameState.timeLeft <= 0) {
      // Time's up, skip turn
      const nextPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
      room.gameState.currentPlayer = nextPlayer;
      room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, nextPlayer);
      
      if (room.gameState.validMoves.length === 0) {
        // Check if game is over
        if (OthelloGame.isGameOver(room.gameState.board)) {
          room.gameState.gameStatus = 'finished';
          clearInterval(room.gameState.timerInterval);
        } else {
          // Skip turn
          room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
          room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, room.gameState.currentPlayer);
        }
      }
      
      io.to(roomId).emit('gameStateUpdate', room.gameState);
      
      if (room.gameState.gameStatus !== 'finished') {
        startTimer(roomId);
      }
    }
  }, 1000);
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (playerData: { name: string; emoji: string }) => {
    const roomId = generateRoomId();
    const gameState = createInitialGameState();
    
    const player: Player = {
      id: socket.id,
      name: playerData.name,
      emoji: playerData.emoji,
      isReady: false
    };
    
    gameState.players.push(player);
    
    const room: Room = {
      id: roomId,
      gameState,
      messages: []
    };
    
    rooms.set(roomId, room);
    socket.join(roomId);
    
    socket.emit('roomCreated', { roomId, gameState });
  });

  socket.on('joinRoom', (data: { roomId: string; playerData: { name: string; emoji: string } }) => {
    const { roomId, playerData } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    
    if (room.gameState.players.length >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }
    
    const player: Player = {
      id: socket.id,
      name: playerData.name,
      emoji: playerData.emoji,
      isReady: false
    };
    
    room.gameState.players.push(player);
    socket.join(roomId);
    
    io.to(roomId).emit('gameStateUpdate', room.gameState);
    socket.emit('roomJoined', { roomId, gameState: room.gameState });
  });

  socket.on('createAIGame', (data: { playerData: { name: string; emoji: string }; difficulty: AIDifficulty }) => {
    const roomId = generateRoomId();
    const gameState = createInitialGameState();
    
    const humanPlayer: Player = {
      id: socket.id,
      name: data.playerData.name,
      emoji: data.playerData.emoji,
      isReady: true
    };
    
    const aiPlayer: Player = {
      id: 'AI',
      name: `AI (${data.difficulty.toUpperCase()})`,
      emoji: '🤖',
      isReady: true
    };
    
    gameState.players = [humanPlayer, aiPlayer];
    gameState.gameStatus = 'playing';
    
    const room: Room = {
      id: roomId,
      gameState,
      messages: []
    };
    
    rooms.set(roomId, room);
    socket.join(roomId);
    
    startTimer(roomId);
    
    socket.emit('aiGameCreated', { roomId, gameState, difficulty: data.difficulty });
  });

  socket.on('playerReady', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
      
      if (room.gameState.players.length === 2 && room.gameState.players.every(p => p.isReady)) {
        room.gameState.gameStatus = 'playing';
        startTimer(roomId);
      }
      
      io.to(roomId).emit('gameStateUpdate', room.gameState);
    }
  });

  socket.on('makeMove', (data: { roomId: string; row: number; col: number; difficulty?: AIDifficulty }) => {
    const room = rooms.get(data.roomId);
    if (!room || room.gameState.gameStatus !== 'playing') return;
    
    const currentPlayerIndex = room.gameState.currentPlayer - 1;
    const currentPlayer = room.gameState.players[currentPlayerIndex];
    
    if (currentPlayer.id !== socket.id) return;
    
    const validMove = room.gameState.validMoves.some(([r, c]) => r === data.row && c === data.col);
    if (!validMove) return;
    
    // Make the move
    room.gameState.board = OthelloGame.makeMove(room.gameState.board, data.row, data.col, room.gameState.currentPlayer);
    room.gameState.scores = OthelloGame.calculateScores(room.gameState.board);
    
    // Switch player
    room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
    room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, room.gameState.currentPlayer);
    
    // Check if current player has no moves
    if (room.gameState.validMoves.length === 0) {
      if (OthelloGame.isGameOver(room.gameState.board)) {
        room.gameState.gameStatus = 'finished';
        if (room.gameState.timerInterval) {
          clearInterval(room.gameState.timerInterval);
        }
      } else {
        // Skip turn
        room.gameState.currentPlayer = room.gameState.currentPlayer === 1 ? 2 : 1;
        room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, room.gameState.currentPlayer);
      }
    }
    
    io.to(data.roomId).emit('gameStateUpdate', room.gameState);
    
    // Handle AI move if playing against AI
    if (data.difficulty && room.gameState.currentPlayer === 2 && room.gameState.gameStatus === 'playing') {
      setTimeout(() => {
        const aiMove = OthelloGame.makeAIMove(room.gameState.board, data.difficulty!);
        if (aiMove) {
          const [aiRow, aiCol] = aiMove;
          
          room.gameState.board = OthelloGame.makeMove(room.gameState.board, aiRow, aiCol, 2);
          room.gameState.scores = OthelloGame.calculateScores(room.gameState.board);
          room.gameState.currentPlayer = 1;
          room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, 1);
          
          if (room.gameState.validMoves.length === 0) {
            if (OthelloGame.isGameOver(room.gameState.board)) {
              room.gameState.gameStatus = 'finished';
              if (room.gameState.timerInterval) {
                clearInterval(room.gameState.timerInterval);
              }
            } else {
              room.gameState.currentPlayer = 2;
              room.gameState.validMoves = OthelloGame.getValidMoves(room.gameState.board, 2);
            }
          }
          
          io.to(data.roomId).emit('gameStateUpdate', room.gameState);
          
          if (room.gameState.gameStatus === 'playing') {
            startTimer(data.roomId);
          }
        }
      }, 1000); // 1 second delay for AI move
    } else if (room.gameState.gameStatus === 'playing') {
      startTimer(data.roomId);
    }
  });

  socket.on('newGame', (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.gameState = createInitialGameState();
    room.gameState.players = room.gameState.players.map(p => ({ ...p, isReady: false }));
    
    io.to(roomId).emit('gameStateUpdate', room.gameState);
  });

  socket.on('sendMessage', (data: { roomId: string; message: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;
    
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      playerId: socket.id,
      playerName: player.name,
      message: data.message,
      timestamp: Date.now()
    };
    
    room.messages.push(chatMessage);
    
    // Keep only last 50 messages
    if (room.messages.length > 50) {
      room.messages = room.messages.slice(-50);
    }
    
    io.to(data.roomId).emit('newMessage', chatMessage);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all rooms
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.gameState.players.splice(playerIndex, 1);
        
        if (room.gameState.players.length === 0) {
          // Clean up empty room
          if (room.gameState.timerInterval) {
            clearInterval(room.gameState.timerInterval);
          }
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('gameStateUpdate', room.gameState);
        }
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
