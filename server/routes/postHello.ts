import { is } from "../../common/typeguards.ts";
import { Handler } from "../util/Router.ts";

const isPostHelloBody = is.object({
  name: is.string,
});

export const postHello: Handler = async (req) => {
  const json = await req.json();
  if (!isPostHelloBody(json)) throw new Error("Bad body");
  return new Response(`Hello, ${json.name}!`);
};
