import React, { useEffect, useRef } from "react";
import { Color, InstancedMesh, Matrix4 } from "three";
import { neutral, useEntities } from "../ecs/index.ts";
import "@react-three/fiber";

export const HexGrid = () => {
  const { entities } = useEntities(
    { props: ["cell", "position", "owner", "color"] },
    true,
  );
  const mesh = useRef<InstancedMesh>(null!);

  useEffect(() => {
    if (!mesh.current) return;

    const dummy = new Matrix4();

    let i = 0;
    for (const cell of entities) {
      dummy.setPosition(
        (cell.position.x + ((cell.position.y & 1) === 1 ? 0.5 : 0)) *
          Math.SQRT2,
        cell.position.y * (Math.SQRT1_2 + 0.5),
        1,
      );
      mesh.current.setMatrixAt(i, dummy);
      mesh.current.setColorAt(
        i,
        new Color(cell.owner !== neutral ? cell.owner.color : cell.color),
      );
      i++;
    }
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [mesh.current, entities]);

  return (
    <instancedMesh
      key={entities.size}
      ref={mesh}
      args={[undefined, undefined, entities.size]}
    >
      <circleBufferGeometry
        attach="geometry"
        // TODO: find exact value for 0.82
        args={[0.82, 6, Math.PI / 6]}
      />
      <meshPhongMaterial />
    </instancedMesh>
  );
};
