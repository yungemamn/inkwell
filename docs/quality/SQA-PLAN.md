# Inkwell SQA Plan — v1

## Standards
- All code changes follow the PR checklist (docs/reviews, .github/PULL_REQUEST_TEMPLATE.md)
- Architecture conformance per ADR-001 (docs/architecture/adr-001-modular.monolith.md)
- API contract conventions per docs/design/api-contract.md

## Reviews
- Every merged change is self-reviewed (author) then peer-reviewed before merge
- Review findings logged in docs/reviews/

## Testing (expanded in Lecture 12-15)
- Unit tests: Services and Repositories (Jest) — ACTIVE (Lecture 12)
- Integration tests: Routes → Services → Repositories, real test DB (Supertest) — ACTIVE (Lecture 13)
- Component tests: React components (RTL) — ACTIVE (Lecture 13)
- End-to-end tests: critical user flows, mobile + desktop viewports (Playwright) — ACTIVE (Lecture 14)
- Automated accessibility checks (axe-core) — ACTIVE (Lecture 14)
- Documentation verification (README, Section 4.10) — ACTIVE (Lecture 14)
- Security testing: STRIDE threat model (docs/security/THREAT-MODEL.md) plus
  security regression tests at the route and component level — ACTIVE (Lecture 15)
- Performance/load testing — deferred; revisit at Lecture 19-20 (architecture scale-out)

## Defect Tracking
- All discovered defects (via review, testing, or manual use) recorded in docs/quality/DEFECT-LOG.md
- Each entry records: cause category, discovery stage, and remediation

## Metrics Tracked
- Defects per lecture/increment
- Defect cause category distribution
- Review turnaround (informal, tracked qualitatively at this project's scale)

## Ownership
- For this course project: the student/team implementing Inkwell owns SQA plan adherence.

## Metrics Snapshot (October 6, 2026)
- Commits: 29 (git rev-list --count HEAD, counted right before this section was committed)
- Logged defects: 11 in DEFECT-LOG.md. 9 fixed, 2 open (D-005, D-011)
- Backlog items at "Requirements Defined" or later: 6 of 11
  - US-01, US-02, US-03, US-04 are Implemented
  - US-10, US-11 are In progress
  - US-05 to US-09 are still Backlog

By cause: 3 security, 3 missing validation, 2 logic, 1 compatibility, 1 integration, 1 regression.
All 3 missing-validation defects were bad input that turned into a 500, so those are the first
things the Lecture 12 tests should cover.

## Metrics Snapshot (October 27, 2026)
- Commits: 45 (git rev-list --count HEAD, counted right before this section was committed)
- Logged defects: 21 in DEFECT-LOG.md. 19 fixed, 2 open (D-005 in part, D-011)
- Tests: 41 server (Jest), 2 client (Vitest), 12 end-to-end (Playwright, 3 specs x 3 browsers)
- Of those 55, the 20 added this lecture are security regression tests

By cause this lecture: 2 security, 1 missing validation, 1 regression (D-020, introduced and
fixed within the same pass). The security pass found in one sitting what three lectures of
functional testing had not, because functional tests only ever supplied honest input.
