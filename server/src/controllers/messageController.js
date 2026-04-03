import { validationResult } from 'express-validator';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getConversations = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, l.title,
            owner.full_name AS owner_name,
            renter.full_name AS renter_name,
            MAX(m.created_at) AS last_message_at,
            SUBSTRING_INDEX(GROUP_CONCAT(m.body ORDER BY m.created_at DESC), ',', 1) AS last_message
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users owner ON owner.id = c.owner_id
     JOIN users renter ON renter.id = c.renter_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE c.owner_id = ? OR c.renter_id = ?
     GROUP BY c.id
     ORDER BY last_message_at DESC, c.created_at DESC`,
    [req.user.id, req.user.id]
  );

  res.json({ conversations: rows });
});

export const getMessages = asyncHandler(async (req, res) => {
  const [conversations] = await pool.query('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
  const conversation = conversations[0];

  if (!conversation) {
    return res.status(404).json({ message: 'Conversation not found' });
  }

  if (![conversation.owner_id, conversation.renter_id].includes(req.user.id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const [messages] = await pool.query(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [req.params.id]
  );

  res.json({ messages, conversation });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { listingId, renterId, body } = req.body;
  const [listings] = await pool.query('SELECT * FROM listings WHERE id = ?', [listingId]);
  const listing = listings[0];

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  const ownerId = listing.user_id;
  const resolvedRenterId = req.user.id === ownerId ? Number(renterId) : req.user.id;

  const [existing] = await pool.query(
    'SELECT * FROM conversations WHERE listing_id = ? AND owner_id = ? AND renter_id = ?',
    [listingId, ownerId, resolvedRenterId]
  );

  let conversationId = existing[0]?.id;
  if (!conversationId) {
    const [result] = await pool.query(
      'INSERT INTO conversations (listing_id, owner_id, renter_id) VALUES (?, ?, ?)',
      [listingId, ownerId, resolvedRenterId]
    );
    conversationId = result.insertId;
  }

  await pool.query(
    'INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)',
    [conversationId, req.user.id, body]
  );

  res.status(201).json({ message: 'Message sent', conversationId });
});
