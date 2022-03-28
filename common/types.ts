export type Entity = {
  // cell
  readonly isCell?: true;
  isHarvester?: true;
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
  local?: boolean;
  // color?: number | string;
};

export type Player =
  & Entity
  & Required<Pick<Entity, "isPlayer" | "color">>;

export type Cell =
  & Entity
  & Required<
    Pick<Entity, "isCell" | "position" | "color" | "owner" | "ownerships">
  >;
