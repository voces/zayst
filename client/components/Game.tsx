import { World } from "./World.tsx";
import React, { useEffect } from "react";
import { useApp } from "../ecs/index.ts";

const red = { color: "red" };

export const Game = () => {
  const app = useApp();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const itr = app.entities.values().next();
      const entity = itr.done ? undefined : itr.value;
      if (entity) {
        entity.owner = red;
        entity.progressRemaining = 5;
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => app.update(), 100);

    return () => clearInterval(interval);
  });

  return <World />;
};
