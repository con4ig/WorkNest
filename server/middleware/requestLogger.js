// HTTP request logging + request-ID propagation.
//
// `pino-http` attaches a child logger to `req.log` carrying a stable
// request ID (auto-generated, or whatever the client sent in the
// `X-Request-Id` header). The same ID is echoed back in the response
// header so a caller can correlate their failure with a server log
// line without grep-ing across a haystack.
//
// `health` and Swagger UI assets are silenced — they otherwise dominate
// the log volume on platforms like Render that probe every few seconds.

import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import logger from "../lib/logger.js";

const isTest = process.env.NODE_ENV === "test";

const requestLogger = pinoHttp({
  logger,
  // Quiet in tests so Vitest output stays readable.
  enabled: !isTest,

  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const id = incoming || randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    if (res.statusCode >= 300) return "silent";
    return "info";
  },

  // Skip noisy endpoints — health probes and docs assets.
  autoLogging: {
    ignore: (req) =>
      req.url === "/api/health" ||
      req.url === "/ping" ||
      req.url === "/favicon.ico" ||
      req.url.startsWith("/api/docs"),
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        // `req.user` is populated after `authenticate`; safe to surface.
        userId: req.raw?.user?._id?.toString(),
        company: req.raw?.user?.company?._id?.toString(),
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});

export default requestLogger;
