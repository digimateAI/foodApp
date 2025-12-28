import { Router } from 'express';
import multer from 'multer';
import { getMeals, logMeal, analyzeFood, searchFood } from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, getMeals);
router.post('/', authenticate, logMeal);
router.get('/foods/search', authenticate, searchFood);
router.post('/analyze', upload.single('image'), analyzeFood);

export default router;
