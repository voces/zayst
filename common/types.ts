import { StructureType } from "./structures.ts";

// Make sure to update client/ecs/newEntity.ts for updated props
export type Entity = {
  // cell
  readonly isCell?: true;
  isHarvester?: true;
  isArrow?: true;
  /** 2-D position of the entity. */
  position?: {
    x: number;
    y: number;
  };
  /** Color for non-owned tiles. */
  color?: number | string;
  /** Owner of the tile. */
  owner?: Player;
  ownerships?: Map<Player, number>;
  progressRemaining?: number;

  // player
  readonly isPlayer?: true;
  // color?: number | string;
  wealth?: number;
  income?: number;
  // Local player info
  local?: boolean;
  structureType?: StructureType;
};

export type Player =
  & Entity
  & Required<Pick<Entity, "isPlayer" | "color" | "wealth" | "income">>;

export type Cell =
  & Entity
  & Required<
    Pick<Entity, "isCell" | "position" | "color" | "owner" | "ownerships">
  >;
