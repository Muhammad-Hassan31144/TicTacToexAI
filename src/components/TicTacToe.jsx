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
      const updatedBoard = board.map((r, rowIndex) =>
        r.map((cell, colIndex) => (rowIndex === row && colIndex === col ? currentPlayer : cell))
      );
      setBoard(updatedBoard);

      const gameWinner = checkWinner(updatedBoard, currentPlayer);
      if (gameWinner) {
        setWinner(gameWinner);
        setGameOver(true);
      } else if (isBoardFull(updatedBoard)) {
        setWinner('Draw');
        setGameOver(true);
      } else {
        const nextPlayer = currentPlayer === X ? O : X;
        setCurrentPlayer(nextPlayer);
        if (nextPlayer === O) {
          setTimeout(() => makeAIMove(aiMode, updatedBoard), 500);
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

  const getBestMoveMinimax = (currentBoard, player, opponent) => {
    const emptyCells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (currentBoard[row][col] === EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }

    let bestMove = { row: -1, col: -1 };
    let bestScore = -Infinity;

    for (let i = 0; i < emptyCells.length; i++) {
      const { row, col } = emptyCells[i];
      currentBoard[row][col] = player;
      const score = minimax(currentBoard, opponent, player, false);
      currentBoard[row][col] = EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { row, col };
      }
    }

    return bestMove;
  };

  const minimax = (currentBoard, player, opponent, isMaximizing) => {
    const winner = checkWinner(currentBoard, player);
    if (winner === player) {
      return 1;
    } else if (winner === opponent) {
      return -1;
    } else if (isBoardFull(currentBoard)) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (currentBoard[row][col] === EMPTY) {
            currentBoard[row][col] = player;
            const score = minimax(currentBoard, opponent, player, false);
            currentBoard[row][col] = EMPTY;
            bestScore = Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (currentBoard[row][col] === EMPTY) {
            currentBoard[row][col] = opponent;
            const score = minimax(currentBoard, opponent, player, true);
            currentBoard[row][col] = EMPTY;
            bestScore = Math.min(score, bestScore);
          }
        }
      }
      return bestScore;
    }
  };

  const makeAIMove = (aiMode, currentBoard) => {
    let aiMove = { row: -1, col: -1 };

    switch (aiMode) {
      case 'easy':
        aiMove = getRandomMove(currentBoard);
        break;
      case 'medium':
        aiMove = getBlockingMove(currentBoard, O);
        break;
      case 'hard':
        try {
          aiMove = getBestMoveMinimax(currentBoard, O, X);
        } catch (error) {
          console.error('Error in minimax calculation:', error);
          aiMove = getRandomMove(currentBoard);
        }
        break;
      default:
        aiMove = getRandomMove(currentBoard);
        break;
    }

    if (aiMove.row !== -1 && aiMove.col !== -1) {
      currentBoard[aiMove.row][aiMove.col] = O;
      setBoard([...currentBoard]);

      const gameWinner = checkWinner(currentBoard, O);
      if (gameWinner) {
        setWinner(gameWinner);
        setGameOver(true);
      } else if (isBoardFull(currentBoard)) {
        setWinner('Draw');
        setGameOver(true);
      } else {
        setCurrentPlayer(X);
      }
    }
  };

  const handleModeChange = (mode) => {
    setAiMode(mode);
    if (!gameOver && currentPlayer === O) {
      makeAIMove(mode, board);
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
