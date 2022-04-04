import { Entity } from "../../common/types.ts";
import type { App } from "./index.ts";

const trackedProps = [
  "color",
  "owner",
  "position",
  "progressRemaining",
  "ownerships",
  "wealth",
  "income",
] as const;

export const newEntity: React.ComponentProps<typeof App>["newEntity"] = (
  entity,
  app,
) => {
  for (const prop of trackedProps) app.trackProp(entity, prop);
  return entity as Entity;
};
