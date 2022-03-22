export type Player = {
  color: string;
};

export type Entity = {
  // cell
  /** Flag indicating the entity is a cell. */
  readonly cell?: true;
  /** 2-D position of the entity. */
  position?: {
    x: number;
    y: number;
  };
  /** Color for non-owned tiles. */
  color?: number;
  /** Owner of the tile. */
  owner?: Player;
  progressRemaining?: number;
};

export type Cell = Entity & {
  cell: true;
  x: number;
  y: number;
};
