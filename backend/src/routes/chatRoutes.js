const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat
// Conversational AI nutrition assistant with daily meal context
router.post('/chat', chatController.chat);

module.exports = router;
