import { Router } from 'express';
import { body } from 'express-validator';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getMessages);
router.post('/', [
  body('listingId').notEmpty(),
  body('body').notEmpty(),
  body('renterId').optional()
], sendMessage);

export default router;
