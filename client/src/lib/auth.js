// client/src/lib/auth.js
//
// Minimal token storage. No auth context or global state library has
// been introduced yet, so we keep this deliberately small: PostEditor
// reads the stored token to attach it to authenticated requests.
//
// Lecture 14: the login response's user is saved too, so PostEditor can
// send authorId. The handout says that without this every publish from
// the browser fails with Prisma's "Argument `author` is missing". That
// was true here up to Lecture 8 (WATCH-LIST, D-005), but since Lecture 9
// my POST /api/posts route reads the author out of the bearer token, so
// the Lecture 14 end-to-end test passed before this change. authorId in
// the body is the fallback for a request with no token, until Lecture
// 15's requireAuth makes the token the only source.

const TOKEN_KEY = "inkwell_access_token";
const USER_KEY = "inkwell_user";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
