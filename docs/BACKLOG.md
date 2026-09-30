# Inkwell Product Backlog

Definition of Done: see README.md

| ID | User Story | Priority | Points | Status | Notes |
|----|------------|----------|--------|--------|-------|
| US-01 | As a visitor, I want to register an account... | High | 3 | Implemented (API only) | No register page yet, the endpoint works |
| US-02 | As a registered user, I want to log in... | High | 5 | Implemented | Login page added Lecture 7; token stored client-side |
| US-03 | As an author, I want to write and publish... | High | 5 | Implemented | Editor at /write. Since Lecture 9 the author comes from the login token; a request with no token can still send any authorId until Lecture 15 |
| US-04 | As a reader, I want to browse a public feed... | High | 3 | Implemented | Feed at / with loading and empty states |
| US-05 | As a reader, I want to comment on a post... | Medium | 3 | Backlog | |
| US-06 | As a reader, I want to follow an author... | Medium | 3 | Backlog | |
| US-07 | As an author, I want basic analytics... | Low | 5 | Backlog | |
| US-08 | As an author, I want to edit or delete my posts, so that I can fix mistakes after publishing | High | 3 | Backlog | |
| US-09 | As a registered user, I want to reset my password through email, so that I can get back in my account if I forget it | Medium | 5 | Backlog | |
| US-10 | As an author, I want to tag my post with one or more topics, so that readers can discover it by subject | Medium | 5 | In progress (API only) | Lecture 9. Tags save through POST /api/posts; the editor has no tag field yet |
| US-11 | As a reader, I want to search posts by keyword or tag, so that I can find content relevant to me | Medium | 3 | In progress (API only) | Lecture 9. GET /api/posts?search= matches title and body. Searching by tag name does not work yet |

US-01 through US-04 all pass the four checks in my Definition of Done. I still would not
call them finished though. The in-memory placeholder in server/src/db/client.js
doesn't survive a restart, so nothing actually gets saved. I'll replace it in
Lecture 8.

New stories:

US-08 is 3 points because editing/deleting mostly reuses the post code from US-03, so it should be a smaller task like US-01.

US-09 is 5 points because password reset deals with security tokens and sending emails, which feels as big as the login story US-02.

Lecture 9 stories:

The handout calls these two US-08 and US-09, but I already used those numbers for my own
stories in Workshop 2, so they're US-10 and US-11 here. Same stories, just renumbered.

US-10 is 5 points because it needed a new table plus a join table (PostTag) and a migration,
and it still needs a tag field in the editor. That's more than US-01.

US-11 is 3 points because it reuses the feed endpoint and the same paging code. The search
itself is one repository method.
