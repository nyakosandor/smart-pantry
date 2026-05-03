import type { Request, Response } from 'express';
import { Ingredient } from '../models/Ingredient.js';

/**
 * GET /api/ingredients
 * Returns the full pantry, newest first.
 */
export const listIngredients = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const ingredients = await Ingredient.find().sort({ createdAt: -1 }).lean();
  res.status(200).json(ingredients);
};

/**
 * POST /api/ingredients
 * Body: { name, category, quantity, calories }
 *
 * Type & uniqueness errors are produced by Mongoose and forwarded to the
 * central error handler, which maps:
 *   - ValidationError → 400 with per-field messages
 *   - CastError       → 400 ("invalid value for field X")
 *   - E11000 (name)   → 409 ("name 'tomato' already exists")
 */
export const createIngredient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, category, quantity, calories } = req.body as {
    name?: unknown;
    category?: unknown;
    quantity?: unknown;
    calories?: unknown;
  };

  // We hand the raw values to Mongoose so its schema validators decide
  // what's acceptable — single source of truth for validation rules.
  const created = await Ingredient.create({
    name,
    category,
    quantity,
    calories,
  });

  res.status(201).json(created);
};
