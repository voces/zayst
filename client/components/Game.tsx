import { World } from "./World.tsx";
import React, { useEffect } from "react";
import { useApp } from "../ecs.ts";

const HEIGHT = 20;
const WIDTH = 58;

export const Game = () => {
  const app = useApp();

  useEffect(() => {
    let i = 0;
    for (let y = -HEIGHT; y <= HEIGHT; y++) {
      for (let x = -WIDTH; x <= WIDTH; x++) {
        app.add({ x, y, cell: true });
        i++;
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => app.update(), 100);

    return () => clearInterval(interval);
  });

  return <World />;
};
