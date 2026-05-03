/**
 * Declaration merging: adds `req.user` to every Express Request.
 * Populated by the JWT auth middleware after a token has been verified.
 */
export {};

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
