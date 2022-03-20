interface TypedBroadcastChannelEventMap<Message> {
  "message": MessageEvent<Message>;
  "messageerror": MessageEvent<Message>;
}

export class TypedBroadcastChannel<Message> {
  #broadcastChannel: BroadcastChannel;
  #listenerMap = new WeakMap<
    (
      this: TypedBroadcastChannel<Message>,
      ev: TypedBroadcastChannelEventMap<
        Message
      >[keyof TypedBroadcastChannelEventMap<Message>],
    ) => void,
    (
      this: BroadcastChannel,
      ev: BroadcastChannelEventMap[keyof BroadcastChannelEventMap],
    ) => void
  >();
  #typeguard?: (message: unknown) => message is Message;
  onTypeError?: (ev: MessageEvent) => void;

  constructor(
    name: string,
    /**
     * Enforces incoming messages match. Useful if nodes may have mixed
     * versioning. #onTypeError is invoked if the typeguard fails.
     */
    typeguard?: (message: unknown) => message is Message,
  ) {
    this.#broadcastChannel = new BroadcastChannel(name);
    this.#typeguard = typeguard;
  }

  postMessage(message: Message) {
    this.#broadcastChannel.postMessage(message);
  }

  addEventListener<K extends keyof TypedBroadcastChannelEventMap<Message>>(
    type: K,
    listener: (
      this: TypedBroadcastChannel<Message>,
      ev: TypedBroadcastChannelEventMap<Message>[K],
    ) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const wrapped = (ev: BroadcastChannelEventMap[K]) => {
      if (this.#typeguard) {
        if (this.#typeguard(ev.data)) listener.call(this, ev);
        else this.onTypeError?.(ev);
      } else listener.call(this, ev);
    };
    this.#listenerMap.set(listener, wrapped);
    this.#broadcastChannel.addEventListener(type, wrapped, options);
  }

  removeEventListener<K extends keyof TypedBroadcastChannelEventMap<Message>>(
    type: K,
    listener: (
      this: TypedBroadcastChannel<Message>,
      ev: TypedBroadcastChannelEventMap<Message>[K],
    ) => void,
    options?: boolean | EventListenerOptions,
  ): void {
    const wrapped = this.#listenerMap.get(listener);
    if (!wrapped) return;
    this.#broadcastChannel.removeEventListener(type, wrapped, options);
  }
}
