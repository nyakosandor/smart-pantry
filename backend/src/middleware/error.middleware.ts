import type { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Type guard for the duplicate-key error MongoDB throws (E11000).
 * The shape is not part of the official Mongoose error hierarchy, so we
 * detect it structurally.
 */
interface MongoDuplicateKeyError extends Error {
  code: 11000;
  keyValue: Record<string, unknown>;
}

const isDuplicateKeyError = (err: unknown): err is MongoDuplicateKeyError =>
  typeof err === 'object' &&
  err !== null &&
  (err as { code?: number }).code === 11000;

/**
 * Central error handler. Translates the most common Mongoose / Mongo errors
 * into clean JSON responses with the appropriate HTTP status code.
 *
 *  - ValidationError → 400 with per-field messages
 *  - CastError       → 400 ("invalid value for field X")
 *  - E11000 dup key  → 409 ("X already exists")
 *  - everything else → 500 (or err.status if explicitly set)
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[Error]', err);

  if (err instanceof MongooseError.ValidationError) {
    const fields: Record<string, string> = {};
    for (const [path, validatorError] of Object.entries(err.errors)) {
      fields[path] = validatorError.message;
    }
    res.status(400).json({ message: 'Validation failed', fields });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({
      message: `Invalid value for field "${err.path}": expected ${err.kind}`,
    });
    return;
  }

  if (isDuplicateKeyError(err)) {
    const [field, value] = Object.entries(err.keyValue)[0] ?? ['field', ''];
    res.status(409).json({
      message: `${field} "${String(value)}" already exists`,
      field,
    });
    return;
  }

  const status =
    typeof (err as { status?: unknown }).status === 'number'
      ? (err as { status: number }).status
      : 500;
  const message =
    err instanceof Error ? err.message : 'Internal server error';

  res.status(status).json({ message });
};
