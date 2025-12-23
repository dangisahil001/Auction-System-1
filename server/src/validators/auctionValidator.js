const { body, param } = require('express-validator');

const createAuctionValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('category')
    .isIn(['electronics', 'art', 'collectibles', 'fashion', 'home', 'sports', 'vehicles', 'other'])
    .withMessage('Invalid category'),
  body('startingPrice')
    .isFloat({ min: 0 })
    .withMessage('Starting price must be a positive number'),
  body('minBidIncrement')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum bid increment must be at least 1'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
];

const updateAuctionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid auction ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['electronics', 'art', 'collectibles', 'fashion', 'home', 'sports', 'vehicles', 'other'])
    .withMessage('Invalid category'),
];

const auctionIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid auction ID'),
];

module.exports = {
  createAuctionValidation,
  updateAuctionValidation,
  auctionIdValidation,
};
