import { Handler } from "../util/Router.ts";

export const getHello: Handler<"name"> = (_, { name }) =>
  new Response(`Hello, ${name}!`);
