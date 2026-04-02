import { Router } from 'express';
import { body } from 'express-validator';
import { createReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, [
  body('bookingId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
], createReview);

export default router;
