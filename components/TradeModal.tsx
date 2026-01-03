import React, { useState } from 'react';
import { Player, BoardSpace, PropertyState, TradeOffer } from '../types';
import { BOARD_SPACES } from '../constants';

interface TradeModalProps {
  initiator: Player;
  players: Player[];
  properties: Record<number, PropertyState>;
  onPropose: (offer: TradeOffer) => void;
  onCancel: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ initiator, players, properties, onPropose, onCancel }) => {
    const [targetPlayerId, setTargetPlayerId] = useState<string>(players.find(p => p.id !== initiator.id)?.id || '');
    const [offeredCash, setOfferedCash] = useState(0);
    const [requestedCash, setRequestedCash] = useState(0);
    const [offeredProps, setOfferedProps] = useState<number[]>([]);
    const [requestedProps, setRequestedProps] = useState<number[]>([]);

    const targetPlayer = players.find(p => p.id === targetPlayerId);

    // Get properties owned by initiator
    const myProperties = BOARD_SPACES.filter(s => properties[s.id]?.ownerId === initiator.id);
    // Get properties owned by target
    const targetProperties = targetPlayer ? BOARD_SPACES.filter(s => properties[s.id]?.ownerId === targetPlayer.id) : [];

    const toggleOfferedProp = (id: number) => {
        setOfferedProps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleRequestedProp = (id: number) => {
        setRequestedProps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = () => {
        if(!targetPlayer) return;
        onPropose({
            fromPlayerId: initiator.id,
            toPlayerId: targetPlayer.id,
            offeredCash,
            offeredProperties: offeredProps,
            offeredJailCards: 0, // Lite version ignores jail cards for now
            requestedCash,
            requestedProperties: requestedProps,
            requestedJailCards: 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
             <div className="bg-slate-900 border border-monopoly-gold w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[90vh]">
                 
                 {/* Header */}
                 <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-slate-800">
                     <h2 className="text-2xl font-display font-bold text-white">TRADE PROPOSAL</h2>
                     <button onClick={onCancel} className="text-gray-400 hover:text-white">Close</button>
                 </div>

                 {/* Body */}
                 <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                     
                     {/* Left: You Offer */}
                     <div className="flex-1 p-6 border-r border-gray-700 overflow-y-auto bg-slate-900/50">
                         <h3 className="text-monopoly-gold font-bold mb-4 uppercase tracking-widest">You Offer ({initiator.name})</h3>
                         
                         <div className="mb-6">
                             <label className="text-xs text-gray-400">Cash: ${offeredCash}</label>
                             <input 
                                type="range" min="0" max={initiator.money} step="10" 
                                value={offeredCash} onChange={(e) => setOfferedCash(parseInt(e.target.value))}
                                className="w-full accent-monopoly-gold"
                             />
                         </div>

                         <div className="space-y-2">
                             {myProperties.map(p => (
                                 <div 
                                    key={p.id} 
                                    onClick={() => toggleOfferedProp(p.id)}
                                    className={`p-3 rounded border cursor-pointer flex justify-between ${offeredProps.includes(p.id) ? 'bg-green-900/40 border-green-500' : 'bg-slate-800 border-slate-700'}`}
                                 >
                                     <span>{p.name}</span>
                                     <span className="text-gray-400">${p.price}</span>
                                 </div>
                             ))}
                             {myProperties.length === 0 && <p className="text-gray-500 italic">No properties to trade.</p>}
                         </div>
                     </div>

                     {/* Right: You Get */}
                     <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest">You Get</h3>
                            <select 
                                value={targetPlayerId} 
                                onChange={(e) => setTargetPlayerId(e.target.value)}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none"
                            >
                                {players.filter(p => p.id !== initiator.id).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                         </div>

                         {targetPlayer && (
                             <>
                                <div className="mb-6">
                                    <label className="text-xs text-gray-400">Cash: ${requestedCash}</label>
                                    <input 
                                        type="range" min="0" max={targetPlayer.money} step="10" 
                                        value={requestedCash} onChange={(e) => setRequestedCash(parseInt(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    {targetProperties.map(p => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => toggleRequestedProp(p.id)}
                                            className={`p-3 rounded border cursor-pointer flex justify-between ${requestedProps.includes(p.id) ? 'bg-blue-900/40 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
                                        >
                                            <span>{p.name}</span>
                                            <span className="text-gray-400">${p.price}</span>
                                        </div>
                                    ))}
                                    {targetProperties.length === 0 && <p className="text-gray-500 italic">No properties available.</p>}
                                </div>
                             </>
                         )}
                     </div>
                 </div>

                 {/* Footer */}
                 <div className="p-6 border-t border-gray-700 bg-slate-800 flex justify-end gap-4">
                     <button onClick={onCancel} className="px-6 py-3 rounded-lg hover:bg-white/10">Cancel</button>
                     <button 
                        onClick={handleSubmit}
                        className="bg-monopoly-gold text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 shadow-lg"
                     >
                         PROPOSE TRADE
                     </button>
                 </div>
             </div>
        </div>
    );
}

export default TradeModal;