import { appSet } from "ecs-proxy-react";
import { Entity } from "../common/types.ts";

export const { AppContext, useSystem, useEntities, App, useApp } = appSet<
  Entity
>();
