import { isPlayer } from "../../../common/typeguards.ts";
import { Cell, Player } from "../../../common/types.ts";
import { AppType } from "../index.ts";
import { getNeutralPlayer } from "./initPlayers.ts";

const colorfulness = 40;
const randomColor = () => {
  const r = Math.floor(Math.random() * colorfulness) + (255 - colorfulness);
  const g = Math.floor(Math.random() * colorfulness) + (255 - colorfulness);
  const b = Math.floor(Math.random() * colorfulness) + (255 - colorfulness);
  return r * 256 ** 2 + g * 256 + b;
};

const HEIGHT = 20;
const WIDTH = 58;

export const cellGrid = new WeakMap<
  AppType,
  Record<number, Record<number, Cell>>
>();

export const initCells = (app: AppType) => {
  const neutralPlayer = getNeutralPlayer();

  const players = new Set<Player>();
  for (const entity of app.entities) {
    if (isPlayer(entity)) players.add(entity as Player);
  }

  const grid: Record<number, Record<number, Cell>> = {};
  cellGrid.set(app, grid);
  for (let y = -HEIGHT; y <= HEIGHT; y++) {
    const row: Record<number, Cell> = {};
    grid[y] = row;
    for (let x = -WIDTH; x <= WIDTH; x++) {
      row[x] = app.add({
        position: { x, y },
        color: randomColor(),
        isCell: true,
        owner: neutralPlayer,
        ownerships: new Map(),
      });
    }
  }

  for (const player of players) {
    if (player === neutralPlayer) continue;
    let cell: Cell;
    while (true) {
      const x = Math.floor(Math.random() * (WIDTH * 2 + 1) - WIDTH);
      const y = Math.floor(Math.random() * (HEIGHT * 2 + 1) - HEIGHT);
      cell = grid[y][x];
      if (cell.owner === neutralPlayer) break;
    }
    console.log(cell.position);
    cell.owner = player;
    cell.isHarvester = true;
    cell.progressRemaining = 0.001;
  }
};
