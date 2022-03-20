import type { Player } from "./Player.ts";
import type { Structure } from "./Structure.ts";

const genId = () => {
  const d = new Date();
  return (
    (d.getFullYear() % 10 || 1) *
    (d.getSeconds() || 1) *
    (d.getMilliseconds() || 1) *
    Math.ceil(Math.random() * 50000)
  ).toString(36);
};

class Cell {
  owner?: Player;
  valuations?: WeakMap<Player, number>;
  structure?: Structure;

  constructor(readonly x: number, readonly y: number) {}
}

export class Game {
  readonly id = genId();
  grid: Cell[][];
  players = new Set<Player>();
  ticks = 0;

  constructor() {
    this.grid = Array.from(
      Array(100),
      (_, y) => Array.from(Array(100), (_, x) => new Cell(x, y)),
    );
  }

  tick() {
    for (const player of this.players) player.tick();

    for (
      let y = this.ticks % 4 < 2 ? 0 : 1;
      y < this.grid.length;
      y += 2
    ) {
      for (
        let x = this.ticks % 2;
        x < this.grid[y].length;
        x += 2
      ) {
        const structure = this.grid[y][x].structure;
        if (!structure) continue;
        if (structure.buildTime) {
          structure.buildTime -= 1;
          if (structure.buildTime === 0) structure.complete();
        }
      }
    }

    this.ticks += 1;
  }
}
