// Global Error Handler Middleware
// Ensures all errors follow the NutriSnap AI API contract envelope:
// { "success": false, "error": { "code": "...", "message": "..." } }

function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: err.stack })
    }
  });
}

// 404 Handler for undefined routes
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
