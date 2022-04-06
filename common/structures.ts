export type Spec = {
  name: string;
  cost: number;
  economy?: number;
  damage?: number;
  range?: number;
  cooldown?: number;
  health: number;
  buildTime: number;
};

export const stats = {
  harvester: {
    name: "Harvester",
    cost: 240,
    economy: 4,
    health: 10,
    buildTime: 5,
  },
  arrow: {
    name: "Arrow Tower",
    cost: 1_000,
    damage: 3,
    range: 5,
    cooldown: 1,
    health: 30,
    buildTime: 3,
  },
};

export type StructureType = keyof typeof stats;
