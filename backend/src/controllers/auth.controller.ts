import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

interface AuthBody {
  name?: string;
  email?: string;
  password?: string;
}

const toAuthResponse = (user: { id: string; name: string; email: string }) => ({
  token: signToken({ userId: user.id, email: user.email }),
  user,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as AuthBody;

  const created = await User.create({ name, email, password });

  res.status(201).json(
    toAuthResponse({ id: created.id, name: created.name, email: created.email }),
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as AuthBody;

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  res.status(200).json(
    toAuthResponse({ id: user.id, name: user.name, email: user.email }),
  );
};
