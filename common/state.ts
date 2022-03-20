import { createECS } from "miniplex/react";
import { Cell, Entity } from "./types.ts";

export const ecs = createECS<Entity>();
export const { useArchetype } = ecs;

export const cells = Array.from(
  Array(51),
  (_, y) =>
    Array.from(
      Array(101),
      (_, x) =>
        ecs.world.createEntity({
          cell: true,
          x,
          y,
          owner: x === 50 && y === 100 ? { color: "red" } : undefined,
        }) as Cell,
    ),
);
