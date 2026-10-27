// server/src/routes/__tests__/auth.integration.test.js
//
// Lecture 13, Exercise 1: registration and login working together.
// Same setup as posts.integration.test.js: the real app, real services,
// real repositories and the inkwell_test database, nothing mocked.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";
import { resetAuthRateLimit } from "../../middleware/rate-limit.middleware.js";

beforeEach(async () => {
  await resetDatabase();
  // Lecture 15: the auth rate limiter counts failed attempts in one
  // process-wide store, so each file starts from a clean count
  resetAuthRateLimit();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("a user who registers can log in with the same email and password (US-01, US-02)", async () => {
  // Arrange: register through the API, not a fixture, so both routes run
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: "bob@example.com", displayName: "Bob", password: "correcthorse" });
  expect(registerRes.status).toBe(201);

  // Act: log in with what was just registered
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "bob@example.com", password: "correcthorse" });

  // Assert: login finds the same user that register saved
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.user.id).toBe(registerRes.body.user.id);
  expect(loginRes.body.user.email).toBe("bob@example.com");
  expect(loginRes.body.user).not.toHaveProperty("passwordHash");
  expect(loginRes.body.accessToken).toEqual(expect.any(String));
  expect(loginRes.body.refreshToken).toEqual(expect.any(String));

  // Assert: the login token actually works. Publishing with it saves the
  // post under Bob's id, which only happens if the token is real
  const publishRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
    .send({ title: "Logged in", body: "Posted with the login token." });
  expect(publishRes.status).toBe(201);
  expect(publishRes.body.authorId).toBe(registerRes.body.user.id);
});

test("the wrong password after registering is rejected (US-02 extension)", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ email: "bob@example.com", displayName: "Bob", password: "correcthorse" });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "bob@example.com", password: "wrongpassword" });

  expect(loginRes.status).toBe(401);
  expect(loginRes.body.error.code).toBe("INVALID_CREDENTIALS");
  expect(loginRes.body).not.toHaveProperty("accessToken");
});
