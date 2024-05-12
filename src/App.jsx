// import { useState } from "react";
// import "./App.css";
import TicTacToe from "./components/TicTacToe";
// import TicTacToeCanvas from "./components/TicTacToeCanvas";
function App() {
  // const [mode, setMode] = useState(null);

  // const handleModeChange = (newMode) => {
  //   setMode(newMode);
  // };

  return (
      <div className="App">
        <h1>Welcome to Tic Tac Toe!</h1>
        {/* <p>Please select a mode:</p>
        <button onClick={() => handleModeChange("player")}>
          Player vs Player
        </button> */}
        {/* <button onClick={() => handleModeChange("ai")}>Player vs AI</button> */}

      {mode === "player" && <TicTacToeCanvas />}
      {mode === "ai" && <TicTacToe />}
      {mode === null && <p>Please select a mode above to start playing!</p>}
      
      </div>
  );
}

export default App;
