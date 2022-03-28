import { Player } from "../../../common/types.ts";
import { AppType } from "../index.ts";

let localPlayer: Player;
let neutralPlayer: Player;

export const getLocalPlayer = () => {
  if (!localPlayer) {
    throw new Error("Expected players to have been initialized");
  }
  return localPlayer;
};

export const getNeutralPlayer = () => {
  if (!neutralPlayer) {
    throw new Error("Expected players to have been initialized");
  }
  return neutralPlayer;
};

export const initPlayers = (app: AppType) => {
  localPlayer = app.add({
    isPlayer: true,
    color: "red",
  });

  neutralPlayer = app.add({
    isPlayer: true,
    color: "random",
  });
};
