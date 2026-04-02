import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';
import { calculateBookingPrice } from '../utils/pricing.js';

export const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { listingId, startDate, endDate, pricingUnit } = req.body;
  const [listings] = await pool.query('SELECT * FROM listings WHERE id = ?', [listingId]);
  const listing = listings[0];

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  if (listing.user_id === req.user.id) {
    return res.status(400).json({ message: 'You cannot book your own listing' });
  }

  const [conflicts] = await pool.query(
    `SELECT id FROM bookings
     WHERE listing_id = ?
       AND status IN ('pending', 'confirmed')
       AND NOT (end_date < ? OR start_date > ?)`,
    [listingId, startDate, endDate]
  );

  if (conflicts.length) {
    return res.status(409).json({ message: 'Selected dates are already booked' });
  }

  const totalPrice = calculateBookingPrice({ startDate, endDate, pricingUnit, listing });
  const [result] = await pool.query(
    `INSERT INTO bookings (listing_id, renter_id, owner_id, start_date, end_date, pricing_unit, total_price)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [listingId, req.user.id, listing.user_id, startDate, endDate, pricingUnit, totalPrice]
  );

  res.status(201).json({ message: 'Booking request created', bookingId: result.insertId, totalPrice });
};

export const getMyBookings = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, l.title, l.location, li.image_url
     FROM bookings b
     JOIN listings l ON l.id = b.listing_id
     LEFT JOIN listing_images li ON li.listing_id = l.id
     WHERE b.renter_id = ? OR b.owner_id = ?
     GROUP BY b.id
     ORDER BY b.created_at DESC`,
    [req.user.id, req.user.id]
  );

  res.json({ bookings: rows });
};

export const updateBookingStatus = async (req, res) => {
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
};
