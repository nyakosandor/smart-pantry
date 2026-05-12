import type { Request, Response } from 'express';
import { Ingredient } from '../models/Ingredient.js';
import { findRecipesByIngredients } from '../services/spoonacular.service.js';

export const suggestRecipes = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const ingredients = await Ingredient.find().select('name').lean();

  if (ingredients.length === 0) {
    res.status(200).json([]);
    return;
  }

  const names = ingredients.map((i) => i.name);
  const suggestions = await findRecipesByIngredients(names);

  res.status(200).json(suggestions);
};
