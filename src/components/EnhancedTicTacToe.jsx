import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import 'tailwindcss/tailwind.css';

const X = "X";
const O = "O";
const EMPTY = null;

const EnhancedTicTacToe = ({ setMode, gameMode = 'ai' }) => {
  const { isDark, toggleTheme } = useTheme();
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => Array(3).fill().map(() => Array(3).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(X);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [aiMode, setAiMode] = useState('medium');
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
  }, [board, winner, gameOver, isDark]);

  const playSound = (type) => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const createBeep = (frequency, duration, type = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'move':
        createBeep(800, 0.1);
        break;
      case 'win':
        createBeep(600, 0.2);
        setTimeout(() => createBeep(800, 0.2), 100);
        setTimeout(() => createBeep(1000, 0.3), 200);
        break;
      case 'draw':
        createBeep(400, 0.5);
        break;
      case 'button':
        createBeep(600, 0.05);
        break;
    }
  };

  const drawBoard = (ctx) => {
    const cellSize = 100;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Board background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, isDark ? '#1f2937' : '#f9fafb');
    gradient.addColorStop(1, isDark ? '#111827' : '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Grid lines with glow effect
    ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.shadowColor = isDark ? '#3b82f6' : '#1d4ed8';
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(i * cellSize, 10);
      ctx.lineTo(i * cellSize, ctx.canvas.height - 10);
      ctx.moveTo(10, i * cellSize);
      ctx.lineTo(ctx.canvas.width - 10, i * cellSize);
    }
    ctx.stroke();
    
    // Reset shadow for pieces
    ctx.shadowBlur = 0;

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === X) {
          drawX(ctx, rowIndex, colIndex, cellSize);
        } else if (cell === O) {
          drawO(ctx, rowIndex, colIndex, cellSize);
        }
      });
    });

    // Highlight last move
    if (lastMove && !gameOver) {
      ctx.strokeStyle = isDark ? '#fbbf24' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        lastMove.col * cellSize + 5,
        lastMove.row * cellSize + 5,
        cellSize - 10,
        cellSize - 10
      );
      ctx.setLineDash([]);
    }
  };

  const drawX = (ctx, row, col, size) => {
    ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = isDark ? '#3b82f6' : '#1d4ed8';
    ctx.shadowBlur = 3;
    
    ctx.beginPath();
    ctx.moveTo(col * size + 20, row * size + 20);
    ctx.lineTo((col + 1) * size - 20, (row + 1) * size - 20);
    ctx.moveTo((col + 1) * size - 20, row * size + 20);
    ctx.lineTo(col * size + 20, (row + 1) * size - 20);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  };

  const drawO = (ctx, row, col, size) => {
    ctx.strokeStyle = isDark ? '#f87171' : '#ef4444';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = isDark ? '#ef4444' : '#dc2626';
    ctx.shadowBlur = 3;
    
    ctx.beginPath();
    ctx.arc((col + 0.5) * size, (row + 0.5) * size, size / 3, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  };

  const handleCellClick = async (row, col) => {
    if (!gameOver && board[row][col] === EMPTY && !isAnimating) {
      setIsAnimating(true);
      playSound('move');
      
      const updatedBoard = board.map((r, rowIndex) =>
        r.map((cell, colIndex) => (rowIndex === row && colIndex === col ? currentPlayer : cell))
      );
      
      setBoard(updatedBoard);
      setLastMove({ row, col });
      
      // Add slight delay for animation effect
      setTimeout(() => {
        const gameWinner = checkWinner(updatedBoard, currentPlayer);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          playSound('win');
          if (gameMode === 'ai') {
            if (gameWinner === X) {
              setWinCount(winCount + 1);
            } else if (gameWinner === O) {
              setLossCount(lossCount + 1);
            }
          }
        } else if (isBoardFull(updatedBoard)) {
          setWinner('Draw');
          setGameOver(true);
          playSound('draw');
          setDrawCount(drawCount + 1);
        } else {
          const nextPlayer = currentPlayer === X ? O : X;
          setCurrentPlayer(nextPlayer);
          if (gameMode === 'ai' && nextPlayer === O) {
            setTimeout(() => makeAIMove(aiMode, updatedBoard), 800);
          }
        }
        setIsAnimating(false);
      }, 150);
    }
  };

  // AI Logic (minimax implementation)
  const minimax = (board, depth, isMaximizing) => {
    const winner = checkWinner(board, O) || checkWinner(board, X);
    if (winner === O) return 10 - depth;
    if (winner === X) return depth - 10;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (board[row][col] === EMPTY) {
            board[row][col] = O;
            let score = minimax(board, depth + 1, false);
            board[row][col] = EMPTY;
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (board[row][col] === EMPTY) {
            board[row][col] = X;
            let score = minimax(board, depth + 1, true);
            board[row][col] = EMPTY;
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (board) => {
    let bestScore = -Infinity;
    let move = { row: -1, col: -1 };
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === EMPTY) {
          board[row][col] = O;
          let score = minimax(board, 0, false);
          board[row][col] = EMPTY;
          if (score > bestScore) {
            bestScore = score;
            move = { row, col };
          }
        }
      }
    }
    return move;
  };

  const getRandomMove = (currentBoard) => {
    const emptyCells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (currentBoard[row][col] === EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getBlockingMove = (currentBoard, player) => {
    const opponent = player === O ? X : O;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (currentBoard[row][col] === EMPTY) {
          currentBoard[row][col] = player;
          const winner = checkWinner(currentBoard, player);
          currentBoard[row][col] = EMPTY;

          if (winner === player) {
            return { row, col };
          }

          currentBoard[row][col] = opponent;
          const opponentWinner = checkWinner(currentBoard, opponent);
          currentBoard[row][col] = EMPTY;

          if (opponentWinner === opponent) {
            return { row, col };
          }
        }
      }
    }
    return getRandomMove(currentBoard);
  };

  const makeAIMove = (aiMode, currentBoard) => {
    if (gameOver) return;
    
    setIsAnimating(true);
    let aiMove = { row: -1, col: -1 };

    switch (aiMode) {
      case 'easy':
        aiMove = getRandomMove(currentBoard);
        break;
      case 'medium':
        aiMove = getBlockingMove(currentBoard, O);
        break;
      case 'hard':
        aiMove = getBestMove(currentBoard);
        break;
      default:
        aiMove = getRandomMove(currentBoard);
        break;
    }

    if (aiMove.row !== -1 && aiMove.col !== -1) {
      playSound('move');
      currentBoard[aiMove.row][aiMove.col] = O;
      setBoard([...currentBoard]);
      setLastMove({ row: aiMove.row, col: aiMove.col });

      setTimeout(() => {
        const gameWinner = checkWinner(currentBoard, O);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameOver(true);
          playSound('win');
          setLossCount(lossCount + 1);
        } else if (isBoardFull(currentBoard)) {
          setWinner('Draw');
          setGameOver(true);
          playSound('draw');
          setDrawCount(drawCount + 1);
        } else {
          setCurrentPlayer(X);
        }
        setIsAnimating(false);
      }, 150);
    }
  };

  const checkWinner = (currentBoard, player) => {
    for (let i = 0; i < 3; i++) {
      if (currentBoard[i][0] === player && currentBoard[i][1] === player && currentBoard[i][2] === player) {
        return player;
      }
      if (currentBoard[0][i] === player && currentBoard[1][i] === player && currentBoard[2][i] === player) {
        return player;
      }
    }
    if (currentBoard[0][0] === player && currentBoard[1][1] === player && currentBoard[2][2] === player) {
      return player;
    }
    if (currentBoard[0][2] === player && currentBoard[1][1] === player && currentBoard[2][0] === player) {
      return player;
    }
    return null;
  };

  const isBoardFull = (currentBoard) => {
    return currentBoard.every(row => row.every(cell => cell !== EMPTY));
  };

  const resetGame = () => {
    playSound('button');
    setBoard(() => Array(3).fill().map(() => Array(3).fill(EMPTY)));
    setCurrentPlayer(X);
    setWinner(null);
    setGameOver(false);
    setLastMove(null);
    setIsAnimating(false);
  };

  const handleModeChange = (mode) => {
    playSound('button');
    setAiMode(mode);
    if (!gameOver && currentPlayer === O && gameMode === 'ai') {
      makeAIMove(mode, board);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen transition-all duration-500 relative ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={() => {
          playSound('button');
          toggleTheme();
        }}
        className={`fixed top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${
          isDark 
            ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className={`text-3xl font-bold mb-6 mt-16 md:mt-6 transition-colors duration-300 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        {gameMode === 'ai' ? '🤖 AI Challenge' : '👥 Two Player Mode'}
      </div>
      
      <div className={`mb-4 p-4 rounded-lg backdrop-blur-sm transition-all duration-300 ${
        isDark ? 'bg-gray-800/50 text-white' : 'bg-white/50 text-gray-800'
      }`}>
        <div className="flex justify-around text-center space-x-6">
          <div>
            <p className="text-lg font-semibold text-green-500">Wins</p>
            <p className="text-2xl font-bold">{winCount}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-500">Losses</p>
            <p className="text-2xl font-bold">{lossCount}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-yellow-500">Draws</p>
            <p className="text-2xl font-bold">{drawCount}</p>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={(e) => {
          if (!gameOver && !isAnimating) {
            const rect = canvasRef.current.getBoundingClientRect();
            const cellSize = rect.width / 3;
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            handleCellClick(y, x);
          }
        }}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevent double-tap zoom on mobile
        }}
        onTouchEnd={(e) => {
          if (!gameOver && !isAnimating) {
            e.preventDefault();
            const rect = canvasRef.current.getBoundingClientRect();
            const touch = e.changedTouches[0];
            const cellSize = rect.width / 3;
            const x = Math.floor((touch.clientX - rect.left) / cellSize);
            const y = Math.floor((touch.clientY - rect.top) / cellSize);
            handleCellClick(y, x);
          }
        }}
        className={`border-4 rounded-lg mb-6 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
          isDark ? 'border-blue-400 shadow-blue-400/25' : 'border-blue-500 shadow-blue-500/25'
        } shadow-lg w-full max-w-sm mx-auto`}
        style={{ 
          filter: isAnimating ? 'brightness(1.1)' : 'brightness(1)',
          transition: 'filter 0.15s ease, transform 0.15s ease',
          aspectRatio: '1/1'
        }}
      />

      <div className={`text-xl font-semibold mb-4 transition-colors duration-300 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        <p className={`${currentPlayer === X ? 'text-blue-400' : 'text-red-400'}`}>
          Current Player: {currentPlayer}
        </p>
      </div>

      {gameMode === 'ai' && (
        <div className="mb-6">
          <label className={`block text-lg font-semibold mb-2 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            AI Difficulty:
          </label>
          <select
            value={aiMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className={`px-4 py-2 border rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            }`}
          >
            <option value="easy">😊 Easy</option>
            <option value="medium">🤔 Medium</option>
            <option value="hard">😈 Hard</option>
          </select>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          🔄 New Game
        </button>
        <button
          onClick={() => {
            playSound('button');
            setMode(null);
          }}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          🚪 Quit
        </button>
      </div>

      {/* Footer with Social Links */}
      <div className={`text-center transition-colors duration-300 ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <p className="text-sm mb-2">Created by Muhammad Hassan</p>
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/Muhammad-Hassan31144"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('button')}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-all duration-300 hover:scale-105 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-xs">GitHub</span>
          </a>
          
          <a
            href="https://www.linkedin.com/in/muhammad-hassan31144"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('button')}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-all duration-300 hover:scale-105 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            <span className="text-xs">LinkedIn</span>
          </a>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className={`p-8 rounded-xl text-center transform animate-bounce-in shadow-2xl ${
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-6xl mb-4">
              {winner === 'Draw' ? '🤝' : winner === X ? '🎉' : '🤖'}
            </div>
            <p className="text-2xl font-bold mb-6">
              {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </p>
            <button 
              onClick={resetGame} 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTicTacToe;