export type Player = {
  color: string;
};

export type Entity = {
  cell?: true;

  x?: number;
  y?: number;
  owner?: Player;
};

export type Cell = Entity & {
  cell: true;
  x: number;
  y: number;
};
