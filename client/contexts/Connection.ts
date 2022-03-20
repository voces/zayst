import { createContext } from "react";
import { ServerToClientMessageMap } from "../../common/ServerToClientMessage.ts";
import { GenericEvent } from "../../server/util/GenericEvent.ts";

type ClientEventDataMap = ServerToClientMessageMap & {
  connect: { type: "connect" };
  disconnect: { type: "disconnect" };
};

class ClientEvent<T extends keyof ClientEventDataMap>
  extends GenericEvent<ClientEventDataMap[T]> {}

type ClientEventMap = {
  [K in keyof ClientEventDataMap]: ClientEvent<K>;
};

class Connection extends EventTarget {
  #websocket!: WebSocket;

  constructor() {
    super();
    this.#setupSocket();
  }

  #setupSocket() {
    const protocol = location.protocol === "http:" ? "ws" : "wss";
    this.#websocket = new WebSocket(`${protocol}://${location.host}`);

    this.#websocket.addEventListener("open", () => {
      this.dispatchEvent(
        new ClientEvent({ type: "connect" }),
      );
    });

    this.#websocket.addEventListener("message", (e) => {
      try {
        this.dispatchEvent(new ClientEvent(JSON.parse(e.data)));
      } catch {
        console.error("Received invalid JSON", e.data);
      }
    });

    this.#websocket.addEventListener("close", () => {
      console.log("Disconnected, reconnecting...");
      this.#setupSocket();
      this.dispatchEvent(new ClientEvent({ type: "disconnect" }));
    });
  }

  addEventListener<K extends keyof ClientEventMap>(
    type: K,
    listener: (this: Connection, ev: ClientEventMap[K]) => void,
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

export const ConnectionContext = createContext(new Connection());
