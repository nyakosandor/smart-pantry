import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { suggestRecipes } from '../controllers/recipes.controller.js';

const router = Router();

router.get('/suggest', requireAuth, asyncHandler(suggestRecipes));

export default router;
