# Test Cases: PostService.search() (Lecture 12, Exercise 1)

Same table format as Lecture 12, Section 1.2 (AuthService.register()).
Code: server/src/services/__tests__/post.search.test.js

| # | Technique | Input | Expected Outcome |
|---|-----------|-------|------------------|
| 1 | Black-box (equivalence: valid query that matches) | query "Design", page 1, repository finds 2 posts | `{ posts: [both], page: 1, hasMore: false }`, and the query reaches the repository as typed |
| 2 | Black-box (equivalence: valid query, no matches) | query "zzzz", repository finds nothing | `{ posts: [], page: 1, hasMore: false }`, not an error |
| 3 | Black-box (boundary: second page) | query "design", page 2, repository says there are more | Repository is asked for page 2 with pageSize 10, response has page 2 and hasMore true |
| 4 | Black-box (equivalence: invalid partition) | query "", "   " (only spaces), or no query at all | ValidationError (MISSING_QUERY, 400 from the route), repository never called |
| 5 | White-box (branch: default parameters) | query "design", no page or pageSize | Repository is asked for page 1, pageSize 10, response has page 1 |
| 6 | White-box (error path: repository failure) | PostRepository.searchPublished rejects with "connection lost" | search() rejects with that same error, it does not turn it into an empty result |

Row 4 is one row in the table but three tests in Jest (test.each), one per input.
So the file runs 8 tests for 6 rows.

## Why these and not others

- Only PostRepository is a test double. PostService.search() and SubstringSearchStrategy
  are the real code, so these are unit tests and never touch Postgres (Mistake 3).
- search() doesn't do much itself, it hands the query and the paging down to the
  strategy. So what arrives at the repository is its behavior, not an internal step,
  which is why rows 3 and 5 check the arguments (Mistake 2 is about checking
  internals like the bcrypt arguments, which is different).
- Ignoring upper/lower case happens in the repository (`mode: "insensitive"` in
  Prisma). A mocked repository can't show that, so row 1 only checks that the
  service passes "Design" through unchanged. The real case check belongs in the
  Lecture 13 integration tests.
- Pages below 1 are not here because the route already turns them into page 1
  (D-010). search() is only called from that route.

## What the first run found

Rows 1, 2, 3, 4 and 5 failed on the code as it was (7 of the 8 tests):

- search() returned `{ posts, hasMore }` with no page field, unlike listPublished().
  api-contract.md already said this was an inconsistency to fix. Logged as D-013.
- A blank or missing query went straight to the repository. Through the API,
  `?search=%20%20` came back 200 with an empty list, as if nothing matched.
  Logged as D-014.

Both are fixed in PostService.search() and the GET /api/posts handler, and all 16
tests pass now.
