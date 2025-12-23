const { body, param } = require('express-validator');

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

const updateRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['admin', 'seller', 'bidder'])
    .withMessage('Role must be admin, seller, or bidder'),
];

const removeAuctionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid auction ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

module.exports = {
  userIdValidation,
  updateRoleValidation,
  removeAuctionValidation,
};
