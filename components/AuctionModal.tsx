import React, { useState } from 'react';
import { Player, BoardSpace } from '../types';

interface AuctionModalProps {
  property: BoardSpace;
  players: Player[];
  onFinalize: (amount: number, winnerId: string) => void;
  onCancel: () => void;
}

const AuctionModal: React.FC<AuctionModalProps> = ({ 
    property, players, onFinalize, onCancel 
}) => {
    const [winningBid, setWinningBid] = useState<number>(property.price / 2); // Start suggestion at half price
    const [selectedWinnerId, setSelectedWinnerId] = useState<string>(players[0]?.id || '');

    const handleConfirm = () => {
        if (selectedWinnerId && winningBid > 0) {
            onFinalize(winningBid, selectedWinnerId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-monopoly-gold w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 text-center border-b border-white/10">
                    <h2 className="text-3xl font-display font-bold text-white tracking-wider">AUCTION BLOCK</h2>
                    <p className="text-purple-200 text-sm mt-1">Conduct the auction offline, then record results.</p>
                </div>

                <div className="p-8 flex flex-col gap-6">
                    {/* Property Info */}
                    <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">Item For Sale</div>
                        <div className="text-2xl font-bold text-white">{property.name}</div>
                        <div className="text-sm text-gray-500">List Price: ${property.price}</div>
                    </div>

                    {/* Winner Selection */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Winning Player</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {players.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedWinnerId(p.id)}
                                    className={`flex items-center gap-2 p-3 rounded-lg border transition ${selectedWinnerId === p.id ? 'bg-monopoly-gold text-black border-monopoly-gold' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                                >
                                    <div className="w-4 h-4 rounded-full border border-black/20" style={{backgroundColor: p.color}}></div>
                                    <span className="font-bold text-sm truncate">{p.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Final Sold Price ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input 
                                type="number" 
                                value={winningBid}
                                onChange={(e) => setWinningBid(parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-white focus:border-monopoly-gold outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4">
                     <button 
                        onClick={onCancel}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold py-4 rounded-xl transition"
                     >
                        CANCEL
                     </button>
                     <button 
                        onClick={handleConfirm}
                        disabled={!selectedWinnerId || winningBid <= 0}
                        className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95"
                     >
                        CONFIRM SALE
                     </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionModal;