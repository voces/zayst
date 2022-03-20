import type { Game } from "./Game.ts";
import { Structure, structureStats } from "./Structure.ts";
import type { Action, Build, Demolish } from "./types.ts";
import { capitalize } from "./util.ts";

export class Player {
  resources = 0;
  income = 0;
  readonly queue: Action[] = [];
  readonly structures = new Set<Structure>();
  readonly game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  handleBuild(action: Build) {
    const cost = structureStats[action.structure].cost;
    if (this.resources < cost) return;
    const cell = this.game.grid[action.y]?.[action.x];
    if (!cell) return;
    if (cell.structure) return;
    const structure = new Structure(this, action.structure, action.x, action.y);
    this.resources -= cost;
    this.structures.add(structure);
    cell.structure = structure;
  }

  handleDemolish(action: Demolish) {
    const cell = this.game.grid[action.y]?.[action.x];
    if (!cell) return;
    const structure = cell.structure;
    if (!structure || structure.owner !== this) return;
    cell.structure = undefined;
    this.structures.delete(structure);
  }

  tick() {
    this.resources += this.income;

    for (const action of this.queue) {
      // deno-lint-ignore no-explicit-any
      this[`handle${capitalize(action.action)}`](action as any);
    }

    // for (
    //   let y = this.game.ticks % 4 < 2 ? 0 : 1;
    //   y < this.game.grid.length;
    //   y += 2
    // ) {
    //   for (
    //     let x = this.game.ticks % 2;
    //     x < this.game.grid[y].length;
    //     x += 2
    //   ) {

    //   }
    // }
  }
}
