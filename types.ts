export enum PropertyGroup {
  BROWN = 'BROWN',
  LIGHT_BLUE = 'LIGHT_BLUE',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  DARK_BLUE = 'DARK_BLUE',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
  SPECIAL = 'SPECIAL',
}

export enum SpaceType {
  PROPERTY = 'PROPERTY',
  RAILROAD = 'RAILROAD',
  UTILITY = 'UTILITY',
  GO = 'GO',
  JAIL = 'JAIL',
  GO_TO_JAIL = 'GO_TO_JAIL',
  FREE_PARKING = 'FREE_PARKING',
  TAX = 'TAX',
  CHANCE = 'CHANCE',
  COMMUNITY_CHEST = 'COMMUNITY_CHEST',
}

export interface BoardSpace {
  id: number;
  name: string;
  type: SpaceType;
  group: PropertyGroup;
  price: number;
  baseRent: number;
  rentHouse1?: number;
  rentHouse2?: number;
  rentHouse3?: number;
  rentHouse4?: number;
  rentHotel?: number;
  houseCost?: number;
  mortgageValue?: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  money: number;
  position: number;
  isInJail: boolean;
  jailTurns: number;
  getOutOfJailFreeCards: number;
}

export interface PropertyState {
  ownerId: string | null;
  houses: number;
  isMortgaged: boolean;
}

export interface GameRules {
  startingCash: number;
  goSalary: number;
  parkingBonus: number; // 0 for off
  houseBuilding: 'even' | 'any'; // 'even' enforces n-1 rule
  mortgageInterest: number; // usually 10% on unmortgage (not fully implemented in this lite version but good for config)
  auctionEnabled: boolean;
}

export interface AuctionState {
  active: boolean;
  propertyId: number;
}

export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  offeredCash: number;
  offeredProperties: number[]; // Space IDs
  offeredJailCards: number;
  requestedCash: number;
  requestedProperties: number[];
  requestedJailCards: number;
}

export type GamePhase = 
  | 'SETUP' 
  | 'LOBBY'
  | 'ROLL' 
  | 'MOVING' 
  | 'ACTION' 
  | 'AUCTION'
  | 'TRADE_PROPOSAL'
  | 'MANAGE_PROPERTIES';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'TRANSACTION' | 'ALERT' | 'MOVE';
}

export interface GameState {
  roomCode: string;
  rules: GameRules;
  players: Player[];
  currentPlayerIndex: number;
  properties: Record<number, PropertyState>;
  phase: GamePhase;
  dice: [number, number];
  lastRollWasDouble: boolean;
  consecutiveDoubles: number;
  auction: AuctionState | null;
  activeTrade: TradeOffer | null;
  logs: LogEntry[];
  viewMode: 'BOARD' | 'PLAYER_WALLET'; // For simulating mobile view
  localPlayerId: string | null; // For simulating "my phone"
}

// Network Types
export type NetworkMessage = 
 | { type: 'SYNC', state: GameState }
 | { type: 'PLAYER_JOIN', player: Player }
 | { type: 'ACTION_ROLL', d1: number, d2: number }
 | { type: 'ACTION_BUY' }
 | { type: 'ACTION_AUCTION_START' }
 | { type: 'ACTION_AUCTION_RESOLVE', amount: number, winnerId: string }
 | { type: 'ACTION_PAY_RENT' }
 | { type: 'ACTION_END_TURN' }
 | { type: 'ACTION_TRADE', offer: TradeOffer }
 | { type: 'START_GAME' };
