import { useState } from "react";
import "./index.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import EnhancedTicTacToe from "./components/EnhancedTicTacToe";

function AppContent() {
  const [mode, setMode] = useState(null);
  const { isDark, toggleTheme } = useTheme();

  const playSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleModeSelect = (selectedMode) => {
    playSound();
    setMode(selectedMode);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {!mode && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {/* Theme Toggle */}
          <button
            onClick={() => {
              playSound();
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

          {/* Header */}
          <div className="text-center mb-12 mt-16 md:mt-0">
            <h1 className={`text-5xl md:text-7xl font-bold mb-4 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              🎮 Tic Tac Toe
            </h1>
            <p className={`text-xl md:text-2xl mb-6 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Choose your game mode and let's play!
            </p>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/Muhammad-Hassan31144"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playSound}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'bg-white/50 text-gray-600 hover:bg-white/70 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/muhammad-hassan31144"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playSound}
                className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white' 
                    : 'bg-white/50 text-gray-600 hover:bg-white/70 hover:text-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {/* AI Mode Card */}
            <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
              <div className="relative p-8 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  AI Challenge
                </h2>
                <p className={`text-lg mb-6 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Test your skills against our intelligent AI with multiple difficulty levels!
                </p>
                <button 
                  onClick={() => handleModeSelect("ai")} 
                  className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg group-hover:shadow-blue-500/25"
                >
                  🚀 Challenge AI
                </button>
              </div>
            </div>

            {/* Human Mode Card */}
            <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50 backdrop-blur-sm'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20"></div>
              <div className="relative p-8 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h2 className={`text-3xl font-bold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Two Player
                </h2>
                <p className={`text-lg mb-6 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Play with a friend locally and see who's the ultimate Tic Tac Toe champion!
                </p>
                <button 
                  onClick={() => handleModeSelect("player")} 
                  className="px-8 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg group-hover:shadow-green-500/25"
                >
                  🎯 Play Together
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <span className={`px-4 py-2 rounded-full ${
                isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
              }`}>
                🎨 Beautiful Graphics
              </span>
              <span className={`px-4 py-2 rounded-full ${
                isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
              }`}>
                🔊 Sound Effects
              </span>
              <span className={`px-4 py-2 rounded-full ${
                isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
              }`}>
                📱 Mobile Friendly
              </span>
              <span className={`px-4 py-2 rounded-full ${
                isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-white/50 text-gray-600'
              }`}>
                🌙 Dark Mode
              </span>
            </div>
          </div>
        </div>
      )}
      
      {(mode === "player" || mode === "ai") && (
        <EnhancedTicTacToe setMode={setMode} gameMode={mode} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
