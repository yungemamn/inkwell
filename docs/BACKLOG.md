# Inkwell Product Backlog

Definition of Done: see README.md

| ID | User Story | Priority | Points | Status | Notes |
|----|------------|----------|--------|--------|-------|
| US-01 | As a visitor, I want to register an account... | High | 3 | Implemented (API only) | No register page yet, the endpoint works |
| US-02 | As a registered user, I want to log in... | High | 5 | Implemented | Login page added Lecture 7; token stored client-side |
| US-03 | As an author, I want to write and publish... | High | 5 | Implemented | Editor at /write. Server still trusts authorId from the body, fixed in Lecture 15 |
| US-04 | As a reader, I want to browse a public feed... | High | 3 | Implemented | Feed at / with loading and empty states |
| US-05 | As a reader, I want to comment on a post... | Medium | 3 | Backlog | |
| US-06 | As a reader, I want to follow an author... | Medium | 3 | Backlog | |
| US-07 | As an author, I want basic analytics... | Low | 5 | Backlog | |
| US-08 | As an author, I want to edit or delete my posts, so that I can fix mistakes after publishing | High | 3 | Backlog | |
| US-09 | As a registered user, I want to reset my password through email, so that I can get back in my account if I forget it | Medium | 5 | Backlog | |

None of these are really Done by my own definition yet. The in-memory
placeholder in server/src/db/client.js doesn't survive a restart, so nothing
actually gets saved. I'll replace it in Lecture 8.

New stories:

US-08 is 3 points because editing/deleting mostly reuses the post code from US-03, so it should be a smaller task like US-01.

US-09 is 5 points because password reset deals with security tokens and sending emails, which feels as big as the login story US-02.
