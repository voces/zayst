import React, { useEffect, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

export const HexGeometry = () => {
  const ref = useRef<BufferGeometry>(null!);

  useEffect(() => {
    if (!ref.current) return;

    const vertices: number[] = [
      [3 ** .5 / -2, -0.5, 0],
      [0, 1, 0],
      [3 ** .5 / -2, 0.5, 0],

      [3 ** .5 / -2, -0.5, 0],
      [3 ** .5 / 2, 0.5, 0],
      [0, 1, 0],

      [3 ** .5 / -2, -0.5, 0],
      [3 ** .5 / 2, -0.5, 0],
      [3 ** .5 / 2, 0.5, 0],

      [3 ** .5 / -2, -0.5, 0],
      [0, -1, 0],
      [3 ** .5 / 2, -0.5, 0],
    ].flat().map((v) => v / (Math.SQRT1_2 + 0.5));

    ref.current.setAttribute(
      "position",
      new Float32BufferAttribute(vertices, 3),
    );
  }, [ref.current]);

  return <bufferGeometry ref={ref} attach="geometry" />;
};
