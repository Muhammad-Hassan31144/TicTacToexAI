import { useState } from "react";
import "./index.css";
import TicTacToe from "./components/TicTacToe";
import TicTacToeCanvas from "./components/TicTacToeCanvas";

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {!mode && (
        <div className="landing-page grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto p-4">
          <div className="relative text-white text-center flex items-center justify-center bg-cover bg-center h-64 md:h-auto" style={{ backgroundImage: "url('https://source.unsplash.com/random/800x600/?ai')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative z-10 p-4">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Play Against AI</h2>
              <p className="mb-4">Test your skills against our AI!</p>
              <button onClick={() => setMode("ai")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Play AI vs Human</button>
            </div>
          </div>
          <div className="relative text-white text-center flex items-center justify-center bg-cover bg-center h-64 md:h-auto" style={{ backgroundImage: "url('https://source.unsplash.com/random/800x600/?human')" }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative z-10 p-4">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">Play with a Friend</h2>
              <p className="mb-4">Enjoy the classic game with a friend!</p>
              <button onClick={() => setMode("player")} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">Play Human vs Human</button>
            </div>
          </div>
        </div>
      )}
      {mode === "player" && <TicTacToeCanvas setMode={setMode} />}
      {mode === "ai" && <TicTacToe setMode={setMode} />}
    </div>
  );
}

export default App;
