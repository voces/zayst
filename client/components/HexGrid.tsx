import React, { useEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Matrix4, TextureLoader } from "three";
import { localPlayer, neutral, useEntities } from "../ecs/index.ts";
import "@react-three/fiber";
import { Cell, Player } from "../../common/types.ts";

class CellIndexMap extends WeakMap<Cell, number> {
  #reverse: Record<number, WeakRef<Cell> | undefined> = {};

  set(entity: Cell, index: number) {
    this.#reverse[index] = new WeakRef(entity);
    return super.set(entity, index);
  }

  getReverse(index: number) {
    return this.#reverse[index]?.deref();
  }
}

export const HexGrid = () => {
  const cellIndexMap = useRef(new CellIndexMap()).current;
  const index = useRef(0);
  const lastVersion = useRef(-1);
  const { version, entities, addedEntities, modifiedEntities } = useEntities(
    { props: ["isCell", "position", "owner", "color", "ownerships"] },
    true,
  );
  const mesh = useRef<InstancedMesh>(null!);

  const getOrIndex = (cell: Cell) => {
    if (cellIndexMap.has(cell)) return cellIndexMap.get(cell)!;
    cellIndexMap.set(cell, index.current);
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

  const parts = 3;
  const vertices = useMemo(
    () =>
      Float32Array.from(
        Array(entities.size),
        () => Math.floor(Math.random() ** 50 * Math.random() * 3),
      ),
    [entities.size],
  );

  return (
    <instancedMesh
      key={entities.size}
      ref={mesh}
      args={[undefined, undefined, entities.size]}
      onClick={(e) => {
        const entity = cellIndexMap.getReverse(e.instanceId!);
        if (!entity || entity.owner !== neutral) return;
        entity.owner = localPlayer;
        entity.progressRemaining = 5;
        entity.isHarvester = true;
      }}
      onPointerOver={(e) => {
        mesh.current.setColorAt(e.instanceId!, new Color("blue"));
        mesh.current.instanceColor!.needsUpdate = true;
      }}
      onPointerOut={(e) => {
        const cell = cellIndexMap.getReverse(e.instanceId!)!;

        const color = new Color(
          cell.owner !== neutral ? cell.owner.color : cell.color,
        );
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
        mesh.current.setColorAt(e.instanceId!, color);
        mesh.current.instanceColor!.needsUpdate = true;
      }}
    >
      <circleBufferGeometry
        attach="geometry"
        // TODO: find exact value for 0.82
        args={[0.82, 6, Math.PI / 6]}
      >
        <instancedBufferAttribute
          attachObject={["attributes", "texIdx"]}
          array={vertices}
          count={vertices.length}
          itemSize={1}
        />
      </circleBufferGeometry>
      <meshBasicMaterial
        defines={{ USE_UV: "" }}
        onBeforeCompile={(shader) => {
          const texAtlas = new TextureLoader().load(
            "data:image/png;base64,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",
          );
          shader.uniforms.texAtlas = { value: texAtlas };
          shader.vertexShader = `attribute float texIdx;
varying float vTexIdx;
${shader.vertexShader}`.replace(
            `void main() {`,
            `void main() {
    vTexIdx = texIdx;`,
          );
          shader.fragmentShader = `
uniform sampler2D texAtlas;
varying float vTexIdx;
${shader.fragmentShader}`.replace(
            `#include <map_fragment>`,
            `#include <map_fragment>
    diffuseColor *= texture(texAtlas, vec2(${
              1 / parts
            }, 1) * vUv + vec2(vTexIdx * ${1 / parts}, 0));`,
          );
        }}
      />
    </instancedMesh>
  );
};
