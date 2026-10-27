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
import { errorHandler } from "./middleware/error-handler.js";
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

// A05: the handler lives in its own file now (Lecture 16).
app.use(errorHandler);
