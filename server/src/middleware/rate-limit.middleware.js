// server/src/middleware/rate-limit.middleware.js

import rateLimit, { MemoryStore } from "express-rate-limit";

// One rateLimit() call makes one counter. The handout puts the same
// limiter object on /auth/login and /auth/register, which means the two
// share a counter: five failed logins then lock out registration for
// everyone at that address. I found this by running the Playwright
// suite after my own manual testing had used up the budget -- every
// publish-flow test failed at its register step with a 429 (D-020).
// Separate counters, one per endpoint, so neither can starve the other.
function authLimiter(store) {
  return rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    // what makes this five FAILED attempts rather than five attempts.
    // Without it an ordinary user who signs in five times in ten minutes
    // is locked out for doing nothing wrong.
    skipSuccessfulRequests: true,
    message: {
      error: { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Try again later." },
    },
    standardHeaders: true,
    legacyHeaders: false,
    store,
  });
}

// Exported so tests can clear the counters between files: they live in
// one process-wide store, so otherwise the failed logins in one test
// file count against the next one (the same shared-state problem as
// D-016).
const loginStore = new MemoryStore();
const registerStore = new MemoryStore();

export function resetAuthRateLimit() {
  loginStore.resetAll();
  registerStore.resetAll();
}

// The security requirement, now enforced in code: "reject login attempts
// after five consecutive failures within ten minutes."
export const loginRateLimiter = authLimiter(loginStore);
export const registerRateLimiter = authLimiter(registerStore);
