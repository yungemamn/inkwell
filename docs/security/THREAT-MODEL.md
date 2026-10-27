# Inkwell Threat Model (Lecture 15)

STRIDE applied to Inkwell's attack surface as it actually stood at the start of
Lecture 15. STRIDE is a checklist of six kinds of threat — Spoofing, Tampering,
Repudiation, Information Disclosure, Denial of Service, and Elevation of
Privilege — used so the search for problems is systematic instead of whatever
comes to mind.

Every row below was checked against the running server before it was written
down, not copied from the lecture handout. Two of the handout's four rows did
not describe this repository, and they are corrected here rather than repeated.

## Attack Surface

- POST /api/auth/register — unauthenticated, accepts email/displayName/password
- POST /api/auth/login — unauthenticated, accepts email/password
- POST /api/posts — was *effectively* unauthenticated, accepts title/body/tagNames
- GET /api/posts — unauthenticated, returns the paginated feed and search results
- GET /api/stats — unauthenticated, returns a count of posts published since startup
- JWT access tokens — bearer, sent in the Authorization header

## STRIDE Analysis, with Risk Rating

| Component | Threat | Category | Likelihood | Impact | Risk Rating | Mitigation |
|---|---|---|---|---|---|---|
| POST /api/posts | A request with no Authorization header can put any user's `authorId` in the body and publish as them | Spoofing | High | High | Critical | Derive the author from the verified token, never from the request body (Section 1.3) |
| GET /api/posts | A future `include: { author: true }` would put the author's email and passwordHash in the feed. Not currently leaking — see "Checked, not assumed" below | Information Disclosure | Medium | High | Medium | Explicit response shaping / DTO, as structural prevention (Section 1.4) |
| POST /api/auth/login | Unlimited login attempts enable brute-force credential guessing | Denial of Service / Broken Auth | Medium | High | High | Rate limiting (Section 1.5) |
| POST /api/posts | Untrusted `body` content rendered unsanitized on the client, enabling stored XSS | Tampering / Info Disclosure | Medium | High | High | Output encoding on render, verified by regression test (Section 1.6) |
| GET /api/posts | An unbounded caller-supplied page size lets one request pull every post at once | Denial of Service | Medium | Medium | Medium | Maximum page size enforced in PostService (Exercise 1) |

The Likelihood, Impact and Risk Rating columns exist so the findings can be
ranked. Without them a team tends to fix whichever issue is loudest or newest
rather than the most dangerous one.

## Checked, not assumed

The handout's table describes a reference version of Inkwell. Each row was
re-tested against this repository before being accepted:

| Handout's claim | What this repository actually did | Verdict |
|---|---|---|
| `POST /api/posts` trusts the client's `authorId` | Confirmed. With no Authorization header, a request naming another user's id returned 201 and saved the post under that user | True, and the most serious finding |
| The feed returns fields beyond what it needs, "e.g. email" | False here. The feed returned no author object at all, and search used an explicit `select: { id, displayName }` added in Lecture 9. `grep email` over both responses found nothing | Corrected: the risk is latent, not present. The DTO is prevention, not a repair |
| Unlimited login attempts | Confirmed. Eight consecutive wrong passwords all returned 401 with no lockout | True |
| Stored XSS in `post.body` | Not reachable. `PostCard` and `Feed` render `{post.body}` as text, and React escapes it. The real risk is a future change to `dangerouslySetInnerHTML` | Corrected: this is a regression test over an existing protection, not a fix |

This is the difference between functional testing and security testing.
Functional tests check that the system can do what is expected of it. Security
tests check that it cannot do what was never intended. Lectures 12 to 14 never
caught the spoofing bug because every one of those tests supplied a correct and
honest `authorId`.

## Authentication is not authorization

Requiring a valid token is not enough on its own. Amy can send her own valid
token and put Ben's id in the body: authentication succeeds, because the token
is genuinely hers. Only using `req.user.id` — which comes from the verified
token — instead of `req.body.authorId` stops it. Authentication confirms the
user is who they say. Authorization confirms they may act only as themselves.
The vulnerability lives in the gap where the first is added and the second is
not. Both cases are covered by tests in
`server/src/routes/__tests__/security.integration.test.js`.
