import { GuardedType, is } from "../../common/typeguards.ts";

const isTransferEntityEvent = is.object({
  type: is.const("transferEntity"),
  entityId: is.string,
});
type TransferEntityEvent = GuardedType<typeof isTransferEntityEvent>;

export const isServerToServerMessage = is.union(isTransferEntityEvent);
export type ServerToServerMessage = GuardedType<typeof isServerToServerMessage>;
export type ServerToServerMessageMap = {
  transferEntity: TransferEntityEvent;
};
