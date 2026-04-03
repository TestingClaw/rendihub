import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { fullName, email, password, location } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, location) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, location || null]
  );

  const [users] = await pool.query('SELECT id, full_name, email, location FROM users WHERE id = ?', [result.insertId]);
  const user = users[0];

  return res.status(201).json({
    token: signToken(user),
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      location: user.location
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: signToken(user),
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      location: user.location
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  const [users] = await pool.query('SELECT id, full_name, email, location FROM users WHERE id = ?', [req.user.id]);
  const user = users[0];

  return res.json({
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      location: user.location
    }
  });
});
