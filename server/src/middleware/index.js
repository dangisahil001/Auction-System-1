const { authenticate, optionalAuth, authorize, isSeller, isAdmin } = require('./auth');
const validate = require('./validate');
const { errorHandler, AppError } = require('./errorHandler');
const upload = require('./upload');

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isSeller,
  isAdmin,
  validate,
  errorHandler,
  AppError,
  upload,
};
