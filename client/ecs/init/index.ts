import type { App } from "../index.ts";
import { initCells } from "./initCells.ts";

export const initApp: React.ComponentProps<typeof App>["initApp"] = (app) => {
  initCells(app);
};
