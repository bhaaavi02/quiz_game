
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateTechWords, getFallbackWords } from './services/geminiService';
import { buildGrid } from './services/gameLogic';
import { Difficulty, GameState, UserProgress, PlacedWord } from './types';
import { QuestionModal } from './components/QuestionModal';
import { Button } from './components/Button';
import { 
  Trophy, 
  Zap, 
  Flame, 
  Terminal, 
  Layout, 
  RefreshCw,
  Award,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const isInitialized = useRef(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    // Instant start: Initialize with fallback words immediately
    const words = getFallbackWords();
    const { grid, placedWords } = buildGrid(words);
    return {
      difficulty: Difficulty.EASY,
      grid,
      placedWords,
      currentWordIndex: null,
      status: 'PLAYING'
    };
  });

  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    streak: 3,
    completedPuzzles: 0,
    unlockedCategories: ['Fundamentals']
  });

  const initializeGame = useCallback(async (difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, status: 'LOADING', difficulty }));
    const words = await generateTechWords(difficulty);
    const { grid, placedWords } = buildGrid(words);
    setGameState(prev => ({
      ...prev,
      grid,
      placedWords,
      status: 'PLAYING',
      currentWordIndex: null
    }));
  }, []);

  // On mount, we are already "PLAYING" with fallback words. 
  // We can choose to silently fetch an AI puzzle or just let the user start.
  // Let's just ensure the component is ready.
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      // Optionally pre-fetch a harder puzzle if user is experienced, 
      // but for "as soon as possible", we already rendered the grid.
    }
  }, []);

  const handleCellClick = (wordIndex: number) => {
    if (gameState.placedWords[wordIndex].isSolved) return;
    setGameState(prev => ({ ...prev, currentWordIndex: wordIndex }));
  };

  const handleSolve = (answer: string) => {
    if (gameState.currentWordIndex === null) return;
    
    const word = gameState.placedWords[gameState.currentWordIndex];
    const newGrid = [...gameState.grid];
    const newPlacedWords = [...gameState.placedWords];

    newPlacedWords[gameState.currentWordIndex].isSolved = true;

    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === 'ACROSS' ? word.row : word.row + i;
      const c = word.direction === 'ACROSS' ? word.col + i : word.col;
      newGrid[r][c].userInput = word.answer[i];
      newGrid[r][c].isSolved = true;
    }

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      placedWords: newPlacedWords,
      currentWordIndex: null
    }));

    setProgress(prev => {
      const newXp = prev.xp + 50;
      const newLevel = Math.floor(newXp / 500) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });

    if (newPlacedWords.every(w => w.isSolved)) {
      setGameState(prev => ({ ...prev, status: 'COMPLETED' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Top Navigation / Stats */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Terminal className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">TECHX-CROSS</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">The Ultimate Dev Challenge</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{progress.xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg">
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-400">LVL {progress.level}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-500">{progress.streak} DAY</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Clue Lists & Controls */}
        <aside className="lg:col-span-4 order-2 lg:order-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Layout className="w-4 h-4 mr-2" /> Puzzle Clues
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {gameState.status === 'LOADING' ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-slate-800 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-400 uppercase">Across</p>
                    {gameState.placedWords.filter(w => w.direction === 'ACROSS').map((w, idx) => (
                      <button
                        key={`across-${idx}`}
                        onClick={() => handleCellClick(gameState.placedWords.indexOf(w))}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${w.isSolved ? 'bg-green-900/10 border-green-500/20 text-green-400 opacity-60' : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                      >
                        <span className="text-xs opacity-50 mr-2">{idx + 1}.</span> {w.clue}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold text-purple-400 uppercase">Down</p>
                    {gameState.placedWords.filter(w => w.direction === 'DOWN').map((w, idx) => (
                      <button
                        key={`down-${idx}`}
                        onClick={() => handleCellClick(gameState.placedWords.indexOf(w))}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${w.isSolved ? 'bg-green-900/10 border-green-500/20 text-green-400 opacity-60' : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-300'}`}
                      >
                        <span className="text-xs opacity-50 mr-2">{idx + 1}.</span> {w.clue}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              variant="primary" 
              onClick={() => initializeGame(gameState.difficulty)}
              className="w-full group"
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> 
              AI New Puzzle
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={gameState.difficulty === Difficulty.EASY ? 'secondary' : 'ghost'} 
                onClick={() => initializeGame(Difficulty.EASY)}
                size="sm"
              >Easy</Button>
              <Button 
                variant={gameState.difficulty === Difficulty.MEDIUM ? 'secondary' : 'ghost'} 
                onClick={() => initializeGame(Difficulty.MEDIUM)}
                size="sm"
              >Medium</Button>
            </div>
          </div>
        </aside>

        {/* Center: The Grid */}
        <section className="lg:col-span-8 order-1 lg:order-2">
          {gameState.status === 'LOADING' ? (
            <div className="w-full aspect-square flex items-center justify-center bg-slate-900 rounded-3xl border-4 border-dashed border-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-medium animate-pulse">Engaging Gemini Neural Network...</p>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative bg-slate-950 p-4 md:p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div 
                  className="grid gap-1 md:gap-2 mx-auto"
                  style={{ 
                    gridTemplateColumns: `repeat(${gameState.grid[0]?.length || 15}, minmax(0, 1fr))`,
                    maxWidth: '100%'
                  }}
                >
                  {gameState.grid.map((row, r) => 
                    row.map((cell, c) => (
                      <div
                        key={`cell-${r}-${c}`}
                        className={`aspect-square flex items-center justify-center rounded-sm md:rounded-md transition-all duration-300 transform
                          ${cell.isBlack 
                            ? 'bg-slate-900 opacity-20' 
                            : 'bg-slate-800 border-b-2 border-slate-700 hover:scale-105 cursor-pointer shadow-sm'
                          }
                          ${cell.isSolved ? 'bg-blue-600/20 border-blue-500/50 scale-[1.02]' : ''}
                        `}
                        onClick={() => !cell.isBlack && handleCellClick(cell.wordIndices[0])}
                      >
                        {!cell.isBlack && (
                          <div className="relative w-full h-full flex items-center justify-center">
                             {gameState.placedWords.some(w => w.row === r && w.col === c) && (
                               <span className="absolute top-0.5 left-0.5 text-[8px] md:text-[10px] font-bold text-slate-500">
                                 {gameState.placedWords.findIndex(w => w.row === r && w.col === c) + 1}
                               </span>
                             )}
                            <span className={`text-sm md:text-xl font-black mono ${cell.isSolved ? 'text-white' : 'text-slate-500'}`}>
                              {cell.userInput || ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Completion Overlay */}
      {gameState.status === 'COMPLETED' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative inline-block">
               <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
               <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter">MISSION ACCOMPLISHED</h2>
            <div className="p-6 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
              <div className="flex justify-around items-center">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Reward</p>
                  <p className="text-xl font-black text-yellow-400">+500 XP</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase">Level Up</p>
                  <p className="text-xl font-black text-blue-400">{progress.level}</p>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={() => initializeGame(gameState.difficulty)}>
                Generate Next Puzzle
              </Button>
            </div>
          </div>
        </div>
      )}

      {gameState.currentWordIndex !== null && (
        <QuestionModal
          word={gameState.placedWords[gameState.currentWordIndex]}
          onSolve={handleSolve}
          onClose={() => setGameState(prev => ({ ...prev, currentWordIndex: null }))}
        />
      )}

      <footer className="mt-auto py-8 w-full max-w-5xl flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Support</span>
          <span className="hover:text-slate-300 cursor-pointer">API Docs</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Booted in 120ms</span>
          <Terminal className="w-3 h-3 text-blue-500" />
          <span>TechX OS v1.0.4</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default App;
