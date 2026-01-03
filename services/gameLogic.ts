import { BOARD_SPACES } from '../constants';
import { BoardSpace, Player, PropertyState, SpaceType, PropertyGroup, GameRules } from '../types';

export const calculateRent = (
  space: BoardSpace,
  ownerId: string,
  properties: Record<number, PropertyState>,
  diceTotal: number,
  rules?: GameRules
): number => {
  const propertyState = properties[space.id];
  
  // Safety check: if property state doesn't exist (e.g. unowned), return 0
  if (!propertyState) return 0;

  // If mortgaged, no rent
  if (propertyState.isMortgaged) return 0;

  // Utilities
  if (space.group === PropertyGroup.UTILITY) {
    const ownerUtilities = BOARD_SPACES.filter(
      (s) => s.group === PropertyGroup.UTILITY && properties[s.id]?.ownerId === ownerId && !properties[s.id]?.isMortgaged
    );
    const count = ownerUtilities.length;
    // Default rule: 4x or 10x. Could be customizable via rules object if we expanded it.
    return count === 2 ? diceTotal * 10 : diceTotal * 4;
  }

  // Railroads
  if (space.group === PropertyGroup.RAILROAD) {
    const ownerRailroads = BOARD_SPACES.filter(
      (s) => s.group === PropertyGroup.RAILROAD && properties[s.id]?.ownerId === ownerId && !properties[s.id]?.isMortgaged
    );
    const count = ownerRailroads.length;
    // 1: 25, 2: 50, 3: 100, 4: 200
    return 25 * Math.pow(2, count - 1);
  }

  // Standard Properties
  if (space.type === SpaceType.PROPERTY) {
    if (propertyState.houses > 0) {
        if (propertyState.houses === 1) return space.rentHouse1 || 0;
        if (propertyState.houses === 2) return space.rentHouse2 || 0;
        if (propertyState.houses === 3) return space.rentHouse3 || 0;
        if (propertyState.houses === 4) return space.rentHouse4 || 0;
        if (propertyState.houses === 5) return space.rentHotel || 0;
    } else {
        // Check for color set monopoly
        const groupProps = BOARD_SPACES.filter((s) => s.group === space.group);
        const allOwned = groupProps.every((s) => properties[s.id]?.ownerId === ownerId);
        
        // Standard rule: 2x rent on unimproved color sets
        // If we had rules.monopolyMultiplier, we would use it here.
        return allOwned ? space.baseRent * 2 : space.baseRent;
    }
  }

  return 0;
};

export const canBuildHouse = (
    space: BoardSpace, 
    ownerId: string, 
    properties: Record<number, PropertyState>,
    rules: GameRules
): boolean => {
    if (space.type !== SpaceType.PROPERTY) return false;
    
    // Must own all of color group
    const groupProps = BOARD_SPACES.filter(s => s.group === space.group);
    const allOwned = groupProps.every(s => properties[s.id]?.ownerId === ownerId);
    // Cannot build if any in group is mortgaged
    const anyMortgaged = groupProps.some(s => properties[s.id]?.isMortgaged);
    
    if (!allOwned || anyMortgaged) return false;

    const currentHouses = properties[space.id]?.houses || 0;
    if (currentHouses >= 5) return false; // Max hotel

    if (rules.houseBuilding === 'even') {
        const minHousesInGroup = Math.min(...groupProps.map(s => properties[s.id]?.houses || 0));
        
        // You can build if current is equal to min (bringing it up)
        // AND you cannot build if it would make difference > 1 (e.g. 2,0,0 -> trying to build to 3,0,0 is illegal)
        // Actually the rule is: you cannot build on X if X > any other Y. 
        // So X must be == minHousesInGroup.
        return currentHouses === minHousesInGroup;
    } else {
        // 'any' rule (house rules)
        return true;
    }
};

export const getGroupColorClass = (group: PropertyGroup): string => {
  switch (group) {
    case PropertyGroup.BROWN: return 'bg-monopoly-brown';
    case PropertyGroup.LIGHT_BLUE: return 'bg-monopoly-lightBlue';
    case PropertyGroup.PINK: return 'bg-monopoly-pink';
    case PropertyGroup.ORANGE: return 'bg-monopoly-orange';
    case PropertyGroup.RED: return 'bg-monopoly-red';
    case PropertyGroup.YELLOW: return 'bg-monopoly-yellow text-black';
    case PropertyGroup.GREEN: return 'bg-monopoly-green';
    case PropertyGroup.DARK_BLUE: return 'bg-monopoly-blue';
    default: return 'bg-slate-600';
  }
};