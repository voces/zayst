import { Game } from "./Game.tsx";
import React from "react";
import { App as ECSApp } from "../ecs.ts";
import { Entity } from "../../common/types.ts";

const trackedProps = ["x", "y", "owner"] as const;

export const App = () => (
  <ECSApp
    newEntity={(e, app) => {
      for (const prop of trackedProps) app.trackProp(e, prop);
      return e as Entity;
    }}
  >
    <Game />
  </ECSApp>
);
