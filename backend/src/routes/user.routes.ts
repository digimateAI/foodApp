import { Router } from 'express';
import { getProfile, updateProfile, updateGoal } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/goal', authenticate, updateGoal);

export default router;
