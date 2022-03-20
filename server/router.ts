import { route404 } from "./middleware/404.ts";
import { beginLogger } from "./middleware/beginLogger.ts";
import { endLogger } from "./middleware/endLogger.ts";
import { staticServe } from "./middleware/staticServe.ts";
import { getHello } from "./routes/getHello.ts";
import { postHello } from "./routes/postHello.ts";
import { Router } from "./util/Router.ts";

export const router = new Router();

router.use(beginLogger);
router.get("/api/hello/:name", getHello);
router.post("/api/goodbye", postHello);
router.use(staticServe("public"));
router.use(route404);
router.use(endLogger);
