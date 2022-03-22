import { Cell } from "../../../common/types.ts";
import { AppType, neutral } from "../index.ts";

const colorfulness = 0;
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
        owner: neutral,
        ownerships: new Map(),
      }) as Cell;
    }
  }
};
