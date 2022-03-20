import { Handler } from "../util/Router.ts";
import { logMap } from "./beginLogger.ts";

const sizes = ["B", "KB", "MB", "GB", "TB"];

const prettySize = (size: number) => {
  if (Number.isNaN(size)) return "";

  let exp = 0;
  while (size >= 1024 && exp < sizes.length) {
    size /= 1024;
    exp++;
  }

  return Math.round(size) + sizes[exp];
};

export const endLogger: Handler = (req, _, prev) => {
  const data = logMap.get(req);

  if (!data) console.log(new Date(), req.method, prev?.status, req.url);
  else {
    console.log(
      new Date(),
      req.method,
      prev?.status,
      req.url,
      Date.now() - data.start + "ms",
      prettySize(parseInt(prev?.headers.get("content-length") ?? "")),
    );
  }

  return prev;
};
