const aiVisionService = require('../services/aiVisionService');

/**
 * Controller to handle food recognition requests from the mobile app
 */
async function analyzeFood(req, res, next) {
  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'IMAGE_REQUIRED',
          message: 'An image in base64 format is required in the request body.'
        }
      });
    }

    const result = await aiVisionService.analyzeFoodImage({
      image,
      mimeType: mimeType || 'image/jpeg'
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
  analyzeFood
};
