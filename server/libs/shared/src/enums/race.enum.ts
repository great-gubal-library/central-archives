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
