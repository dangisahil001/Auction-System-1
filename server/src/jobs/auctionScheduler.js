const cron = require('node-cron');
const { Auction, Bid } = require('../models');
const notificationService = require('../services/notificationService');
const { getIO } = require('../config/socket');

class AuctionScheduler {
  constructor() {
    this.jobs = {};
  }

  // Initialize cron jobs
  init() {
    // Run every minute to check for auction status changes
    this.jobs.statusCheck = cron.schedule('* * * * *', async () => {
      try {
        await this.updateAuctionStatuses();
      } catch (error) {
        console.error('Auction status update error:', error);
      }
    });

    // Run every 5 minutes to send ending soon notifications
    this.jobs.endingSoon = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.notifyEndingSoon();
      } catch (error) {
        console.error('Ending soon notification error:', error);
      }
    });

    console.log('Auction scheduler initialized');
  }

  // Update auction statuses (upcoming -> live -> ended)
  async updateAuctionStatuses() {
    const now = new Date();

    // Start upcoming auctions that should be live
    const toStart = await Auction.find({
      status: 'upcoming',
      startTime: { $lte: now },
      endTime: { $gt: now },
      isRemoved: false,
    });

    for (const auction of toStart) {
      auction.status = 'live';
      await auction.save();

      console.log(`Auction started: ${auction.title}`);

      // Emit auction started event
      try {
        const io = getIO();
        io.emit('auction-started', {
          auctionId: auction._id,
          title: auction.title,
        });
      } catch (err) {
        console.error('Socket emit error:', err);
      }
    }

    // End live auctions that have passed end time
    const toEnd = await Auction.find({
      status: 'live',
      endTime: { $lte: now },
      isRemoved: false,
    });

    for (const auction of toEnd) {
      await this.endAuction(auction);
    }
  }

  // End an auction and determine winner
  async endAuction(auction) {
    auction.status = 'ended';

    // Find winning bid
    const winningBid = await Bid.findOne({
      auction: auction._id,
      isWinning: true,
    }).populate('bidder', '_id firstName lastName');

    if (winningBid) {
      auction.winner = winningBid.bidder._id;
      auction.winningBid = winningBid._id;

      // Notify winner
      await notificationService.createNotification({
        userId: winningBid.bidder._id,
        type: 'auction_won',
        title: 'Congratulations! You won the auction!',
        message: `You won "${auction.title}" with a bid of $${winningBid.amount}`,
        auctionId: auction._id,
        metadata: { winningAmount: winningBid.amount },
      });

      // Notify seller
      await notificationService.createNotification({
        userId: auction.seller,
        type: 'auction_won',
        title: 'Your auction has ended!',
        message: `"${auction.title}" sold for $${winningBid.amount}`,
        auctionId: auction._id,
        metadata: { winningAmount: winningBid.amount, winnerId: winningBid.bidder._id },
      });

      // Notify other bidders that they lost
      const otherBidders = await Bid.distinct('bidder', {
        auction: auction._id,
        bidder: { $ne: winningBid.bidder._id },
      });

      for (const bidderId of otherBidders) {
        await notificationService.createNotification({
          userId: bidderId,
          type: 'auction_lost',
          title: 'Auction ended',
          message: `You didn't win "${auction.title}". The winning bid was $${winningBid.amount}`,
          auctionId: auction._id,
          metadata: { winningAmount: winningBid.amount },
        });
      }
    } else {
      // No bids - notify seller
      await notificationService.createNotification({
        userId: auction.seller,
        type: 'auction_won',
        title: 'Your auction has ended',
        message: `"${auction.title}" ended with no bids`,
        auctionId: auction._id,
      });
    }

    await auction.save();

    console.log(`Auction ended: ${auction.title}, Winner: ${winningBid?.bidder?.firstName || 'None'}`);

    // Emit auction ended event
    try {
      const io = getIO();
      io.to(`auction:${auction._id}`).emit('auction-ended', {
        auctionId: auction._id,
        winner: winningBid ? {
          id: winningBid.bidder._id,
          name: `${winningBid.bidder.firstName} ${winningBid.bidder.lastName}`,
          amount: winningBid.amount,
        } : null,
      });
    } catch (err) {
      console.error('Socket emit error:', err);
    }
  }

  // Notify bidders when auction is ending soon (5 minutes)
  async notifyEndingSoon() {
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

    const endingSoon = await Auction.find({
      status: 'live',
      endTime: { $gte: now, $lte: fiveMinutesLater },
      isRemoved: false,
    });

    for (const auction of endingSoon) {
      // Get all bidders
      const bidders = await Bid.distinct('bidder', { auction: auction._id });

      for (const bidderId of bidders) {
        await notificationService.createNotification({
          userId: bidderId,
          type: 'auction_ending',
          title: 'Auction ending soon!',
          message: `"${auction.title}" is ending in less than 5 minutes!`,
          auctionId: auction._id,
        });
      }
    }
  }

  // Broadcast remaining time for live auctions
  broadcastRemainingTime() {
    setInterval(async () => {
      try {
        const io = getIO();
        const liveAuctions = await Auction.find({
          status: 'live',
          isRemoved: false,
        }).select('_id endTime');

        for (const auction of liveAuctions) {
          const remaining = Math.max(0, auction.endTime - new Date());
          io.to(`auction:${auction._id}`).emit('time-sync', {
            auctionId: auction._id,
            remainingTime: remaining,
          });
        }
      } catch (err) {
        console.error('Time broadcast error:', err);
      }
    }, 1000); // Every second
  }

  // Stop all jobs
  stop() {
    Object.values(this.jobs).forEach((job) => job.stop());
    console.log('Auction scheduler stopped');
  }
}

module.exports = new AuctionScheduler();
