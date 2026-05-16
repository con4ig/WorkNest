// Centralised pino logger.
//
// - In `development` we pipe through `pino-pretty` for human-readable
//   colourised output.
// - In `production` we emit single-line JSON so downstream log shippers
//   (Loki, CloudWatch, Better Stack) can parse without help.
// - In `test` we silence everything below `error` to keep CI logs clean.
//
// Redact patterns scrub anything that looks like credentials or PII out
// of the structured log payload before serialization — defence in depth
// for the case where someone accidentally `logger.info(req.body)`.

import pino from "pino";

const env = process.env.NODE_ENV || "development";

const baseOptions = {
  level: process.env.LOG_LEVEL || (env === "production" ? "info" : "debug"),
  base: {
    service: "worknest-api",
    env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.peselOrId",
    ],
    censor: "[REDACTED]",
  },
};

let transport;
if (env === "development") {
  transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname,service,env",
    },
  };
}

const logger =
  env === "test"
    ? pino({ ...baseOptions, level: "error" })
    : pino({ ...baseOptions, transport });

export default logger;
