import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  InterleavedBufferAttribute,
  Material,
  Matrix4,
  Shader,
  TextureLoader,
} from "three";
import { useEntities } from "../ecs/index.ts";
import "@react-three/fiber";
import { Cell, Entity, Player } from "../../common/types.ts";
import { getLocalPlayer, getNeutralPlayer } from "../ecs/init/initPlayers.ts";
import { stats } from "../../common/structures.ts";

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

const spriteCount = 3;
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

const getPrimaryOwner = (cell: Cell) => {
  if (cell.owner !== getNeutralPlayer() || !cell.ownerships) return;

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

  if (primaryOwners.length === 1) {
    return {
      owner: primaryOwners[0][0],
      share: primaryOwners[0][1],
    };
  }
};

const color = new Color();
const getColor = (cell: Cell) => {
  color.set(cell.owner !== getNeutralPlayer() ? cell.owner.color : cell.color);

  const primaryOwner = getPrimaryOwner(cell);
  if (primaryOwner) {
    color.lerp(
      new Color(primaryOwner.owner.color),
      Math.min(primaryOwner.share, 1) ** 0.5,
    );
  }

  return color;
};

const getTextureIndex = (entity: Cell): number =>
  entity.isHarvester ? 1 : entity.isArrow ? 2 : 0;
const isBufferAttribute = (
  value: InterleavedBufferAttribute | BufferAttribute,
): value is BufferAttribute => "isBufferAttribute" in value;
const setTexIdx = (mesh: InstancedMesh, index: number, value: number) => {
  const attr = mesh.geometry.getAttribute("texIdx");
  if (isBufferAttribute(attr)) attr.set([value], index);
};
const structureFlagMap: {
  [K in NonNullable<Entity["structureType"]>]: `is${Capitalize<K>}`;
} = {
  harvester: "isHarvester",
  arrow: "isArrow",
};

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

export const HexGrid = React.memo(() => {
  const cellIndexMap = useRef(new CellIndexMap()).current;
  const index = useRef(0);
  const lastVersion = useRef(-1);
  const { version, entities, addedEntities, modifiedEntities } = useEntities(
    {
      props: ["isCell", "position", "owner", "color", "ownerships"],
      update(delta) {
        const incomes = new Map<Player, number>();
        for (const cell of this.entities!) {
          const primaryOwner = getPrimaryOwner(cell);
          if (!primaryOwner) continue;
          incomes.set(
            primaryOwner.owner,
            (incomes.get(primaryOwner.owner) ?? 0) + primaryOwner.share * delta,
          );
        }

        for (const [player, income] of incomes) {
          player.wealth += income;
          player.income = income / delta;
        }
      },
    },
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
        const cell = cellIndexMap.getReverse(id);
        if (!cell || cell.owner !== getNeutralPlayer()) return;

        const primaryOwner = getPrimaryOwner(cell);
        const localPlayer = getLocalPlayer();
        if (primaryOwner?.owner !== localPlayer) return;

        const spec = stats[localPlayer.structureType!];
        const cost = spec.cost;
        if (cost > localPlayer.wealth) return;

        cell[structureFlagMap[localPlayer.structureType!]] = true;
        cell.owner = localPlayer;
        cell.progressRemaining = spec.buildTime;
        localPlayer.wealth -= spec.cost;
      }}
      onPointerOver={(id) => {
        const cell = cellIndexMap.getReverse(id)!;
        if (cell.owner !== getNeutralPlayer()) return;

        const localPlayer = getLocalPlayer();
        const primaryOwner = getPrimaryOwner(cell);
        if (primaryOwner?.owner !== localPlayer) return;

        mesh.current.setColorAt(id, new Color("blue"));
        mesh.current.instanceColor!.needsUpdate = true;
        setTexIdx(
          mesh.current,
          id,
          getTextureIndex({
            ...cell,
            [structureFlagMap[localPlayer.structureType!]]: true,
          }),
        );
        mesh.current.geometry.getAttribute("texIdx").needsUpdate = true;
      }}
      onPointerOut={(id) => {
        const cell = cellIndexMap.getReverse(id)!;
        mesh.current.setColorAt(id, getColor(cell));
        mesh.current.instanceColor!.needsUpdate = true;
        setTexIdx(mesh.current, id, getTextureIndex(cell));
        mesh.current.geometry.getAttribute("texIdx").needsUpdate = true;
      }}
    />
  );
});
