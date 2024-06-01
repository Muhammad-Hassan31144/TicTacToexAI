import React, { useEffect, useRef, useState } from "react";

const TicTacToeCanvas = ({setMode}) => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [drawCount, setDrawCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawBoard(ctx);
  }, []);

  useEffect(() => {
    if (winner) {
      if (winner === "Draw") {
        setDrawCount(drawCount + 1);
      } else {
        if (winner === "O") {
          setWinCount(winCount + 1);
        } else {
          setLossCount(lossCount + 1);
        }
      }
    }
  }, [winner]);

  const handleCanvasClick = (event) => {
    if (winner) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    const cellSize = canvas.width / 3;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const index = row * 3 + col;

    if (board[index] === null) {
      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);
      drawMark(ctx, currentPlayer, col, row);
      const newWinner = calculateWinner(newBoard);
      if (newWinner) {
        setWinner(newWinner);
      } else if (isBoardFull(newBoard)) {
        setWinner("Draw");
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    }
  };

  const drawBoard = (ctx) => {
    const canvasSize = 300;
    const cellSize = canvasSize / 3;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
    }

    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }
  };

  const drawMark = (ctx, player, col, row) => {
    const canvasSize = 300;
    const cellSize = canvasSize / 3;
    const offsetX = cellSize * col;
    const offsetY = cellSize * row;

    if (player === "X") {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(offsetX + 10, offsetY + 10);
      ctx.lineTo(offsetX + cellSize - 10, offsetY + cellSize - 10);
      ctx.moveTo(offsetX + cellSize - 10, offsetY + 10);
      ctx.lineTo(offsetX + 10, offsetY + cellSize - 10);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        offsetX + cellSize / 2,
        offsetY + cellSize / 2,
        cellSize / 3,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }
  };

  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  };

  const isBoardFull = (board) => {
    return board.every((cell) => cell !== null);
  };

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setCurrentPlayer("X");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawBoard(ctx);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe (Canvas)</h1>
      <div className="text-lg font-semibold mb-4">
        <p>Wins: {winCount}</p>
        <p>Losses: {lossCount}</p>
        <p>Draws: {drawCount}</p>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={handleCanvasClick}
        className="border-4 border-black mb-4"
      />
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg text-center">
            <p className="text-xl font-bold">
              {winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`}
            </p>
            <button
              onClick={restartGame}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      <div className="text-lg font-semibold mt-4">
        <p className={`text-${currentPlayer === "X" ? "blue" : "red"}-500`}>
          Current Player: {currentPlayer}
        </p>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setMode(null)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Quit
        </button>
      </div>
    </div>
  );
};

export default TicTacToeCanvas;
