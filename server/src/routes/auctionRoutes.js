const express = require('express');
const router = express.Router();
const { auctionController } = require('../controllers');
const { authenticate, optionalAuth, isSeller, validate, upload } = require('../middleware');
const {
  createAuctionValidation,
  updateAuctionValidation,
  auctionIdValidation,
} = require('../validators');

// Public routes
router.get('/', auctionController.getAuctions);
router.get('/categories', auctionController.getCategories);
router.get('/:id', auctionIdValidation, validate, auctionController.getAuctionById);
router.get('/:id/bids', auctionIdValidation, validate, auctionController.getBidHistory);

// Protected routes
router.post(
  '/',
  authenticate,
  isSeller,
  upload.array('images', 5),
  createAuctionValidation,
  validate,
  auctionController.createAuction
);

router.put(
  '/:id',
  authenticate,
  isSeller,
  upload.array('images', 5),
  updateAuctionValidation,
  validate,
  auctionController.updateAuction
);

router.delete(
  '/:id',
  authenticate,
  auctionIdValidation,
  validate,
  auctionController.deleteAuction
);

router.get('/user/my-auctions', authenticate, isSeller, auctionController.getMyAuctions);

module.exports = router;
