import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

/**
 * Builds the public response shape, never including the password hash.
 */
const toAuthResponse = (user: {
  id: string;
  name: string;
  email: string;
}) => ({
  token: signToken({ userId: user.id, email: user.email }),
  user,
});

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Mongoose validates required fields & format, the central error handler
 * maps a duplicate email to a 409 response.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ message: 'name, email and password are required' });
    return;
  }

  // The pre('save') hook hashes the password with bcrypt.
  const created = await User.create({ name, email, password });

  res.status(201).json(
    toAuthResponse({
      id: created.id,
      name: created.name,
      email: created.email,
    }),
  );
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns a JWT plus the public user payload.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  // The schema sets `select: false` on password, so we have to ask for it.
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password',
  );

  // Use the same generic message in both cases to avoid leaking which
  // emails are registered (timing differences aside).
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  res.status(200).json(
    toAuthResponse({
      id: user.id,
      name: user.name,
      email: user.email,
    }),
  );
};
