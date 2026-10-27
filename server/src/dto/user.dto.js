// server/src/dto/user.dto.js
//
// Sensitive-data-exposure prevention, made structural: one place that
// says exactly which user fields are safe to expose, so no route handler
// can leak a field by forgetting to strip it.
//
// It is an allowlist, not a denylist: a field added to the User model
// later (phoneNumber, say) stays private until someone adds it here on
// purpose. A denylist would expose it by default.

// The same allowlist in the shape Prisma wants, so the fields that are
// not safe to expose are never read out of the database in the first
// place. The handout loads the whole author row and strips it in JS;
// keeping the two in one file means they cannot drift apart.
export const PUBLIC_USER_SELECT = { id: true, displayName: true };

export function toPublicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    // deliberately excluded: email, passwordHash, and any future
    // sensitive field
  };
}
