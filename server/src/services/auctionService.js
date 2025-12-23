const { Auction, Bid } = require('../models');
const notificationService = require('./notificationService');

class AuctionService {
  async createAuction(auctionData, sellerId) {
    const {
      title,
      description,
      images,
      category,
      startingPrice,
      minBidIncrement,
      startTime,
      endTime,
    } = auctionData;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      const error = new Error('Start time must be in the future');
      error.statusCode = 400;
      throw error;
    }

    if (end <= start) {
      const error = new Error('End time must be after start time');
      error.statusCode = 400;
      throw error;
    }

    // Determine initial status
    let status = 'upcoming';
    if (start <= now && end > now) {
      status = 'live';
    }

    const auction = new Auction({
      title,
      description,
      images: images || [],
      category,
      startingPrice,
      currentPrice: startingPrice,
      minBidIncrement: minBidIncrement || 1,
      startTime: start,
      endTime: end,
      status,
      seller: sellerId,
    });

    await auction.save();
    return auction.populate('seller', 'firstName lastName email');
  }

  async getAuctions(filters = {}, pagination = {}) {
    const {
      status,
      category,
      seller,
      search,
      minPrice,
      maxPrice,
    } = filters;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const query = { isRemoved: false };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (seller) {
      query.seller = seller;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.currentPrice = {};
      if (minPrice !== undefined) query.currentPrice.$gte = minPrice;
      if (maxPrice !== undefined) query.currentPrice.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [auctions, total] = await Promise.all([
      Auction.find(query)
        .populate('seller', 'firstName lastName')
        .populate('winner', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Auction.countDocuments(query),
    ]);

    return {
      auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAuctionById(auctionId, incrementViews = false) {
    const auction = await Auction.findById(auctionId)
      .populate('seller', 'firstName lastName email')
      .populate('winner', 'firstName lastName');

    if (!auction || auction.isRemoved) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    if (incrementViews) {
      auction.views += 1;
      await auction.save();
    }

    return auction;
  }

  async updateAuction(auctionId, updateData, userId) {
    const auction = await Auction.findById(auctionId);

    if (!auction || auction.isRemoved) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    if (auction.seller.toString() !== userId.toString()) {
      const error = new Error('Not authorized to update this auction');
      error.statusCode = 403;
      throw error;
    }

    if (auction.status === 'live' && auction.totalBids > 0) {
      const error = new Error('Cannot update auction with active bids');
      error.statusCode = 400;
      throw error;
    }

    if (auction.status === 'ended') {
      const error = new Error('Cannot update ended auction');
      error.statusCode = 400;
      throw error;
    }

    const allowedUpdates = ['title', 'description', 'images', 'category'];
    
    // Only allow price/time updates if no bids
    if (auction.totalBids === 0) {
      allowedUpdates.push('startingPrice', 'minBidIncrement', 'startTime', 'endTime');
    }

    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        auction[field] = updateData[field];
      }
    });

    // Update currentPrice if startingPrice changed and no bids
    if (updateData.startingPrice !== undefined && auction.totalBids === 0) {
      auction.currentPrice = updateData.startingPrice;
    }

    await auction.save();
    return auction.populate('seller', 'firstName lastName email');
  }

  async deleteAuction(auctionId, userId, isAdmin = false) {
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = auction.seller.toString() === userId.toString();

    if (!isOwner && !isAdmin) {
      const error = new Error('Not authorized to delete this auction');
      error.statusCode = 403;
      throw error;
    }

    if (auction.status === 'live' && auction.totalBids > 0 && !isAdmin) {
      const error = new Error('Cannot delete auction with active bids');
      error.statusCode = 400;
      throw error;
    }

    auction.isRemoved = true;
    auction.status = 'cancelled';
    await auction.save();

    return { message: 'Auction deleted successfully' };
  }

  async getAuctionsByUser(userId, role = 'seller') {
    const query = role === 'seller' 
      ? { seller: userId, isRemoved: false }
      : { isRemoved: false };

    const auctions = await Auction.find(query)
      .populate('seller', 'firstName lastName')
      .sort({ createdAt: -1 });

    return auctions;
  }

  async getBidHistory(auctionId) {
    const bids = await Bid.find({ auction: auctionId })
      .populate('bidder', 'firstName lastName')
      .sort({ createdAt: -1 });

    return bids;
  }
}

module.exports = new AuctionService();
