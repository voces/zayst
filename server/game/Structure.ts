import { border, rqsToXy, xyToRqs } from "../util/coordinates.ts";
import type { Player } from "./Player.ts";

export type StructureType =
  | "attack"
  | "sniper"
  | "canon"
  | "bunker"
  | "nuke"
  | "siege"
  | "splash"
  | "harvester";

type BaseStats = { health: number; buildTime: number; cost: number };
type AttackType = "LoS" | "Artillery";
type AttackStats = {
  damage: number;
  range: number;
  cooldown: number;
  attackType: AttackType;
  splash?: number;
};

export const structureStats: {
  [type in StructureType]: BaseStats | (BaseStats & AttackStats);
} = {
  attack: {
    health: 30,
    buildTime: 3,
    cost: 5,
    damage: 3,
    range: 5,
    cooldown: 1,
    attackType: "LoS",
  },
  sniper: {
    health: 20,
    buildTime: 10,
    cost: 20,
    damage: 7,
    range: 10,
    cooldown: 5,
    attackType: "LoS",
  },
  canon: {
    health: 50,
    buildTime: 8,
    cost: 15,
    damage: 6,
    range: 8,
    cooldown: 4,
    attackType: "Artillery",
  },
  bunker: {
    health: 10,
    buildTime: 10,
    cost: 10,
    damage: 2,
    range: 1,
    cooldown: 2,
    attackType: "LoS",
  },
  nuke: {
    health: 10,
    buildTime: 30,
    cost: 50,
    damage: 10,
    range: 10,
    cooldown: 10,
    attackType: "Artillery",
    splash: 5,
  },
  siege: {
    health: 20,
    buildTime: 1,
    cost: 3,
    damage: 1,
    range: 4,
    cooldown: 0.25,
    attackType: "LoS",
  },
  splash: {
    health: 40,
    buildTime: 4,
    cost: 10,
    damage: 3,
    range: 6,
    cooldown: 3,
    attackType: "LoS",
    splash: 3,
  },
  harvester: { health: 10, buildTime: 5, cost: 5 },
};

export class Structure {
  readonly owner: Player;
  readonly type: StructureType;
  readonly x: number;
  readonly y: number;

  health!: number;
  /** Seconds remaining. */
  buildTime!: number;
  readonly cost!: number;
  readonly damage?: number;
  readonly range?: number;
  readonly cooldown?: number;
  readonly attackType?: AttackType;
  readonly splash?: number;
  cooldownRemaining?: number;

  constructor(owner: Player, type: StructureType, x: number, y: number) {
    this.owner = owner;
    this.type = type;
    this.x = x;
    this.y = y;

    Object.assign(this, structureStats[type]);
  }

  complete() {
    if (this.type !== "harvester") return;

    border(xyToRqs(this.x, this.y), 1, (rqs) => {
      const { x, y } = rqsToXy(rqs);
      const cell = this.owner.game.grid[y]?.[x];
      if (!cell) return;
    });
  }
}
