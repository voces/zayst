import { Game } from "./Game.tsx";
import React from "react";
import { App as ECSApp } from "../ecs/index.ts";
import { initApp } from "../ecs/init/index.ts";
import { newEntity } from "../ecs/newEntity.ts";

export const App = React.memo(() => (
  <ECSApp newEntity={newEntity} initApp={initApp}>
    <Game />
  </ECSApp>
));
