# Review: Lecture 6 AuthService, PostService, and their routes (self-review, Workshop 10 Exercise 1)

**Reviewer prep time:** ~40 minutes (read every Lecture 6 file as it is now, then tried the edge cases with curl)
**Defects found:** 5 (3 fixed, 2 left for later)
**Outcome:** Accept with follow-up

Fixed in the follow-up commit:
1. The token secrets fell back to "dev-access-secret", which is in this public repo, and my .env never set them. I signed a token with that string and it published a post as another user. The server now won't start without both secrets (same rule as DATABASE_URL).
2. POST /api/auth/login with no email returned 500, because undefined went straight to Prisma. Now it's the same 401 INVALID_CREDENTIALS as a wrong password.
3. GET /api/posts?page=-1 returned 500 (negative skip). Anything below 1 now gets page 1.

Left for later:
- AuthService.register turns any error from UserRepository.create() into EMAIL_ALREADY_REGISTERED, so a database problem would tell the user their email is taken.
- The ValidationError to 400 block is copied in three route handlers. Small enough to leave.
- Not Lecture 6, but I noticed it: db/client.js imports @prisma/client outside repositories/. Its comment says that's the one intended exception, so the checklist line should probably say "or db/".
- Still open from before: a request with no token can put any authorId in the body (WATCH-LIST, Lecture 15's requireAuth).

Process: the Lecture 6 commit (9e29c14) doesn't name a backlog ID and didn't touch docs/BACKLOG.md.
