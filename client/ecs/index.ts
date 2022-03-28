import { appSet } from "ecs-proxy-react";
import { Entity } from "../../common/types.ts";

export const { AppContext, useSystem, useEntities, App, useApp } = appSet<
  Entity
>();

export type AppType = Parameters<
  React.ComponentProps<typeof App>["newEntity"]
>[1];

export type System = Parameters<AppType["addSystem"]>[0];
