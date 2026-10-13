const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific database errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => e.message);
    err = new AppError(`Validation Error: ${errors.join('. ')}`, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your token has expired. Please log in again.', 401);
  }

  // Fallback for untracked object throws
  if (err.statusCode === 500 && !err.isOperational) {
    console.error('ERROR 💥:', err);
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || 'Something went wrong',
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
