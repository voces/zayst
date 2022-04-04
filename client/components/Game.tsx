import { World } from "./World.tsx";
import React, { useEffect } from "react";
import { useApp } from "../ecs/index.ts";
import { HUD } from "./HUD.tsx";

export const Game = React.memo(() => {
  const app = useApp();

  useEffect(() => {
    const interval = setInterval(() => app.update(), 100);
    return () => clearInterval(interval);
  });

  return (
    <>
      <World />
      <HUD />
    </>
  );
});
