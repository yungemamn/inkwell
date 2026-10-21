// server/src/app.js
//
// Extracted from index.js so tests (and this file) can import the
// Express app without binding a real port — index.js now only
// handles process startup (app.listen), not app construction.

import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import statsRoutes from "./routes/stats.routes.js";
// Lecture 9's listeners register themselves as a side effect on
// import -- carry them over from index.js
import "./events/listeners/log-published-posts.listener.js";
import "./events/listeners/count-published-posts.listener.js";

export const app = express();
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", statsRoutes);

// Carried over from index.js (Lecture 7 version, not the handout's).
// The handout's handler sends err.message back, which is the leak I
// fixed in Lecture 7, so this keeps the fixed one.
app.use((err, req, res, next) => {
  console.error(err);

  // express's own JSON parser throws a 400 when the body is not valid JSON,
  // and that one is the caller's fault, so it keeps its status.
  if (err.status === 400) {
    return res.status(400).json({
      error: { code: "BAD_JSON", message: "The request body was not valid JSON." },
    });
  }

  // Anything else is a bug on my side. err.message is internal stuff like a
  // file path, so I keep it in the log and send back one fixed sentence.
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong on our end." },
  });
});
