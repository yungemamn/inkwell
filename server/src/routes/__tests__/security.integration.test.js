// server/src/routes/__tests__/security.integration.test.js
//
// Lecture 15: the threat model's mitigations, checked through the real
// app, services, repositories and test database. These are security
// tests, not functional ones -- each asserts that the system CANNOT do
// something, which is why the earlier suites never caught any of it.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";
import { resetAuthRateLimit } from "../../middleware/rate-limit.middleware.js";

beforeEach(async () => {
  await resetDatabase();
  // the limiter's counter is one object for the whole process, so without
  // this the failed logins in the other test files count against this one
  resetAuthRateLimit();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function registerUser(email, displayName) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, displayName, password: "correcthorse" });
  expect(res.status).toBe(201);
  return res.body;
}

describe("spoofing: POST /api/posts", () => {
  test("refuses to publish without a token (it used to accept the body's authorId)", async () => {
    const victim = await registerUser("victim@example.com", "Victim");

    const res = await request(app)
      .post("/api/posts")
      .send({ authorId: victim.user.id, title: "Not mine", body: "Published by nobody." });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
    // and nothing was written
    const feed = await request(app).get("/api/posts");
    expect(feed.body.posts).toHaveLength(0);
  });

  test("a valid token cannot publish as somebody else", async () => {
    const attacker = await registerUser("attacker@example.com", "Attacker");
    const victim = await registerUser("victim@example.com", "Victim");

    // Alice's own token, Bob's id in the body -- authentication passes,
    // so only the authorization rule stops this
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${attacker.accessToken}`)
      .send({ authorId: victim.user.id, title: "Whose post?", body: "..." });

    expect(res.status).toBe(201);
    expect(res.body.authorId).toBe(attacker.user.id);
    expect(res.body.authorId).not.toBe(victim.user.id);
  });

  test("a made-up token is rejected", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer not.a.real.token")
      .send({ title: "x", body: "y" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });
});

describe("information disclosure: GET /api/posts", () => {
  test("the feed shows the author's display name and never the email or hash", async () => {
    const author = await registerUser("author@example.com", "Author");
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${author.accessToken}`)
      .send({ title: "Public", body: "Body text." });

    const feed = await request(app).get("/api/posts");

    expect(feed.status).toBe(200);
    expect(feed.body.posts[0].author).toEqual({ id: author.user.id, displayName: "Author" });
    // checked on the whole serialized response, not just the field we
    // expected to be wrong, so a leak anywhere in the shape fails this
    expect(JSON.stringify(feed.body)).not.toContain("author@example.com");
    expect(JSON.stringify(feed.body)).not.toContain("passwordHash");
  });
});

describe("denial of service: POST /api/auth/login", () => {
  test("a sixth failed login in the window is refused", async () => {
    await registerUser("target@example.com", "Target");

    const codes = [];
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "target@example.com", password: `wrong${attempt}` });
      codes.push(res.status);
    }

    expect(codes).toEqual([401, 401, 401, 401, 401, 429]);
  });

  test("failing the login limit does not also block registration (D-020)", async () => {
    await registerUser("target@example.com", "Target");

    for (let attempt = 1; attempt <= 6; attempt += 1) {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "target@example.com", password: `wrong${attempt}` });
    }
    // login is locked
    const lockedOut = await request(app)
      .post("/api/auth/login")
      .send({ email: "target@example.com", password: "correcthorse" });
    expect(lockedOut.status).toBe(429);

    // a different person signing up is not
    const newcomer = await request(app)
      .post("/api/auth/register")
      .send({ email: "newcomer@example.com", displayName: "Newcomer", password: "correcthorse" });
    expect(newcomer.status).toBe(201);
  });

  test("successful logins do not count toward the limit", async () => {
    await registerUser("target@example.com", "Target");

    for (let attempt = 1; attempt <= 8; attempt += 1) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "target@example.com", password: "correcthorse" });
      expect(res.status).toBe(200);
    }
  });
});

describe("denial of service: GET /api/posts page size (Exercise 1)", () => {
  test("an oversized pageSize is clamped to the maximum", async () => {
    const res = await request(app).get("/api/posts?pageSize=100000");

    expect(res.status).toBe(200);
    expect(res.body.pageSize).toBe(50);
  });

  test("a page size within the limit is honoured, and junk falls back to the default", async () => {
    expect((await request(app).get("/api/posts?pageSize=25")).body.pageSize).toBe(25);
    expect((await request(app).get("/api/posts?pageSize=abc")).body.pageSize).toBe(10);
    expect((await request(app).get("/api/posts?pageSize=-5")).body.pageSize).toBe(10);
    expect((await request(app).get("/api/posts")).body.pageSize).toBe(10);
  });
});
