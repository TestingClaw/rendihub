import { Router } from 'express';
import { body } from 'express-validator';
import { createBooking, getMyBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/mine', getMyBookings);
router.post('/', [
  body('listingId').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('pricingUnit').isIn(['day', 'week', 'month'])
], createBooking);
router.patch('/:id/status', [body('status').isIn(['pending', 'confirmed', 'cancelled'])], updateBookingStatus);

export default router;
