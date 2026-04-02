import { Router } from 'express';
import { body } from 'express-validator';
import { createListing, getCategories, getListingById, getListings } from '../controllers/listingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getListings);
router.get('/:id', getListingById);
router.post(
  '/',
  authMiddleware,
  upload.array('images', 6),
  [
    body('categoryId').notEmpty(),
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('location').notEmpty(),
    body('priceDay').isFloat({ min: 0 }),
    body('priceWeek').isFloat({ min: 0 }),
    body('priceMonth').isFloat({ min: 0 })
  ],
  createListing
);

export default router;
