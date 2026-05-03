import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler so that any rejected promise is forwarded
 * to the central error middleware via `next(err)`.
 *
 * Express 4 does not catch promise rejections automatically — without this
 * wrapper, a thrown error inside an async controller would crash the process.
 */
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
