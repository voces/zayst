import { appSet } from "ecs-proxy-react";
import { Entity, Player } from "../../common/types.ts";

export const { AppContext, useSystem, useEntities, App, useApp } = appSet<
  Entity
>();

export type AppType = Parameters<
  React.ComponentProps<typeof App>["newEntity"]
>[1];

export const neutral: Player = { color: "random" };
