const express = require('express');
const router = express.Router();

// GET /api/health
// Used by mobile app and developers to verify server status
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'online',
      message: 'NutriSnap AI Backend is running smoothly',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: '1.0.0'
    }
  });
});

module.exports = router;
