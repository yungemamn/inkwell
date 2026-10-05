// server/src/services/token.service.js
//
// Pure fabrication (Lecture 4): TokenService has no
// counterpart in the blogging domain, but AuthService needs it to issue
// and verify tokens. This is a minimal stub — see Lecture 15 for a
// hardened version (rotation, revocation, secret management).

import jwt from "jsonwebtoken";

// These used to fall back to "dev-access-secret", which is sitting in this
// public repo, so anyone could sign their own token. Same rule as
// DATABASE_URL in db/client.js now: no secret, no server.
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set");
}

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export const TokenService = {
  issueTokens(user) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  },

  verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  },

  verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  },
};
