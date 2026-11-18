const chatService = require('../services/chatService');

/**
 * Controller to handle conversational nutrition assistant messages
 */
async function chat(req, res, next) {
  try {
    const { userId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MESSAGE_REQUIRED',
          message: 'Please provide a non-empty message string.'
        }
      });
    }

    const result = await chatService.processChat({
      userId: userId || 'default_user',
      message: message.trim()
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  chat
};
