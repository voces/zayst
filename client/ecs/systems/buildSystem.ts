import type { Entity } from "../../../common/types.ts";
import { border, rqsToXy, xyToRqs } from "../../../server/util/coordinates.ts";
import { AppType, System } from "../index.ts";
import { cellGrid } from "../init/initCells.ts";

export const newBuildSystem = (app: AppType) => ({
  props: ["progressRemaining"],
  updateChild: (entity, delta) => {
    if (entity.progressRemaining > delta) {
      entity.progressRemaining -= delta;
      return;
    }

    (entity as Entity).progressRemaining = undefined;

    if (entity.isHarvester) {
      const grid = cellGrid.get(app)!;
      for (const radius of [1, 2, 3, 4, 5, 6, 7, 8]) {
        border(xyToRqs(entity.position.x, entity.position.y), radius, (rqs) => {
          const { x, y } = rqsToXy(rqs);
          const cell = grid[y]?.[x];
          if (cell) {
            const newOwnerships = new Map(cell.ownerships);
            newOwnerships.set(
              entity.owner,
              (newOwnerships.get(entity.owner) ?? 0) + ((1 / 12) / radius),
            );
            cell.ownerships = newOwnerships;
          }
        });
      }
    }
  },
} as System);
