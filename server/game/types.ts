import type { StructureType } from "./Structure.ts";

export type Build = {
  action: "build";
  x: number;
  y: number;
  structure: StructureType;
};

export type Demolish = {
  action: "demolish";
  x: number;
  y: number;
};

export type Action = Build | Demolish;
