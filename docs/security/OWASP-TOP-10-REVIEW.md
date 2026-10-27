# Inkwell OWASP Top 10 Review (Lecture 16)

Lecture 15 built a STRIDE table from scratch. This pass does the same job with
somebody else's finished checklist: walk all ten OWASP categories in order and
write down what each one means for Inkwell, including the ones that turn out to
need nothing.

Every row below was checked against this repository before it was written.
Three categories needed no change. A review that finds ten new problems is not
the goal; recording that a category does not currently apply, and why, is worth
as much, because it stops the next person re-running the same investigation
from nothing.

| # | Category | Status in Inkwell | Action |
|---|---|---|---|
| A01 | Broken Access Control | The one identity bug, body `authorId` spoofing, was fixed in Lecture 15. But no owner-scoped route existed yet, so nothing had ever had to answer "may this user act on *this row*" | Fixed — Section 1.2. DELETE /api/posts/:id is the first such route and ships with the ownership check |
| A02 | Cryptographic Failures | Already fixed. Passwords have used bcrypt since Lecture 6. The hardcoded `"dev-access-secret"` JWT fallback was D-008, found and removed in Lecture 10 | No action needed, verified only |
| A03 | Injection | Prisma's parameterized queries prevent SQL injection by default, and `grep` for `$queryRaw`/`$executeRaw`/`...Unsafe` across the whole repo returns nothing | No action needed, verified only |
| A04 | Insecure Design | Covered by Lecture 15's threat model; no new design gap found this pass | No action needed |
| A05 | Security Misconfiguration | Half fixed already: the handler stopped echoing `err.message` in Lecture 7 (D-003). It was still inline in app.js with no environment split | Fixed — Section 1.4, moved to its own file with a production/development split |
| A06 | Vulnerable/Outdated Components | **Found, and it was live.** `npm audit` reported 8 vulnerabilities in server/ (1 critical, 5 high) and 2 high in client/ | Fixed — Section 1.5, `npm audit fix` in both; both now report 0 |
| A07 | Authentication Failures | Rate limiting on login and register was added in Lecture 15, with separate counters per endpoint (D-020) | No new action needed |
| A08 | Software/Data Integrity Failures | Deferred — pipeline integrity belongs with the CI work in Lecture 20/21 | Deferred, flagged |
| A09 | Logging/Monitoring Failures | **Found.** A failed login threw `InvalidCredentialsError` and that was the end of it. Nothing was recorded, so a thousand failed attempts left no trace | Fixed — Section 1.6, structured logging with pino |
| A10 | SSRF | Not applicable. Nothing in the server makes an outbound request to any URL, let alone a user-supplied one | Flagged for when avatar-by-URL is built |

## What this pass actually found

Two live problems, and they were not the ones the handout expects.

**A06 was the real one.** The lecture notes suggest `npm audit fix` will refuse
to help because the only resolution is a breaking downgrade. That is not what
happened here: every finding had a non-breaking fix available, `npm audit fix`
took all of them in both packages, and all 60 tests still pass afterwards (46 server,
2 client, 12 end-to-end).
The critical one was `proxy-addr` (IP spoofing via IPv4-mapped IPv6 subnets),
reached through express. I had never run `npm audit` on this project before,
which is the actual lesson — the vulnerabilities arrived through dependencies
I never chose and never touched.

**A09 was invisible by construction.** Lecture 15 added a rate limiter that
blocks the sixth failed login. Until this lecture nothing anywhere recorded
that the first five happened, so the defence worked and left no evidence.

**Three categories needed nothing**, and two of those were already handled by
earlier lectures rather than by luck: A02 by the Lecture 10 self-review, A07 by
Lecture 15's rate limiting.

## Authentication is not authorization (again)

Lecture 15 made this point about `authorId`; A01 is the same point with a
different shape. `requireAuth` proves *who* is calling. It says nothing about
*what* they may touch. The new delete route needs both: the middleware for the
first question, and the `post.authorId !== req.user.id` check for the second.
A route that only asks the first question is exactly the A01 category.
