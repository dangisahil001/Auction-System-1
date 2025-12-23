const { body, param } = require('express-validator');

const placeBidValidation = [
  param('auctionId')
    .isMongoId()
    .withMessage('Invalid auction ID'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Bid amount must be a positive number'),
];

module.exports = {
  placeBidValidation,
};
