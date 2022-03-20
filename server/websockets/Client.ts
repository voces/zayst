import { ConnInfo } from "https://deno.land/std@0.126.0/http/server.ts";
import {
  ClientToServerMessageMap,
  isClientToServerMessage,
} from "../../common/ClientToServerMessage.ts";
import { ServerToClientMessage } from "../../common/ServerToClientMessage.ts";
import { GenericEvent } from "../util/GenericEvent.ts";
import { tryParseJson } from "../util/json.ts";

type ClientEventDataMap =
  & ClientToServerMessageMap
  & {
    init: { type: "init" };
    close: { type: "close"; reason: string };
  };

class ClientEvent<T extends keyof ClientEventDataMap>
  extends GenericEvent<ClientEventDataMap[T]> {}

type ClientEventMap = {
  [K in keyof ClientEventDataMap]: ClientEvent<K>;
};

export class Client extends EventTarget {
  #websocket: WebSocket;
  #heartbeatInterval: number;

  constructor(websocket: WebSocket, connInfo: ConnInfo) {
    super();
    this.#websocket = websocket;

    websocket.addEventListener(
      "open",
      () =>
        console.log(
          new Date(),
          "Socket opened",
          connInfo.remoteAddr.transport === "tcp"
            ? connInfo.remoteAddr.hostname
            : connInfo,
        ),
    );

    websocket.addEventListener("message", (ev) => {
      const json = tryParseJson(ev);
      if (!json) return this.close("invalid json");
      if (!isClientToServerMessage(json)) return this.close("invalid message");
      this.dispatchEvent(new ClientEvent(json));
    });

    websocket.addEventListener(
      "error",
      (e) => {
        console.log(new Date(), "websocket error", e);
        this.close("client error");
      },
    );

    websocket.addEventListener(
      "close",
      () => this.close("client terminated"),
    );

    this.#heartbeatInterval = setInterval(() => {
      this.send({ type: "heartbeat" });
    }, 1000);
  }

  send(message: ServerToClientMessage) {
    try {
      this.#websocket.send(JSON.stringify(message));
    } catch (err) {
      console.error(err);
      this.close("error sending message");
    }
  }

  close(reason: string) {
    console.log(new Date(), "Closing:", reason);
    this.#websocket.close();
    clearInterval(this.#heartbeatInterval);
    this.dispatchEvent(new ClientEvent({ type: "close", reason }));
  }

  addEventListener<K extends keyof ClientEventMap>(
    type: K,
    listener: (this: Client, ev: ClientEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    super.addEventListener(type, listener, options);
  }
}
