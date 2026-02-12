
import React, { useState, useEffect, useCallback } from 'react';
import { generateLevelContent } from './services/geminiService';
import { buildGrid } from './services/gameLogic';
import { GameState, UserProgress, PlacedWord } from './types';
import { QuestionModal } from './components/QuestionModal';
import { TutorialModal } from './components/TutorialModal';
import { Button } from './components/Button';
import { 
  Trophy, 
  Zap, 
  Flame, 
  Terminal, 
  Layout, 
  Cpu,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const STORAGE_KEY = 'techx_cross_progress';

const App: React.FC = () => {
  // Load Initial Progress from LocalStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      xp: 0,
      level: 1,
      completedPuzzles: 0,
      hasSeenTutorial: false,
      highScore: 0
    };
  });

  const [gameState, setGameState] = useState<GameState>({
    currentLevel: progress.level,
    grid: [],
    placedWords: [],
    currentWordIndex: null,
    status: 'LOADING'
  });

  // Persist Progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const loadLevel = useCallback(async (level: number) => {
    setGameState(prev => ({ ...prev, status: 'LOADING', currentLevel: level }));
    const words = await generateLevelContent(level);
    const { grid, placedWords } = buildGrid(words, level);
    setGameState(prev => ({
      ...prev,
      grid,
      placedWords,
      status: 'PLAYING',
      currentWordIndex: null
    }));
  }, []);

  useEffect(() => {
    loadLevel(progress.level);
  }, []);

  const handleCellClick = (wordIndex: number) => {
    if (gameState.placedWords[wordIndex].isSolved) return;
    setGameState(prev => ({ ...prev, currentWordIndex: wordIndex }));
  };

  const handleSolve = (answer: string, hintsUsed: number) => {
    if (gameState.currentWordIndex === null) return;
    
    const word = gameState.placedWords[gameState.currentWordIndex];
    const newGrid = [...gameState.grid];
    const newPlacedWords = [...gameState.placedWords];

    newPlacedWords[gameState.currentWordIndex].isSolved = true;
    newPlacedWords[gameState.currentWordIndex].hintsUsed = hintsUsed;

    // Reveal on grid
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

    // XP Logic: 100 base - hint penalties (15, 30, 45)
    const hintPenalties = [0, 15, 30, 45];
    const earnedXp = Math.max(20, 100 - (hintPenalties[hintsUsed] || 0));

    setProgress(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
      highScore: Math.max(prev.highScore, prev.xp + earnedXp)
    }));

    // Check if whole level complete
    if (newPlacedWords.every(w => w.isSolved)) {
      setGameState(prev => ({ ...prev, status: 'COMPLETED' }));
    }
  };

  const startNextLevel = () => {
    const nextLevel = progress.level + 1;
    setProgress(prev => ({ ...prev, level: nextLevel, completedPuzzles: prev.completedPuzzles + 1 }));
    loadLevel(nextLevel);
  };

  const handleTutorialComplete = () => {
    setProgress(prev => ({ ...prev, hasSeenTutorial: true }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100 overflow-x-hidden">
      {!progress.hasSeenTutorial && <TutorialModal onComplete={handleTutorialComplete} />}

      {/* Modern Dashboard Header */}
      <header className="w-full max-w-6xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <Terminal className="text-blue-500 w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter leading-none">TECHX-CROSS</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-blue-500/20">System Ver 1.4.2</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Level {progress.level} Operations</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-black text-white">{progress.xp} XP</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-black text-white">LVL {progress.level}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-6xl px-6 md:px-8 mb-8">
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${(gameState.placedWords.filter(w => w.isSolved).length / Math.max(1, gameState.placedWords.length)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Sector Decryption</span>
          <span className="text-[10px] text-blue-400 font-bold uppercase">
            {Math.round((gameState.placedWords.filter(w => w.isSolved).length / Math.max(1, gameState.placedWords.length)) * 100)}% Complete
          </span>
        </div>
      </div>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 px-6 md:px-8 pb-12">
        {/* Clue Panel */}
        <aside className="lg:col-span-4 order-2 lg:order-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                <Layout className="w-4 h-4 mr-2 text-blue-500" /> Clue Terminal
              </h3>
              <span className="text-[10px] text-slate-600 font-bold">{gameState.placedWords.length} Uplinks</span>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {gameState.status === 'LOADING' ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-800/50 rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <>
                  {['ACROSS', 'DOWN'].map(dir => (
                    <div key={dir} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${dir === 'ACROSS' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dir}</p>
                      </div>
                      {gameState.placedWords.filter(w => w.direction === dir).map((w, i) => (
                        <button
                          key={i}
                          onClick={() => handleCellClick(gameState.placedWords.indexOf(w))}
                          className={`w-full group text-left p-4 rounded-2xl border transition-all duration-300 ${
                            w.isSolved 
                              ? 'bg-green-500/5 border-green-500/20 opacity-50' 
                              : 'bg-slate-800/30 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 shadow-lg'
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className="text-xs font-black text-slate-500 mt-1">{gameState.placedWords.indexOf(w) + 1}</span>
                            <div className="flex-1">
                              <p className={`text-sm leading-relaxed ${w.isSolved ? 'text-green-400 italic' : 'text-slate-200 font-medium group-hover:text-white'}`}>
                                {w.clue}
                              </p>
                              {w.isSolved && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[8px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Verified</span>
                                  <span className="text-[8px] text-slate-600 font-bold italic">{w.answer}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Crossword Grid */}
        <section className="lg:col-span-8 order-1 lg:order-2">
          {gameState.status === 'LOADING' ? (
            <div className="aspect-square w-full flex flex-col items-center justify-center bg-slate-900/30 rounded-[3rem] border-4 border-dashed border-slate-800/50">
               <div className="relative">
                 <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                 <Cpu className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
               </div>
               <p className="mt-8 text-slate-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Initialising Matrix...</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-4 md:p-8 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
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
                      key={`grid-${r}-${c}`}
                      className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-500 transform
                        ${cell.isBlack 
                          ? 'bg-slate-950/40 opacity-10' 
                          : 'bg-slate-800/80 border-b-4 border-slate-900 hover:scale-105 cursor-pointer shadow-inner active:scale-95'
                        }
                        ${cell.isSolved ? 'bg-blue-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] border-b-4 border-blue-800 scale-[1.05]' : ''}
                      `}
                      onClick={() => !cell.isBlack && handleCellClick(cell.wordIndices[0])}
                    >
                      {!cell.isBlack && (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                           {gameState.placedWords.some(w => w.row === r && w.col === c) && (
                             <span className="absolute top-1 left-1.5 text-[8px] font-black text-slate-500/50">
                               {gameState.placedWords.findIndex(w => w.row === r && w.col === c) + 1}
                             </span>
                           )}
                          <span className={`text-base md:text-2xl font-black mono transition-all duration-700 ${cell.isSolved ? 'text-white' : 'text-slate-600'}`}>
                            {cell.userInput || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Level Completion Screen */}
      {gameState.status === 'COMPLETED' && (
        <div className="fixed inset-0 z-[120] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center">
              <div className="relative inline-block group">
                <div className="absolute -inset-4 bg-blue-500 blur-3xl opacity-30 group-hover:opacity-50 animate-pulse transition duration-1000"></div>
                <Trophy className="w-32 h-32 text-yellow-400 mx-auto drop-shadow-2xl" />
              </div>
              <h2 className="text-5xl font-black italic tracking-tighter text-white mt-6">SECTOR CLEARED</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Uplink Level {progress.level} Finalized</p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-3xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">XP Bonus</p>
                  <p className="text-3xl font-black text-yellow-400">+{gameState.placedWords.length * 50}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">New Rank</p>
                  <p className="text-3xl font-black text-blue-400">LVL {progress.level + 1}</p>
                </div>
              </div>
              
              <Button size="lg" className="w-full py-6 text-xl rounded-2xl flex items-center justify-center gap-3" onClick={startNextLevel}>
                NEXT MISSION <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {gameState.currentWordIndex !== null && (
        <QuestionModal
          word={gameState.placedWords[gameState.currentWordIndex]}
          onSolve={handleSolve}
          onClose={() => setGameState(prev => ({ ...prev, currentWordIndex: null }))}
        />
      )}

      <footer className="w-full max-w-6xl p-8 flex flex-col md:flex-row justify-between items-center text-slate-600 gap-4 mt-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 hover:text-slate-400 cursor-pointer transition-colors">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Security Protocols</span>
          </div>
          <div className="flex items-center gap-2 hover:text-slate-400 cursor-pointer transition-colors">
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Kernel Logs</span>
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
          TechX Global Command & Control © 2025
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
