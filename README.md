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

## Running the server

```
cd server
npm install
npm run dev
```

Then open http://localhost:4000/api/health. It should return `{"status":"ok","service":"inkwell-api"}`.

## Running the client

The client talks to the API through Vite's dev proxy, so the server has to be
running first (see above). In a second terminal:

```
cd client
npm install
npm run dev
```

Then open http://localhost:5173. Three pages: the feed at `/`, the editor at
`/write`, and the login form at `/login`.

Note: `server/src/db/client.js` is a temporary in-memory stand-in for Prisma.
Everything you register or publish is gone when the server restarts. I'll swap it for real Prisma in
Lecture 8.
