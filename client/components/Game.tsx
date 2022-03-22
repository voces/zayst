import { World } from "./World.tsx";
import React, { useEffect } from "react";
import { useApp } from "../ecs/index.ts";

export const Game = () => {
  const app = useApp();

  useEffect(() => {
    const interval = setInterval(() => app.update(), 100);
    return () => clearInterval(interval);
  });

  return <World />;
};
