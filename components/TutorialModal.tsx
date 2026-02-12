
import React from 'react';
import { Button } from './Button';
import { Terminal, Lightbulb, Trophy, Target } from 'lucide-react';

interface TutorialModalProps {
  onComplete: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-blue-500/30 rounded-3xl max-w-lg w-full p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -z-10"></div>
        
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Terminal className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter">MISSION DEBRIEF</h2>
          <p className="text-slate-400 text-sm mt-1">Welcome to TechX-Cross Command Center</p>
        </div>

        <div className="space-y-6 mb-8 text-left">
          <div className="flex gap-4">
            <div className="bg-slate-800 p-3 rounded-xl h-fit"><Target className="w-6 h-6 text-blue-400" /></div>
            <div>
              <h4 className="font-bold text-slate-100">Solve the Grid</h4>
              <p className="text-slate-400 text-sm">Click any white tile to view the technical clue. Complete words to clear the level.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-800 p-3 rounded-xl h-fit"><Lightbulb className="w-6 h-6 text-yellow-400" /></div>
            <div>
              <h4 className="font-bold text-slate-100">Hints Cost XP</h4>
              <p className="text-slate-400 text-sm">Stuck? Use hints, but beware: each level of hint reduces your final XP reward for that word.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-800 p-3 rounded-xl h-fit"><Trophy className="w-6 h-6 text-purple-400" /></div>
            <div>
              <h4 className="font-bold text-slate-100">Level Progression</h4>
              <p className="text-slate-400 text-sm">Clear a level to upgrade. Levels get harder, puzzles get larger, and topics more advanced.</p>
            </div>
          </div>
        </div>

        <Button onClick={onComplete} size="lg" className="w-full py-4 text-lg">
          BEGIN MISSION
        </Button>
      </div>
    </div>
  );
};
