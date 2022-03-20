export class GenericEvent<T extends { type: string }> extends Event {
  readonly type!: T["type"];
  readonly data: T;

  constructor(data: T) {
    super(data.type);
    this.data = data;
  }
}
