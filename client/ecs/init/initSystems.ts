import { AppType } from "../index.ts";
import { newBuildSystem } from "../systems/buildSystem.ts";

export const initSystems = (app: AppType) => {
  app.addSystem(newBuildSystem(app));
};
