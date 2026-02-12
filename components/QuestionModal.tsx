
import React, { useState } from 'react';
import { PlacedWord } from '../types';
import { Button } from './Button';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface QuestionModalProps {
  word: PlacedWord;
  onSolve: (answer: string, hintsUsed: number) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ word, onSolve, onClose }) => {
  const [input, setInput] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase().trim() === word.answer.toUpperCase()) {
      onSolve(input.toUpperCase().trim(), hintsRevealed);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const revealHint = () => {
    if (hintsRevealed < word.hints.length) {
      setHintsRevealed(prev => prev + 1);
    }
  };

  const hintCosts = [15, 30, 45]; // XP Deductions

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {word.category} • {word.direction}
            </span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-xl font-bold mb-6 text-slate-100 leading-tight">{word.clue}</h2>
          
          <div className="mb-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`p-4 rounded-xl border transition-all duration-500 ${hintsRevealed > i ? 'bg-slate-800/80 border-blue-500/40' : 'bg-slate-900 border-slate-800 opacity-80'}`}>
                {hintsRevealed > i ? (
                  <p className="text-sm text-blue-200 font-medium italic">"{word.hints[i]}"</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Hint Level {i + 1}</span>
                    <button 
                      onClick={revealHint} 
                      disabled={hintsRevealed !== i}
                      className="text-xs text-yellow-500 hover:text-yellow-400 disabled:opacity-0 flex items-center gap-1 font-bold"
                    >
                      <AlertTriangle className="w-3 h-3" /> Reveal (-{hintCosts[i]} XP)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`ENTER ${word.answer.length} CHARS...`}
                className={`w-full bg-slate-800 border-2 rounded-2xl px-5 py-4 outline-none transition-all text-2xl mono tracking-[0.2em] text-center font-black ${error ? 'border-red-500 animate-shake' : 'border-slate-700 focus:border-blue-500 text-white'}`}
              />
              {error && <p className="text-red-400 text-center text-xs mt-2 font-black tracking-widest uppercase">System Error: Incorrect Key</p>}
            </div>
            
            <Button type="submit" className="w-full py-5 text-xl tracking-tighter italic">
              <CheckCircle2 className="mr-2 w-6 h-6" /> EXECUTE ANSWER
            </Button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.15s ease-in-out 3; }
      `}</style>
    </div>
  );
};
