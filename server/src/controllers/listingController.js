import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const mapListing = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  location: row.location,
  categoryId: row.category_id,
  categoryName: row.category_name,
  owner: {
    id: row.user_id,
    fullName: row.owner_name,
    location: row.owner_location
  },
  pricing: {
    day: Number(row.price_day),
    week: Number(row.price_week),
    month: Number(row.price_month)
  },
  rating: row.avg_rating ? Number(row.avg_rating) : null,
  reviewCount: row.review_count ? Number(row.review_count) : 0,
  createdAt: row.created_at,
  images: row.images ? row.images.split(',') : []
});

export const getCategories = asyncHandler(async (_req, res) => {
  const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json({ categories });
});

export const createListing = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { categoryId, title, description, location, priceDay, priceWeek, priceMonth } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO listings (user_id, category_id, title, description, location, price_day, price_week, price_month)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, categoryId, title, description, location, priceDay, priceWeek, priceMonth]
    );

    if (req.files?.length) {
      const values = req.files.map((file) => [result.insertId, `/uploads/${file.filename}`]);
      await connection.query('INSERT INTO listing_images (listing_id, image_url) VALUES ?', [values]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Listing created', listingId: result.insertId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const getListings = asyncHandler(async (req, res) => {
  const { category, location, minPrice, maxPrice, query } = req.query;
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('l.category_id = ?');
    params.push(category);
  }
  if (location) {
    conditions.push('l.location LIKE ?');
    params.push(`%${location}%`);
  }
  if (minPrice) {
    conditions.push('l.price_day >= ?');
    params.push(minPrice);
  }
  if (maxPrice) {
    conditions.push('l.price_day <= ?');
    params.push(maxPrice);
  }
  if (query) {
    conditions.push('(l.title LIKE ? OR l.description LIKE ?)');
    params.push(`%${query}%`, `%${query}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT l.*, c.name AS category_name, u.full_name AS owner_name, u.location AS owner_location,
            AVG(r.rating) AS avg_rating, COUNT(DISTINCT r.id) AS review_count,
            GROUP_CONCAT(DISTINCT li.image_url) AS images
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.user_id
     LEFT JOIN reviews r ON r.listing_id = l.id
     LEFT JOIN listing_images li ON li.listing_id = l.id
     ${whereClause}
     GROUP BY l.id
     ORDER BY l.created_at DESC`,
    params
  );

  res.json({ listings: rows.map(mapListing) });
});

export const getListingById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT l.*, c.name AS category_name, u.full_name AS owner_name, u.location AS owner_location,
            AVG(r.rating) AS avg_rating, COUNT(DISTINCT r.id) AS review_count,
            GROUP_CONCAT(DISTINCT li.image_url) AS images
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.user_id
     LEFT JOIN reviews r ON r.listing_id = l.id
     LEFT JOIN listing_images li ON li.listing_id = l.id
     WHERE l.id = ?
     GROUP BY l.id`,
    [req.params.id]
  );

  if (!rows.length) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  const [bookings] = await pool.query(
    'SELECT id, start_date, end_date, status, pricing_unit, total_price FROM bookings WHERE listing_id = ? ORDER BY start_date ASC',
    [req.params.id]
  );

  const [reviews] = await pool.query(
    `SELECT r.*, reviewer.full_name AS reviewer_name
     FROM reviews r
     JOIN users reviewer ON reviewer.id = r.reviewer_id
     WHERE r.listing_id = ?
     ORDER BY r.created_at DESC`,
    [req.params.id]
  );

  return res.json({
    listing: mapListing(rows[0]),
    bookings,
    reviews
  });
});
