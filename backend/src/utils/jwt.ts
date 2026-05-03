import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

/** Shape of the data we embed inside our JWTs. */
export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Returns the JWT secret from env, throwing loudly at boot-time if missing.
 * Throwing (rather than silently using a default) prevents accidentally
 * issuing tokens signed with a weak / predictable key.
 */
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

/** Sign a new token for a given user. */
export const signToken = (payload: {
  userId: string;
  email: string;
}): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
};

/**
 * Verifies a token and returns the decoded payload.
 * Throws (JsonWebTokenError / TokenExpiredError) on invalid / expired tokens.
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
};
