import { Handler } from "../util/Router.ts";

export const route404: Handler = (_, _2, prev) => {
  if (prev) return prev;

  return new Response("Not found", { status: 404 });
};
