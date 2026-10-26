# Inkwell

Semester project for CS 415. A blog website like Medium.

## Definition of Done

A backlog item is Done when:
- [ ] Code is committed with a descriptive message
- [ ] It runs locally per the relevant lecture's Code Walkthrough
- [ ] It does not break previously-passing verification steps
- [ ] New setup steps are documented here

## Process

Inkwell follows an incremental process: one lecture, one increment.
See docs/BACKLOG.md for the current product backlog.

## Getting Started

These steps were tested from a fresh copy of the repo in Lecture 14
(docs/quality/README-VERIFICATION.md). Follow them in order.

### Prerequisites

- Node.js 22 or newer (see `engines` in server/package.json). I use 24.
- PostgreSQL. I run it with Homebrew (`postgresql@17`). If you have Docker
  instead, the Docker block below does the same thing, but I have not tested
  it because there is no Docker on my machine.

### Database

Homebrew:

```
brew install postgresql@17
brew services start postgresql@17
/opt/homebrew/opt/postgresql@17/bin/psql postgres -c "CREATE ROLE inkwell LOGIN PASSWORD 'inkwell' CREATEDB;"
/opt/homebrew/opt/postgresql@17/bin/createdb -O inkwell inkwell_dev
```

CREATEDB matters: `prisma migrate dev` makes a shadow database and fails with
P3014 without it (Lecture 8).

Docker (untested here):

```
docker run --name inkwell-postgres \
  -e POSTGRES_USER=inkwell \
  -e POSTGRES_PASSWORD=inkwell \
  -e POSTGRES_DB=inkwell_dev \
  -p 5432:5432 \
  -d postgres:16
```

Already created this container once? Use `docker start inkwell-postgres` instead.

### Server

```
cd server
npm install
npx prisma generate
cp .env.example .env
npx prisma migrate deploy
npm run dev
# → Inkwell API listening on port 4000
```

Two notes on those steps:

- `npx prisma generate` is required. npm 11 does not run Prisma's install
  script (it prints an `allow-scripts` warning instead), so without this
  the server dies on start with `Cannot find module '.prisma/client/default'`.
- After `cp .env.example .env`, open `.env` and set
  `DATABASE_URL="postgresql://inkwell:inkwell@localhost:5432/inkwell_dev"`
  and replace the two token secrets with long random strings. The server
  refuses to start if either secret is missing.

Then open http://localhost:4000/api/health. It should return `{"status":"ok","service":"inkwell-api"}`.

### Client

The client talks to the API through Vite's dev proxy, so the server has to be
running first. In a second terminal:

```
cd client
npm install
npm run dev
# → Local: http://localhost:5173
```

Three pages: the feed at `/`, the editor at `/write`, and the login form at
`/login`. There is no register page yet, so make an account with curl:

```
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","displayName":"You","password":"correcthorse"}'
```

### Running the tests

The integration tests use a separate `inkwell_test` database (never the dev
one), created once:

```
/opt/homebrew/opt/postgresql@17/bin/createdb -O inkwell inkwell_test
cd server && DATABASE_URL="postgresql://inkwell:inkwell@localhost:5432/inkwell_test" npx prisma migrate deploy
```

Then create `server/.env.test` with three lines: `DATABASE_URL` pointing at
`inkwell_test`, plus `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` (any
values, different from `.env`). It is gitignored.

The end-to-end tests need the Playwright package and its browsers, installed
once from the repo root:

```
npm install
npx playwright install
```

Running them:

```
cd server && npm test            # Jest: unit + integration
cd client && npx vitest run      # Vitest: component tests
npx playwright test              # Playwright: E2E, from the repo root (starts both dev servers itself)
```
