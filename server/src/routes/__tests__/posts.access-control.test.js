// server/src/routes/__tests__/posts.access-control.test.js
//
// Lecture 16, A01. These are ownership tests, not login tests. Lecture 15
// already proved you need a token; what matters here is that having a
// valid token for the wrong account still isn't enough.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import {
  resetDatabase,
  createTestUser,
  createTestPost,
  tokenFor,
} from "../../test-utils/fixtures.js";
import { resetAuthRateLimit } from "../../middleware/rate-limit.middleware.js";

beforeEach(async () => {
  await resetDatabase();
  resetAuthRateLimit();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("a user cannot delete another user's post (A01 regression test)", async () => {
  const owner = await createTestUser();
  const attacker = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set("Authorization", `Bearer ${tokenFor(attacker)}`);

  expect(res.status).toBe(403);
  expect(res.body.error.code).toBe("FORBIDDEN");

  // and the post is still there
  expect(await prisma.post.findUnique({ where: { id: post.id } })).not.toBeNull();
});

test("the owner can delete their own post", async () => {
  const owner = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set("Authorization", `Bearer ${tokenFor(owner)}`);

  expect(res.status).toBe(204);
  expect(await prisma.post.findUnique({ where: { id: post.id } })).toBeNull();
});

test("deleting a post that was tagged does not fail on the foreign key", async () => {
  // Without onDelete: Cascade on PostTag this is a Prisma P2003 and a 500.
  const owner = await createTestUser();
  const token = tokenFor(owner);
  const published = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Tagged", body: "Has tags.", tagNames: ["design", "lox"] });
  expect(published.status).toBe(201);

  const res = await request(app)
    .delete(`/api/posts/${published.body.id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(204);
  expect(await prisma.postTag.count()).toBe(0);
  // the tags themselves survive, only the join rows go
  expect(await prisma.tag.count()).toBe(2);
});

test("deleting without a token is a 401, not a 403", async () => {
  const owner = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app).delete(`/api/posts/${post.id}`);

  expect(res.status).toBe(401);
  expect(res.body.error.code).toBe("UNAUTHENTICATED");
});

test("deleting a post that does not exist is a 404", async () => {
  const owner = await createTestUser();

  const res = await request(app)
    .delete("/api/posts/does-not-exist")
    .set("Authorization", `Bearer ${tokenFor(owner)}`);

  expect(res.status).toBe(404);
  expect(res.body.error.code).toBe("NOT_FOUND");
});
