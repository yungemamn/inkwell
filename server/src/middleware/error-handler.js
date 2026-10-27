// server/src/middleware/error-handler.js
//
// A05's fix, pulled out of app.js into its own file. The rule is that the
// client never learns anything about the inside of the server: no stack
// traces, no file paths, no library messages. Those go to the log.

import { logger } from "../lib/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error({ event: "request.failed", err: err.message, stack: err.stack }, "Unhandled error");

  const isProd = process.env.NODE_ENV === "production";

  // express's own JSON parser throws a 400 when the body is not valid JSON,
  // and that one is the caller's fault, so it keeps its status. Dropping
  // this would undo D-004, which is why I did not take the handout's
  // handler as it is written.
  if (err.status === 400) {
    return res.status(400).json({
      error: { code: "BAD_JSON", message: "The request body was not valid JSON." },
    });
  }

  // Anything else is a bug on my side. In production the client gets one
  // fixed sentence; in development I let the real message through, because
  // it is my own machine and it makes debugging much faster.
  res.status(err.status || 500).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: isProd ? "Something went wrong on our end." : err.message,
    },
  });
}
