// server/src/routes/stats.routes.js
//
// GET /api/stats (Workshop 9, Exercise 1). Public and read-only.

import { Router } from "express";
import { StatsService } from "../services/stats.service.js";

const router = Router();

router.get("/stats", (req, res) => {
  res.status(200).json(StatsService.getStats());
});

export default router;
