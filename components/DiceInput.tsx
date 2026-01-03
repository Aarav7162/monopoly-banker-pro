import React, { useState } from 'react';

interface DiceInputProps {
  onSubmit: (die1: number, die2: number) => void;
  onCancel?: () => void;
  title?: string;
}

const DiceInput: React.FC<DiceInputProps> = ({ onSubmit, onCancel, title = "AWAITING INPUT" }) => {
  const [d1, setD1] = useState<number | null>(null);
  const [d2, setD2] = useState<number | null>(null);

  const handleSubmit = () => {
      if (d1 && d2) onSubmit(d1, d2);
  };

  const renderNumBtn = (num: number, selected: boolean, onClick: () => void) => (
      <button
        onClick={onClick}
        className={`w-12 h-12 border border-gray-600 font-mono text-xl font-bold transition-all
            ${selected 
                ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.5)]' 
                : 'bg-black text-gray-500 hover:text-white hover:border-white'
            }
        `}
      >
          {num}
      </button>
  );

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in p-8 cyber-card w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-neon-blue tracking-widest uppercase font-mono border-b border-gray-800 pb-2 w-full text-center">{title}</h2>
      
      <div className="flex gap-8 w-full justify-center">
          <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">DIE 1</span>
              <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(n => renderNumBtn(n, d1 === n, () => setD1(n)))}
              </div>
          </div>
          <div className="w-px bg-gray-800"></div>
          <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">DIE 2</span>
              <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map(n => renderNumBtn(n, d2 === n, () => setD2(n)))}
              </div>
          </div>
      </div>
      
      <div className="w-full pt-4 border-t border-gray-800">
         <button 
            onClick={handleSubmit}
            disabled={!d1 || !d2}
            className="w-full cyber-btn bg-neon-green text-black font-bold text-xl py-4 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-800"
         >
             CONFIRM ROLL {d1 && d2 ? `[${d1 + d2}]` : ''}
         </button>
         {onCancel && (
             <button onClick={onCancel} className="w-full mt-2 text-xs text-gray-500 hover:text-white">CANCEL</button>
         )}
      </div>
    </div>
  );
};

export default DiceInput;