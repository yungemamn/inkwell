// server/src/routes/post.routes.js
//
// Wires PostService's publish(), listPublished() and search() to
// the API contract's POST /api/posts and GET /api/posts (Lectures 4 and 9).
// Same thin-route discipline as auth.routes.js: no business rules here.

import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ValidationError } from "../utils/validation.js";

const router = Router();

router.post("/posts", requireAuth, async (req, res, next) => {
  try {
    const { title, body, tagNames } = req.body;

    // Never trust client-supplied identity fields. Lecture 9 read the
    // token here when one was sent but fell back to req.body.authorId
    // when it wasn't, so a request with no Authorization header could
    // publish as anybody. requireAuth now makes the token the only way
    // in, and the author comes from the verified token every time.
    const post = await PostService.publish({
      title,
      body,
      tagNames,
      authorId: req.user.id,
    });
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
    // ?page=-1 used to turn into a negative skip and a 500, so anything
    // below 1 (or not a number) gets page 1
    const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
    const { search } = req.query;
    const result = search
      ? await PostService.search({ query: search, page })
      : await PostService.listPublished({ page });
    res.status(200).json(result);
  } catch (err) {
    // ?search=%20%20 is truthy, so it gets to search() and comes back here
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: { code: err.code, message: err.message },
      });
    }
    next(err);
  }
});

export default router;
