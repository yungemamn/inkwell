// server/src/routes/__tests__/search.integration.test.js
//
// D-014 left the route half of the blank-search fix with no automated
// test (Lecture 12's tests only reach PostService). This sends the real
// request through the real route and database.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { createTestUser, resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("a search of only spaces gets a 400, not an empty 200 (D-014)", async () => {
  const res = await request(app).get("/api/posts?search=%20%20");

  expect(res.status).toBe(400);
  expect(res.body.error.code).toBe("MISSING_QUERY");
});

test("search ignores upper and lower case against the real database (US-11)", async () => {
  // Lecture 12 couldn't test this: mode "insensitive" happens in Prisma,
  // and those tests had a fake repository
  const author = await createTestUser();
  await prisma.post.create({
    data: { authorId: author.id, title: "Design Systems", body: "Notes.", status: "PUBLISHED", publishedAt: new Date() },
  });

  const res = await request(app).get("/api/posts?search=design");

  expect(res.status).toBe(200);
  expect(res.body.posts).toHaveLength(1);
  expect(res.body.posts[0].title).toBe("Design Systems");
  expect(res.body.page).toBe(1);
});
