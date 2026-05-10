import type { Request, Response } from 'express';
import { Ingredient } from '../models/Ingredient.js';

/**
 * GET /api/shopping-list
 *
 * Returns all ingredients where:
 *  - minimumThreshold is defined (the user opted in to threshold tracking)
 *  - current quantity is strictly less than that threshold
 *
 * Uses a MongoDB $expr stage so the comparison is between two document
 * fields rather than a fixed value — no application-layer filtering needed.
 */
export const getShoppingList = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const items = await Ingredient.find({
    minimumThreshold: { $exists: true, $ne: null },
    $expr: { $lt: ['$quantity', '$minimumThreshold'] },
  })
    .sort({ name: 1 })
    .lean();

  res.status(200).json(items);
};
