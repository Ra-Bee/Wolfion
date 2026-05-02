import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import pinoHttp from "pino-http";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "32mb" }));
app.use(express.urlencoded({ extended: true, limit: "32mb" }));

app.use(clerkMiddleware());

// Disable ETag-based 304 responses for /api/*. Without this, browsers (and
// PWAs/TWAs in particular) HTTP-cache JSON responses, then revalidate with
// If-None-Match. The server responds 304 with an empty body. Some runtimes
// (notably Android WebView inside a TWA) hand that 304 to JS as a real empty
// response instead of substituting the cached body. Our generic API client
// then treats it as `null`, which makes pages like /products appear empty
// even though the server has data.
//
// Sending `Cache-Control: no-store` instructs the browser to drop the
// response immediately, so no conditional request ever fires and we always
// get a fresh 200 with the full body. The payload is small (a few KB) so
// the bandwidth cost is negligible.
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use("/api", router);

export default app;
