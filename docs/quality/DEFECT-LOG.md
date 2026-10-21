# Inkwell Defect Log

| ID | Found During | Cause Category | Description | Remediation |
|----|---------------|-----------------|--------------|-------------|
| D-001 | Lecture 10 review | Compatibility | Nullish-coalescing assignment used without a documented minimum Node version | Added engines field to package.json |
| D-002 | Lecture 7 exercise | Security | Register and login sent the bcrypt passwordHash back to the client | toUserPublic() in AuthService (9552d4c) |
| D-003 | Lecture 7 exercise | Security | Error responses echoed err.message, which can show file paths | Fixed "Something went wrong on our end." message (9552d4c) |
| D-004 | Lecture 7 audit | Regression | My error handler change turned express's 400 for bad JSON into a 500 | Let err.status 400 through as BAD_JSON (43c5cab) |
| D-005 | Lecture 8 manual testing | Missing validation | Publishing with no authorId and no token gives a 500 instead of a 400 | Open. On the WATCH-LIST for Lecture 15's requireAuth |
| D-006 | Lecture 9 manual testing | Integration | The handout's second GET /posts route never runs because express uses the first match | One handler for feed and search (57440f4) |
| D-007 | Lecture 9 manual testing | Logic | post.published sent the tag names as typed, so duplicates went out | Send the saved tag names (313f0d8) |
| D-008 | Lecture 10 self-review | Security | Token secrets fell back to "dev-access-secret", which is public in the repo | Server won't start without both secrets (1e754f3) |
| D-009 | Lecture 10 self-review | Missing validation | Login with no email gave a 500 | Returns 401 INVALID_CREDENTIALS (1e754f3) |
| D-010 | Lecture 10 self-review | Missing validation | GET /api/posts?page=-1 gave a 500 | Pages under 1 become page 1 (1e754f3) |
| D-011 | Lecture 10 self-review | Logic | register() reports any database error as EMAIL_ALREADY_REGISTERED | Open. Noted in docs/reviews/2026-lecture-06-auth-and-posts.md. Lecture 12's row 6 test expects this behavior, so the fix has to change that test too |
| D-012 | Lecture 12 unit tests | Test defect | The handout's publish() test mocks createWithTags without tags, so publish() hits post.tags.map on undefined and the test fails with a TypeError. The real repository always returns tags | Mock returns tags: [] like the real one (9a9c6e8) |
| D-013 | Lecture 12 unit tests | Interface | search() returned { posts, hasMore } with no page field, unlike the feed | search() returns page too, api-contract.md updated (c027653) |
| D-014 | Lecture 12 unit tests | Missing validation | A blank or missing search query went to the database, so ?search=%20%20 gave a 200 instead of an error | search() rejects it, the route returns 400 MISSING_QUERY (c027653). The route part has no automated test yet, the Lecture 13 integration tests will cover it |
| D-015 | Lecture 13 setup | Configuration | The handout says server/.env.test falls under "the same .gitignore rule as .env", but the root .gitignore only listed .env, so git saw .env.test as a new file it could commit | Added .env.test to .gitignore (aa3b336) |
