// server/src/repositories/post.repository.js

import { prisma } from "../db/client.js";
import { PUBLIC_USER_SELECT, toPublicUser } from "../dto/user.dto.js";

export const PostRepository = {
  create({ authorId, title, body, status, publishedAt }) {
    return prisma.post.create({
      data: { authorId, title, body, status, publishedAt },
    });
  },

  // The handout calls this from PostService.publish() but never shows it.
  // Each tag is found by its unique name or made on the spot, so "design"
  // is one Tag row no matter how many posts use it.
  createWithTags({ authorId, title, body, tagNames, status, publishedAt }) {
    const names = [...new Set(tagNames.map((name) => name.trim()).filter(Boolean))];
    return prisma.post.create({
      data: {
        authorId,
        title,
        body,
        status,
        publishedAt,
        tags: {
          create: names.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  },

  findById(id) {
    return prisma.post.findUnique({ where: { id } });
  },

  deleteById(id) {
    return prisma.post.delete({ where: { id } });
  },

  async findPublished({ page, pageSize }) {
    const rows = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: { author: { select: PUBLIC_USER_SELECT } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1, // fetch one extra row to compute hasMore
    });
    const hasMore = rows.length > pageSize;
    return {
      posts: rows.slice(0, pageSize).map((post) => ({ ...post, author: toPublicUser(post.author) })),
      hasMore,
    };
  },

  async searchPublished({ query, page, pageSize }) {
    const where = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    };
    const rows = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize + 1,
      // the author fields the feed is allowed to show, named once in
      // user.dto.js instead of spelled out here (Lecture 15)
      include: { author: { select: PUBLIC_USER_SELECT } },
    });
    const hasMore = rows.length > pageSize;
    return {
      posts: rows.slice(0, pageSize).map((post) => ({ ...post, author: toPublicUser(post.author) })),
      hasMore,
    };
  },
};
