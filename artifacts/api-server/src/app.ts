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

// Disable Express's automatic ETag generation. Combined with stripping
// conditional request headers below, this guarantees /api responses are
// always served as a 200 with a full body — never a 304 with empty body.
app.set("etag", false);

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
// Belt-and-braces approach to make 304s impossible:
//   1. `app.set("etag", false)` above stops the server from generating an
//      ETag on outbound responses, so future requests have nothing to
//      revalidate against.
//   2. Strip incoming `If-None-Match` and `If-Modified-Since` headers so
//      Express's freshness check (req.fresh) never matches and never
//      returns a 304 — even when an old browser cache is still sending
//      conditional headers from before the fix shipped.
//   3. Send `Cache-Control: no-store, no-cache, must-revalidate` so any
//      shared cache (browser, proxy, CDN) immediately drops the response.
app.use("/api", (req, res, next) => {
  delete req.headers["if-none-match"];
  delete req.headers["if-modified-since"];
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});
app.use("/api", router);

export default app;
