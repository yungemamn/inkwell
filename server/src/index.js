// server/src/index.js
//
// Entry point. As of Lecture 5, this file's only job is to assemble
// middleware and mount routers — it contains no business logic itself,
// consistent with ADR-001's layered architecture.

import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api", postRoutes);

app.use((err, req, res, next) => {
  // Anything that gets here is a bug, not something the user did. err.message
  // is internal stuff like a file path, so I keep it in the log and send back
  // one fixed sentence.
  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our end.",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});
