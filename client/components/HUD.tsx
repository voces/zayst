import React, { useCallback } from "react";
import { Spec, stats, StructureType } from "../../common/structures.ts";
import { Player } from "../../common/types.ts";
import { useEntities } from "../ecs/index.ts";
import { spacing } from "../ui/spacing.ts";
import { Icon } from "./Icon.tsx";

const Icons = React.memo(({ player }: { player: Player }) => (
  <>
    {(Object.entries(stats) as [StructureType, Spec][]).map((
      [key, value],
    ) => (
      <Icon
        key={key}
        structureType={player.structureType}
        icon={key}
        description={
          <>
            <div>{value.name}</div>
            <div>🪙 {value.cost}</div>
            {value.economy && <div>Income: {value.economy}</div>}
            {value.damage && <div>Damage: {value.damage}</div>}
            {value.range && <div>Range: {value.range}</div>}
            {value.cooldown && <div>Cooldown: {value.cooldown}</div>}
            <div>Health: {value.health}</div>
            <div>Build time: {value.buildTime}</div>
          </>
        }
        onClick={() => player.structureType = key}
      />
    ))}
  </>
));

export const HUD = React.memo(() => {
  const { entities } = useEntities({
    props: ["isPlayer", "wealth", "income", "local", "structureType", "color"],
  }, true);

  const player = Array.from(entities.values())[0];

  if (!entities.size) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: spacing.s,
        left: spacing.s,
      }}
    >
      <div style={{ marginBottom: spacing.s }}>
        🪙{player.wealth.toFixed(0)} ({player.income.toFixed(0)}/s)
      </div>
      <Icons player={player} />
    </div>
  );
});
