import React, { useEffect, useMemo, useRef } from "react";
import { Color, InstancedMesh, Matrix4, Shader, TextureLoader } from "three";
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

const spriteCount = 2;
const spriteSheet = new TextureLoader().load("./assets/spritesheet.svg");
const uvDefine = { USE_UV: "" };
const indexedMesh = (shader: Shader) => {
  shader.uniforms.texAtlas = { value: spriteSheet };
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

    vec4 d = texture(texAtlas, vec2(${
      1 / spriteCount
    }, 1) * vUv + vec2(vTexIdx * ${1 / spriteCount}, 0));

    diffuseColor = vec4(mix(diffuseColor.rgb, d.rgb * 255.0, d.a), 1.0);`,
  );
};

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
        defines={uvDefine}
        onBeforeCompile={indexedMesh}
      />
    </instancedMesh>
  );
};
