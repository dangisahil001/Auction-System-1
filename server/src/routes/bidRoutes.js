const express = require('express');
const router = express.Router();
const { bidController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { placeBidValidation } = require('../validators');

// Protected routes
router.post(
  '/auction/:auctionId',
  authenticate,
  placeBidValidation,
  validate,
  bidController.placeBid
);

router.get('/my-bids', authenticate, bidController.getMyBids);
router.get('/auction/:auctionId/highest', bidController.getHighestBid);

module.exports = router;
