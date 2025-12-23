const { bidService } = require('../services');

const placeBid = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;

    const bid = await bidService.placeBid(auctionId, req.user._id, amount);

    res.status(201).json({
      message: 'Bid placed successfully',
      bid,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBids = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
    };

    const bids = await bidService.getUserBids(req.user._id, filters);
    res.json({ bids });
  } catch (error) {
    next(error);
  }
};

const getHighestBid = async (req, res, next) => {
  try {
    const bid = await bidService.getHighestBid(req.params.auctionId);
    res.json({ bid });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeBid,
  getMyBids,
  getHighestBid,
};
