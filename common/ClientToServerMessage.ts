import { GuardedType, is } from "./typeguards.ts";

const isLoginMessage = is.object({
  type: is.const("login"),
  username: is.string,
});
export type LoginMessage = GuardedType<typeof isLoginMessage>;

const isLogoutMessage = is.object({
  type: is.const("logout"),
});
export type LogoutMessage = GuardedType<typeof isLogoutMessage>;

export const isClientToServerMessage = is.union(
  isLoginMessage,
  isLogoutMessage,
);
export type ClientToServerMessage = GuardedType<typeof isClientToServerMessage>;
export type ClientToServerMessageMap = {
  login: LoginMessage;
  logout: LogoutMessage;
};
