import { Router } from 'express';
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../controllers/ingredients.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Every pantry route requires a valid JWT.
router.use(requireAuth);

router.get('/', asyncHandler(listIngredients));
router.post('/', asyncHandler(createIngredient));
router.put('/:id', asyncHandler(updateIngredient));
router.delete('/:id', asyncHandler(deleteIngredient));

export default router;
