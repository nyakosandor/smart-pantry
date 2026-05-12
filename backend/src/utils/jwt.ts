import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

/**
 * Throws at call-time if JWT_SECRET is absent rather than silently falling
 * back to a predictable value, which would make every issued token insecure.
 */
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

export const signToken = (payload: { userId: string; email: string }): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '1d') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
};

/**
 * Throws JsonWebTokenError or TokenExpiredError for invalid / expired tokens —
 * callers must not catch these silently.
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
};
