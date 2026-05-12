import type { Request, Response } from 'express';
import { Ingredient } from '../models/Ingredient.js';

export const listIngredients = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const ingredients = await Ingredient.find().sort({ createdAt: -1 }).lean();
  res.status(200).json(ingredients);
};

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

  // Only fields present in the request body are included to prevent
  // unintentional mass-assignment of unrelated fields.
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
