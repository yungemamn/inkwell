# Inkwell API Contract v1

This is what the React client in /client can send to the Express server in /server, and
what it gets back. It covers US-01, US-02 and US-04. The client doesn't need to know how
the server does any of it. It just needs to know what to send and what comes back.

Everything starts with /api, like /api/health. That way you can tell right away the
address gives back data and not a web page.

## POST /api/auth/register
Request: { email: string, displayName: string, password: string }
Success: 201 { user: UserPublic, accessToken: string, refreshToken: string }
Errors:
  400 EMAIL_ALREADY_REGISTERED  - "This email is already registered."
  400 WEAK_PASSWORD             - "Password does not meet strength requirements."

## POST /api/auth/login
Request: { email: string, password: string }
Success: 200 { user: UserPublic, accessToken: string, refreshToken: string }
Errors:
  401 INVALID_CREDENTIALS       - "Invalid email or password."

## GET /api/posts?page=n
Success: 200 { posts: PostPublic[], page: number, hasMore: boolean }

## POST /api/posts/:id/comments
Request: { body: string }
Success: 201 { comment: CommentPublic }
Errors:
  400 EMPTY_COMMENT             - "Comment cannot be empty."
  400 COMMENT_TOO_LONG          - "Comment is over the character limit."
  401 NOT_AUTHENTICATED         - "You must be logged in to comment."
  404 POST_NOT_FOUND            - "That post is no longer available."

This one is for US-05. I didn't make the errors up, they come from the extensions in the
US-05 use case I wrote last workshop. Not logged in, empty comment, comment too long, and
the post being gone by the time they hit submit.

## Shared shapes

UserPublic: { id, email, displayName, createdAt }
PostPublic: { id, authorId, title, body, publishedAt }
CommentPublic: { id, postId, authorId, body, createdAt }

UserPublic doesn't have passwordHash in it. The client never has a reason to see that, so
I just left it out of the contract completely.

## Error format

Every error looks the same:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "A clear explanation"
  }
}
```

## Design decisions

The code and the message are two different things on purpose. The code is for my frontend
so it knows what to do, like showing a "Resend verification email" link. The message is
the part the actual person reads.

Some of the messages are vague on purpose. A failed login always says "Invalid email or
password." It never says which one was wrong. If it told you which one, somebody could sit
there typing in emails until the site tells them which ones have accounts. That's the same
non enumeration rule from the use case I wrote in docs/requirements/use-cases.md.

## Status codes I'm using

- 200 it worked
- 201 something got created
- 400 the client sent something wrong
- 401 not logged in
- 403 logged in but not allowed to do that
- 404 couldn't find it
- 500 the server broke

## Rules I'm following

Keep the names the same everywhere. It's /api/posts, not /api/getPosts in one spot and
/api/post-list in another one.

One error format for everything instead of every route doing its own thing.

Long lists get pages. GET /api/posts?page=2 instead of sending back every post that
exists.

If I ever have to break something it goes to /api/v2/posts so anything still on the old
one keeps working.

/api/auth/login gets rate limited so nobody can sit there guessing passwords all day.
