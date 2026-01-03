import { BoardSpace, SpaceType, PropertyGroup } from './types';

export const BOARD_SPACES: BoardSpace[] = [
  { id: 0, name: "GO", type: SpaceType.GO, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 1, name: "Old Kent Road", type: SpaceType.PROPERTY, group: PropertyGroup.BROWN, price: 60, baseRent: 2, rentHouse1: 10, rentHouse2: 30, rentHouse3: 90, rentHouse4: 160, rentHotel: 250, houseCost: 50 },
  { id: 2, name: "Community Chest", type: SpaceType.COMMUNITY_CHEST, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 3, name: "Whitechapel Road", type: SpaceType.PROPERTY, group: PropertyGroup.BROWN, price: 60, baseRent: 4, rentHouse1: 20, rentHouse2: 60, rentHouse3: 180, rentHouse4: 320, rentHotel: 450, houseCost: 50 },
  { id: 4, name: "Income Tax", type: SpaceType.TAX, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 }, // Handled by logic
  { id: 5, name: "Kings Cross Station", type: SpaceType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, baseRent: 25 },
  { id: 6, name: "The Angles Islington", type: SpaceType.PROPERTY, group: PropertyGroup.LIGHT_BLUE, price: 100, baseRent: 6, rentHouse1: 30, rentHouse2: 90, rentHouse3: 270, rentHouse4: 400, rentHotel: 550, houseCost: 50 },
  { id: 7, name: "Chance", type: SpaceType.CHANCE, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 8, name: "Euston Road", type: SpaceType.PROPERTY, group: PropertyGroup.LIGHT_BLUE, price: 100, baseRent: 6, rentHouse1: 30, rentHouse2: 90, rentHouse3: 270, rentHouse4: 400, rentHotel: 550, houseCost: 50 },
  { id: 9, name: "Pentonville Road", type: SpaceType.PROPERTY, group: PropertyGroup.LIGHT_BLUE, price: 120, baseRent: 8, rentHouse1: 40, rentHouse2: 100, rentHouse3: 300, rentHouse4: 450, rentHotel: 600, houseCost: 50 },
  { id: 10, name: "Jail / Just Visiting", type: SpaceType.JAIL, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 11, name: "St. Charles Place", type: SpaceType.PROPERTY, group: PropertyGroup.PINK, price: 140, baseRent: 10, rentHouse1: 50, rentHouse2: 150, rentHouse3: 450, rentHouse4: 625, rentHotel: 750, houseCost: 100 },
  { id: 12, name: "Electric Company", type: SpaceType.UTILITY, group: PropertyGroup.UTILITY, price: 150, baseRent: 0 }, // Logic handles 4x/10x
  { id: 13, name: "States Ave", type: SpaceType.PROPERTY, group: PropertyGroup.PINK, price: 140, baseRent: 10, rentHouse1: 50, rentHouse2: 150, rentHouse3: 450, rentHouse4: 625, rentHotel: 750, houseCost: 100 },
  { id: 14, name: "Virginia Ave", type: SpaceType.PROPERTY, group: PropertyGroup.PINK, price: 160, baseRent: 12, rentHouse1: 60, rentHouse2: 180, rentHouse3: 500, rentHouse4: 700, rentHotel: 900, houseCost: 100 },
  { id: 15, name: "Pennsylvania Railroad", type: SpaceType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, baseRent: 25 },
  { id: 16, name: "St. James Place", type: SpaceType.PROPERTY, group: PropertyGroup.ORANGE, price: 180, baseRent: 14, rentHouse1: 70, rentHouse2: 200, rentHouse3: 550, rentHouse4: 750, rentHotel: 950, houseCost: 100 },
  { id: 17, name: "Community Chest", type: SpaceType.COMMUNITY_CHEST, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 18, name: "Tennessee Ave", type: SpaceType.PROPERTY, group: PropertyGroup.ORANGE, price: 180, baseRent: 14, rentHouse1: 70, rentHouse2: 200, rentHouse3: 550, rentHouse4: 750, rentHotel: 950, houseCost: 100 },
  { id: 19, name: "New York Ave", type: SpaceType.PROPERTY, group: PropertyGroup.ORANGE, price: 200, baseRent: 16, rentHouse1: 80, rentHouse2: 220, rentHouse3: 600, rentHouse4: 800, rentHotel: 1000, houseCost: 100 },
  { id: 20, name: "Free Parking", type: SpaceType.FREE_PARKING, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 21, name: "Kentucky Ave", type: SpaceType.PROPERTY, group: PropertyGroup.RED, price: 220, baseRent: 18, rentHouse1: 90, rentHouse2: 250, rentHouse3: 700, rentHouse4: 875, rentHotel: 1050, houseCost: 150 },
  { id: 22, name: "Chance", type: SpaceType.CHANCE, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 23, name: "Indiana Ave", type: SpaceType.PROPERTY, group: PropertyGroup.RED, price: 220, baseRent: 18, rentHouse1: 90, rentHouse2: 250, rentHouse3: 700, rentHouse4: 875, rentHotel: 1050, houseCost: 150 },
  { id: 24, name: "Illinois Ave", type: SpaceType.PROPERTY, group: PropertyGroup.RED, price: 240, baseRent: 20, rentHouse1: 100, rentHouse2: 300, rentHouse3: 750, rentHouse4: 925, rentHotel: 1100, houseCost: 150 },
  { id: 25, name: "B. & O. Railroad", type: SpaceType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, baseRent: 25 },
  { id: 26, name: "Atlantic Ave", type: SpaceType.PROPERTY, group: PropertyGroup.YELLOW, price: 260, baseRent: 22, rentHouse1: 110, rentHouse2: 330, rentHouse3: 800, rentHouse4: 975, rentHotel: 1150, houseCost: 150 },
  { id: 27, name: "Ventnor Ave", type: SpaceType.PROPERTY, group: PropertyGroup.YELLOW, price: 260, baseRent: 22, rentHouse1: 110, rentHouse2: 330, rentHouse3: 800, rentHouse4: 975, rentHotel: 1150, houseCost: 150 },
  { id: 28, name: "Water Works", type: SpaceType.UTILITY, group: PropertyGroup.UTILITY, price: 150, baseRent: 0 },
  { id: 29, name: "Marvin Gardens", type: SpaceType.PROPERTY, group: PropertyGroup.YELLOW, price: 280, baseRent: 24, rentHouse1: 120, rentHouse2: 360, rentHouse3: 850, rentHouse4: 1025, rentHotel: 1200, houseCost: 150 },
  { id: 30, name: "Go To Jail", type: SpaceType.GO_TO_JAIL, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 31, name: "Pacific Ave", type: SpaceType.PROPERTY, group: PropertyGroup.GREEN, price: 300, baseRent: 26, rentHouse1: 130, rentHouse2: 390, rentHouse3: 900, rentHouse4: 1100, rentHotel: 1275, houseCost: 200 },
  { id: 32, name: "North Carolina Ave", type: SpaceType.PROPERTY, group: PropertyGroup.GREEN, price: 300, baseRent: 26, rentHouse1: 130, rentHouse2: 390, rentHouse3: 900, rentHouse4: 1100, rentHotel: 1275, houseCost: 200 },
  { id: 33, name: "Community Chest", type: SpaceType.COMMUNITY_CHEST, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 34, name: "Pennsylvania Ave", type: SpaceType.PROPERTY, group: PropertyGroup.GREEN, price: 320, baseRent: 28, rentHouse1: 150, rentHouse2: 450, rentHouse3: 1000, rentHouse4: 1200, rentHotel: 1400, houseCost: 200 },
  { id: 35, name: "Short Line", type: SpaceType.RAILROAD, group: PropertyGroup.RAILROAD, price: 200, baseRent: 25 },
  { id: 36, name: "Chance", type: SpaceType.CHANCE, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 },
  { id: 37, name: "Park Place", type: SpaceType.PROPERTY, group: PropertyGroup.DARK_BLUE, price: 350, baseRent: 35, rentHouse1: 175, rentHouse2: 500, rentHouse3: 1100, rentHouse4: 1300, rentHotel: 1500, houseCost: 200 },
  { id: 38, name: "Luxury Tax", type: SpaceType.TAX, group: PropertyGroup.SPECIAL, price: 0, baseRent: 0 }, // Usually $100
  { id: 39, name: "Boardwalk", type: SpaceType.PROPERTY, group: PropertyGroup.DARK_BLUE, price: 400, baseRent: 50, rentHouse1: 200, rentHouse2: 600, rentHouse3: 1400, rentHouse4: 1700, rentHotel: 2000, houseCost: 200 },
];

export const INITIAL_CASH = 1500;
export const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
