// server/src/services/post.service.js

import { PostRepository } from "../repositories/post.repository.js";
import { assertNonEmpty, ValidationError } from "../utils/validation.js";
import { SubstringSearchStrategy } from "./search/substring-search.strategy.js";
import { EventBus } from "../events/event-bus.js";

const searchStrategy = SubstringSearchStrategy; // swap this line to change search behavior system-wide

// Lecture 15, Exercise 1 -- the denial-of-service row of the threat model.
// A page size the caller picks with no ceiling lets one request ask the
// database for every post at once, so a handful of requests can tie the
// server up. The cap is here rather than in the route so every caller
// gets it, and a request over the cap is served at the cap instead of
// being refused: an oversized page is a client mistake, not an attack
// worth a 400, and the response says which size was actually used.
const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

function clampPageSize(requested) {
  const size = Math.floor(Number(requested));
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export const PostService = {
  async publish({ authorId, title, body, tagNames = [] }) {
    assertNonEmpty(title, "title", "MISSING_TITLE");
    assertNonEmpty(body, "body", "MISSING_BODY");
    // tagNames: "design" instead of ["design"] would crash on .map() in the
    // repository and come back as a 500, so catch it here as a 400
    if (!Array.isArray(tagNames) || !tagNames.every((name) => typeof name === "string")) {
      throw new ValidationError("tagNames must be a list of strings.", "INVALID_TAGS");
    }

    const post = await PostRepository.createWithTags({
      authorId, title, body, tagNames,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    EventBus.emit("post.published", {
      postId: post.id,
      authorId,
      title: post.title,
      // the tags that were actually saved (trimmed, no repeats), not the raw input
      tags: post.tags.map(({ tag }) => tag.name),
    });

    return post;
  },

  async listPublished({ page = 1, pageSize }) {
    const size = clampPageSize(pageSize);
    const { posts, hasMore } = await PostRepository.findPublished({ page, pageSize: size });
    return { posts, page, pageSize: size, hasMore };
  },

  async search({ query, page = 1, pageSize }) {
    // a blank or missing query used to go straight down to Prisma and come
    // back as a 200 with no posts, which looks like "nothing matched"
    assertNonEmpty(query, "search", "MISSING_QUERY");
    const size = clampPageSize(pageSize);
    const { posts, hasMore } = await searchStrategy.search(query, { page, pageSize: size });
    // same shape as listPublished(), so the client can page through results
    return { posts, page, pageSize: size, hasMore };
  },
};
