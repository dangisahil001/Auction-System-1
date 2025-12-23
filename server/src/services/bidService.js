const { Auction, Bid, User } = require('../models');
const { getIO } = require('../config/socket');
const notificationService = require('./notificationService');

class BidService {
  async placeBid(auctionId, bidderId, amount) {
    const auction = await Auction.findById(auctionId);

    if (!auction || auction.isRemoved) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if auction is live
    if (auction.status !== 'live') {
      const error = new Error(`Cannot bid on ${auction.status} auction`);
      error.statusCode = 400;
      throw error;
    }

    // Check auction time
    const now = new Date();
    if (now < auction.startTime || now > auction.endTime) {
      const error = new Error('Auction is not currently accepting bids');
      error.statusCode = 400;
      throw error;
    }

    // Prevent self-bidding
    if (auction.seller.toString() === bidderId.toString()) {
      const error = new Error('Cannot bid on your own auction');
      error.statusCode = 400;
      throw error;
    }

    // Validate bid amount
    const minBid = auction.currentPrice + auction.minBidIncrement;
    if (amount < minBid) {
      const error = new Error(`Bid must be at least ${minBid}`);
      error.statusCode = 400;
      throw error;
    }

    // Get previous highest bidder for outbid notification
    const previousHighestBid = await Bid.findOne({ auction: auctionId, isWinning: true })
      .populate('bidder', '_id');

    // Update previous winning bid
    if (previousHighestBid) {
      previousHighestBid.isWinning = false;
      await previousHighestBid.save();
    }

    // Create new bid
    const bid = new Bid({
      auction: auctionId,
      bidder: bidderId,
      amount,
      isWinning: true,
    });

    await bid.save();

    // Update auction
    auction.currentPrice = amount;
    auction.totalBids += 1;
    await auction.save();

    // Populate bid with bidder info
    await bid.populate('bidder', 'firstName lastName');

    // Emit real-time update
    try {
      const io = getIO();
      io.to(`auction:${auctionId}`).emit('bid-update', {
        auctionId,
        currentPrice: amount,
        totalBids: auction.totalBids,
        highestBidder: {
          id: bid.bidder._id,
          name: `${bid.bidder.firstName} ${bid.bidder.lastName}`,
        },
        bidTime: bid.createdAt,
      });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    // Send outbid notification to previous bidder
    if (previousHighestBid && previousHighestBid.bidder._id.toString() !== bidderId.toString()) {
      await notificationService.createNotification({
        userId: previousHighestBid.bidder._id,
        type: 'outbid',
        title: 'You have been outbid!',
        message: `Someone placed a higher bid of $${amount} on "${auction.title}"`,
        auctionId,
        metadata: { newAmount: amount },
      });
    }

    return bid;
  }

  async getUserBids(userId, filters = {}) {
    const { status } = filters;

    const query = { bidder: userId };

    const bids = await Bid.find(query)
      .populate({
        path: 'auction',
        match: status ? { status } : {},
        populate: { path: 'seller', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 });

    // Filter out bids where auction didn't match the status filter
    return bids.filter((bid) => bid.auction !== null);
  }

  async getHighestBid(auctionId) {
    const bid = await Bid.findOne({ auction: auctionId, isWinning: true })
      .populate('bidder', 'firstName lastName');

    return bid;
  }

  async getBidCount(auctionId) {
    return Bid.countDocuments({ auction: auctionId });
  }
}

module.exports = new BidService();
