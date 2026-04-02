import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);
export const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, fullName: user.full_name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
