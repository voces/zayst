import React, { useEffect, useRef } from "react";
import { Color, InstancedMesh, Matrix4 } from "three";
import { useEntities } from "../ecs.ts";
import { HexGeometry } from "./HexGeometry.tsx";
import "@react-three/fiber";

export const HexGrid = () => {
  const { entities } = useEntities({ props: ["cell", "x", "y"] });
  const mesh = useRef<InstancedMesh>(null!);

  useEffect(() => {
    if (!mesh.current) return;

    const dummy = new Matrix4();
    dummy.setPosition(0, 0, 1);

    let i = 0;
    for (const cell of entities) {
      dummy.setPosition(
        (cell.x + ((cell.y & 1) === 1 ? 0.5 : 0)) *
          Math.SQRT2,
        cell.y * (Math.SQRT1_2 + 0.5),
        1,
      );
      mesh.current.setMatrixAt(i, dummy);
      const owner = cell.owner;
      mesh.current.setColorAt(
        i,
        new Color(
          ...(owner?.color ? [owner.color] : [
            Math.random() * 0.25 + 0.75,
            Math.random() * 0.25 + 0.75,
            Math.random() * 0.25 + 0.75,
          ]),
        ),
      );
      i++;
    }
  }, [mesh.current, entities]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, entities.size]}
    >
      <HexGeometry />
      <meshBasicMaterial attach="material" />
    </instancedMesh>
  );
};
