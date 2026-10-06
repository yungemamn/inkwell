# Inkwell SQA Plan — v1

## Standards
- All code changes follow the PR checklist (docs/reviews, .github/PULL_REQUEST_TEMPLATE.md)
- Architecture conformance per ADR-001 (docs/architecture/adr-001-modular.monolith.md)
- API contract conventions per docs/design/api-contract.md

## Reviews
- Every merged change is self-reviewed (author) then peer-reviewed before merge
- Review findings logged in docs/reviews/

## Testing (expanded in Lecture 12-14)
- Unit tests: Services and Repositories (Jest) — starting Lecture 12
- Integration tests: Routes (Supertest) — starting Lecture 13
- End-to-end tests: critical user flows (Playwright) — starting Lecture 14

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
