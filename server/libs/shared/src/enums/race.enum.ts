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

export function getRaceByName(raceName: string): Race|null {
  for (const race of Object.values(Race)) {
    if (races[race] === raceName) {
      return race;
    }
  }

  return null;
}
