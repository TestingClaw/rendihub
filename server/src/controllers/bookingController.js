import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';
import { calculateBookingPrice } from '../utils/pricing.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { listingId, startDate, endDate, name, email, phone } = req.body;
  const [listings] = await pool.query('SELECT * FROM listings WHERE id = ?', [listingId]);
  const listing = listings[0];

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  const [conflicts] = await pool.query(
    `SELECT id FROM bookings
     WHERE listing_id = ?
       AND status IN ('pending', 'confirmed')
       AND NOT (end_date < ? OR start_date > ?)`,
    [listingId, startDate, endDate]
  );

  if (conflicts.length) {
    return res.status(409).json({ message: 'Valitud kuupäevad on juba broneeritud' });
  }

  const totalPrice = calculateBookingPrice({ startDate, endDate, listing });
  const [result] = await pool.query(
    `INSERT INTO bookings (listing_id, owner_id, start_date, end_date, pricing_unit, total_price, guest_name, guest_email, guest_phone)
     VALUES (?, ?, ?, ?, 'day', ?, ?, ?, ?)`,
    [listingId, listing.user_id, startDate, endDate, totalPrice, name, email, phone]
  );

  res.status(201).json({ message: 'Broneering loodud!', bookingId: result.insertId, totalPrice });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, l.title, l.location,
       (SELECT image_url FROM listing_images WHERE listing_id = l.id LIMIT 1) AS image_url
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     WHERE b.owner_id = ?
     ORDER BY b.created_at DESC`,
    [req.user.id]
  );

  res.json({ bookings: rows });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  const booking = rows[0];

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  if (booking.owner_id !== req.user.id) {
    return res.status(403).json({ message: 'Only owner can update booking status' });
  }

  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Booking updated' });
});
