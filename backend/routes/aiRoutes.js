const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
  sendMessage,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.patch('/conversations/:id', renameConversation);
router.delete('/conversations/:id', deleteConversation);

router.post('/chat', aiLimiter, sendMessage);

module.exports = router;
