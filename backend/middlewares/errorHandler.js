// Consistent JSON error responses across the API.
// Throw errors with a `statusCode` property in controllers, e.g.:
//   const err = new Error('Deck not found'); err.statusCode = 404; throw err;

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
  });
}

module.exports = errorHandler;
