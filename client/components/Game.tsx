import { World } from "./World.tsx";
import React, { useEffect, useRef } from "react";
import { neutral, useApp } from "../ecs.ts";

const HEIGHT = 20;
const WIDTH = 58;

const red = { color: "red" };

export const Game = () => {
  const app = useApp();

  useEffect(() => {
    for (let y = -HEIGHT; y <= HEIGHT; y++) {
      for (let x = -WIDTH; x <= WIDTH; x++) {
        app.add({
          x,
          y,
          cell: true,
          owner: x === 0 && y === 0 ? red : neutral,
        });
      }
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const itr = app.entities.values().next();
      const entity = itr.done ? undefined : itr.value;
      if (entity) {
        console.log("do it!");
        entity.owner = red;
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
