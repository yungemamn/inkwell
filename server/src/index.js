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
  console.error(err);

  // A 500 means something broke inside the server. err.message there is an
  // internal detail — a file path, a driver error — and the client has no use
  // for it, so it stays in the server log and the client gets one fixed
  // sentence. Errors that deliberately set a status keep their contract
  // message, because that message was written for the reader.
  const status = err.status || 500;

  if (status >= 500) {
    return res.status(status).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong on our end.",
      },
    });
  }

  res.status(status).json({
    error: { code: err.code || "VALIDATION_ERROR", message: err.message },
  });
});

app.listen(PORT, () => {
  console.log(`Inkwell API listening on port ${PORT}`);
});
