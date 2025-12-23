const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    images: [{
      type: String,
    }],
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'art', 'collectibles', 'fashion', 'home', 'sports', 'vehicles', 'other'],
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    minBidIncrement: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended', 'cancelled'],
      default: 'upcoming',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
auctionSchema.index({ status: 1, startTime: 1 });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ createdAt: -1 });

// Virtual to check if auction is active
auctionSchema.virtual('isLive').get(function () {
  const now = new Date();
  return this.status === 'live' && now >= this.startTime && now <= this.endTime;
});

// Calculate remaining time
auctionSchema.virtual('remainingTime').get(function () {
  if (this.status !== 'live') return 0;
  const now = new Date();
  const remaining = this.endTime - now;
  return remaining > 0 ? remaining : 0;
});

auctionSchema.set('toJSON', { virtuals: true });
auctionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Auction', auctionSchema);
