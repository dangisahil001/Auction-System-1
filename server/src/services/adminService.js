const { User, Auction, Bid } = require('../models');

class AdminService {
  async getAllUsers(filters = {}, pagination = {}) {
    const { role, search, isBanned } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (isBanned !== undefined) {
      query.isBanned = isBanned;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Get user statistics
    const [auctionsCreated, bidsPlaced, auctionsWon] = await Promise.all([
      Auction.countDocuments({ seller: userId }),
      Bid.countDocuments({ bidder: userId }),
      Auction.countDocuments({ winner: userId }),
    ]);

    return {
      ...user.toObject(),
      stats: {
        auctionsCreated,
        bidsPlaced,
        auctionsWon,
      },
    };
  }

  async banUser(userId, adminId) {
    if (userId === adminId) {
      const error = new Error('Cannot ban yourself');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Cannot ban admin users');
      error.statusCode = 400;
      throw error;
    }

    user.isBanned = true;
    user.refreshToken = null; // Invalidate refresh token
    await user.save();

    return { message: 'User banned successfully', user };
  }

  async unbanUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.isBanned = false;
    await user.save();

    return { message: 'User unbanned successfully', user };
  }

  async updateUserRole(userId, newRole, adminId) {
    if (userId === adminId) {
      const error = new Error('Cannot change your own role');
      error.statusCode = 400;
      throw error;
    }

    const validRoles = ['admin', 'seller', 'bidder'];
    if (!validRoles.includes(newRole)) {
      const error = new Error('Invalid role');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async getAllAuctions(filters = {}, pagination = {}) {
    const { status, category, seller, includeRemoved } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const query = {};

    if (!includeRemoved) {
      query.isRemoved = false;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (seller) {
      query.seller = seller;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [auctions, total] = await Promise.all([
      Auction.find(query)
        .populate('seller', 'firstName lastName email')
        .populate('winner', 'firstName lastName email')
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

  async removeAuction(auctionId, reason) {
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      const error = new Error('Auction not found');
      error.statusCode = 404;
      throw error;
    }

    auction.isRemoved = true;
    auction.status = 'cancelled';
    await auction.save();

    // TODO: Notify seller and bidders about removal

    return { message: 'Auction removed successfully', reason };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalSellers,
      totalBidders,
      bannedUsers,
      totalAuctions,
      liveAuctions,
      endedAuctions,
      totalBids,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'bidder' }),
      User.countDocuments({ isBanned: true }),
      Auction.countDocuments({ isRemoved: false }),
      Auction.countDocuments({ status: 'live', isRemoved: false }),
      Auction.countDocuments({ status: 'ended', isRemoved: false }),
      Bid.countDocuments(),
    ]);

    // Get total revenue (sum of winning bids)
    const revenueResult = await Auction.aggregate([
      { $match: { status: 'ended', winner: { $exists: true }, isRemoved: false } },
      { $group: { _id: null, total: { $sum: '$currentPrice' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return {
      users: {
        total: totalUsers,
        sellers: totalSellers,
        bidders: totalBidders,
        banned: bannedUsers,
      },
      auctions: {
        total: totalAuctions,
        live: liveAuctions,
        ended: endedAuctions,
      },
      bids: {
        total: totalBids,
      },
      revenue: {
        total: totalRevenue,
      },
    };
  }
}

module.exports = new AdminService();
