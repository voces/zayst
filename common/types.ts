export type Player = {
  color: string;
};

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
  color?: number;
  /** Owner of the tile. */
  owner?: Player;
  ownerships?: Map<Player, number>;
  progressRemaining?: number;
};

export type Cell =
  & Entity
  & Required<
    Pick<Entity, "isCell" | "position" | "color" | "owner" | "ownerships">
  >;
