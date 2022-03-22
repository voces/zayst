import { AppType, neutral } from "../index.ts";

const randomColor = () => {
  const r = Math.floor(Math.random() * 128) + 128;
  const g = Math.floor(Math.random() * 128) + 128;
  const b = Math.floor(Math.random() * 128) + 128;
  return r * 256 ** 2 + g * 256 + b;
};

const HEIGHT = 20;
const WIDTH = 58;

export const initCells = (app: AppType) => {
  for (let y = -HEIGHT; y <= HEIGHT; y++) {
    for (let x = -WIDTH; x <= WIDTH; x++) {
      app.add({
        position: { x, y },
        color: randomColor(),
        cell: true,
        owner: neutral,
      });
    }
  }
};
