import { Router } from 'express';
import {
  listIngredients,
  createIngredient,
} from '../controllers/ingredients.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Every pantry route requires a valid JWT.
router.use(requireAuth);

router.get('/', asyncHandler(listIngredients));
router.post('/', asyncHandler(createIngredient));

export default router;
