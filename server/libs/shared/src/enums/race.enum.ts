export enum Race {
  HYUR = 'hyur',
  ELEZEN = 'elezen',
  LALAFELL = 'lalafell',
  MIQOTE = 'miqote',
  ROEGADYN = 'roegadyn',
  AURA = 'aura',
  HROTHGAR = 'hrothgar',
  VIERA = 'viera',
}

export const races: { [k: string]: string } = {
  [Race.HYUR]: 'Hyur',
  [Race.ELEZEN]: 'Elezen',
  [Race.LALAFELL]: 'Lalafell',
  [Race.MIQOTE]: "Miqo'te",
  [Race.ROEGADYN]: 'Roegadyn',
  [Race.AURA]: 'Au Ra',
  [Race.HROTHGAR]: 'Hrothgar',
  [Race.VIERA]: 'Viera',
};

// IDs returned by XIVAPI's Lodestone queries.
const racesById = {
  1: Race.HYUR,
  2: Race.ELEZEN,
  3: Race.LALAFELL,
  4: Race.MIQOTE,
  5: Race.ROEGADYN,
  6: Race.AURA,
  7: Race.HROTHGAR,
  8: Race.VIERA,
}

export function getRaceById(id: number): Race|null {
  return racesById[id as keyof typeof racesById] || null;
}

export function getRaceByName(raceName: string): Race|null {
  for (const race of Object.values(Race)) {
    if (races[race] === raceName) {
      return race;
    }
  }

  return null;
}
