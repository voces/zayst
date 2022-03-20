type RQS = {
  r: number;
  q: number;
  s: number;
};

export const xyToRqs = (x: number, y: number): RQS => {
  const q = x - (y - (y & 1)) / 2;
  const r = y;
  return { q, r, s: -q - r };
};

export const rqsToXy = ({ r, q }: RQS & { s?: number }) => ({
  x: q + (r - (r & 1)) / 2,
  y: r,
});

export const border = <T>(
  { r, q, s }: RQS,
  radius: number,
  fn: (rqs: RQS) => T,
) => {
  const ret: T[] = [];

  // Start left
  let sd = radius;
  let qd = -radius;
  let rd = 0;

  // Move up-left
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    qd++;
    rd--;
  }

  // Move right
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    qd++;
    sd--;
  }

  // Move down-right
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    rd++;
    sd--;
  }

  // Move down-left
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    rd++;
    qd--;
  }

  // Move left
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    sd++;
    qd--;
  }

  // Move up-left
  for (let i = radius; i > 0; i--) {
    ret.push(fn({ r: r + rd, q: q + qd, s: s + sd }));
    sd++;
    rd--;
  }

  return ret;
};
