
import React, { useState } from 'react';
import { PlacedWord } from '../types';
import { Button } from './Button';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

interface QuestionModalProps {
  word: PlacedWord;
  onSolve: (answer: string) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ word, onSolve, onClose }) => {
  const [input, setInput] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toUpperCase() === word.answer) {
      onSolve(input.toUpperCase());
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
              {word.category} • {word.direction}
            </span>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <h2 className="text-xl font-bold mb-4 text-slate-100">{word.clue}</h2>
          
          <div className="mb-6 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`p-3 rounded-lg border transition-all ${hintsRevealed > i ? 'bg-slate-800 border-blue-500/30' : 'bg-slate-800/20 border-slate-800'}`}>
                {hintsRevealed > i ? (
                  <p className="text-sm text-blue-200">{word.hints[i]}</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 italic">Hint {i + 1} locked</span>
                    <button 
                      onClick={revealHint} 
                      disabled={hintsRevealed !== i}
                      className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-0"
                    >
                      Unlock (-5 XP)
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
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder={`Type the ${word.answer.length} letter answer...`}
                className={`w-full bg-slate-800 border-2 rounded-xl px-4 py-3 outline-none transition-all text-xl mono tracking-[0.2em] font-bold ${error ? 'border-red-500 animate-shake' : 'border-slate-700 focus:border-blue-500'}`}
              />
              {error && <p className="text-red-400 text-xs mt-1 font-semibold">Incorrect answer. Try again!</p>}
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 py-4 text-lg">
                <CheckCircle2 className="mr-2" /> Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
      `}</style>
    </div>
  );
};
