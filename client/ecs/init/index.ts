import type { App } from "../index.ts";
import { initCells } from "./initCells.ts";
import { initPlayers } from "./initPlayers.ts";
import { initSystems } from "./initSystems.ts";

export const initApp: React.ComponentProps<typeof App>["initApp"] = (app) => {
  initPlayers(app);
  initCells(app);
  initSystems(app);
};
