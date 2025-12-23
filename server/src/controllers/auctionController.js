const { auctionService } = require('../services');

const createAuction = async (req, res, next) => {
  try {
    // Handle uploaded images
    const images = req.files ? req.files.map((file) => `/uploads/auctions/${file.filename}`) : [];
    
    const auctionData = {
      ...req.body,
      images: [...images, ...(req.body.images || [])],
    };

    const auction = await auctionService.createAuction(auctionData, req.user._id);

    res.status(201).json({
      message: 'Auction created successfully',
      auction,
    });
  } catch (error) {
    next(error);
  }
};

const getAuctions = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      seller: req.query.seller,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await auctionService.getAuctions(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAuctionById = async (req, res, next) => {
  try {
    const auction = await auctionService.getAuctionById(req.params.id, true);
    res.json({ auction });
  } catch (error) {
    next(error);
  }
};

const updateAuction = async (req, res, next) => {
  try {
    // Handle uploaded images
    const newImages = req.files ? req.files.map((file) => `/uploads/auctions/${file.filename}`) : [];
    
    const updateData = {
      ...req.body,
    };

    if (newImages.length > 0) {
      updateData.images = [...(req.body.images || []), ...newImages];
    }

    const auction = await auctionService.updateAuction(req.params.id, updateData, req.user._id);

    res.json({
      message: 'Auction updated successfully',
      auction,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAuction = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const result = await auctionService.deleteAuction(req.params.id, req.user._id, isAdmin);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getMyAuctions = async (req, res, next) => {
  try {
    const auctions = await auctionService.getAuctionsByUser(req.user._id, 'seller');
    res.json({ auctions });
  } catch (error) {
    next(error);
  }
};

const getBidHistory = async (req, res, next) => {
  try {
    const bids = await auctionService.getBidHistory(req.params.id);
    res.json({ bids });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { id: 'electronics', name: 'Electronics' },
      { id: 'art', name: 'Art' },
      { id: 'collectibles', name: 'Collectibles' },
      { id: 'fashion', name: 'Fashion' },
      { id: 'home', name: 'Home & Garden' },
      { id: 'sports', name: 'Sports' },
      { id: 'vehicles', name: 'Vehicles' },
      { id: 'other', name: 'Other' },
    ];
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  getMyAuctions,
  getBidHistory,
  getCategories,
};
