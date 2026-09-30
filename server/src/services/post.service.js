// server/src/services/post.service.js

import { PostRepository } from "../repositories/post.repository.js";
import { assertNonEmpty, ValidationError } from "../utils/validation.js";
import { SubstringSearchStrategy } from "./search/substring-search.strategy.js";
import { EventBus } from "../events/event-bus.js";

const searchStrategy = SubstringSearchStrategy; // swap this line to change search behavior system-wide

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

  async listPublished({ page = 1, pageSize = 10 }) {
    const { posts, hasMore } = await PostRepository.findPublished({ page, pageSize });
    return { posts, page, hasMore };
  },

  async search({ query, page = 1, pageSize = 10 }) {
    return searchStrategy.search(query, { page, pageSize });
  },
};
