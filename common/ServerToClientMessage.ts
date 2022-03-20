type StartMessage = { type: "start" };
type HeartbeatMessage = { type: "heartbeat" };

export type ServerToClientMessage = StartMessage | HeartbeatMessage;

export type ServerToClientMessageMap = {
  start: StartMessage;
  heartbeat: HeartbeatMessage;
};
