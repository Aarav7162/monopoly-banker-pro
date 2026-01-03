import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { GameState, Player, PropertyState, GamePhase, LogEntry, SpaceType, GameRules, TradeOffer, NetworkMessage } from './types';
import { BOARD_SPACES, PLAYER_COLORS } from './constants';
import { calculateRent } from './services/gameLogic';
import PlayerCard from './components/PlayerCard';
import DiceInput from './components/DiceInput';
import ActionScreen from './components/ActionScreen';
import AuctionModal from './components/AuctionModal';
import TradeModal from './components/TradeModal';

const DEFAULT_RULES: GameRules = {
    startingCash: 1500,
    goSalary: 200,
    parkingBonus: 0,
    houseBuilding: 'even',
    mortgageInterest: 0.1,
    auctionEnabled: true
};

const INITIAL_STATE: GameState = {
    roomCode: '',
    rules: DEFAULT_RULES,
    players: [],
    currentPlayerIndex: 0,
    properties: {},
    phase: 'SETUP',
    dice: [0, 0],
    lastRollWasDouble: false,
    consecutiveDoubles: 0,
    auction: null,
    activeTrade: null,
    logs: [],
    viewMode: 'BOARD',
    localPlayerId: null
};

// PeerJS ID Prefix to avoid collisions on public server
const APP_ID_PREFIX = 'monopoly-banker-pro-v2-';

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Network Refs
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  const hostConnectionRef = useRef<DataConnection | null>(null);
  
  // Important: We need a ref to access the latest state inside PeerJS event callbacks
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Auto-scroll logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.logs]);

  // --- NETWORK HELPERS ---

  const broadcastState = (newState: GameState) => {
      // Send to all connected clients
      connectionsRef.current.forEach(conn => {
          if (conn.open) {
              conn.send({ type: 'SYNC', state: newState } as NetworkMessage);
          }
      });
  };

  const sendAction = (action: NetworkMessage) => {
      if (isHost) {
          // If I am host, process directly
          handleNetworkMessage(action);
      } else {
          // Send to host
          hostConnectionRef.current?.send(action);
      }
  };

  // --- STATE UPDATERS (Host Only) ---
  
  const updateGameState = (updater: (prev: GameState) => GameState) => {
      setGameState(prev => {
          const newState = updater(prev);
          if (isHost) {
              broadcastState(newState);
          }
          return newState;
      });
  };

  const addLog = (msg: string, type: LogEntry['type'] = 'INFO') => {
      const newLog: LogEntry = { id: Math.random().toString(), timestamp: Date.now(), message: msg, type };
      updateGameState(prev => ({
          ...prev,
          logs: [...prev.logs, newLog]
      }));
  };

  // --- HOSTING & JOINING ---

  const setupHost = () => {
      if (!localPlayerName) return;
      setIsConnecting(true);
      setConnectionError('');
      
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const peerId = `${APP_ID_PREFIX}${code}`;
      
      const peer = new Peer(peerId);
      
      peer.on('open', (id) => {
          const myId = Math.random().toString(36).substr(2, 9);
          const newPlayer: Player = {
            id: myId,
            name: localPlayerName,
            color: PLAYER_COLORS[0],
            money: DEFAULT_RULES.startingCash,
            position: 0,
            isInJail: false,
            jailTurns: 0,
            getOutOfJailFreeCards: 0
          };

          const newState: GameState = {
              ...INITIAL_STATE,
              roomCode: code,
              phase: 'LOBBY',
              localPlayerId: myId,
              players: [newPlayer]
          };
          
          setGameState(newState);
          setIsHost(true);
          setIsConnecting(false);
          peerRef.current = peer;
      });

      peer.on('connection', (conn) => {
          connectionsRef.current.push(conn);
          conn.on('open', () => {
              // Send current state to new player
              conn.send({ type: 'SYNC', state: gameStateRef.current } as NetworkMessage);
          });
          conn.on('data', (data) => {
              handleNetworkMessage(data as NetworkMessage);
          });
          conn.on('close', () => {
              // Handle disconnect if needed
              connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          });
      });

      peer.on('error', (err) => {
          console.error(err);
          setConnectionError('Could not start room (ID might be taken). Try again.');
          setIsConnecting(false);
      });
  };

  const joinGame = () => {
      if (!localPlayerName || !joinRoomCode) return;
      setIsConnecting(true);
      setConnectionError('');

      const peer = new Peer(); // Random Client ID
      
      peer.on('open', () => {
          const hostId = `${APP_ID_PREFIX}${joinRoomCode.toUpperCase()}`;
          const conn = peer.connect(hostId);
          
          conn.on('open', () => {
              setIsHost(false);
              setIsConnecting(false);
              hostConnectionRef.current = conn;
              
              // Send JOIN request
              const myId = Math.random().toString(36).substr(2, 9);
              // Store my ID locally first so we know who we are when state arrives
              setGameState(prev => ({ ...prev, localPlayerId: myId }));

              const newPlayer: Player = {
                id: myId,
                name: localPlayerName,
                color: PLAYER_COLORS[0], // Host will reassign color
                money: DEFAULT_RULES.startingCash,
                position: 0,
                isInJail: false,
                jailTurns: 0,
                getOutOfJailFreeCards: 0
              };

              conn.send({ type: 'PLAYER_JOIN', player: newPlayer } as NetworkMessage);
          });

          conn.on('data', (data) => {
              const msg = data as NetworkMessage;
              if (msg.type === 'SYNC') {
                  setGameState(prev => ({
                      ...msg.state,
                      // Preserve my local ID if the server state doesn't have it (shouldn't happen but safe)
                      localPlayerId: prev.localPlayerId || msg.state.localPlayerId
                  }));
              }
          });

          conn.on('error', (err) => {
              console.error(err);
              setConnectionError('Connection failed.');
              setIsConnecting(false);
          });
          
          peerRef.current = peer;
      });

      peer.on('error', (err) => {
          console.error(err);
          setConnectionError('Could not connect to Peer server.');
          setIsConnecting(false);
      });
  };

  // --- MESSAGE HANDLER (HOST SIDE) ---
  
  const handleNetworkMessage = (msg: NetworkMessage) => {
      // This runs on Host
      switch (msg.type) {
          case 'PLAYER_JOIN': {
              const p = msg.player;
              const currentPlayers = gameStateRef.current.players;
              // Avoid duplicates
              if (currentPlayers.find(existing => existing.name === p.name)) return;
              
              // Assign Color
              const usedColors = currentPlayers.map(cp => cp.color);
              const nextColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[0];
              p.color = nextColor;

              updateGameState(prev => ({
                  ...prev,
                  players: [...prev.players, p]
              }));
              addLog(`${p.name} joined the session via Quantum Link.`);
              break;
          }
          case 'START_GAME': {
              updateGameState(prev => ({ ...prev, phase: 'ROLL' }));
              addLog("SYSTEM: Game Sequence Initiated", 'ALERT');
              break;
          }
          case 'ACTION_ROLL': {
              _executeDiceRoll(msg.d1, msg.d2);
              break;
          }
          case 'ACTION_BUY': {
              _executeBuyProperty();
              break;
          }
          case 'ACTION_AUCTION_START': {
              const player = gameStateRef.current.players[gameStateRef.current.currentPlayerIndex];
              const space = BOARD_SPACES[player.position];
              updateGameState(prev => ({
                  ...prev,
                  phase: 'AUCTION',
                  auction: { active: true, propertyId: space.id }
              }));
              break;
          }
          case 'ACTION_AUCTION_RESOLVE': {
              _executeAuctionResolve(msg.amount, msg.winnerId);
              break;
          }
          case 'ACTION_PAY_RENT': {
              _executePayRent();
              break;
          }
          case 'ACTION_END_TURN': {
              _executeEndTurn();
              break;
          }
          case 'ACTION_TRADE': {
              _executeProposeTrade(msg.offer);
              break;
          }
      }
  };


  // --- GAME LOGIC EXECUTORS (Host Only) ---
  // These are the "Reducers" that actually change state

  const _executeDiceRoll = (d1: number, d2: number) => {
    const currentState = gameStateRef.current;
    const isDouble = d1 === d2;
    const total = d1 + d2;
    const currentPlayer = currentState.players[currentState.currentPlayerIndex];
    let consecutiveDoubles = isDouble ? currentState.consecutiveDoubles + 1 : 0;
    
    // Jail Logic
    if (currentPlayer.isInJail) {
        if (isDouble) {
            addLog(`${currentPlayer.name} rolled doubles [${d1}-${d2}] -> Escaped Jail`, 'ALERT');
            _executeMovePlayer(currentPlayer.id, total, true, 0, d1, d2); 
            return;
        } else {
            addLog(`${currentPlayer.name} rolled [${d1}-${d2}] -> Jail Sentence Continues`, 'INFO');
             updateGameState(prev => {
                const updatedPlayers = [...prev.players];
                const p = updatedPlayers[prev.currentPlayerIndex];
                p.jailTurns += 1;
                return {
                    ...prev,
                    dice: [d1, d2],
                    phase: 'ROLL',
                    consecutiveDoubles: 0,
                    lastRollWasDouble: false
                };
            });
            _executeNextTurn(); 
            return;
        }
    }

    if (consecutiveDoubles === 3) {
      addLog(`SPEEDING DETECTED: ${currentPlayer.name} -> JAIL`, 'ALERT');
      _executeSendToJail(currentPlayer.id);
      return;
    }

    _executeMovePlayer(currentPlayer.id, total, false, consecutiveDoubles, d1, d2);
  };

  const _executeMovePlayer = (playerId: string, steps: number, justEscapedJail: boolean, doublesCount: number, d1: number, d2: number) => {
     updateGameState(prev => {
         const playerIndex = prev.players.findIndex(p => p.id === playerId);
         const updatedPlayers = [...prev.players];
         const p = updatedPlayers[playerIndex];
         
         let newPos = (p.position + steps) % 40;
         const passedGo = newPos < p.position && !justEscapedJail;
         
         if (passedGo) {
             p.money += prev.rules.goSalary;
         }
         
         p.position = newPos;
         p.isInJail = false; 
         p.jailTurns = 0;

         return {
             ...prev,
             players: updatedPlayers,
             dice: [d1, d2],
             phase: 'ACTION',
             lastRollWasDouble: d1 === d2,
             consecutiveDoubles: doublesCount,
             logs: passedGo 
                ? [...prev.logs, {id: Math.random().toString(), timestamp: Date.now(), message: `GO PASSED: ${p.name} credited $${prev.rules.goSalary}`, type:'TRANSACTION'}]
                : prev.logs
         };
     });
  };

  const _executeSendToJail = (playerId: string) => {
      updateGameState(prev => {
          const updatedPlayers = [...prev.players];
          const p = updatedPlayers.find(pl => pl.id === playerId)!;
          p.position = 10;
          p.isInJail = true;
          return {
              ...prev,
              players: updatedPlayers,
              phase: 'ROLL',
              lastRollWasDouble: false,
              consecutiveDoubles: 0
          };
      });
      _executeNextTurn();
  };

  const _executeNextTurn = () => {
    updateGameState(prev => {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        const stay = prev.lastRollWasDouble && !currentPlayer.isInJail;
        
        let nextIndex = prev.currentPlayerIndex;
        if (!stay) {
            nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        }

        return {
            ...prev,
            currentPlayerIndex: nextIndex,
            phase: 'ROLL',
        };
    });
  };

  const _executeBuyProperty = () => {
    const currentState = gameStateRef.current;
    const player = currentState.players[currentState.currentPlayerIndex];
    const space = BOARD_SPACES[player.position];
    
    updateGameState(prev => {
        const updatedPlayers = [...prev.players];
        const p = updatedPlayers[prev.currentPlayerIndex];
        p.money -= space.price;
        
        const updatedProps = { ...prev.properties };
        updatedProps[space.id] = { ownerId: p.id, houses: 0, isMortgaged: false };

        return {
            ...prev,
            players: updatedPlayers,
            properties: updatedProps,
            logs: [...prev.logs, { id: Math.random().toString(), timestamp: Date.now(), message: `ACQUIRED: ${p.name} bought ${space.name}`, type: 'TRANSACTION' }]
        };
    });
    _executeEndTurn();
  };

  const _executeAuctionResolve = (amount: number, winnerId: string) => {
      updateGameState(prev => {
          if(!prev.auction) return prev;
          const spaceId = prev.auction.propertyId;
          const spaceName = BOARD_SPACES[spaceId].name;
          const updatedPlayers = [...prev.players];
          const winner = updatedPlayers.find(p => p.id === winnerId)!;
          winner.money -= amount;

          const updatedProps = { ...prev.properties };
          updatedProps[spaceId] = { ownerId: winnerId, houses: 0, isMortgaged: false };

          return {
              ...prev,
              players: updatedPlayers,
              properties: updatedProps,
              phase: prev.dice ? 'ACTION' : 'ROLL', 
              auction: null,
              logs: [...prev.logs, { id: Math.random().toString(), timestamp: Date.now(), message: `AUCTION CLOSED: ${winner.name} won ${spaceName} for $${amount}`, type: 'TRANSACTION' }]
          }
      });
      _executeEndTurn();
  };

  const _executePayRent = () => {
    const currentState = gameStateRef.current;
    const player = currentState.players[currentState.currentPlayerIndex];
    const space = BOARD_SPACES[player.position];
    const property = currentState.properties[space.id];
    
    let rent = 0;
    if (space.type === SpaceType.TAX) {
        rent = space.id === 4 ? 200 : 100;
         updateGameState(prev => {
            const updatedPlayers = [...prev.players];
            const p = updatedPlayers[prev.currentPlayerIndex];
            p.money -= rent;
            return {
                ...prev,
                players: updatedPlayers,
                logs: [...prev.logs, { id: Math.random().toString(), timestamp: Date.now(), message: `TAX PAID: ${p.name} - $${rent}`, type: 'TRANSACTION' }]
            };
        });
    } else {
        rent = calculateRent(space, property.ownerId!, currentState.properties, currentState.dice[0] + currentState.dice[1], currentState.rules);
        const ownerIndex = currentState.players.findIndex(p => p.id === property.ownerId);
        
        updateGameState(prev => {
            const updatedPlayers = [...prev.players];
            const sender = updatedPlayers[prev.currentPlayerIndex];
            const receiver = updatedPlayers[ownerIndex];
            
            sender.money -= rent;
            receiver.money += rent;

            return {
                ...prev,
                players: updatedPlayers,
                logs: [...prev.logs, { id: Math.random().toString(), timestamp: Date.now(), message: `RENT: ${sender.name} -> ${receiver.name} [$${rent}]`, type: 'TRANSACTION' }]
            };
        });
    }
    _executeEndTurn();
  };

  const _executeEndTurn = () => {
      const currentState = gameStateRef.current;
      const currentPlayer = currentState.players[currentState.currentPlayerIndex];
      const rolledDoubles = currentState.lastRollWasDouble;
      
      if (rolledDoubles && !currentPlayer.isInJail) {
           addLog("SYSTEM: Doubles detected. Bonus Roll granted.", 'INFO');
           updateGameState(prev => ({ ...prev, phase: 'ROLL' }));
      } else {
           _executeNextTurn();
      }
  };

  const _executeProposeTrade = (offer: TradeOffer) => {
      updateGameState(prev => {
          const updatedPlayers = [...prev.players];
          const sender = updatedPlayers.find(p => p.id === offer.fromPlayerId)!;
          const receiver = updatedPlayers.find(p => p.id === offer.toPlayerId)!;
          const updatedProps = { ...prev.properties };

          sender.money -= offer.offeredCash;
          receiver.money += offer.offeredCash;
          sender.money += offer.requestedCash;
          receiver.money -= offer.requestedCash;

          offer.offeredProperties.forEach(id => {
              if(updatedProps[id]) updatedProps[id].ownerId = receiver.id;
          });
          
          offer.requestedProperties.forEach(id => {
            if(updatedProps[id]) updatedProps[id].ownerId = sender.id;
          });

          return {
              ...prev,
              players: updatedPlayers,
              properties: updatedProps,
              phase: prev.phase,
              logs: [...prev.logs, { id: Math.random().toString(), timestamp: Date.now(), message: `TRADE EXECUTED: ${sender.name} <-> ${receiver.name}`, type: 'TRANSACTION' }]
          }
      });
  };

  // --- UI HANDLERS (Triggers Network Action) ---

  const handleStartGame = () => {
      sendAction({ type: 'START_GAME' });
  }

  const handleDiceSubmit = (d1: number, d2: number) => {
      sendAction({ type: 'ACTION_ROLL', d1, d2 });
  };

  const handleBuyProperty = () => {
      sendAction({ type: 'ACTION_BUY' });
  };

  const handleAuctionStart = () => {
      sendAction({ type: 'ACTION_AUCTION_START' });
  };

  const handleManualAuctionResolve = (amount: number, winnerId: string) => {
      sendAction({ type: 'ACTION_AUCTION_RESOLVE', amount, winnerId });
  };

  const handlePayRent = () => {
      sendAction({ type: 'ACTION_PAY_RENT' });
  };

  const handleActionComplete = () => {
      sendAction({ type: 'ACTION_END_TURN' });
  };

  const handleProposeTrade = (offer: TradeOffer) => {
      sendAction({ type: 'ACTION_TRADE', offer });
      setGameState(prev => ({ ...prev, activeTrade: null }));
  };


  // --- VIEWS ---

  // 1. LOGIN SCREEN
  if (gameState.phase === 'SETUP') {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="cyber-card p-10 max-w-md w-full rounded-sm relative">
                  <h1 className="text-4xl font-sans font-bold text-center text-neon-blue mb-8 tracking-widest neon-text">BANKER PRO</h1>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-neon-blue text-xs font-mono mb-1">IDENTIFIER</label>
                          <input 
                            type="text"
                            value={localPlayerName}
                            onChange={(e) => setLocalPlayerName(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white p-3 focus:border-neon-blue outline-none font-mono"
                            placeholder="ENTER NAME"
                          />
                      </div>
                      
                      {connectionError && (
                          <div className="text-red-500 text-xs font-mono">{connectionError}</div>
                      )}

                      <div className="pt-4 border-t border-gray-800">
                           <button 
                            onClick={setupHost}
                            disabled={!localPlayerName || isConnecting}
                            className="w-full cyber-btn bg-neon-blue text-black font-bold py-4 mb-4 disabled:opacity-50"
                           >
                               {isConnecting ? 'ESTABLISHING UPLINK...' : 'HOST NEW SESSION'}
                           </button>
                           
                           <div className="flex gap-2">
                               <input 
                                type="text"
                                value={joinRoomCode}
                                onChange={(e) => setJoinRoomCode(e.target.value)}
                                className="flex-1 bg-black border border-gray-700 text-white p-3 font-mono text-center uppercase"
                                placeholder="ROOM CODE"
                               />
                               <button 
                                onClick={joinGame}
                                disabled={!localPlayerName || !joinRoomCode || isConnecting}
                                className="cyber-btn bg-gray-800 text-neon-blue border border-neon-blue px-6 disabled:opacity-50"
                               >
                                   JOIN
                               </button>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // 2. LOBBY
  if (gameState.phase === 'LOBBY') {
      return (
          <div className="min-h-screen flex items-center justify-center p-4">
              <div className="w-full max-w-2xl cyber-card p-8">
                  <div className="text-center mb-8">
                      <h2 className="text-gray-400 font-mono text-sm">SECURE CONNECTION ESTABLISHED</h2>
                      <div className="text-6xl font-mono font-bold text-white mt-2 tracking-[0.2em] text-neon-blue">{gameState.roomCode}</div>
                      <p className="text-neon-pink text-xs mt-2 animate-pulse">WAITING FOR PLAYERS...</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {gameState.players.map(p => (
                          <div key={p.id} className="border border-gray-700 p-4 flex items-center gap-4 bg-black/40">
                              <div className="w-8 h-8 rounded-sm shadow-[0_0_10px_currentColor]" style={{backgroundColor: p.color, color: p.color}}></div>
                              <div className="font-mono text-xl">{p.name}</div>
                              {p.id === gameState.localPlayerId && <div className="text-xs bg-gray-800 px-2 py-1 ml-auto">YOU</div>}
                          </div>
                      ))}
                  </div>

                  {isHost ? (
                      <button 
                        onClick={handleStartGame}
                        disabled={gameState.players.length < 2}
                        className="w-full cyber-btn bg-neon-green text-black font-bold py-4 text-xl disabled:bg-gray-800 disabled:text-gray-500"
                      >
                          INITIALIZE GAME SEQUENCE
                      </button>
                  ) : (
                      <div className="text-center text-gray-500 font-mono">
                          WAITING FOR HOST TO START...
                      </div>
                  )}
              </div>
          </div>
      )
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer.id === gameState.localPlayerId;
  const me = gameState.players.find(p => p.id === gameState.localPlayerId);

  // 3. MAIN GAME
  return (
      <div className="min-h-screen flex flex-col md:flex-row">
          {/* SIDEBAR: Players & Log */}
          <div className="w-full md:w-80 bg-black/90 border-r border-gray-800 flex flex-col h-1/3 md:h-screen z-20">
              <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                  <h1 className="text-xl font-bold text-neon-blue font-sans tracking-wider">BANKER PRO <span className="text-xs text-gray-500 ml-2">V2.0</span></h1>
                  {me && (
                    <div className="mt-2 text-xs font-mono text-gray-400 flex justify-between">
                        <span>USER: {me.name}</span>
                        <span className="text-neon-gold">${me.money}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-600 mt-1">ROOM: {gameState.roomCode}</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {gameState.players.map((p, idx) => (
                      <PlayerCard 
                        key={p.id} 
                        player={p} 
                        isActive={idx === gameState.currentPlayerIndex}
                      />
                  ))}
              </div>

              {/* LOGS */}
              <div className="h-48 bg-black border-t border-gray-800 flex flex-col">
                  <div className="bg-gray-900 px-2 py-1 text-[10px] font-mono text-neon-blue uppercase">System Log</div>
                  <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                      {gameState.logs.map(log => (
                          <div key={log.id} className={`${log.type === 'ALERT' ? 'text-neon-pink' : log.type === 'TRANSACTION' ? 'text-neon-green' : 'text-gray-500'}`}>
                              <span className="opacity-30 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit'})}]</span>
                              {log.message}
                          </div>
                      ))}
                      <div ref={messagesEndRef} />
                  </div>
              </div>
          </div>

          {/* MAIN AREA */}
          <div className="flex-1 relative flex flex-col">
              <div className="grid-bg"></div>
              
              {/* TOP BAR */}
              <div className="p-6 flex justify-between items-end border-b border-gray-800 backdrop-blur-sm z-10">
                  <div>
                      <div className="text-xs text-neon-blue font-mono mb-1">ACTIVE AGENT</div>
                      <div className="text-4xl font-bold text-white uppercase" style={{textShadow: `0 0 20px ${currentPlayer.color}`}}>
                          {currentPlayer.name}
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-xs text-gray-500 font-mono mb-1">COORDINATES</div>
                      <div className="text-2xl font-mono text-white">{BOARD_SPACES[currentPlayer.position].name}</div>
                  </div>
              </div>

              {/* ACTION CENTER */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                  
                  {/* TURN INDICATOR FOR NON-ACTIVE PLAYERS */}
                  {!isMyTurn && gameState.phase !== 'AUCTION' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 animate-fade-in">
                          <div className="text-center">
                              <div className="text-6xl font-bold text-gray-700 animate-pulse">{currentPlayer.name}</div>
                              <div className="text-neon-blue font-mono mt-2">IS TAKING ACTION...</div>
                          </div>
                      </div>
                  )}

                  {/* GAME CONTROLS */}
                  <div className="w-full max-w-2xl relative z-40">
                      {gameState.phase === 'ROLL' && (
                          <div className="text-center">
                              {currentPlayer.isInJail ? (
                                  <div className="cyber-card p-8 border-neon-pink">
                                      <h2 className="text-3xl text-neon-pink mb-4 font-bold">DETENTION BLOCK</h2>
                                      {isMyTurn && (
                                          <div className="flex flex-col gap-4">
                                              <button 
                                                onClick={() => handleManualAuctionResolve(50, currentPlayer.id)} // Reuse logic for payment
                                                disabled={currentPlayer.money < 50}
                                                className="cyber-btn bg-neon-pink text-black py-3 disabled:opacity-50"
                                              >
                                                  PAY BAIL ($50)
                                              </button>
                                              <DiceInput title="ATTEMPT ESCAPE ROLL" onSubmit={handleDiceSubmit} />
                                          </div>
                                      )}
                                  </div>
                              ) : (
                                  <DiceInput 
                                    onSubmit={handleDiceSubmit} 
                                    title={isMyTurn ? "INITIATE ROLL" : `${currentPlayer.name} ROLLING...`} 
                                  />
                              )}
                          </div>
                      )}

                      {gameState.phase === 'ACTION' && !gameState.auction && (
                          <ActionScreen 
                              space={BOARD_SPACES[currentPlayer.position]}
                              currentPlayer={currentPlayer}
                              owner={gameState.players.find(p => p.id === gameState.properties[BOARD_SPACES[currentPlayer.position].id]?.ownerId)}
                              rentAmount={calculateRent(BOARD_SPACES[currentPlayer.position], gameState.properties[BOARD_SPACES[currentPlayer.position].id]?.ownerId || '', gameState.properties, gameState.dice[0] + gameState.dice[1], gameState.rules)}
                              onBuy={handleBuyProperty}
                              onAuction={handleAuctionStart}
                              onPayRent={handlePayRent}
                              onEndTurn={handleActionComplete}
                              canAfford={true} 
                              diceTotal={gameState.dice[0] + gameState.dice[1]}
                          />
                      )}

                      {/* AUCTION IS GLOBAL - EVERYONE SEES IT */}
                      {gameState.phase === 'AUCTION' && gameState.auction && (
                          <AuctionModal 
                              property={BOARD_SPACES[gameState.auction.propertyId]}
                              players={gameState.players}
                              onFinalize={handleManualAuctionResolve}
                              onCancel={() => handleActionComplete()} // Use handleActionComplete as cancel might end turn or return to action? 
                              // Actually if canceled we should probably go back to action screen, but for simplicity in this V2 let's assume auction must resolve or we skip.
                              // Let's make onCancel just close modal locally? No, sync state.
                              // Simplified: Cancel just ends turn for now or does nothing? 
                              // Let's re-use handleActionComplete which triggers END_TURN for simplicity of the prompt constraint "keep updates minimal".
                          />
                      )}
                  </div>
              </div>

              {/* BOTTOM TRAY (Local Player Actions) */}
              <div className="h-20 border-t border-gray-800 bg-black/80 flex items-center px-6 gap-4 z-50">
                   <div className="text-xs font-mono text-gray-500 mr-auto">
                       SESSION: {gameState.roomCode} | ID: {gameState.localPlayerId?.substring(0,4)}
                   </div>
                   <button 
                    onClick={() => setGameState(prev => ({...prev, activeTrade: { fromPlayerId: gameState.localPlayerId!, toPlayerId: '', offeredCash: 0, offeredProperties: [], requestedCash: 0, requestedProperties: [], offeredJailCards: 0, requestedJailCards: 0 } as any}))}
                    className="cyber-btn border border-neon-gold text-neon-gold px-6 py-2 text-sm hover:bg-neon-gold hover:text-black"
                   >
                       TRADE
                   </button>
              </div>
          </div>
          
          {gameState.activeTrade && (
            <TradeModal 
                initiator={gameState.players.find(p => p.id === gameState.activeTrade!.fromPlayerId)!}
                players={gameState.players}
                properties={gameState.properties}
                onPropose={handleProposeTrade}
                onCancel={() => setGameState(prev => ({...prev, activeTrade: null}))}
            />
        )}
      </div>
  );
};

export default App;