import { isError } from "../../common/typeguards.ts";

type Method =
  | "delete"
  | "get"
  | "patch"
  | "post"
  | "put";

type PathParams<Path extends string> = Path extends
  `:${infer Param}/${infer Rest}` ? Param | PathParams<Rest>
  : Path extends `:${infer Param}` ? Param
  : Path extends `${infer _Prefix}:${infer Rest}` ? PathParams<`:${Rest}`>
  : never;

export type Handler<Params extends string = never> = (
  req: Request,
  params: { [param in Params]: string },
  previousResponse?: Response,
) => undefined | Response | Promise<undefined | Response>;

type RouteHandler<Path extends string = string> = Handler<PathParams<Path>>;

type AbstractRouter = Record<
  Method,
  <Path extends string>(
    pathname: Path,
    handler: RouteHandler<Path>,
  ) => void
>;

export class Router implements AbstractRouter {
  #routes: Record<
    Method,
    // deno-lint-ignore no-explicit-any
    { pattern: URLPattern; handler: RouteHandler<any> }[]
  > = {
    delete: [],
    get: [],
    patch: [],
    post: [],
    put: [],
  };

  use(handler: RouteHandler): void;
  use<Path extends string>(pathname: Path, handler: RouteHandler<Path>): void;
  use(arg1: RouteHandler | string, arg2?: RouteHandler) {
    const handler = typeof arg1 === "function" ? arg1 : arg2!;
    const pathname = typeof arg1 === "string" ? arg1 : undefined;

    const pattern = new URLPattern({ pathname });

    this.#routes.delete.push({ pattern, handler });
    this.#routes.patch.push({ pattern, handler });
    this.#routes.get.push({ pattern, handler });
    this.#routes.post.push({ pattern, handler });
    this.#routes.put.push({ pattern, handler });
  }

  delete<Path extends string>(path: Path, handler: RouteHandler<Path>) {
    this.#routes.delete.push({
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  patch<Path extends string>(path: Path, handler: RouteHandler<Path>) {
    this.#routes.patch.push({
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  get<Path extends string>(path: Path, handler: RouteHandler<Path>) {
    this.#routes.get.push({
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  post<Path extends string>(path: Path, handler: RouteHandler<Path>) {
    this.#routes.post.push({
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  put<Path extends string>(path: Path, handler: RouteHandler<Path>) {
    this.#routes.put.push({
      pattern: new URLPattern({ pathname: path }),
      handler,
    });
  }

  async route(request: Request): Promise<Response> {
    try {
      let resp: Response | undefined;

      const method = request.method.toLowerCase();
      if (!(method in this.#routes)) {
        return new Response(`Unsupported method: ${method}`, { status: 404 });
      }

      for (const { pattern, handler } of this.#routes[method as Method]) {
        const res = pattern.exec(request.url);
        if (!res) continue;

        resp = await handler(request, res.pathname.groups, resp);
      }

      if (resp) return resp;

      console.warn(new Date(), "Unhandled route:", request.url);
      return new Response("Not found", { status: 404 });
    } catch (err: unknown) {
      console.error(err);
      return new Response(
        `Unhandled exception: ${isError(err) ? err.message : err}`,
        {
          status: 500,
        },
      );
    }
  }
}

declare interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

declare type URLPatternInput = string | URLPatternInit;

declare interface URLPatternComponentResult {
  input: string;
  groups: Record<string, string>;
}

/** `URLPatternResult` is the object returned from `URLPattern.exec`. */
declare interface URLPatternResult {
  /** The inputs provided when matching. */
  inputs: [URLPatternInit] | [URLPatternInit, string];

  /** The matched result for the `protocol` matcher. */
  protocol: URLPatternComponentResult;
  /** The matched result for the `username` matcher. */
  username: URLPatternComponentResult;
  /** The matched result for the `password` matcher. */
  password: URLPatternComponentResult;
  /** The matched result for the `hostname` matcher. */
  hostname: URLPatternComponentResult;
  /** The matched result for the `port` matcher. */
  port: URLPatternComponentResult;
  /** The matched result for the `pathname` matcher. */
  pathname: URLPatternComponentResult;
  /** The matched result for the `search` matcher. */
  search: URLPatternComponentResult;
  /** The matched result for the `hash` matcher. */
  hash: URLPatternComponentResult;
}

declare class URLPattern {
  constructor(input: URLPatternInput, baseURL?: string);

  /**
   * Match the given input against the stored pattern.
   *
   * The input can either be provided as a url string (with an optional base),
   * or as individual components in the form of an object.
   *
   * ```ts
   * const pattern = new URLPattern("https://example.com/books/:id");
   *
   * // Match a url string.
   * let match = pattern.exec("https://example.com/books/123");
   * console.log(match.pathname.groups.id); // 123
   *
   * // Match a relative url with a base.
   * match = pattern.exec("/books/123", "https://example.com");
   * console.log(match.pathname.groups.id); // 123
   *
   * // Match an object of url components.
   * match = pattern.exec({ pathname: "/books/123" });
   * console.log(match.pathname.groups.id); // 123
   * ```
   */
  exec(input: URLPatternInput, baseURL?: string): URLPatternResult | null;
}
