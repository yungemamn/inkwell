# docs/quality/README-VERIFICATION.md

## README Verification — Lecture 14

Performed on this checkout, following README.md exactly, step by step,
with no undocumented prior knowledge assumed. Method: copy the working tree
to an empty folder with no node_modules, no .env and no .env.test, then run
every command in the README in order and record what it printed.

Pass 1, the README as it was before this lecture:

- [ ] `git clone` + steps in "Getting Started" produce a running server
- [x] `git clone` + steps in "Getting Started" produce a running client
- [ ] Every environment variable the app actually requires is documented
- [ ] Every command shown in the README actually runs without modification

Result: 2 gaps found, both bigger than this section's own example.

1. The README had no "Getting Started" section. It had "Running the server"
   and "Running the client" from Lecture 5, and nothing about PostgreSQL,
   the `inkwell` role, `prisma migrate`, the `inkwell_test` database, or how
   to run any of the three test suites. The server section still ended with
   "server/src/db/client.js is a temporary in-memory stand-in for Prisma ...
   I'll swap it for real Prisma in Lecture 8", which has been false since
   Lecture 8.
2. Following "Running the server" literally (`npm install`, `cp .env.example
   .env`, `npm run dev`) does not produce a running server. It dies on start:
   `Error: Cannot find module '.prisma/client/default'`. npm 11 refuses to run
   Prisma's install script (it prints an `allow-scripts` warning instead), so
   the generated client never exists on a fresh clone, and nothing in the
   README said to run `npx prisma generate`. On my own machine it worked
   because I had run `prisma migrate dev` in Lecture 8, which generates the
   client as a side effect. Even with that fixed, `.env.example`'s
   DATABASE_URL points at a database that does not exist, and the README did
   not say what to change it to.

Fixed by replacing both sections with a full "Getting Started" section:
prerequisites, database setup (Homebrew, which is what this machine uses,
plus the Docker block as an untested alternative), server setup including
`npx prisma generate` and the `.env` edit, client setup, how to make an
account (there is no register page), the `inkwell_test` database and
`.env.test`, the Playwright install, and how to run all three test suites.

Pass 2, the new README, same method, fresh copy:

- [x] `git clone` + steps in "Getting Started" produce a running server
      (`{"status":"ok","service":"inkwell-api"}` from /api/health, and a
      register request returned 201)
- [x] `git clone` + steps in "Getting Started" produce a running client
      (HTTP 200 from http://localhost:5173/)
- [x] Every environment variable the app actually requires is documented
      (DATABASE_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET for `.env`;
      the same three for `.env.test`)
- [x] Every command shown in the README actually runs without modification
      (server: 6 suites, 22 tests; client: 1 test; Playwright: 9 tests, all
      passed from the fresh copy)

Two honest exceptions. The `CREATE ROLE inkwell` and `createdb inkwell_dev`
/ `createdb inkwell_test` commands printed "already exists" errors on this
machine, because that role and both databases have been here since
Lectures 8 and 13. They are the right commands for a new machine, but this
pass could not prove that without deleting my data. The Docker block is
copied from the handout and is untested here, because there is no Docker on
this Mac; the README says so.
