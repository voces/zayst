import type { App } from "../index.ts";
import { initCells } from "./initCells.ts";
import { initSystems } from "./initSystems.ts";

export const initApp: React.ComponentProps<typeof App>["initApp"] = (app) => {
  initCells(app);
  initSystems(app);
};
