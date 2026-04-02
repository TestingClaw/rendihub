import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';

export const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { bookingId, rating, comment } = req.body;
  const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  const booking = bookings[0];

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.renter_id !== req.user.id) {
    return res.status(403).json({ message: 'Only renter can leave review' });
  }

  const [existing] = await pool.query('SELECT id FROM reviews WHERE booking_id = ?', [bookingId]);
  if (existing.length) {
    return res.status(409).json({ message: 'Review already exists' });
  }

  await pool.query(
    `INSERT INTO reviews (booking_id, listing_id, reviewer_id, reviewee_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [bookingId, booking.listing_id, req.user.id, booking.owner_id, rating, comment || null]
  );

  res.status(201).json({ message: 'Review submitted' });
};
