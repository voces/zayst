import { serve } from "https://deno.land/std@0.126.0/http/server.ts";
import { router } from "./router.ts";
import { Client } from "./websockets/Client.ts";

const port = parseInt(Deno.env.get("PORT") ?? "NaN") || 3000;

console.log(new Date(), "Listening on", port);

serve((req, connInfo) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return router.route(req);
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  new Client(socket, connInfo);
  return response;
}, { port });
