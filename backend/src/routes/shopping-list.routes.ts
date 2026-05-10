import { Router } from 'express';
import { getShoppingList } from '../controllers/shopping-list.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(getShoppingList));

export default router;
