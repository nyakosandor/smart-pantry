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
  const { name, category, quantity, unit, calories, expirationDate, minimumThreshold } =
    req.body as {
      name?: unknown;
      category?: unknown;
      quantity?: unknown;
      unit?: unknown;
      calories?: unknown;
      expirationDate?: unknown;
      minimumThreshold?: unknown;
    };

  // We hand the raw values to Mongoose so its schema validators decide
  // what's acceptable — single source of truth for validation rules.
  const created = await Ingredient.create({
    name,
    category,
    quantity,
    unit,
    calories,
    expirationDate,
    minimumThreshold,
  });

  res.status(201).json(created);
};

/**
 * DELETE /api/ingredients/:id
 * Permanently removes one ingredient by its MongoDB ObjectId.
 * Returns 404 if the id is valid but no document was found.
 * An invalid ObjectId format is caught by the central CastError handler → 400.
 */
export const deleteIngredient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const deleted = await Ingredient.findByIdAndDelete(req.params['id']);

  if (!deleted) {
    res.status(404).json({ message: 'Ingredient not found' });
    return;
  }

  res.status(200).json({ message: 'Ingredient deleted', id: deleted._id });
};

/**
 * PUT /api/ingredients/:id
 * Body: Partial<IIngredient> — only the provided fields are updated.
 *
 * Allowed updatable fields are whitelisted to prevent mass-assignment.
 * Mongoose validators run on the new values (runValidators: true).
 */
export const updateIngredient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, category, quantity, unit, calories, expirationDate, minimumThreshold } =
    req.body as Partial<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
      calories: number;
      expirationDate: string | null;
      minimumThreshold: number | null;
    }>;

  // Build the update object from only the fields present in the request body.
  const update: Record<string, unknown> = {};
  if (name !== undefined)             update['name'] = name;
  if (category !== undefined)         update['category'] = category;
  if (quantity !== undefined)         update['quantity'] = quantity;
  if (unit !== undefined)             update['unit'] = unit;
  if (calories !== undefined)         update['calories'] = calories;
  if (expirationDate !== undefined)   update['expirationDate'] = expirationDate;
  if (minimumThreshold !== undefined) update['minimumThreshold'] = minimumThreshold;

  const updated = await Ingredient.findByIdAndUpdate(
    req.params['id'],
    { $set: update },
    { new: true, runValidators: true },
  );

  if (!updated) {
    res.status(404).json({ message: 'Ingredient not found' });
    return;
  }

  res.status(200).json(updated);
};
