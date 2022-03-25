import React from "react";
import { Canvas } from "@react-three/fiber";
import { HexGrid } from "./HexGrid.tsx";
import { AppContext, useApp } from "../ecs/index.ts";

export const World = () => {
  const app = useApp();
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas orthographic camera={{ zoom: 20 }}>
        <AppContext.Provider value={app}>
          <color attach="background" args={["black"]} />
          <HexGrid />
        </AppContext.Provider>
      </Canvas>
    </div>
  );
};
