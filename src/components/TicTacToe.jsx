
import { useState, useEffect, useRef } from 'react';

const X = "X";
const O = "O";
const EMPTY = null;

const TicTacToe = () => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => Array(3).fill().map(() => Array(3).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(X);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [aiMode, setAiMode] = useState('medium');
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBoard(ctx);
  }, [board, winner, gameOver]);

  const drawBoard = (ctx) => {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    const cellSize = 100;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, ctx.canvas.height);
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(ctx.canvas.width, i * cellSize);
    }
    ctx.stroke();

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === X) {
          drawX(ctx, rowIndex, colIndex, cellSize);
        } else if (cell === O) {
          drawO(ctx, rowIndex, colIndex, cellSize);
        }
      });
    });

  };

  const drawX = (ctx, row, col, size) => {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(col * size + 10, row * size + 10);
    ctx.lineTo((col + 1) * size - 10, (row + 1) * size - 10);
    ctx.moveTo((col + 1) * size - 10, row * size + 10);
    ctx.lineTo(col * size + 10, (row + 1) * size - 10);
    ctx.stroke();
  };

  const drawO = (ctx, row, col, size) => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc((col + 0.5) * size, (row + 0.5) * size, size / 3, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const handleCellClick = (row, col) => {
    if (!gameOver && board[row][col] === EMPTY) {
      const updatedBoard = [...board];
      updatedBoard[row][col] = currentPlayer;
      setBoard(updatedBoard);

      const gameWinner = checkWinner(updatedBoard, currentPlayer);
      if (gameWinner) {
        setWinner(gameWinner);
        setGameOver(true);
      } else if (isBoardFull(updatedBoard)) {
        setWinner('Draw');
        setGameOver(true);
      } else {
        setCurrentPlayer(currentPlayer === X ? O : X);
        if (currentPlayer === X) {
          setTimeout(() => makeAIMove(updatedBoard), 500); 
        }
      }
    }
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
    // Choose a random empty cell
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };
  
  const getBlockingMove = (currentBoard, player) => {
    const opponent = player === O ? X : O;
  
    // Check for winning moves or blocking moves
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (currentBoard[row][col] === EMPTY) {
          // Simulate placing player's token and check for a win
          currentBoard[row][col] = player;
          const winner = checkWinner(currentBoard, player);
          currentBoard[row][col] = EMPTY; // Undo move
  
          // If placing the token here results in a win, return this move
          if (winner === player) {
            return { row, col };
          }
          
          // Simulate placing opponent's token and check for a win
          currentBoard[row][col] = opponent;
          const opponentWinner = checkWinner(currentBoard, opponent);
          currentBoard[row][col] = EMPTY; // Undo move
  
          // If placing the token here blocks opponent's win, return this move
          if (opponentWinner === opponent) {
            return { row, col };
          }
        }
      }
    }
  
    // If no winning or blocking moves, return null
    return null;
  };
  

  const makeAIMove = async (aiMode) => {
    let aiMove = { row: -1, col: -1 };
  
    switch (aiMode) {
      case 'easy':
        aiMove = getRandomMove(board);
        break;
      case 'medium':
        aiMove = getBlockingMove(board, O) || getRandomMove(board);
        break;
      case 'hard':
        try {
          aiMove = await getBestMoveMinimax(board, O, X);
        } catch (error) {
          console.error('Error in minimax calculation:', error);
          aiMove = getRandomMove(board); // Fallback to random move
        }
        break;
      default:
        aiMove = getRandomMove(board); // Default to easy mode
        break;
    }
  
    // Retry until a valid move is found
    while (aiMove.row === -1 || aiMove.col === -1 || board[aiMove.row][aiMove.col] !== EMPTY) {
      switch (aiMode) {
        case 'easy':
          aiMove = getRandomMove(board);
          break;
        case 'medium':
          aiMove = getBlockingMove(board, O) || getRandomMove(board);
          break;
        case 'hard':
          try {
            aiMove = await getBestMoveMinimax(board, O, X);
          } catch (error) {
            console.error('Error in minimax calculation (retry):', error);
            aiMove = getRandomMove(board); // Fallback to random move
          }
          break;
        default:
          aiMove = getRandomMove(board); // Default to easy mode
          break;
      }
    }
  
    const updatedBoard = [...board];
    updatedBoard[aiMove.row][aiMove.col] = O;
    setBoard(updatedBoard);
  
    const gameWinner = checkWinner(updatedBoard, O);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
    } else if (isBoardFull(updatedBoard)) {
      setWinner('Draw');
      setGameOver(true);
    } else {
      setCurrentPlayer(X);
    }
  };
  

  const handleModeChange = (mode) => {
    setAiMode(mode);
    if (!gameOver && currentPlayer === O) {
      makeAIMove();
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
    setBoard(() => Array(3).fill().map(() => Array(3).fill(EMPTY)));
    setCurrentPlayer(X);
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={(e) => {
          if (!gameOver) {
            const rect = canvasRef.current.getBoundingClientRect();
            const cellSize = rect.width / 3;
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            handleCellClick(y, x);
          }
        }}
        className="canvas"
      />
      <div className="game-info">
        <p>Current Player: {currentPlayer}</p>
        {winner && <p>{winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}</p>}
        {gameOver && <button onClick={resetGame}>Play Again</button>}
      </div>
      <div className="ai-mode">
        <label>Select AI Mode:</label>
        <select value={aiMode} onChange={(e) => handleModeChange(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
};

export default TicTacToe;
