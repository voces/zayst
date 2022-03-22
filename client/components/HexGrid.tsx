import React, { useEffect, useRef } from "react";
import { Color, InstancedMesh, Matrix4 } from "three";
import { localPlayer, neutral, useEntities } from "../ecs/index.ts";
import "@react-three/fiber";
import { Entity, Player } from "../../common/types.ts";

class EntityIndexMap extends WeakMap<Entity, number> {
  #reverse: Record<number, WeakRef<Entity> | undefined> = {};

  set(entity: Entity, index: number) {
    this.#reverse[index] = new WeakRef(entity);
    return super.set(entity, index);
  }

  getReverse(index: number) {
    return this.#reverse[index]?.deref();
  }
}

export const HexGrid = () => {
  const entityIndexMap = useRef(new EntityIndexMap()).current;
  const index = useRef(0);
  const lastVersion = useRef(-1);
  const { version, entities, addedEntities, modifiedEntities } = useEntities(
    { props: ["isCell", "position", "owner", "color", "ownerships"] },
    true,
  );
  const mesh = useRef<InstancedMesh>(null!);

  const getOrIndex = (entity: Entity) => {
    if (entityIndexMap.has(entity)) return entityIndexMap.get(entity)!;
    entityIndexMap.set(entity, index.current);
    return index.current++;
  };

  useEffect(() => {
    if (!mesh.current || version === lastVersion.current) return;
    lastVersion.current = version;

    const dummy = new Matrix4();
    const color = new Color();

    for (const set of [addedEntities, modifiedEntities]) {
      for (const cell of set) {
        const i = getOrIndex(cell);

        dummy.setPosition(
          (cell.position.x + ((cell.position.y & 1) === 1 ? 0.5 : 0)) *
            Math.SQRT2,
          cell.position.y * (Math.SQRT1_2 + 0.5),
          1,
        );
        mesh.current.setMatrixAt(i, dummy);

        color.set(cell.owner !== neutral ? cell.owner.color : cell.color);
        if (cell.owner === neutral && cell.ownerships) {
          const primaryOwners = Array.from(cell.ownerships).reduce((
            primaryOwners,
            owner,
          ) => {
            if (!primaryOwners.length) return [owner];
            if (primaryOwners[0][1] > owner[1]) return primaryOwners;
            if (primaryOwners[0][1] === owner[1]) {
              return [...primaryOwners, owner];
            }
            return [owner];
          }, [] as [Player, number][]);

          if (primaryOwners.length === 1) {
            color.lerp(
              new Color(primaryOwners[0][0].color),
              Math.min(primaryOwners[0][1], 1),
            );
          }
        }

        mesh.current.setColorAt(i, color);
      }
    }

    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [mesh.current, version, addedEntities, modifiedEntities]);

  return (
    <instancedMesh
      key={entities.size}
      ref={mesh}
      args={[undefined, undefined, entities.size]}
      onClick={(e) => {
        const entity = entityIndexMap.getReverse(e.instanceId!);
        if (!entity || entity.owner !== neutral) return;
        entity.owner = localPlayer;
        entity.progressRemaining = 5;
        entity.isHarvester = true;
      }}
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
