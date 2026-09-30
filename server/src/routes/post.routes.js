// server/src/routes/post.routes.js
//
// Wires PostService's publish(), listPublished() and search() to
// the API contract's POST /api/posts and GET /api/posts (Lectures 4 and 9).
// Same thin-route discipline as auth.routes.js: no business rules here.

import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { TokenService } from "../services/token.service.js";
import { ValidationError } from "../utils/validation.js";

const router = Router();

router.post("/posts", async (req, res, next) => {
  try {
    const { title, body, tagNames } = req.body;

    // The handout's Section 2.6 request sends a bearer token and no authorId,
    // so the author has to come from the token. This is a stopgap until
    // Lecture 15's requireAuth. With no token, the old body authorId still
    // works so nothing that already used it breaks.
    let authorId = req.body.authorId;
    const header = req.get("Authorization") ?? "";
    if (header.startsWith("Bearer ")) {
      try {
        authorId = TokenService.verifyAccessToken(header.slice(7)).sub;
      } catch {
        return res.status(401).json({
          error: { code: "INVALID_TOKEN", message: "Your session has expired. Please log in again." },
        });
      }
    }

    const post = await PostService.publish({ authorId, title, body, tagNames });
    res.status(201).json(post);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: { code: err.code, message: err.message },
      });
    }
    // Anything else is a bug, not something the user did. Hand it to the
    // error handler so its message is logged instead of returned.
    next(err);
  }
});

// One handler for both the feed and search. The handout's Section 2.4 route
// is added as a second GET /posts, but express runs the first match and the
// first one never looks at ?search=, so this replaces it instead.
router.get("/posts", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const { search } = req.query;
    const result = search
      ? await PostService.search({ query: search, page })
      : await PostService.listPublished({ page });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
