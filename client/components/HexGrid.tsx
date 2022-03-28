import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Shader,
  TextureLoader,
} from "three";
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

const color = new Color();
const getColor = (cell: Cell) => {
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

  return color;
};

const getTextureIndex = (entity: Cell): number => entity.isHarvester ? 1 : 0;

const HexGridMesh = (
  { entities, mesh, onClick, onPointerOver, onPointerOut }: {
    entities: ReadonlySet<Cell>;
    mesh: React.MutableRefObject<
      InstancedMesh<BufferGeometry, Material | Material[]>
    >;
    onClick: (id: number) => void;
    onPointerOver: (id: number) => void;
    onPointerOut: (id: number) => void;
  },
) => {
  useEffect(() => {
    if (!mesh.current || mesh.current.geometry.hasAttribute("texIdx")) return;

    mesh.current.geometry.setAttribute(
      "texIdx",
      new InstancedBufferAttribute(
        Float32Array.from(
          Array.from(entities.values()),
          (e) => getTextureIndex(e),
        ),
        1,
      ),
    );
    mesh.current.geometry.getAttribute("texIdx").needsUpdate = true;
  }, [mesh.current, entities]);

  return (
    <instancedMesh
      key={entities.size}
      ref={mesh}
      args={[undefined, undefined, entities.size]}
      onClick={(e) => onClick(e.instanceId!)}
      onPointerOver={(e) => onPointerOver(e.instanceId!)}
      onPointerOut={(e) => onPointerOut(e.instanceId!)}
    >
      <circleBufferGeometry
        attach="geometry"
        // TODO: find exact value for 0.82
        args={[0.82, 6, Math.PI / 6]}
      >
      </circleBufferGeometry>
      <meshBasicMaterial
        defines={uvDefine}
        onBeforeCompile={indexedMesh}
      />
    </instancedMesh>
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
        mesh.current.setColorAt(i, getColor(cell));
        (mesh.current.geometry.getAttribute("texIdx").array as Uint8Array)[
          i
        ] = getTextureIndex(cell);
      }
    }

    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.geometry.getAttribute("texIdx")) {
      mesh.current.geometry.getAttribute("texIdx").needsUpdate = true;
    }
  }, [mesh.current, version, addedEntities, modifiedEntities]);

  if (!entities.size) return null;

  return (
    <HexGridMesh
      entities={entities}
      mesh={mesh}
      onClick={(id) => {
        const entity = cellIndexMap.getReverse(id);
        if (!entity || entity.owner !== neutral) return;
        entity.isHarvester = true;
        entity.owner = localPlayer;
        entity.progressRemaining = 5;
      }}
      onPointerOver={(id) => {
        const cell = cellIndexMap.getReverse(id)!;
        if (cell.owner !== neutral) return;
        mesh.current.setColorAt(id, new Color("blue"));
        mesh.current.instanceColor!.needsUpdate = true;
      }}
      onPointerOut={(id) => {
        const cell = cellIndexMap.getReverse(id)!;
        mesh.current.setColorAt(id, getColor(cell));
        mesh.current.instanceColor!.needsUpdate = true;
      }}
    />
  );
};
